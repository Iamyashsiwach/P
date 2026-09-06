import * as THREE from 'three';

/**
 * A velocity-only fluid-like field: self-advection + cursor-driven force
 * injection + per-step decay. Deliberately not a full pressure-projected
 * incompressible solver (no divergence pass, no Jacobi pressure iteration,
 * no vorticity confinement) — that's the textbook "stable fluids" technique
 * and it's the right call for a scientific simulation, but for a decorative
 * background effect it trades a large amount of implementation risk
 * (Jacobi convergence, boundary conditions, numerical blow-up) for a
 * property nobody can see here (exact mass conservation). Advection with
 * decay is numerically stable by construction — velocity can only shrink
 * between force injections, so there's no failure mode where it diverges —
 * and still reads as fluid: the cursor drags a swirling, momentum-carrying
 * field, which is the entire payoff this feeds into TraceField for.
 *
 * Ping-pongs two RGBA16F render targets, alternating which is "read" and
 * which is "write" after each of the two passes (splat, then advect) — that
 * alternation is what lets two buffers serve three logical states (before
 * splat, after splat, after advect) per frame.
 */

const splatFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform vec2 uPoint;
  uniform vec2 uForce;
  uniform float uRadius;
  varying vec2 vUv;

  void main() {
    vec2 vel = texture2D(uVelocity, vUv).xy;
    float d = distance(vUv, uPoint);
    float falloff = exp(-d * d / uRadius);
    vel += uForce * falloff;
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

const advectFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform float uDt;
  uniform float uDissipation;
  varying vec2 vUv;

  void main() {
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vec2 backUv = vUv - vel * uDt;
    vec2 advected = texture2D(uVelocity, backUv).xy;
    gl_FragColor = vec4(advected * uDissipation, 0.0, 1.0);
  }
`;

const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

function makeTarget(size: number) {
  return new THREE.WebGLRenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export class FluidSim {
  private size: number;
  private targets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private quad: THREE.Mesh;
  private splatMaterial: THREE.ShaderMaterial;
  private advectMaterial: THREE.ShaderMaterial;
  private readIndex = 0;
  private lastPoint: { x: number; y: number } | null = null;

  constructor(size: number) {
    this.size = size;
    this.targets = [makeTarget(size), makeTarget(size)];

    this.splatMaterial = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: splatFragment,
      uniforms: {
        uVelocity: { value: null },
        uPoint: { value: new THREE.Vector2(0.5, 0.5) },
        uForce: { value: new THREE.Vector2(0, 0) },
        uRadius: { value: 0.0025 },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.advectMaterial = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: advectFragment,
      uniforms: {
        uVelocity: { value: null },
        uDt: { value: 0 },
        uDissipation: { value: 0.985 },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.splatMaterial);
    this.scene.add(this.quad);
  }

  /** Rebuilds both targets at a new resolution — used by the performance
   * decline ladder (128 -> 64). Old targets are disposed, not leaked. */
  resize(size: number) {
    if (size === this.size) return;
    this.size = size;
    this.targets[0].dispose();
    this.targets[1].dispose();
    this.targets = [makeTarget(size), makeTarget(size)];
    this.lastPoint = null;
  }

  private read() {
    return this.targets[this.readIndex].texture;
  }

  private renderPass(renderer: THREE.WebGLRenderer, material: THREE.ShaderMaterial) {
    const writeIndex = this.readIndex === 0 ? 1 : 0;
    this.quad.material = material;
    renderer.setRenderTarget(this.targets[writeIndex]);
    renderer.render(this.scene, this.camera);
    this.readIndex = writeIndex;
  }

  /**
   * `point` is in the same 0..1 UV space TraceField maps particle positions
   * into (see uFluidUv in TraceField's vertex shader) — `active` is false
   * when there's no live pointer (e.g. touch lifted), which skips the splat
   * pass entirely rather than injecting a stale/zero force every frame.
   */
  step(
    renderer: THREE.WebGLRenderer,
    dt: number,
    point: { x: number; y: number } | null,
    active: boolean
  ) {
    const prevTarget = renderer.getRenderTarget();

    if (active && point) {
      const force = this.lastPoint
        ? { x: (point.x - this.lastPoint.x) * 12, y: (point.y - this.lastPoint.y) * 12 }
        : { x: 0, y: 0 };

      this.splatMaterial.uniforms.uVelocity.value = this.read();
      this.splatMaterial.uniforms.uPoint.value.set(point.x, point.y);
      this.splatMaterial.uniforms.uForce.value.set(force.x, force.y);
      this.renderPass(renderer, this.splatMaterial);
      this.lastPoint = point;
    } else {
      this.lastPoint = null;
    }

    this.advectMaterial.uniforms.uVelocity.value = this.read();
    this.advectMaterial.uniforms.uDt.value = Math.min(dt, 1 / 30);
    this.renderPass(renderer, this.advectMaterial);

    renderer.setRenderTarget(prevTarget);
    return this.read();
  }

  dispose() {
    this.targets[0].dispose();
    this.targets[1].dispose();
    this.splatMaterial.dispose();
    this.advectMaterial.dispose();
    this.quad.geometry.dispose();
  }
}

export default FluidSim;
