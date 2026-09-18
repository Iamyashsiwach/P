'use client';

import React from 'react';
import Image from 'next/image';
import { work, certifications } from '@/app/lib/content';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';
import { VerticalTicker } from '@/app/components/motion/VerticalTicker';

/**
 * Work and Certifications used to be two full-height sections, one after the
 * other — a long, single-column scroll of large text that read closer to a
 * blog post than a portfolio. Merged into one section with two columns that
 * drift past each other in opposite directions: Work down, Certifications
 * up. Certifications keeps a small label rather than its own big heading —
 * it is real signal, but it should not visually compete with shipped work.
 */
export function CertWork() {
  return (
    <section id="work" aria-labelledby="work-heading" className="section-rhythm">
      <div className="grid-shell">
        <SectionHeading id="work-heading" eyebrow={work.eyebrow} title={work.heading} />

        <div className="col-span-12 mt-16 grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-10">
          <div>
            <p className="mono-label border-b border-border pb-3">Recent work</p>
            <VerticalTicker direction="down" height={420}>
              {work.projects.map((project, i) => {
                const Row = project.href ? 'a' : 'div';
                return (
                  <Row
                    key={project.title}
                    {...(project.href
                      ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    data-cursor={project.href ? 'view' : undefined}
                    className="flex items-center gap-4 border-b border-border py-4 pr-2 transition-colors hover:bg-paper-2"
                  >
                    <span data-numeric className="shrink-0 font-mono text-xs text-ink-mute">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Image
                      src={project.image}
                      alt=""
                      width={64}
                      height={64}
                      data-print-hide
                      className="h-14 w-14 shrink-0 border border-border object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base text-ink">{project.title}</h3>
                      <p className="mt-0.5 truncate font-mono text-xs text-ink-mute">
                        {project.role}
                      </p>
                    </div>
                  </Row>
                );
              })}
            </VerticalTicker>
          </div>

          <div>
            <p
              id="certifications"
              className="mono-label flex items-baseline justify-between gap-4 border-b border-border pb-3"
            >
              <span className="whitespace-nowrap">{certifications.eyebrow}</span>
              <a
                href={certifications.profile}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap transition-colors hover:text-ink"
              >
                {/* Too wide beside the label at phone width — visually
                    shortened there, still read in full by screen readers. */}
                <span className="sr-only sm:not-sr-only">All badges on </span>Credly{' '}
                <span aria-hidden="true">↗</span>
              </a>
            </p>
            <VerticalTicker direction="up" height={420}>
              {certifications.items.map((cert, i) => (
                <a
                  key={cert.title}
                  href={cert.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="view"
                  className="flex items-baseline gap-3 border-b border-border py-4 pr-2 transition-colors hover:bg-paper-2"
                >
                  <span data-numeric className="shrink-0 font-mono text-xs text-ink-mute">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {/* Wraps rather than truncates, unlike the Work rows: on a
                      phone the expiry date is what got cut off, and it's
                      half of what a visitor is here to verify. */}
                  <div className="min-w-0">
                    <h3 className="font-display text-base text-ink">{cert.title}</h3>
                    <p className="mt-0.5 font-mono text-xs text-ink-mute">
                      {/* Each phrase stays whole, so a wrap lands between
                          "Issued …" and "Expires …", never inside a date;
                          the nbsp keeps a line from starting with "·". */}
                      {[cert.issuer, ...cert.date.split(' · ')].map((part, j) => (
                        <React.Fragment key={part}>
                          {j > 0 && ' · '}
                          <span className="whitespace-nowrap">{part}</span>
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                  {/* Touch screens have no hover or custom cursor to signal a
                      link — this is the only cue there that a row is
                      clickable to verify. */}
                  <span
                    aria-hidden="true"
                    className="ml-auto shrink-0 font-mono text-xs text-ink-mute"
                  >
                    ↗
                  </span>
                </a>
              ))}
            </VerticalTicker>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CertWork;
