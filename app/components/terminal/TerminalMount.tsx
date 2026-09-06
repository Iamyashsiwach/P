'use client';

import dynamic from 'next/dynamic';
import { useTerminal } from './TerminalProvider';

const Terminal = dynamic(() => import('./Terminal').then(m => m.Terminal), { ssr: false });

/**
 * Mounted once, near the root. The dialog's own module is only fetched the
 * first time hasOpenedOnce flips true — a visitor who never opens the
 * terminal never downloads it.
 */
export function TerminalMount() {
  const { open, hasOpenedOnce, closeTerminal } = useTerminal();
  if (!hasOpenedOnce) return null;
  return open ? <Terminal onRequestClose={closeTerminal} /> : null;
}

export default TerminalMount;
