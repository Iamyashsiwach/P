'use client';

import React, { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

type MarqueeProps = {
  children: React.ReactNode;
  /** Base travel speed in px/sec. */
  speed?: number;
  className?: string;
};

/**
 * Seamless infinite marquee that reacts to scroll velocity — it accelerates
 * while you scroll and flips direction when you reverse.
 *
 * The wrap is done with a modifier on x rather than by restarting a tween, so
 * there is no seam and no layout read per frame.
 */
export function Marquee({ children, speed = 60, className }: MarqueeProps) {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced || !scope.current) return;

      const track = scope.current.querySelector<HTMLElement>('[data-marquee-track]');
      const items = gsap.utils.toArray<HTMLElement>('[data-marquee-item]', scope.current);
      if (!track || items.length === 0) return;

      const cycle = items[0].offsetWidth;
      if (!cycle) return;

      const wrap = gsap.utils.wrap(-cycle, 0);
      const direction = { value: 1 };

      const tween = gsap.to(items, {
        x: `-=${cycle}`,
        duration: cycle / speed,
        ease: 'none',
        repeat: -1,
        modifiers: { x: gsap.utils.unitize(wrap) },
      });

      /*
       * Speed and direction are handled separately on purpose.
       *
       * timeScale only ever carries the *speed*, and stays strictly positive:
       * interpolating it from +1 to -1 would pass through 0, and a timeScale of
       * 0 on a repeat:-1 tween gives it an unbounded total duration, which locks
       * the main thread. Direction flips instantly via reversed() instead.
       */
      const rate = { value: 1 };
      const applyRate = gsap.quickTo(rate, 'value', {
        duration: 0.4,
        ease: 'power2',
        onUpdate: () => tween.timeScale(Math.max(0.05, rate.value)),
      });

      const trigger = ScrollTrigger.create({
        onUpdate: self => {
          const velocity = self.getVelocity();
          const sign = velocity < 0 ? -1 : 1;

          if (sign !== direction.value) {
            direction.value = sign;
            tween.reversed(sign === -1);
          }

          applyRate(gsap.utils.clamp(1, 5, 1 + Math.abs(velocity) / 800));
        },
      });

      // Coast back to the resting speed once scrolling stops.
      const onScrollEnd = () => applyRate(1);
      ScrollTrigger.addEventListener('scrollEnd', onScrollEnd);

      return () => {
        ScrollTrigger.removeEventListener('scrollEnd', onScrollEnd);
        trigger.kill();
        tween.kill();
      };
    },
    // Without this, the repeat:-1 tween created before reduced motion's
    // SSR-safe `false` default gets corrected is never torn down — @gsap/react
    // defers cleanup to unmount by default once a dependencies array is
    // passed, so the marquee would keep scrolling forever regardless.
    { scope, dependencies: [reduced, speed], revertOnUpdate: true }
  );

  return (
    <div ref={scope} className={`overflow-hidden ${className ?? ''}`} aria-hidden="true">
      <div data-marquee-track className="flex w-max flex-nowrap will-change-transform">
        {/* Duplicated so there is always a copy filling the gap left by the wrap. */}
        {[0, 1, 2].map(i => (
          <div key={i} data-marquee-item className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
