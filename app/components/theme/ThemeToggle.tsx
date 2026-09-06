'use client';

import { useRef } from 'react';
import { useTheme } from './ThemeProvider';

/**
 * Deliberately not labelled "paper/terminal" — a visitor who has never heard
 * those words still needs to know what this button does. "Hacker Mode" reads
 * as an invitation regardless of technical background; the glyph is the only
 * jargon, and it's decorative (aria-hidden), not load-bearing.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const isHacker = theme === 'terminal';

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => toggle(ref.current)}
      aria-pressed={isHacker}
      className={
        'inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-mono-label uppercase tracking-[0.18em] text-ink-dim transition-colors hover:border-ink hover:text-ink' +
        (className ? ` ${className}` : '')
      }
    >
      <span aria-hidden="true">{isHacker ? '>_' : '●'}</span>
      {isHacker ? 'Hacker mode' : 'Normal'}
    </button>
  );
}

export default ThemeToggle;
