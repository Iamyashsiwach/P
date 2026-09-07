'use client';

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
                      <h3 className="truncate font-display text-base text-ink draft:text-sm">
                        {project.title}
                      </h3>
                      <p className="mt-0.5 truncate font-mono text-xs text-ink-mute">
                        {project.year} · {project.role}
                      </p>
                    </div>
                  </Row>
                );
              })}
            </VerticalTicker>
          </div>

          <div>
            <p id="certifications" className="mono-label border-b border-border pb-3">
              Certifications
            </p>
            <VerticalTicker direction="up" height={420}>
              {certifications.items.map((cert, i) => (
                <div
                  key={cert.title}
                  className="flex items-baseline gap-3 border-b border-border py-4 pr-2"
                >
                  <span data-numeric className="shrink-0 font-mono text-xs text-ink-mute">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base text-ink draft:text-sm">
                      {cert.title}
                    </h3>
                    <p className="mt-0.5 truncate font-mono text-xs text-ink-mute">
                      {cert.issuer} · {cert.date}
                    </p>
                  </div>
                </div>
              ))}
            </VerticalTicker>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CertWork;
