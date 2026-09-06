'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { about } from '@/app/lib/content';
import { gsap, useGSAP, SplitText, ScrollTrigger } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';
import { useTheme } from '@/app/components/theme/ThemeProvider';

export function About() {
  const prose = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  // --ink/--ink-mute are read once below via getComputedStyle, so this tween
  // must rebuild whenever the theme changes or it stays frozen on whichever
  // theme's colors happened to be current at first paint.
  const { theme } = useTheme();

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

        // GSAP's color tween parses the string itself and can't resolve a
        // nested CSS var(), so read the actual values before handing them off.
        const rootStyle = getComputedStyle(document.documentElement);
        const inkMute = `hsl(${rootStyle.getPropertyValue('--ink-mute').trim()})`;
        const ink = `hsl(${rootStyle.getPropertyValue('--ink').trim()})`;

        const tween = gsap.fromTo(
          split.words,
          { color: inkMute },
          {
            color: ink,
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
    { scope: prose, dependencies: [reduced, theme] }
  );

  return (
    <section id="about" aria-labelledby="about-heading" className="section-rhythm">
      <div className="grid-shell">
        <SectionHeading id="about-heading" eyebrow={about.eyebrow} title={about.heading} />

        {/* The spec sheet and portrait stick as one unit — making only the list
            sticky lets the portrait scroll up over it. */}
        <div className="col-span-12 mt-10 md:col-span-4 md:mt-16">
          <div className="md:sticky md:top-24">
            <dl className="border-t border-border">
              {about.spec.map(row => (
                <div key={row.term} className="border-b border-border py-3 md:py-4">
                  <dt className="mono-label">{row.term}</dt>
                  <dd className="mt-2 font-mono text-sm text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>

            {/* Shrunk to a small square on mobile instead of full-width — the
                source photo is a square circular portrait, and stretched
                across the full screen width it ran nearly as tall as the
                viewport before you'd even reached the bio text below it.
                Square crop on a square source is a clean scale-down with no
                cropping; md:object-fill restores the original full-bleed
                stretch untouched at desktop sizes. */}
            <div className="mt-6 border border-border p-2 md:mt-8">
              <Image
                src={about.portrait.src}
                alt={about.portrait.alt}
                width={720}
                height={900}
                sizes="(max-width: 768px) 160px, 30vw"
                className="mx-auto h-40 w-40 object-cover grayscale transition-[filter] duration-700 hover:grayscale-0 md:h-auto md:w-full md:object-fill"
              />
            </div>
          </div>
        </div>

        <div
          ref={prose}
          className="col-span-12 mt-10 space-y-6 md:col-span-7 md:col-start-6 md:mt-16"
        >
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
