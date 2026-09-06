'use client';

import { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/app/lib/motion';

/**
 * The site motif at its thinnest: a single hairline across the top of the
 * viewport that fills as you read.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!bar.current) return;

    gsap.set(bar.current, { scaleX: 0, transformOrigin: 'left center' });

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: self => gsap.set(bar.current, { scaleX: self.progress }),
    });

    return () => trigger.kill();
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[90] h-px bg-transparent">
      <div ref={bar} className="h-full w-full bg-signal" />
    </div>
  );
}

export default ScrollProgress;
