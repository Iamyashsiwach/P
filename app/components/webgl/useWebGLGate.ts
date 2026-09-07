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
 * Decides whether this device gets the 3D scene at all. Everything that
 * fails here sees nothing in its place — the hero's text and layout still
 * work fine without it, there just isn't a fallback graphic. Environments
 * that block WebGL2 outright (an aggressive browser privacy mode, for one)
 * fail this gate the same as a genuinely incapable device.
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

    const wide = window.matchMedia('(min-width: 768px)');
    const evaluate = () =>
      setCapable(
        wide.matches &&
          !nav.connection?.saveData &&
          (nav.hardwareConcurrency ?? 8) >= 4 &&
          (nav.deviceMemory ?? 8) >= 4 &&
          hasWebGL2()
      );

    evaluate();
    wide.addEventListener('change', evaluate);
    return () => wide.removeEventListener('change', evaluate);
  }, [reduced]);

  return capable;
}
