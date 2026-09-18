'use client';

import React, { useEffect, useRef } from 'react';
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
 * exist purely to fill the wrap gap are aria-hidden with their links pulled
 * out of the tab order, so they cannot be tabbed into or announced.
 *
 * Not `inert`, which this used to be: inert also removes an element from
 * hit-testing, and at almost any moment part of the visible window is a
 * filler copy — so a row a visitor could plainly see was dead to a real
 * click. Screen readers and keyboard users only ever need the first copy;
 * a mouse or finger needs whichever copy happens to be under it.
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

  // React never sets tabIndex on these nodes itself, so this survives
  // re-renders; it re-runs anyway in case children swapped out the nodes.
  useEffect(() => {
    scope.current
      ?.querySelectorAll<HTMLElement>('[data-ticker-copy][aria-hidden] :is(a, button)')
      .forEach(el => (el.tabIndex = -1));
  });

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

      // 'up' needs no extra setup: with the three copies stacked at their
      // natural flow positions (0, cycle, 2*cycle), the second copy is
      // already sitting below the window, ready to slide up into it as the
      // first exits above. 'down' is the mirror case — the window needs a
      // copy ABOVE it (negative flow position) ready to slide down in as
      // the first copy exits below, but nothing sits above position 0 in
      // normal DOM flow. A static negative margin on the track (not a GSAP
      // transform, so the wrap modifier below never touches it) shifts the
      // whole stack up by one cycle, turning 0/cycle/2cycle into the
      // -cycle/0/cycle arrangement 'down' actually needs. Without this the
      // window had nothing to show while the exiting copy cleared it —
      // reported as the ticker "going empty".
      const track = scope.current.querySelector<HTMLElement>('[data-ticker-track]');
      if (track) track.style.marginTop = sign === 1 ? `-${cycle}px` : '';

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

      // The wrap modifier leaves each copy sitting at whatever mid-cycle
      // translateY it last had — harmless while the CSS clip hides the
      // other two, but the print stylesheet un-clips the container and
      // un-hides only the one real copy (the print CSS in globals.css
      // hides [data-ticker-copy][aria-hidden]). Left alone, that surviving copy
      // still renders at its last live scroll offset instead of at rest,
      // overlapping whatever content sits above or below it on paper. Same
      // fix as Reveal.tsx's SplitText revert: pause and zero the transform
      // before print, restore it after.
      const onBeforePrint = () => {
        tween.pause();
        gsap.set(copies, { y: 0 });
        if (track) track.style.marginTop = '0px';
      };
      const onAfterPrint = () => {
        if (track) track.style.marginTop = sign === 1 ? `-${cycle}px` : '';
        tween.play();
      };
      window.addEventListener('beforeprint', onBeforePrint);
      window.addEventListener('afterprint', onAfterPrint);

      return () => {
        el.removeEventListener('pointerenter', pause);
        el.removeEventListener('pointerleave', resume);
        el.removeEventListener('focusin', pause);
        el.removeEventListener('focusout', resume);
        window.removeEventListener('beforeprint', onBeforePrint);
        window.removeEventListener('afterprint', onAfterPrint);
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
      <div data-ticker-track className="flex flex-col will-change-transform">
        {/* Three copies: enough that at least two always cover the visible
            window while the third fills the gap the wrap leaves behind. */}
        {[0, 1, 2].map(i => (
          <div key={i} data-ticker-copy aria-hidden={i > 0 || undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VerticalTicker;
