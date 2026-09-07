'use client';

import { useEffect } from 'react';
import { enableMusic, isMusicMuted } from '@/app/lib/audio';
import { startRadio } from '@/app/lib/radio';

/**
 * Unlocks the generative radio on the first click or tap anywhere on the
 * page — capture-phase, so a stray stopPropagation elsewhere can't swallow
 * it. Rendered only on the home page: music over /book's long-form reading
 * would be hostile.
 *
 * Skips clicks on the audio chip itself (data-audio-control) so that
 * muting as your very first action on the site works — the chip handles
 * its own click, and if that first click is a mute, this listener should
 * never fire at all.
 */
export function RadioMount() {
  useEffect(() => {
    if (isMusicMuted()) return;

    const detach = () => {
      document.removeEventListener('pointerdown', onGesture, true);
      document.removeEventListener('keydown', onGesture, true);
    };

    function onGesture(event: Event) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-audio-control]')) return;
      enableMusic();
      startRadio();
      detach();
    }

    document.addEventListener('pointerdown', onGesture, true);
    document.addEventListener('keydown', onGesture, true);
    return detach;
  }, []);

  return null;
}

export default RadioMount;
