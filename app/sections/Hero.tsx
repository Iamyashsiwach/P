'use client';

import { profile } from '@/app/lib/content';
import { Reveal } from '@/app/components/motion/Reveal';
import { Magnetic } from '@/app/components/motion/Magnetic';
import { TerminalTrigger } from '@/app/components/terminal/TerminalTrigger';
import { blip } from '@/app/lib/audio';

/**
 * The WebGL trace field mounts behind this in Phase 3; until then the layout
 * and the type reveal carry the section on their own.
 */
export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-name"
      className="relative flex min-h-[100svh] items-end pb-[clamp(4rem,10vh,8rem)] pt-32"
    >
      <div className="grid-shell">
        <div className="col-span-12 lg:col-span-10">
          <p className="mono-label mb-8">{profile.eyebrow}</p>

          <Reveal as="h1" by="chars" immediate className="font-display text-display-xl text-ink">
            {profile.name}
          </Reveal>

          <div className="mt-10 max-w-2xl">
            <Reveal as="p" by="words" immediate delay={0.5} className="text-body text-ink-dim">
              {profile.statement}
            </Reveal>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href="#work"
                onClick={() => blip()}
                className="inline-block border border-ink bg-ink px-6 py-3 font-mono text-mono-label uppercase tracking-[0.18em] text-paper transition-colors hover:bg-transparent hover:text-ink"
              >
                View work
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => blip()}
                className="inline-block border border-border px-6 py-3 font-mono text-mono-label uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
              >
                Résumé
              </a>
            </Magnetic>
            <TerminalTrigger />
          </div>
        </div>
      </div>

      {/* First appearance of the hairline motif. */}
      <div
        aria-hidden="true"
        data-print-hide
        className="absolute bottom-0 left-[clamp(1.25rem,4vw,4rem)] hidden h-24 w-px bg-gradient-to-b from-transparent to-border md:block"
      />
    </section>
  );
}

export default Hero;
