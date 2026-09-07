'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { TraceField } from './TraceField';

/**
 * One canvas for the whole page, mounted behind the content. A canvas per
 * section would mean several WebGL contexts, several rAF loops and no
 * continuity between sections.
 *
 * The loop is stopped whenever the tab is hidden or the hero has scrolled away,
 * so this costs nothing while you read the rest of the page.
 */
export function Scene() {
  const scroll = useRef(0);
  const shell = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    // Morph progress: 0 across the hero, 1 by the time About is in view.
    //
    // Only scroll position gates the loop. Tying it to visibilitychange as well
    // is redundant — browsers already stop rAF in a hidden tab — and it leaves
    // the canvas blank, since a stopped loop never repaints when you come back.
    const onScroll = () => {
      const vh = window.innerHeight;
      scroll.current = Math.min(1, window.scrollY / (vh * 0.9));

      // The diagram resolves into the pipeline, then gets out of the way — it
      // must not sit behind the prose. Written straight to style so scrolling
      // never triggers a React render.
      const fade = 1 - Math.min(1, Math.max(0, (window.scrollY - vh * 0.55) / (vh * 0.5)));
      if (shell.current) shell.current.style.opacity = String(fade);

      setActive(window.scrollY < vh * 1.3);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={shell}
      aria-hidden="true"
      data-print-hide
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={dpr}
        camera={{ position: [0, 0, 9], fov: 42 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: true,
          stencil: false,
        }}
        // R3F's default event source is the div this canvas is wrapped in —
        // which is pointer-events-none (so the scene never blocks clicks on
        // real content beneath it), meaning that div never actually receives
        // pointer events either. Without this, state.pointer never updates:
        // TraceField's cursor "soft well" and the fluid layer's cursor drag
        // both silently read a frozen (0,0). document.body still receives
        // every pointer event on the page and R3F normalizes against the
        // canvas's own bounding rect regardless of which element it listens
        // on, so this is the documented fix, not a workaround.
        eventSource={document.body}
      >
        {/* Drop resolution before dropping frames. */}
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio))}
        />
        <TraceField scrollRef={scroll} />
      </Canvas>
    </div>
  );
}

export default Scene;
