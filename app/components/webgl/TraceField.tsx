'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useThemeColors } from './useThemeColors';
import { FluidSim } from './gpgpu/FluidSim';
import { hasGpgpuSupport } from './gpgpu/support';
import { getAudioLevel } from '@/app/lib/audio';

/** 96² is negligible next to the 40k-particle draw call this feeds, so a
 * fixed resolution (rather than a PerformanceMonitor-driven decline ladder
 * like TouchField's or Scene's dpr) is enough — the cost here was never
 * load-bearing the way point count or dpr is. */
const FLUID_SIZE = 96;
const BLACK_TEXEL = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
BLACK_TEXEL.needsUpdate = true;

/*
 * A request moving through a fullstack system: Client -> Edge -> API -> Queue -> DB.
 *
 * Each link between nodes carries several CatmullRom curves, and every curve is
 * baked to a texture of sampled positions. The vertex shader then reads a
 * particle's position straight out of that texture, so animating 40k particles
 * costs one texture fetch each and zero CPU work per frame — one draw call, no
 * per-frame geometry updates.
 *
 * Two layouts are baked: an orbital arrangement and a flat left-to-right
 * pipeline. uMorph lerps between them as you scroll, so the sculpture resolves
 * into a legible architecture diagram.
 */

const NODES_ORBIT: [number, number, number][] = [
  [-3.6, 0.9, -1.0],
  [-1.8, -0.7, 1.1],
  [0.1, 1.0, -0.4],
  [2.0, -0.5, 0.9],
  [3.8, 0.6, -1.1],
];

const NODES_FLAT: [number, number, number][] = [
  [-5.2, 0, 0],
  [-2.6, 0, 0],
  [0, 0, 0],
  [2.6, 0, 0],
  [5.2, 0, 0],
];

const CURVES_PER_LINK = 4;
const SAMPLES = 256;
const COUNT = 40000;

// Sits up and to the right: the hero type occupies the lower left, and the
// diagram has to stay off it. Shared with the fluid-UV mapping below (as
// uMeshOffset) rather than duplicated as a second magic number — the sim's
// cursor splats are computed in world/view space, but a particle's `pos` in
// the vertex shader is still local/object space until this offset is added,
// so the two were sampling the fluid texture at different places for the
// same physical point on screen.
const MESH_OFFSET: [number, number, number] = [1.5, 1.3, 0];

/**
 * This layout was tuned against a landscape aspect ratio. A PerspectiveCamera
 * only compensates vertically for a narrower viewport — aspect scales the
 * horizontal frustum directly — so on a phone's portrait aspect the diagram
 * fills proportionally more of the width and crosses into the hero text
 * instead of arcing above it. Pulling the camera back for narrower-than-this
 * aspects fixes that, but the diagram is now smaller on screen too (that's
 * the point), and simply scaling MESH_OFFSET's Y by the same ratio only
 * preserves its *centroid*'s screen position — a smaller shape centered at
 * the same point has its top edge sitting closer to center than before,
 * which opens a gap between it and the nav rather than closing one. What
 * actually needs to stay put is the top edge, so the compensation targets
 * that instead: TOP_REACH approximates how far above MESH_OFFSET's Y the
 * diagram's highest point extends (NODES_ORBIT's max node Y of ~1.0 plus
 * ~0.62 of curve spread) — solving for the offset that keeps
 * (offset + TOP_REACH) / cameraZ constant reproduces the same top-edge
 * angular position regardless of how far the camera has pulled back.
 * 16:10 as the reference aspect: a common laptop screen ratio (1440x900,
 * 2560x1600), narrow enough that it never fires for an actual desktop/
 * laptop viewport.
 */
const REFERENCE_ASPECT = 16 / 10;
const BASE_CAMERA_Z = 9;
const TOP_REACH = 1.6;

function offsetYForCameraZ(z: number) {
  return (z / BASE_CAMERA_Z) * (MESH_OFFSET[1] + TOP_REACH) - TOP_REACH;
}

function cameraZForAspect(aspect: number) {
  return aspect < REFERENCE_ASPECT ? BASE_CAMERA_Z * (REFERENCE_ASPECT / aspect) : BASE_CAMERA_Z;
}

