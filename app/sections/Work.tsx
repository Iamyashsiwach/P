'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { work } from '@/app/lib/content';
import { gsap, useGSAP, ease, duration } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';

/**
 * An index list rather than a carousel: every project is visible at once, and
 * adding a seventh means appending to `work.projects` — no layout change.
 *
 * Hovering a row floats that project's screenshot near the cursor. Phase 4
 * replaces this DOM preview with a WebGL plane; the markup stays the same, so
 * touch and reduced-motion users keep the inline thumbnails either way.
 */
export function Work() {
  const scope = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = preview.current;
      if (reduced || !el) return;
      if (!window.matchMedia('(pointer: fine)').matches) return;

      const opts = { duration: 0.7, ease: ease.out };
      const moveX = gsap.quickTo(el, 'x', opts);
      const moveY = gsap.quickTo(el, 'y', opts);

      const onMove = (event: PointerEvent) => {
        moveX(event.clientX + 24);
        moveY(event.clientY - 120);
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    { dependencies: [reduced] }
  );

  useGSAP(
    () => {
      if (reduced || !preview.current) return;
      gsap.to(preview.current, {
        opacity: hovered === null ? 0 : 1,
        scale: hovered === null ? 0.96 : 1,
        duration: duration.fast,
        ease: ease.out,
      });
    },
    { dependencies: [hovered, reduced] }
  );

  return (
    <section id="work" ref={scope} aria-labelledby="work-heading" className="section-rhythm">
      <div className="grid-shell">
        <SectionHeading id="work-heading" eyebrow={work.eyebrow} title={work.heading} />

        <ol className="col-span-12 mt-16 border-t border-border">
          {work.projects.map((project, i) => {
            const Row = project.href ? 'a' : 'div';
            return (
              <li key={project.title} className="border-b border-border">
                <Row
                  {...(project.href
                    ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  data-cursor={project.href ? 'view' : undefined}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="group grid grid-cols-12 items-baseline gap-4 py-6 transition-colors md:py-8"
                >
                  <span
                    data-numeric
                    className="col-span-2 font-mono text-xs text-ink-mute md:col-span-1"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="col-span-10 md:col-span-5">
                    <h3 className="font-display text-display-m text-ink transition-colors group-hover:text-signal">
                      {project.title}
                    </h3>
                    <p className="mt-2 font-mono text-xs text-ink-mute">
                      {project.year} · {project.role}
                    </p>
                  </div>

                  <div className="col-span-12 max-w-prose md:col-span-5 md:col-start-7">
                    {/* Clamped to 2 lines on mobile — the full blurb plus tech
                        line plus the thumbnail below was most of what made
                        this list such a long scroll on a phone; the full
                        text is still one tap away via the project link. */}
                    <p className="line-clamp-2 text-sm leading-relaxed text-ink-dim md:line-clamp-none">
                      {project.blurb}
                    </p>
                    <p className="mt-3 font-mono text-xs text-ink-mute">
                      {project.tech.join(' · ')}
                    </p>
                  </div>

                  {/* Inline thumbnail: the only preview on touch and reduced
                      motion — shrunk on mobile so it reads as a reference
                      strip, not a full-width hero image per project. */}
                  <div className="col-span-12 mt-3 md:hidden">
                    <Image
                      src={project.image}
                      alt=""
                      width={640}
                      height={400}
                      sizes="100vw"
                      className="h-28 w-full border border-border object-cover"
                    />
                  </div>
                </Row>
              </li>
            );
          })}
        </ol>
      </div>

      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[70] hidden w-[280px] border border-border bg-paper opacity-0 shadow-2xl [@media(pointer:fine)]:block"
      >
        {hovered !== null && (
          <Image
            src={work.projects[hovered].image}
            alt=""
            width={560}
            height={360}
            sizes="280px"
            className="h-[180px] w-full object-cover"
          />
        )}
      </div>
    </section>
  );
}

export default Work;
