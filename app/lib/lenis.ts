import type Lenis from 'lenis';

/**
 * Module-singleton handle onto the one Lenis instance SmoothScroll owns.
 *
 * Anything outside the React tree that needs to scroll the page (the command
 * palette, the terminal) must route through this rather than
 * `scrollIntoView({behavior:'smooth'})` — that triggers the same feedback loop
 * `html.lenis { scroll-behavior: auto !important }` exists to prevent, just
 * through a different API. When this is null (reduced motion, or before
 * mount), callers fall back to `behavior: 'auto'`, never `'smooth'`.
 */
export const SCROLL_OFFSET = -80;

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}

export function scrollToTarget(target: string | HTMLElement) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  if (instance) {
    instance.scrollTo(el as HTMLElement, { offset: SCROLL_OFFSET });
  } else {
    (el as HTMLElement).scrollIntoView({ behavior: 'auto', block: 'start' });
  }
}
