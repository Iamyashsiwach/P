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
  /** Grab a piece and fling it — it always springs back. Desktop only
   * (`pointer: fine`) and off under reduced motion; makes the most sense
   * with `by="chars"`. */
  throwable?: boolean;
  className?: string;
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'span';
};

type DraggableInstance = { kill: () => void };

// div/p/span map to ARIA's "generic" role, which prohibits aria-label —
// h1/h2/h3 map to "heading", which already allows it.
const GENERIC_TAGS = new Set(['div', 'p', 'span']);

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
  throwable = false,
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
      let draggables: DraggableInstance[] = [];

      const killDraggables = () => {
        draggables.forEach(d => d.kill());
        draggables = [];
      };

      // Wired to the reveal tween's onComplete, not to mount: a letter
      // can't be grabbed before it's finished arriving.
      const enableThrow = async () => {
        if (!split || !scope.current) return;
        if (!window.matchMedia('(pointer: fine)').matches) return;

        // SplitText's mask sets overflow:clip inline per char (verified in
        // SplitText.js source) — a dragged letter would otherwise be
        // clipped by its own mask the instant it moved.
        scope.current
          .querySelectorAll<HTMLElement>('.split-char-mask')
          .forEach(el => (el.style.overflow = 'visible'));

        // Draggable/InertiaPlugin only live in motion.heavy.ts, kept out of
        // the shared chunk every section pays for — same pattern as
        // Contact.tsx's copy-success burst.
        const { Draggable } = await import('@/app/lib/motion.heavy');
        // The import is async: theme change or print could have torn this
        // instance down while it was in flight.
        if (!split || !scope.current) return;

        draggables = Draggable.create(split.chars, {
          type: 'x,y',
          inertia: true,
          onDrag: function (this: { target: Element; deltaX: number }) {
            gsap.set(this.target, { rotation: this.deltaX * 0.6 });
          },
          onThrowComplete: function (this: { target: Element }) {
            gsap.to(this.target, {
              x: 0,
              y: 0,
              rotation: 0,
              duration: 0.9,
              ease: 'elastic.out(1, 0.5)',
            });
          },
        });
      };

      // Splitting before webfonts settle measures the fallback face and breaks
      // lines in the wrong places.
      const run = () => {
        if (!scope.current) return;
        killDraggables();

        split = new SplitText(scope.current, {
          type: by,
          mask: by,
          linesClass: 'overflow-hidden',
          // Empty by default (verified in SplitText.js source) unless
          // explicitly requested — without these, individual chars/words
          // are anonymous divs that nothing (this feature, or print CSS)
          // can target.
          charsClass: 'split-char',
          wordsClass: 'split-word',
        });

        tween = gsap.from(split[by], {
          yPercent: 110,
          duration: duration.reveal,
          ease: ease.out,
          stagger: stagger ?? defaultStagger,
          delay,
          onComplete: throwable ? enableThrow : undefined,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: scope.current, start: START, once: true } }),
        });
      };

      // document.fonts.ready and the reduced-motion correction (a separate
      // effect, on a separate component instance of this same hook) both
      // resolve "soon after mount" — if reduced flips true and this effect
      // gets cleaned up before fonts finish loading, this .then() would
      // otherwise still fire afterward on a stale closure, creating a
      // SplitText split that nothing left alive would ever revert.
      let cancelled = false;
      document.fonts.ready.then(() => {
        if (cancelled) return;
        run();
        ScrollTrigger.refresh();
      });

      // SplitText's mask sets overflow:clip inline, and an unrevealed
      // section sits at yPercent:110 inside it until its ScrollTrigger
      // fires — printing without ever having scrolled past a section would
      // print invisible headings. revert() restores the plain original
      // text (exactly what it's for); afterprint re-splits so the on-screen
      // reveal still works if printing happens mid-visit.
      const onBeforePrint = () => {
        killDraggables();
        split?.revert();
      };
      const onAfterPrint = () => {
        run();
        ScrollTrigger.refresh();
      };
      window.addEventListener('beforeprint', onBeforePrint);
      window.addEventListener('afterprint', onAfterPrint);

      return () => {
        cancelled = true;
        window.removeEventListener('beforeprint', onBeforePrint);
        window.removeEventListener('afterprint', onAfterPrint);
        killDraggables();
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
      dependencies: [reduced, by, stagger, delay, immediate, theme, throwable],
      revertOnUpdate: true,
    }
  );

  return (
    <Tag
      ref={scope as React.Ref<never>}
      // SplitText (in the non-reduced-motion effect above) sets aria-label
      // to the full text on this same element so screen readers hear one
      // sentence instead of one announcement per split char/word. A plain
      // div/p/span has role="generic", which the ARIA spec prohibits
      // aria-label on — "group" is the real spec role that allows it there.
      // Heading tags need no help: role="heading" already permits an
      // author-supplied name, and overriding it to "group" would stop them
      // being announced as headings at all, breaking heading navigation.
      role={GENERIC_TAGS.has(Tag) ? 'group' : undefined}
      className={className}
      data-cursor={throwable ? 'grab' : undefined}
      style={throwable ? { cursor: 'grab' } : undefined}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
