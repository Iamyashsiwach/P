'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { gsap } from '@/app/lib/motion';
import { contact, profile } from '@/app/lib/content';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';
import { Magnetic } from '@/app/components/motion/Magnetic';
import { GithubMark, XMark, LinkedinMark } from '@/app/components/icons/Brand';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

const marks = {
  GitHub: GithubMark,
  X: XMark,
  LinkedIn: LinkedinMark,
} as const;

const BURST_GLYPHS = ['·', '+', '▮', '/'];
const BURST_COUNT = 24;

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();

  // A small physics burst on copy success, using Physics2DPlugin — free in
  // GSAP's npm build, previously unregistered. Dynamically imported so its
  // chunk is only fetched by someone who actually clicks copy, not bundled
  // into this always-rendered section for every visitor.
  const burst = async () => {
    if (reduced || !copyButtonRef.current) return;
    await import('@/app/lib/motion.heavy'); // registers Physics2DPlugin as a side effect

    const rect = copyButtonRef.current.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    Object.assign(container.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '110',
    });
    document.body.appendChild(container);

    const glyphs: HTMLSpanElement[] = [];
    for (let i = 0; i < BURST_COUNT; i++) {
      const span = document.createElement('span');
      span.textContent = BURST_GLYPHS[i % BURST_GLYPHS.length];
      Object.assign(span.style, {
        position: 'absolute',
        left: `${originX}px`,
        top: `${originY}px`,
        color: 'hsl(var(--signal))',
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '14px',
      });
      container.appendChild(span);
      glyphs.push(span);
    }

    gsap.to(glyphs, {
      physics2D: {
        velocity: () => gsap.utils.random(120, 260),
        angle: () => gsap.utils.random(0, 360),
        gravity: 420,
      },
      opacity: 0,
      duration: 0.9,
      ease: 'power1.out',
      onComplete: () => container.remove(),
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      burst();
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
              ref={copyButtonRef}
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
