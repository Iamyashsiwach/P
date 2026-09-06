'use client';

import { useCallback, useEffect, useState } from 'react';
import { gsap } from '@/app/lib/motion';
import { setTilt } from '@/app/lib/tilt';

const CLAMP_DEG = 18;
/** Low-pass factor: 0 (frozen) .. 1 (no smoothing). Too high and every hand
 * tremor becomes visible, which reads as nauseating rather than responsive. */
const SMOOTH = 0.08;
/** Comfortable phone-holding pitch, in degrees, treated as "level." */
const HOLD_PITCH = 45;

type OrientationEventCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

/**
 * Opt-in only: iOS 13+ requires DeviceOrientationEvent.requestPermission()
 * from a direct user gesture, and calling it unprompted just silently
 * rejects. So this never auto-requests — a visible chip calls requestEnable
 * from an onClick, which is the only context the permission prompt actually
 * appears in.
 */
export function useTiltParallax() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'DeviceOrientationEvent' in window);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma ?? 0; // left/right tilt
      const beta = (event.beta ?? HOLD_PITCH) - HOLD_PITCH; // front/back, zeroed at holding angle
      target.x = Math.max(-CLAMP_DEG, Math.min(CLAMP_DEG, gamma));
      target.y = Math.max(-CLAMP_DEG, Math.min(CLAMP_DEG, beta));
    };
    window.addEventListener('deviceorientation', onOrientation);

    // One rAF for the whole site: driven from gsap.ticker, not a second loop.
    const tick = () => {
      current.x += (target.x - current.x) * SMOOTH;
      current.y += (target.y - current.y) * SMOOTH;
      setTilt(current.x, current.y);
    };
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('deviceorientation', onOrientation);
      gsap.ticker.remove(tick);
      setTilt(0, 0);
    };
  }, [enabled]);

  const requestEnable = useCallback(async () => {
    const ctor = (window as unknown as { DeviceOrientationEvent?: OrientationEventCtor })
      .DeviceOrientationEvent;

    if (typeof ctor?.requestPermission === 'function') {
      try {
        const result = await ctor.requestPermission();
        if (result === 'granted') setEnabled(true);
      } catch {
        // Dismissed, or called outside a user-gesture tick — leave disabled.
      }
      return;
    }

    // Android and everything else: no permission gate to pass.
    setEnabled(true);
  }, []);

  const disable = useCallback(() => setEnabled(false), []);

  return { supported, enabled, requestEnable, disable };
}

export default useTiltParallax;
