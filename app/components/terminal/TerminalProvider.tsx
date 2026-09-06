'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type TerminalContextValue = {
  open: boolean;
  /** Once true, stays true — this is what gates loading the actual dialog
   * chunk, so ⌘K / the trigger chip decide when that fetch happens, not
   * page load. */
  hasOpenedOnce: boolean;
  openTerminal: () => void;
  closeTerminal: () => void;
};

const TerminalContext = createContext<TerminalContextValue | null>(null);

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const openTerminal = useCallback(() => {
    setOpen(true);
    setHasOpenedOnce(true);
  }, []);

  const closeTerminal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(prev => {
          const next = !prev;
          if (next) setHasOpenedOnce(true);
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <TerminalContext.Provider value={{ open, hasOpenedOnce, openTerminal, closeTerminal }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error('useTerminal must be used within TerminalProvider');
  return ctx;
}

export default TerminalProvider;
