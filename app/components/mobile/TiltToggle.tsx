'use client';

import { useTiltParallax } from './useTiltParallax';

/**
 * Never auto-requested (see useTiltParallax) — this chip is the only place
 * the permission prompt can actually appear, since iOS requires it to come
 * from a direct user gesture.
 */
export function TiltToggle() {
  const { supported, enabled, requestEnable, disable } = useTiltParallax();
  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={() => (enabled ? disable() : requestEnable())}
      aria-pressed={enabled}
      className="pointer-events-auto font-mono text-mono-label uppercase tracking-[0.18em] text-ink-mute transition-colors hover:text-ink"
    >
      Tilt {enabled ? 'on' : 'off'}
    </button>
  );
}

export default TiltToggle;
