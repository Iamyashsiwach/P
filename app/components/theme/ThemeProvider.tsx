'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { ScrollTrigger } from '@/app/lib/motion';
import { getLenis } from '@/app/lib/lenis';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { applyTheme, readDomTheme, type Theme } from '@/app/lib/theme';

type ThemeContextValue = {
  theme: Theme;
  /** `origin` is the element the change appears to expand from (the toggle
   * button) — omit it to switch with no view-transition flourish. */
  setTheme: (next: Theme, origin?: HTMLElement | null) => void;
  toggle: (origin?: HTMLElement | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Starts 'paper' to match the server render (which knows nothing about
  // localStorage), then corrects from the DOM in an effect — the same
  // SSR-agreement pattern usePrefersReducedMotion uses. ThemeScript has
  // already stamped the real value onto <html> before this ever runs, so the
  // correction is instant and pre-hydration paint already shows it correctly;
  // this only re-syncs React's own state to match.
  const [theme, setThemeState] = useState<Theme>('paper');
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    setThemeState(readDomTheme());
  }, []);

  const runTransition = useCallback(
    (next: Theme, origin?: HTMLElement | null) => {
      const commit = () => {
        applyTheme(next);
        setThemeState(next);
      };

      const supportsViewTransition = typeof document.startViewTransition === 'function';

      if (reduced || !supportsViewTransition || !origin) {
        commit();
        return;
      }

      const rect = origin.getBoundingClientRect();
      const root = document.documentElement;
      root.style.setProperty('--vt-x', `${rect.left + rect.width / 2}px`);
      root.style.setProperty('--vt-y', `${rect.top + rect.height / 2}px`);

      // The page is frozen for the transition's duration; queued wheel input
      // would otherwise dump onto Lenis the instant it resumes.
      const lenis = getLenis();
      lenis?.stop();

      const vt = document.startViewTransition(() => {
        flushSync(commit);
      });

      vt.finished.finally(() => {
        lenis?.start();
        ScrollTrigger.refresh();
      });
    },
    [reduced]
  );

  const setTheme = useCallback(
    (next: Theme, origin?: HTMLElement | null) => runTransition(next, origin),
    [runTransition]
  );

  const toggle = useCallback(
    (origin?: HTMLElement | null) =>
      runTransition(theme === 'paper' ? 'terminal' : 'paper', origin),
    [theme, runTransition]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export default ThemeProvider;
