'use client';

import { useTheme } from './ThemeProvider';

/**
 * A faint graph-paper grid, Blueprint mode only — static gradients, no
 * animation. Calm and precise rather than a flickering effect: a technical
 * drawing doesn't move.
 */
export function BlueprintOverlay() {
  const { theme } = useTheme();
  if (theme !== 'blueprint') return null;

  return (
    <div
      aria-hidden="true"
      data-print-hide
      className="blueprint-overlay pointer-events-none fixed inset-0 z-[85]"
    />
  );
}

export default BlueprintOverlay;
