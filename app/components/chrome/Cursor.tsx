'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP, ease } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

type CursorState = 'default' | 'link' | 'view';

/**
 * Additive custom cursor. The native cursor is never hidden — this rides on top
 * of it — so nothing is lost if the element fails to render, and keyboard users
 * are unaffected.
 *
 * Mounts only for fine pointers, so touch devices pay nothing.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>('default');
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = dot.current;
      if (reduced || !el) return;
      if (!window.matchMedia('(pointer: fine)').matches) return;

      const opts = { duration: 0.4, ease: ease.out };
      const moveX = gsap.quickTo(el, 'x', opts);
      const moveY = gsap.quickTo(el, 'y', opts);

      const onMove = (event: PointerEvent) => {
        moveX(event.clientX);
        moveY(event.clientY);
        setVisible(true);

        const target = event.target as HTMLElement;
        if (target?.closest?.('[data-cursor="view"]')) setState('view');
        else if (target?.closest?.('a, button, [role="button"]')) setState('link');
        else setState('default');
      };

      const onLeave = () => setVisible(false);

      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);

      return () => {
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerleave', onLeave);
      };
    },
    { dependencies: [reduced] }
  );

  if (reduced) return null;

  const size = state === 'view' ? 72 : state === 'link' ? 36 : 8;

  // Centring uses negative margins rather than a translate class: GSAP owns the
  // transform property here and would overwrite it.
  return (
    <div
      ref={dot}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden items-center justify-center rounded-full border border-ink text-[9px] uppercase tracking-[0.18em] text-ink transition-[width,height,background-color,opacity] duration-300 [@media(pointer:fine)]:flex"
      style={{
        width: size,
        height: size,
        opacity: visible ? 1 : 0,
        backgroundColor: state === 'default' ? 'hsl(var(--ink))' : 'transparent',
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
    >
      {state === 'view' ? 'View' : ''}
    </div>
  );
}

export default Cursor;
