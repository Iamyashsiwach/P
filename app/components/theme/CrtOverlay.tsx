'use client';

import { useTheme } from './ThemeProvider';

/**
 * Scanlines + vignette, Hacker Mode only. Static gradients and a stepped
 * opacity keyframe — never an animated filter:blur() or animated SVG
 * gradient (an earlier version of this site animated 51 SVG gradients at
 * once and crashed Firefox; see README).
 */
export function CrtOverlay() {
  const { theme } = useTheme();
  if (theme !== 'terminal') return null;

  return (
    <div aria-hidden="true" className="crt-overlay pointer-events-none fixed inset-0 z-[85]" />
  );
}

export default CrtOverlay;
