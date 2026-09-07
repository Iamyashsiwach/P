'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { log } from '@/app/lib/content';
import { gsap, useGSAP, ease, duration, START } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';

function Metric({ value, prefix, suffix }: { value: number; prefix?: string; suffix?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced || !el.current) return;
      const counter = { n: 0 };

      const tween = gsap.to(counter, {
        n: value,
        duration: duration.slow,
        ease: ease.out,
        snap: { n: 1 },
        scrollTrigger: { trigger: el.current, start: START, once: true },
        onUpdate: () => {
          if (el.current) el.current.textContent = counter.n.toLocaleString('en-US');
        },
      });

      return () => tween.kill();
    },
    // revertOnUpdate: @gsap/react defers cleanup to unmount by default once
    // a dependencies array is passed, so a tween created before reduced
    // motion's SSR-safe `false` default gets corrected would otherwise
    // never be torn down.
    { dependencies: [reduced, value], revertOnUpdate: true }
  );

  return (
    <span data-numeric className="font-mono text-signal">
      {prefix}
      {/* Rendered at full value so the number is correct without JS. */}
      <span ref={el}>{value.toLocaleString('en-US')}</span>
      {suffix}
    </span>
  );
}

export function Log() {
  const scope = useRef<HTMLElement>(null);
  const spine = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced || !scope.current) return;

      const tweens: gsap.core.Tween[] = [];

      if (spine.current) {
        gsap.set(spine.current, { scaleY: 0, transformOrigin: 'top center' });
        tweens.push(
          gsap.to(spine.current, {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: scope.current,
              start: 'top 60%',
              end: 'bottom 80%',
              scrub: true,
            },
          })
        );
      }

      // Rows wipe in from the left rather than fading — the motif again.
      //
      // fromTo with immediateRender:false so the clip is applied only as a row
      // is about to animate. A plain from() would clip every row up front, and
      // any row whose trigger never fires would stay invisible for good.
      gsap.utils.toArray<HTMLElement>('[data-log-row]', scope.current).forEach(row => {
        tweens.push(
          gsap.fromTo(
            row,
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: duration.base,
              ease: ease.out,
              immediateRender: false,
              scrollTrigger: { trigger: row, start: 'top 92%', once: true },
            }
          )
        );
      });

      return () => tweens.forEach(t => t.kill());
    },
    // See the Metric component above re: revertOnUpdate.
    { scope, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <section id="log" ref={scope} aria-labelledby="log-heading" className="section-rhythm">
      <div className="grid-shell">
        <SectionHeading id="log-heading" eyebrow={log.eyebrow} title={log.heading} />

        <div className="relative col-span-12 mt-16 md:col-span-10 md:col-start-2">
          <div
            ref={spine}
            aria-hidden="true"
            className="absolute left-0 top-0 hidden h-full w-px bg-signal md:block"
          />

          {log.years.map(group => (
            <div key={group.year} className="md:pl-10">
              <h3 className="sticky top-20 z-10 -mx-2 bg-paper/90 px-2 py-3 font-mono text-mono-label uppercase tracking-[0.18em] text-ink backdrop-blur-sm">
                {group.year}
              </h3>

              <ul>
                {group.entries.map(entry => {
                  const isOpen = open === entry.date;
                  return (
                    <li key={entry.date} data-log-row className="border-b border-border">
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : entry.date)}
                        aria-expanded={isOpen}
                        className="flex w-full items-baseline gap-6 py-5 text-left transition-colors hover:text-signal"
                      >
                        <time data-numeric className="shrink-0 font-mono text-xs text-ink-mute">
                          {entry.date}
                        </time>
                        <span className="flex-1 font-display text-display-m">{entry.title}</span>
                        <span aria-hidden="true" className="font-mono text-xs text-ink-mute">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="grid gap-6 pb-8 md:grid-cols-[1fr_auto]">
                          <div>
                            <p className="max-w-2xl text-body text-ink-dim">{entry.detail}</p>
                            {'metric' in entry && entry.metric && (
                              <p className="mt-4 font-mono text-sm">
                                <Metric
                                  value={entry.metric.value}
                                  prefix={
                                    'prefix' in entry.metric ? entry.metric.prefix : undefined
                                  }
                                  suffix={
                                    'suffix' in entry.metric ? entry.metric.suffix : undefined
                                  }
                                />{' '}
                                <span className="text-ink-mute">{entry.metric.label}</span>
                              </p>
                            )}
                          </div>
                          {entry.image && (
                            <Image
                              src={entry.image}
                              alt=""
                              width={320}
                              height={220}
                              sizes="(max-width: 768px) 100vw, 320px"
                              className="border border-border object-cover"
                            />
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Log;
