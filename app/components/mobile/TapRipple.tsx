'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

/**
 * The mobile answer to the desktop custom cursor: touch has no hover state
 * to signal "the site felt that," so a tap spawns a ring that expands and
 * fades instead. Fires for touch input only — a mouse already has Cursor.tsx.
 */
export function TapRipple() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: coarse)').matches) return;

    const container = containerRef.current;
    if (!container) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;

      const ring = document.createElement('span');
      const size = 10;
      ring.className = 'absolute rounded-full border border-ink';
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.left = `${event.clientX - size / 2}px`;
      ring.style.top = `${event.clientY - size / 2}px`;
      container.appendChild(ring);

      gsap.to(ring, {
        scale: 4,
        opacity: 0,
        duration: 0.5,
        ease: 'out',
        onComplete: () => ring.remove(),
      });
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[82] overflow-hidden"
    />
  );
}

export default TapRipple;
