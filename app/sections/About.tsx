'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { about } from '@/app/lib/content';
import { gsap, useGSAP, SplitText, ScrollTrigger } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';

export function About() {
  const prose = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Words brighten from muted to full ink as they scroll through the viewport,
  // so the paragraph reads as if it is being lit up rather than faded in.
  useGSAP(
    () => {
      if (reduced || !prose.current) return;

      let split: SplitText | null = null;
      let trigger: ScrollTrigger | null = null;

      document.fonts.ready.then(() => {
        if (!prose.current) return;

        split = new SplitText(prose.current, { type: 'words' });

        const tween = gsap.fromTo(
          split.words,
          { color: 'hsl(var(--ink-mute))' },
          {
            color: 'hsl(var(--ink))',
            stagger: 0.6,
            ease: 'none',
            scrollTrigger: {
              trigger: prose.current,
              start: 'top 80%',
              end: 'bottom 60%',
              scrub: true,
            },
          }
        );

        trigger = tween.scrollTrigger ?? null;
        ScrollTrigger.refresh();
      });

      return () => {
        trigger?.kill();
        split?.revert();
      };
    },
    { scope: prose, dependencies: [reduced] }
  );

  return (
    <section id="about" aria-labelledby="about-heading" className="section-rhythm">
      <div className="grid-shell">
        <SectionHeading id="about-heading" eyebrow={about.eyebrow} title={about.heading} />

        {/* The spec sheet and portrait stick as one unit — making only the list
            sticky lets the portrait scroll up over it. */}
        <div className="col-span-12 mt-16 md:col-span-4">
          <div className="sticky top-24">
            <dl className="border-t border-border">
              {about.spec.map(row => (
                <div key={row.term} className="border-b border-border py-4">
                  <dt className="mono-label">{row.term}</dt>
                  <dd className="mt-2 font-mono text-sm text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 border border-border p-2">
              <Image
                src={about.portrait.src}
                alt={about.portrait.alt}
                width={720}
                height={900}
                sizes="(max-width: 768px) 100vw, 30vw"
                className="w-full grayscale transition-[filter] duration-700 hover:grayscale-0"
              />
            </div>
          </div>
        </div>

        <div ref={prose} className="col-span-12 mt-16 space-y-6 md:col-span-7 md:col-start-6">
          {about.paragraphs.map(paragraph => (
            <p key={paragraph.slice(0, 24)} className="text-body">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
