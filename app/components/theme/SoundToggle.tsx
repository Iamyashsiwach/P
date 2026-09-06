'use client';

import { useEffect, useState } from 'react';
import { enableSound, disableSound, isSoundEnabled, subscribeSound, thunk } from '@/app/lib/audio';

/**
 * Always starts OFF, every page load, on purpose — see app/lib/audio.ts.
 * Subscribed to the shared sound state rather than owning its own boolean,
 * so this stays in sync with the terminal's `sound on`/`sound off` command
 * driving the same toggle from a different surface.
 */
export function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(isSoundEnabled);

  useEffect(() => subscribeSound(setOn), []);

  const toggle = () => {
    if (on) {
      disableSound();
    } else {
      enableSound();
      thunk();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className={
        'pointer-events-auto inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-mono-label uppercase tracking-[0.18em] text-ink-dim transition-colors hover:border-ink hover:text-ink' +
        (className ? ` ${className}` : '')
      }
    >
      <span aria-hidden="true">{on ? '♪' : '×'}</span>
      Sound {on ? 'on' : 'off'}
    </button>
  );
}

export default SoundToggle;
