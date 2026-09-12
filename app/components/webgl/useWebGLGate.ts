'use client';

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

type Navigator2 = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** Probe for a real WebGL2 context, then hand it straight back. */
function hasWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Decides whether this device gets the 3D scene at all — phone or desktop,
 * same bar: hardware concurrency, device memory, a real WebGL2 context, and
 * not on a metered connection. No screen-width cutoff, deliberately: a
 * modern phone that clears the same hardware checks a laptop would gets the
 * same scene, not a downgraded one. TouchField is the fallback for whatever
 * doesn't clear this bar and has a coarse pointer; everything else just sees
 * the hero's text and layout with no graphic at all.
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

    setCapable(
      !nav.connection?.saveData &&
        (nav.hardwareConcurrency ?? 8) >= 4 &&
        (nav.deviceMemory ?? 8) >= 4 &&
        hasWebGL2()
    );
  }, [reduced]);

  return capable;
}
