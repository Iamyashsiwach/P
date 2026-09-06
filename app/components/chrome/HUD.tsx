'use client';

import { useEffect, useState } from 'react';
import { ScrollTrigger, useGSAP } from '@/app/lib/motion';

const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata',
  hour12: false,
});

/**
 * Fixed instrument readouts in the bottom corners: which section you are in,
 * and the local time where the work is done.
 */
export function HUD({ sections }: { sections: string[] }) {
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(TIME_FORMAT.format(new Date()));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  useGSAP(() => {
    const triggers = sections.map((id, i) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: self => self.isActive && setIndex(i),
      })
    );

    return () => triggers.forEach(t => t.kill());
  }, [sections]);

  const total = String(sections.length).padStart(2, '0');
  const current = String(index + 1).padStart(2, '0');

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] hidden justify-between px-[clamp(1.25rem,4vw,4rem)] pb-6 font-mono text-mono-label uppercase tracking-[0.18em] text-ink-mute md:flex"
    >
      <span data-numeric>
        {current} / {total} &middot; {sections[index]}
      </span>
      {/* Rendered only after mount so server and client markup agree. */}
      <span data-numeric>{time ? `${time} IST` : ''}</span>
    </div>
  );
}

export default HUD;
