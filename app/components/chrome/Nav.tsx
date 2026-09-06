'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP, ScrollTrigger, Flip, ease, duration } from '@/app/lib/motion';
import { nav, profile } from '@/app/lib/content';
import { ThemeToggle } from '@/app/components/theme/ThemeToggle';

/**
 * Fixed header. Hides on scroll down and returns on scroll up, but is always
 * present at the top of the page — the previous nav hid itself until 5% scroll,
 * which left the hero with no navigation at all.
 *
 * The active-section marker is a single DOM node moved between items with Flip,
 * so it animates between positions instead of cross-fading two elements.
 */
export function Nav() {
  const header = useRef<HTMLElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(
    () => {
      if (!header.current) return;

      // Only tween when the state actually flips. Firing gsap.to() on every
      // scroll update spawns a tween per frame and stalls the main thread.
      let hidden = false;
      const showHide = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: self => {
          const next = self.direction === 1 && self.scroll() > 240;
          if (next === hidden) return;
          hidden = next;
          gsap.to(header.current, {
            yPercent: next ? -130 : 0,
            duration: duration.fast,
            ease: ease.move,
            overwrite: true,
          });
        },
      });

      const sectionTriggers = nav.map(item =>
        ScrollTrigger.create({
          trigger: item.href,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: self => self.isActive && setActive(item.href),
        })
      );

      return () => {
        showHide.kill();
        sectionTriggers.forEach(t => t.kill());
      };
    },
    { scope: header }
  );

  // Move the marker into the active link, animating from wherever it was.
  useGSAP(
    () => {
      const el = marker.current;
      if (!el || !active) return;

      const host = header.current?.querySelector(`[data-nav-item="${active}"]`);
      if (!host || host === el.parentElement) return;

      const state = Flip.getState(el);
      host.appendChild(el);
      gsap.set(el, { opacity: 1 });
      Flip.from(state, { duration: duration.base, ease: ease.move });
    },
    { dependencies: [active], scope: header }
  );

  return (
    <header
      ref={header}
      className="fixed inset-x-0 top-0 z-[95] border-b border-border bg-paper/85 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-[clamp(1.25rem,4vw,4rem)]">
        <Link
          href="#home"
          className="font-mono text-mono-label uppercase tracking-[0.18em] text-ink transition-colors hover:text-signal"
        >
          Yash Siwach
        </Link>

        <nav aria-label="Sections" className="flex items-center gap-1">
          {nav.map(item => (
            <a
              key={item.href}
              href={item.href}
              data-nav-item={item.href}
              aria-current={active === item.href ? 'true' : undefined}
              className="relative hidden px-3 py-2 font-mono text-mono-label uppercase tracking-[0.18em] text-ink-dim transition-colors hover:text-ink sm:inline-block"
            >
              {item.label}
            </a>
          ))}

          <span
            ref={marker}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 bg-signal opacity-0"
          />

          <ThemeToggle className="ml-3 hidden sm:inline-flex" />

          <a
            href={profile.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 hidden border border-ink px-3 py-1.5 font-mono text-mono-label uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-paper sm:inline-block"
          >
            Résumé
          </a>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(v => !v)}
            className="relative ml-2 flex h-8 w-8 flex-col items-center justify-center gap-[5px] sm:hidden"
          >
            <span
              aria-hidden="true"
              className={`h-px w-5 bg-ink transition-transform duration-300 ${menuOpen ? 'translate-y-[3px] rotate-45' : ''}`}
            />
            <span
              aria-hidden="true"
              className={`h-px w-5 bg-ink transition-transform duration-300 ${menuOpen ? '-rotate-45' : ''}`}
            />
          </button>
        </nav>
      </div>

      <div
        ref={menu}
        className={`grid overflow-hidden border-border bg-paper/95 backdrop-blur-sm transition-[grid-template-rows] duration-300 ease-out sm:hidden ${
          menuOpen ? 'grid-rows-[1fr] border-t' : 'grid-rows-[0fr]'
        }`}
      >
        <ul id="mobile-nav" className="min-h-0 px-[clamp(1.25rem,4vw,4rem)]">
          {nav.map(item => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 font-mono text-mono-label uppercase tracking-[0.18em] text-ink-dim transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="block py-3 font-mono text-mono-label uppercase tracking-[0.18em] text-ink transition-colors hover:text-signal"
            >
              Résumé
            </a>
          </li>
          <li className="py-3">
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Nav;
