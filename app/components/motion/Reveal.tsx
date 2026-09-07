'use client';

import React, { useRef } from 'react';
import { gsap, useGSAP, SplitText, ScrollTrigger, ease, duration, START } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { useTheme } from '@/app/components/theme/ThemeProvider';

type RevealProps = {
  children: React.ReactNode;
  /** What to split into. Chars for short display text, lines for prose. */
  by?: 'chars' | 'words' | 'lines';
  /** Seconds between each piece. */
  stagger?: number;
  delay?: number;
  /** Animate on mount instead of on scroll. */
  immediate?: boolean;
  className?: string;
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'span';
};

/**
 * Split-text reveal. Pieces rise out of an overflow-hidden mask rather than
 * fading, which reads as physical rather than as a CSS transition.
 *
 * The text is present and visible in the markup; this only ever animates *from*
 * an offset. If the script fails or never runs, the copy is still readable.
 */
export function Reveal({
  children,
  by = 'lines',
  stagger,
  delay = 0,
  immediate = false,
  className,
  as: Tag = 'div',
}: RevealProps) {
  const scope = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  // Blueprint mode swaps the heading/body font, which changes line-wrap geometry
  // — a `by="lines"` split computed under the old font no longer matches how
  // the text would actually wrap, so re-run the split whenever the theme
  // changes, not just on mount.
  const { theme } = useTheme();

  // Reduced motion forbids movement, not change. A plain opacity fade — no
  // SplitText, no y-offset — still gives the arrival a felt moment without
  // being a vestibular trigger, instead of the page reading as inert.
  //
  // Kept in its own hook, without `theme` in its dependencies: a theme
  // toggle must not replay this fade on every Reveal-wrapped element on the
  // page simultaneously, which is exactly the kind of sudden motion a
  // reduced-motion visitor turned this setting on to avoid.
  useGSAP(
    () => {
      if (!reduced || !scope.current) return;

      const tween = gsap.fromTo(
        scope.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.12,
          delay,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: scope.current, start: START, once: true } }),
        }
      );
      return () => {
        tween.kill();
      };
    },
    // revertOnUpdate: see the full-motion hook below.
    { scope, dependencies: [reduced, delay, immediate], revertOnUpdate: true }
  );

  useGSAP(
    () => {
      if (reduced || !scope.current) return;

      const defaultStagger = by === 'chars' ? 0.018 : by === 'words' ? 0.03 : 0.04;

      let split: SplitText | null = null;
      let tween: gsap.core.Tween | null = null;

      // Splitting before webfonts settle measures the fallback face and breaks
      // lines in the wrong places.
      const run = () => {
        if (!scope.current) return;

        split = new SplitText(scope.current, {
          type: by,
          mask: by,
          linesClass: 'overflow-hidden',
        });

        tween = gsap.from(split[by], {
          yPercent: 110,
          duration: duration.reveal,
          ease: ease.out,
          stagger: stagger ?? defaultStagger,
          delay,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: scope.current, start: START, once: true } }),
        });
      };

      document.fonts.ready.then(() => {
        run();
        ScrollTrigger.refresh();
      });

      return () => {
        tween?.kill();
        split?.revert();
      };
    },
    // Without this, a SplitText/tween queued via document.fonts.ready before
    // reduced motion's SSR-safe `false` default gets corrected can still
    // play in full once fonts settle — @gsap/react defers cleanup to unmount
    // by default once a dependencies array is passed.
    {
      scope,
      dependencies: [reduced, by, stagger, delay, immediate, theme],
      revertOnUpdate: true,
    }
  );

  return (
    <Tag ref={scope as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
}

export default Reveal;
