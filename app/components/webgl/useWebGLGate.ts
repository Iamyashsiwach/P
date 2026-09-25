'use client';

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

type Navigator2 = Navigator & {
  connection?: { saveData?: boolean };
};

// CPU rasterizers standing in for a missing or blocklisted GPU.
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|basic render driver|software/i;

/**
 * Probe for a hardware-accelerated WebGL2 context, then hand it straight
 * back. A software-rendered context still "works", but then every frame of
 * the 40k-particle scene is drawn on the CPU: measured with Lighthouse, the
 * same page went from ~4s to ~7.5s of main-thread work and TBT roughly
 * tripled. PageSpeed Insights runs on GPU-less machines, which is where its
 * 1–2s of TBT came from — and real visitors without GPU acceleration (VMs,
 * remote desktops, blocklisted drivers) got the same jank.
 *
 * Checked by renderer string because failIfMajorPerformanceCaveat, the
 * flag meant for exactly this, still hands back a context for Chrome's
 * SwiftShader-over-ANGLE (verified), so it catches nothing here.
 */
function hasWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !SOFTWARE_RENDERER.test(renderer);
  } catch {
    return false;
  }
}

/**
 * Decides whether this device gets the 3D scene at all — phone or desktop,
 * same bar: hardware concurrency, a hardware-accelerated WebGL2 context,
 * and not on a metered connection. No screen-width cutoff, deliberately: a modern phone
 * that clears the same hardware checks a laptop would gets the same scene,
 * not a downgraded one. TouchField is the fallback for whatever doesn't
 * clear this bar and has a coarse pointer; everything else just sees the
 * hero's text and layout with no graphic at all.
 *
 * No deviceMemory check, deliberately — it's the opposite of a reliable
 * signal on the phones that matter most here. iOS Safari never exposes it
 * at all (silently defaults through), and Chrome's implementation on
 * Android rounds a device's real RAM down to a coarse power-of-two-ish
 * bucket for privacy — a real 6-8GB phone commonly reports 4 or less. A
 * >=4 threshold was silently dropping ordinary, perfectly capable phones to
 * TouchField's plainer fallback instead of the real scene. hardwareConcurrency
 * has no such quirk and is the much more honest signal.
 *
 * Returns false during SSR and on the first client render, so the WebGL chunk
 * is only ever requested after these checks pass.
 */
export function useWebGLGate() {
  const reduced = usePrefersReducedMotion();
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    if (reduced) {
      setCapable(false);
      return;
    }

    const nav = navigator as Navigator2;

    setCapable(!nav.connection?.saveData && (nav.hardwareConcurrency ?? 8) >= 4 && hasWebGL2());
  }, [reduced]);

  return capable;
}