function buildCurveTexture(nodes: [number, number, number][], spread: number) {
  const links = nodes.length - 1;
  const total = links * CURVES_PER_LINK;
  const data = new Float32Array(SAMPLES * total * 4);

  let row = 0;
  for (let link = 0; link < links; link++) {
    const a = new THREE.Vector3(...nodes[link]);
    const b = new THREE.Vector3(...nodes[link + 1]);

    for (let c = 0; c < CURVES_PER_LINK; c++) {
      // Deterministic jitter so the bake is stable across reloads.
      const t = (c / (CURVES_PER_LINK - 1)) * 2 - 1;
      const mid1 = a
        .clone()
        .lerp(b, 0.33)
        .add(new THREE.Vector3(0, t * spread, Math.cos(c * 1.7 + link) * spread));
      const mid2 = a
        .clone()
        .lerp(b, 0.66)
        .add(new THREE.Vector3(0, -t * spread * 0.7, Math.sin(c * 2.1 + link) * spread));

      const curve = new THREE.CatmullRomCurve3([a, mid1, mid2, b]);
      const points = curve.getSpacedPoints(SAMPLES - 1);

      for (let s = 0; s < SAMPLES; s++) {
        const i = (row * SAMPLES + s) * 4;
        data[i] = points[s].x;
        data[i + 1] = points[s].y;
        data[i + 2] = points[s].z;
        data[i + 3] = 1;
      }
      row++;
    }
  }

  const texture = new THREE.DataTexture(data, SAMPLES, total, THREE.RGBAFormat, THREE.FloatType);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return { texture, total };
}

const vertexShader = /* glsl */ `
  uniform sampler2D uCurvesOrbit;
  uniform sampler2D uCurvesFlat;
  uniform float uCurveCount;
  uniform float uTime;
  uniform float uScatter;
  uniform float uMorph;
  uniform float uDpr;
  uniform vec3  uMouse;
  uniform sampler2D uFluid;
  uniform float uFluidStrength;
  uniform vec2  uViewport;
  uniform vec2  uMeshOffset;
  // mediump, explicitly: the fragment shader below sets
  // "precision mediump float" and a uniform shared between both stages has
  // to agree on precision or WebGL refuses to link the program (the error
  // this shipped with: "Precisions of uniform 'uAudio' differ between
  // VERTEX and FRAGMENT shaders"). uAudioPulse is vertex-only, so it isn't
  // at risk the same way, but pinned too for consistency.
  uniform mediump float uAudio;
  uniform mediump float uAudioPulse;

  attribute float aCurveIndex;
  attribute float aOffset;
  attribute float aSeed;
  attribute float aSize;

  varying float vHot;

  vec3 sampleCurve(float u, float row) {
    vec2 uv = vec2(u, (row + 0.5) / uCurveCount);
    return mix(texture2D(uCurvesOrbit, uv).xyz, texture2D(uCurvesFlat, uv).xyz, uMorph);
  }

  void main() {
    // Packets travel the curve at slightly different rates so they never lockstep.
    float rate = 0.05 + aSeed * 0.06;
    float u = fract(aOffset + uTime * rate);

    // A struck bell nudges packets forward along their curve — additive on
    // top of the base position, never folded into rate itself: with a
    // large uTime, even a tiny change to rate would make every particle
    // teleport rather than nudge.
    u = fract(u + uAudioPulse * 0.02);

    vec3 pos = sampleCurve(u, aCurveIndex);

    /*
     * Curves are sampled by arc length, so speed along one is constant and
     * can't drive colour. Instead the accent marks arrival: a particle heats up
     * as it reaches either end of its link — which is where the nodes are — and
     * only a minority of particles carry any warmth at all. The field reads as
     * ink with hotspots at the nodes rather than a wall of red.
     */
    float atNode = 1.0 - smoothstep(0.0, 0.18, min(u, 1.0 - u));
    vHot = clamp(smoothstep(0.82, 1.0, aSeed) * 0.30 + atNode * 0.85 + uAudioPulse * 0.15, 0.0, 1.0);

    // Idle state: a diffuse drifting cloud that condenses onto the curves.
    vec3 flow = vec3(
      sin(pos.y * 1.3 + uTime * 0.30 + aSeed * 6.28),
      cos(pos.z * 1.1 - uTime * 0.25 + aSeed * 4.19),
      sin(pos.x * 1.7 + uTime * 0.20 + aSeed * 2.71)
    );
    // uScatter itself damps to ~0 within ~2.2s of load — the safest place to
    // fold audio in, since that machinery is already tuned to look good and
    // is otherwise dead afterward. Capped well under the intro's 1.0 so the
    // field can never look like the load-in exploding again.
    pos += flow * (uScatter + uAudio * 0.26) * (1.4 + aSeed * 2.2);

    // Pointer pushes a soft well through the field.
    vec2 toMouse = pos.xy - uMouse.xy;
    float d = length(toMouse);
    pos.xy += normalize(toMouse + 1e-4) * smoothstep(2.6, 0.0, d) * uMouse.z;

    // GPGPU fluid layer: the same viewport mapping the sim's cursor splats
    // use (see TraceField.tsx's uPointerUv), so a particle here and the
    // force that dragged the field there agree on where the cursor is.
    // uFluidStrength is 0 on any device that failed the gpgpu capability
    // check, making this exactly a no-op rather than a branch. pos is
    // still object-space here (pre-modelViewMatrix), so the mesh's own
    // position offset has to be added before mapping into the same
    // world-space UV the pointer uses — without it the two were sampling
    // the fluid texture at different places for the same point on screen.
    vec2 fluidUv = (pos.xy + uMeshOffset) / uViewport + 0.5;
    vec2 fluidVel = texture2D(uFluid, fluidUv).xy;
    pos.xy += fluidVel * uFluidStrength;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uDpr * (26.0 / max(-mv.z, 0.1)) * (1.0 + uAudio * 0.15);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3  uInk;
  uniform vec3  uSignal;
  uniform float uOpacity;
  uniform float uAudio;

  varying float vHot;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;

    // Soft core plus a cheap falloff that reads as glow without a second pass.
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(1.0 - d * 2.0, 3.0);

    vec3 color = mix(uInk, uSignal, vHot);
    float alpha = uOpacity * core * (0.45 + 0.55 * glow) * (0.85 + 0.35 * vHot);
    // Never uOpacity itself — that multiplies every particle equally, so
    // the whole field would flicker in unison and read as a rendering
    // fault rather than something breathing.
    alpha *= 1.0 + uAudio * 0.12;

    // Hot particles also carry a little more weight, so nodes read as denser.
    gl_FragColor = vec4(color, alpha);
  }
`;

