'use client';

import { certifications } from '@/app/lib/content';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';

export function Certifications() {
  return (
    <section
      id="certifications"
      aria-labelledby="certifications-heading"
      className="section-rhythm"
    >
      <div className="grid-shell">
        <SectionHeading
          id="certifications-heading"
          eyebrow={certifications.eyebrow}
          title={certifications.heading}
        />

        <ol className="col-span-12 mt-16 border-t border-border">
          {certifications.items.map((cert, i) => (
            <li key={cert.title} className="border-b border-border">
              <div className="grid grid-cols-12 items-baseline gap-4 py-5 md:py-8">
                <span
                  data-numeric
                  className="col-span-2 font-mono text-xs text-ink-mute md:col-span-1"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="col-span-10 md:col-span-5">
                  <h3 className="font-display text-display-m text-ink">{cert.title}</h3>
                  <p className="mt-2 font-mono text-xs text-ink-mute">
                    {cert.issuer} · {cert.date}
                    {cert.credentialId ? ` · #${cert.credentialId}` : ''}
                  </p>
                </div>

                {cert.skills && (
                  <p className="col-span-12 max-w-prose font-mono text-xs text-ink-mute md:col-span-5 md:col-start-7">
                    {cert.skills.join(' · ')}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Certifications;
