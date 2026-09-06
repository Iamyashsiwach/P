'use client';

import Link from 'next/link';
import { useState } from 'react';
import { contact, profile } from '@/app/lib/content';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';
import { Magnetic } from '@/app/components/motion/Magnetic';
import { GithubMark, XMark, LinkedinMark } from '@/app/components/icons/Brand';

const marks = {
  GitHub: GithubMark,
  X: XMark,
  LinkedIn: LinkedinMark,
} as const;

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked by permissions; the mailto link still works.
    }
  };

  return (
    <footer id="contact" aria-labelledby="contact-heading" className="section-rhythm">
      <div className="grid-shell">
        <SectionHeading id="contact-heading" eyebrow={contact.eyebrow} title={contact.heading} />

        <div className="col-span-12 mt-16 md:col-span-8">
          <p className="max-w-xl text-body text-ink-dim">{contact.line}</p>

          <a
            href={`mailto:${profile.email}`}
            className="group mt-10 block font-display text-[clamp(2rem,7vw,6rem)] leading-none text-ink"
          >
            <span className="bg-gradient-to-r from-signal to-signal bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
              {profile.email}
            </span>
          </a>

          <div className="mt-6 flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={copy}
              className="font-mono text-mono-label uppercase tracking-[0.18em] text-ink-mute transition-colors hover:text-signal"
            >
              {copied ? 'Copied' : 'Copy address'}
            </button>
            <a
              href={profile.phoneHref}
              className="font-mono text-mono-label uppercase tracking-[0.18em] text-ink-mute transition-colors hover:text-ink"
            >
              {profile.phone}
            </a>
            <span className="font-mono text-mono-label uppercase tracking-[0.18em] text-ink-mute">
              {profile.location}
            </span>
          </div>
        </div>

        <div className="col-span-12 mt-16 md:col-span-3 md:col-start-10">
          <ul className="space-y-4">
            {profile.socials.map(social => {
              const Mark = marks[social.label as keyof typeof marks];
              return (
                <li key={social.label}>
                  <Magnetic strength={10}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 font-mono text-mono-label uppercase tracking-[0.18em] text-ink transition-colors hover:text-signal"
                    >
                      <Mark width={14} height={14} />
                      {social.label}
                      <span aria-hidden="true">&#8599;</span>
                    </a>
                  </Magnetic>
                </li>
              );
            })}
          </ul>

          <Link
            href="/book"
            className="mt-10 inline-block border border-border p-4 font-mono text-xs leading-relaxed text-ink-mute transition-colors hover:border-ink hover:text-ink"
          >
            The Book
            <span className="mt-1 block text-ink-mute">
              a long-form thing I&rsquo;m writing &#8599;
            </span>
          </Link>
        </div>

        <div className="col-span-12 mt-24 flex flex-wrap justify-between gap-4 border-t border-border pt-6 font-mono text-mono-label uppercase tracking-[0.18em] text-ink-mute">
          <span>&copy; {new Date().getFullYear()} Yash Siwach</span>
          <span>Built with Next &amp; Three.js</span>
        </div>
      </div>
    </footer>
  );
}

export default Contact;
