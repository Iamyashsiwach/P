/**
 * Whether this WebGL2 context can render into a half-float texture at all —
 * sampling/filtering half-float is core WebGL2, but attaching one to a
 * framebuffer as a render target (which FluidSim does every frame) needs
 * this extension. Everything that fails this sees TraceField exactly as it
 * renders without the fluid layer: uFluidStrength just stays 0.
 */
export function hasGpgpuSupport(gl: WebGL2RenderingContext | null | undefined): boolean {
  if (!gl) return false;
  try {
    return !!gl.getExtension('EXT_color_buffer_float');
  } catch {
    return false;
  }
}
