'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

/**
 * Lenis driven by gsap.ticker rather than its own rAF, so the entire site runs
 * on a single animation frame loop and ScrollTrigger can never read a scroll
 * position that Lenis has already moved past.
 *
 * Disabled entirely under reduced motion — smooth scroll is a vestibular
 * trigger, so the native scroll is the correct behaviour, not a degraded one.
 */
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anchors have to go through Lenis or they fight the virtual scroll.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement)?.closest?.('a[href^="#"]');
      const href = anchor?.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    };

    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}

export default SmoothScroll;
