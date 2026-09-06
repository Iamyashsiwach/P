'use client';

import { stack } from '@/app/lib/content';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';
import { Marquee } from '@/app/components/motion/Marquee';

/**
 * Typographic, not a row of logo avatars. The old version loaded twelve PNGs —
 * one of them 1.3MB — to render what is fundamentally a list of words.
 */
export function Stack() {
  const all = stack.groups.flatMap(g => g.items.map(i => i.name));

  return (
    <section id="stack" aria-labelledby="stack-heading" className="section-rhythm">
      <div className="grid-shell">
        <SectionHeading id="stack-heading" eyebrow={stack.eyebrow} title={stack.heading} />
      </div>

      <div className="mt-12 border-y border-border py-5">
        <Marquee speed={70}>
          {all.map(name => (
            <span
              key={name}
              className="whitespace-nowrap px-6 font-mono text-mono-label uppercase tracking-[0.18em] text-ink-mute"
            >
              {name}
              <span className="ml-6 text-signal">/</span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="grid-shell mt-16">
        <dl className="col-span-12 grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-5 md:gap-y-12">
          {stack.groups.map(group => (
            <div key={group.label}>
              <dt className="mono-label border-b border-border pb-3">{group.label}</dt>
              <dd>
                {/*
                  Mobile: a wrapped row of names only — the note text ("where
                  it was actually used") is real signal but doubles every
                  item's height, and five groups of it stacked is most of
                  what was making this section such a long scroll on a phone.
                  Desktop keeps the original one-per-line list with notes.
                */}
                <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 md:block md:space-y-3">
                  {group.items.map(item => (
                    <li key={item.name} className="group">
                      <span className="font-mono text-sm text-ink">{item.name}</span>
                      <span className="mt-1 hidden max-w-[22ch] text-xs leading-snug text-ink-mute transition-colors duration-300 group-hover:text-ink-dim md:block">
                        {item.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default Stack;
