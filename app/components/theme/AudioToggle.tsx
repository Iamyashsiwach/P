'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/app/lib/motion';
import {
  enableSound,
  disableSound,
  enableMusic,
  disableMusic,
  isMusicEnabled,
  isMusicMuted,
  subscribeMusic,
  getAudioLevel,
  thunk,
} from '@/app/lib/audio';
import { startRadio } from '@/app/lib/radio';

/**
 * The combined audio control: one visible chip for two independent
 * booleans — UI sound (opt-in, off by default) and music (opt-out,
 * effectively on by default — see audio.ts for why they can't be one
 * boolean). Clicking it turns both off together, or both on together as one
 * real gesture, valid enough to unlock the radio itself if RadioMount's
 * page-wide listener never got the chance to. Fine-grained, sound-only or
 * music-only control lives in the terminal instead.
 *
 * Displayed state tracks music, not the raw isMusicEnabled() boolean —
 * music defaults to "on" the moment you touch the page, before any gesture
 * has actually run, so the chip reads "on" from the first paint unless an
 * earlier mute this session says otherwise.
 *
 * The three bars are a live VU meter, written directly from getAudioLevel()
 * on the shared gsap.ticker — no React re-render per frame, the pattern
 * TouchField and SmoothScroll already use for anything that updates every
 * frame.
 */
export function AudioToggle({ className }: { className?: string }) {
  // Starts 'on' to match the static server render (which knows nothing
  // about sessionStorage), then corrects from the real flag in an effect —
  // the same SSR-agreement pattern usePrefersReducedMotion and
  // ThemeProvider use. Reading isMusicMuted() directly in useState would
  // mismatch the prerendered markup for anyone who muted on a prior visit
  // this session, and hydration would fail.
  const [on, setOn] = useState(true);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => setOn(!isMusicMuted()), []);
  useEffect(() => subscribeMusic(setOn), []);

  useEffect(() => {
    const tick = () => {
      const level = getAudioLevel();
      bars.current.forEach((bar, i) => {
        if (!bar) return;
        const scale = Math.min(1, Math.max(0.08, level * 3 - i));
        bar.style.transform = `scaleY(${scale})`;
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Decided from the real isMusicEnabled(), not the displayed `on` — before
  // any gesture, `on` reads true (see the comment above) while music hasn't
  // actually started yet. Branching on `on` there would make the very first
  // click silently mute a session that was never playing, and the chip
  // would need a second click to do anything audible.
  const toggle = () => {
    if (isMusicEnabled()) {
      disableSound();
      disableMusic();
    } else {
      enableSound();
      enableMusic();
      startRadio();
      thunk();
    }
  };

  return (
    <button
      type="button"
      data-audio-control
      onClick={toggle}
      aria-pressed={on}
      className={
        'pointer-events-auto inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-mono-label uppercase tracking-[0.18em] text-ink-dim transition-colors hover:border-ink hover:text-ink' +
        (className ? ` ${className}` : '')
      }
    >
      <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            ref={el => {
              bars.current[i] = el;
            }}
            className="h-full w-[3px] origin-bottom bg-current"
            style={{ transform: 'scaleY(0.08)' }}
          />
        ))}
      </span>
      Audio {on ? 'on' : 'off'}
    </button>
  );
}

export default AudioToggle;