// Scratch objects reused every frame — nothing is allocated inside useFrame.
const pointer = new THREE.Vector2();
const target = new THREE.Vector2();
const pointerUv = new THREE.Vector2();

export function TraceField({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const points = useRef<THREE.Points>(null);
  // Onset energy (uAudioPulse) is derived here, not read off the analyser
  // directly: it's how much louder this frame is than the last, decaying
  // afterward — a struck bell should feel struck, not just raise a level.
  const audioPulse = useRef(0);
  const lastAudioLevel = useRef(0);
  const { viewport, invalidate, gl, camera, size } = useThree();
  const themeColors = useThemeColors();

  const gpgpuCapable = useMemo(
    () => hasGpgpuSupport(gl.getContext() as WebGL2RenderingContext),
    [gl]
  );

  const fluid = useMemo(() => (gpgpuCapable ? new FluidSim(FLUID_SIZE) : null), [gpgpuCapable]);
  useEffect(() => () => fluid?.dispose(), [fluid]);

  const orbit = useMemo(() => buildCurveTexture(NODES_ORBIT, 0.62), []);
  const flat = useMemo(() => buildCurveTexture(NODES_FLAT, 0.28), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const position = new Float32Array(COUNT * 3);
    const curveIndex = new Float32Array(COUNT);
    const offset = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      curveIndex[i] = Math.floor(Math.random() * orbit.total);
      offset[i] = Math.random();
      seed[i] = Math.random();
      size[i] = 0.6 + Math.random() * 1.7;
    }

    // Positions come from the shader; this only satisfies the draw count.
    geo.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geo.setAttribute('aCurveIndex', new THREE.BufferAttribute(curveIndex, 1));
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offset, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return geo;
  }, [orbit.total]);

  const uniforms = useMemo(
    () => ({
      uCurvesOrbit: { value: orbit.texture },
      uCurvesFlat: { value: flat.texture },
      uCurveCount: { value: orbit.total },
      uTime: { value: 0 },
      uScatter: { value: 1 },
      uMorph: { value: 0 },
      uDpr: { value: 1 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      // Actual colors seeded directly rather than read from the hook: this
      // only ever matters for the one frame before the sync effect below
      // runs, and keeping the hook out of this memo's deps means the
      // uniforms object is never recreated after mount — which would snap
      // uTime/uScatter/uMorph back to their initial values and visibly
      // reset the field.
      uInk: { value: new THREE.Color('#6E655C') },
      uSignal: { value: new THREE.Color('#CE3A22') },
      uOpacity: { value: 0.72 },
      uFluid: { value: BLACK_TEXEL },
      uFluidStrength: { value: 0 },
      // Updated live in useFrame below (like uDpr/uMouse) rather than fixed
      // here — window resize would otherwise leave this stale and the
      // particle/cursor fluid-UV mapping would drift out of alignment.
      uViewport: { value: new THREE.Vector2(1, 1) },
      uMeshOffset: { value: new THREE.Vector2(MESH_OFFSET[0], MESH_OFFSET[1]) },
      // Written every frame in useFrame below, same as uTime — kept out of
      // this memo's deps for the same reason theme colors are: recreating
      // the uniforms object on a dependency change would snap these (and
      // uTime/uScatter/uMorph alongside them) back to zero.
      uAudio: { value: 0 },
      uAudioPulse: { value: 0 },
    }),
    [orbit, flat]
  );

  // Corrects uInk/uSignal from their hardcoded seed values (above) to the
  // actual CSS-computed colors, once on mount.
  useEffect(() => {
    const mat = material.current;
    if (!mat) return;

    mat.uniforms.uInk.value.copy(themeColors.ink);
    mat.uniforms.uSignal.value.copy(themeColors.signal);
    invalidate();
  }, [themeColors, invalidate]);

  // Fits the diagram to the viewport's aspect ratio — see cameraZForAspect's
  // comment above for why the camera distance and MESH_OFFSET's Y both need
  // to move together. `size` is R3F's own resize-reactive viewport size, so
  // this re-runs on a window resize or a phone rotating; useLayoutEffect
  // (not useEffect) so the correction lands before the first frame paints.
  useLayoutEffect(() => {
    const mat = material.current;
    const mesh = points.current;
    if (!mat || !mesh) return;

    const z = cameraZForAspect(size.width / size.height);
    camera.position.z = z;
    if (camera instanceof THREE.PerspectiveCamera) camera.updateProjectionMatrix();

    const offsetY = offsetYForCameraZ(z);
    mesh.position.y = offsetY;
    mat.uniforms.uMeshOffset.value.set(MESH_OFFSET[0], offsetY);
    invalidate();
  }, [camera, size.width, size.height, invalidate]);

  useFrame((state, delta) => {
    const mat = material.current;
    if (!mat) return;

    const u = mat.uniforms;
    u.uTime.value += delta;
    u.uDpr.value = state.gl.getPixelRatio();

    // The load-in: the cloud condenses onto the curves over roughly 2.2s.
    u.uScatter.value = THREE.MathUtils.damp(u.uScatter.value, 0, 1.6, delta);

    // Scroll unwraps the orbit into the flat pipeline.
    u.uMorph.value = THREE.MathUtils.damp(u.uMorph.value, scrollRef.current, 4, delta);

    // Spring-damped pointer. Reading raw coordinates is what makes these feel cheap.
    target.set((state.pointer.x * viewport.width) / 2, (state.pointer.y * viewport.height) / 2);
    pointer.lerp(target, 1 - Math.exp(-6 * delta));
    u.uMouse.value.set(pointer.x, pointer.y, 0.9);

    u.uViewport.value.set(viewport.width, viewport.height);

    const level = getAudioLevel();
    u.uAudio.value = level;
    const rise = Math.max(0, level - lastAudioLevel.current);
    audioPulse.current = Math.max(audioPulse.current * 0.9, rise * 6);
    u.uAudioPulse.value = audioPulse.current;
    lastAudioLevel.current = level;

    if (fluid) {
      // The raw (undamped) pointer, same view-space `target` used for
      // uMouse above — the fluid sim's own advection+decay already supplies
      // the smoothing, so what drives it should be immediate, not doubly
      // lagged behind an already-damped value.
      pointerUv.set(target.x / viewport.width + 0.5, target.y / viewport.height + 0.5);
      const texture = fluid.step(state.gl, delta, pointerUv, true);
      u.uFluid.value = texture;
      u.uFluidStrength.value = 1;
    }
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} position={MESH_OFFSET}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

export default TraceField;
