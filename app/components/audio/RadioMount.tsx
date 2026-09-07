'use client';

import { useEffect } from 'react';
import { enableMusic, isMusicMuted } from '@/app/lib/audio';
import { startRadio } from '@/app/lib/radio';

/**
 * Tries to start the radio the instant the page loads — no click. Browsers
 * only grant that without a gesture once they've seen this origin play
 * audio before (Chrome's media engagement index, Firefox/Safari's per-site
 * autoplay permission), so it lands silently for returning visitors and the
 * AudioContext otherwise comes up 'suspended'. The pointerdown/keydown
 * listener below is the fallback for that suspended case: first gesture
 * resumes it, so the visit still ends up unlocked, just not before any
 * interaction — capture-phase so a stray stopPropagation elsewhere can't
 * swallow it. Rendered only on the home page: music over /book's long-form
 * reading would be hostile.
 *
 * Skips clicks on the audio chip itself (data-audio-control) so that
 * muting as your very first action on the site works — the chip handles
 * its own click, and if that first click is a mute, this listener should
 * never fire at all.
 */
export function RadioMount() {
  useEffect(() => {
    if (isMusicMuted()) return;

    // Only ever issued once per load — a second enableMusic() call while
    // already enabled re-notifies radio.ts's subscriber and restarts the
    // track with an abrupt 1s fade, cutting off the real 6s one. Once ctx
    // exists and .resume() has been requested, a later user gesture is
    // enough on its own to flip a still-suspended context to running; it
    // doesn't need enableMusic() called again.
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      enableMusic();
      startRadio();
    };

    unlock();

    const detach = () => {
      document.removeEventListener('pointerdown', onGesture, true);
      document.removeEventListener('keydown', onGesture, true);
    };

    function onGesture(event: Event) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-audio-control]')) return;
      unlock();
      detach();
    }

    document.addEventListener('pointerdown', onGesture, true);
    document.addEventListener('keydown', onGesture, true);
    return detach;
  }, []);

  return null;
}

export default RadioMount;
