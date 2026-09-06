'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

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

    vec3 pos = sampleCurve(u, aCurveIndex);

    /*
     * Curves are sampled by arc length, so speed along one is constant and
     * can't drive colour. Instead the accent marks arrival: a particle heats up
     * as it reaches either end of its link — which is where the nodes are — and
     * only a minority of particles carry any warmth at all. The field reads as
     * ink with hotspots at the nodes rather than a wall of red.
     */
    float atNode = 1.0 - smoothstep(0.0, 0.18, min(u, 1.0 - u));
    vHot = clamp(smoothstep(0.82, 1.0, aSeed) * 0.30 + atNode * 0.85, 0.0, 1.0);

    // Idle state: a diffuse drifting cloud that condenses onto the curves.
    vec3 flow = vec3(
      sin(pos.y * 1.3 + uTime * 0.30 + aSeed * 6.28),
      cos(pos.z * 1.1 - uTime * 0.25 + aSeed * 4.19),
      sin(pos.x * 1.7 + uTime * 0.20 + aSeed * 2.71)
    );
    pos += flow * uScatter * (1.4 + aSeed * 2.2);

    // Pointer pushes a soft well through the field.
    vec2 toMouse = pos.xy - uMouse.xy;
    float d = length(toMouse);
    pos.xy += normalize(toMouse + 1e-4) * smoothstep(2.6, 0.0, d) * uMouse.z;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uDpr * (26.0 / max(-mv.z, 0.1));
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3  uInk;
  uniform vec3  uSignal;
  uniform float uOpacity;

  varying float vHot;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;

    // Soft core plus a cheap falloff that reads as glow without a second pass.
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(1.0 - d * 2.0, 3.0);

    vec3 color = mix(uInk, uSignal, vHot);
    // Hot particles also carry a little more weight, so nodes read as denser.
    gl_FragColor = vec4(color, uOpacity * core * (0.45 + 0.55 * glow) * (0.85 + 0.35 * vHot));
  }
`;

// Scratch objects reused every frame — nothing is allocated inside useFrame.
const pointer = new THREE.Vector2();
const target = new THREE.Vector2();

export function TraceField({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

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
      uInk: { value: new THREE.Color('#6E655C') },
      uSignal: { value: new THREE.Color('#CE3A22') },
      uOpacity: { value: 0.72 },
    }),
    [orbit, flat]
  );

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
  });

  // Sits up and to the right: the hero type occupies the lower left, and the
  // diagram has to stay off it.
  return (
    <points geometry={geometry} frustumCulled={false} position={[1.5, 1.3, 0]}>
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
