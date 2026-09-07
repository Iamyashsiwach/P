'use client';

import React, { useRef } from 'react';
import { gsap, useGSAP } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

type VerticalTickerProps = {
  children: React.ReactNode;
  /** Which way the column drifts. Certifications goes up, Work goes down —
   * two columns moving in opposite directions read as a wall, not a list. */
  direction?: 'up' | 'down';
  /** Base travel speed in px/sec. */
  speed?: number;
  /** Fixed viewport height for the clipped scroll window. */
  height?: number;
  className?: string;
};

/**
 * A vertical answer to Marquee.tsx's horizontal technique — same wrap-modifier
 * approach, animating y instead of x, direction set once rather than reacting
 * to scroll velocity (nothing to react to: this isn't tied to page scroll).
 *
 * Unlike Marquee (purely decorative, aria-hidden, with the real content
 * living in an untouched list elsewhere), this list of certifications/work
 * items IS the primary content — real, tabbable links included. Only the
 * first copy stays in the accessibility tree and tab order; the copies that
 * exist purely to fill the wrap gap are marked `inert`, not just visually
 * hidden, so they cannot be tabbed into or announced.
 */
export function VerticalTicker({
  children,
  direction = 'up',
  speed = 26,
  height = 480,
  className,
}: VerticalTickerProps) {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced || !scope.current) return;

      const copies = gsap.utils.toArray<HTMLElement>('[data-ticker-copy]', scope.current);
      const first = copies[0];
      if (!first) return;

      const cycle = first.offsetHeight;
      if (!cycle) return;

      const sign = direction === 'up' ? -1 : 1;
      const wrap = gsap.utils.wrap(sign === -1 ? -cycle : 0, sign === -1 ? 0 : cycle);

      const tween = gsap.to(copies, {
        y: `+=${sign * cycle}`,
        duration: cycle / speed,
        ease: 'none',
        repeat: -1,
        modifiers: { y: gsap.utils.unitize(wrap) },
      });

      // Pausing rather than stopping keeps the wrap math intact — resuming
      // just continues the same tween instead of recomputing a fresh cycle.
      const pause = () => tween.pause();
      const resume = () => tween.play();

      const el = scope.current;
      el.addEventListener('pointerenter', pause);
      el.addEventListener('pointerleave', resume);
      el.addEventListener('focusin', pause);
      el.addEventListener('focusout', resume);

      return () => {
        el.removeEventListener('pointerenter', pause);
        el.removeEventListener('pointerleave', resume);
        el.removeEventListener('focusin', pause);
        el.removeEventListener('focusout', resume);
        tween.kill();
      };
    },
    {
      scope,
      dependencies: [reduced, direction, speed],
      // @gsap/react defers cleanup to unmount by default once a
      // dependencies array is passed (so repeated dependency changes can
      // ADD animations rather than replace them) — without this, the tween
      // created on the very first render (before usePrefersReducedMotion's
      // effect has corrected `reduced` from its SSR-safe `false` default)
      // is never reverted once `reduced` flips true; it just keeps running
      // forever. This restores the "revert old, then re-run" behaviour a
      // plain useEffect dependency array would give for free.
      revertOnUpdate: true,
    }
  );

  return (
    <div
      ref={scope}
      data-ticker
      className={`overflow-hidden ${className ?? ''}`}
      style={{ height }}
    >
      <div className="flex flex-col will-change-transform">
        {/* Three copies: enough that at least two always cover the visible
            window while the third fills the gap the wrap leaves behind. */}
        {[0, 1, 2].map(i => (
          <div key={i} data-ticker-copy inert={i > 0 || undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VerticalTicker;
