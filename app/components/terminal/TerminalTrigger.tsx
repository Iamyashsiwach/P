'use client';

import { useTerminal } from './TerminalProvider';
import { blip } from '@/app/lib/audio';

/**
 * ⌘K is an accelerator for people who already know the pattern — it is
 * never the only door in. This is the visible, click/tap-first entry point;
 * every placement of it (Hero, Nav, the mobile menu) opens the exact same
 * dialog via the same context.
 */
export function TerminalTrigger({ className }: { className?: string }) {
  const { openTerminal } = useTerminal();

  return (
    <button
      type="button"
      onClick={() => {
        blip();
        openTerminal();
      }}
      className={
        'inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-mono-label uppercase tracking-[0.18em] text-ink-dim transition-colors hover:border-ink hover:text-ink' +
        (className ? ` ${className}` : '')
      }
    >
      <span aria-hidden="true">&gt;_</span>
      Try me
    </button>
  );
}

export default TerminalTrigger;
