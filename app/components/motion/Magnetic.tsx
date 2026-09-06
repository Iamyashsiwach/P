'use client';

import React, { useRef } from 'react';
import { gsap, useGSAP, ease } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

type MagneticProps = {
  children: React.ReactNode;
  /** How far the element is allowed to travel toward the cursor, in px. */
  strength?: number;
  className?: string;
};

/**
 * Pulls an element toward the cursor while it is nearby, and lets the inner
 * label trail slightly behind the shell — that parallax between the two is what
 * separates this from a plain translate.
 *
 * Uses quickTo so pointer movement writes into a running tween instead of
 * starting a new one per event.
 */
export function Magnetic({ children, strength = 18, className }: MagneticProps) {
  const shell = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = shell.current;
      const inner = label.current;
      if (reduced || !el || !inner) return;

      // Coarse pointers have no hover state to respond to.
      if (!window.matchMedia('(pointer: fine)').matches) return;

      const opts = { duration: 0.6, ease: ease.out };
      const moveX = gsap.quickTo(el, 'x', opts);
      const moveY = gsap.quickTo(el, 'y', opts);
      const labelX = gsap.quickTo(inner, 'x', opts);
      const labelY = gsap.quickTo(inner, 'y', opts);

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);

        moveX((dx / rect.width) * strength * 2);
        moveY((dy / rect.height) * strength * 2);
        labelX((dx / rect.width) * strength * 0.6);
        labelY((dy / rect.height) * strength * 0.6);
      };

      const onLeave = () => {
        moveX(0);
        moveY(0);
        labelX(0);
        labelY(0);
      };

      el.addEventListener('pointermove', onMove, { passive: true });
      el.addEventListener('pointerleave', onLeave);

      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: shell, dependencies: [reduced, strength] }
  );

  return (
    <span ref={shell} className={`inline-block will-change-transform ${className ?? ''}`}>
      <span ref={label} className="inline-block will-change-transform">
        {children}
      </span>
    </span>
  );
}

export default Magnetic;
