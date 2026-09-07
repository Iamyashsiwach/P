'use client';

import { useEffect } from 'react';
import { enableMusic, getMusicGraph, isMusicMuted } from '@/app/lib/audio';
import { startRadio } from '@/app/lib/radio';

/**
 * Tries to start the radio the instant the page loads — no click. Browsers
 * only grant that without a gesture once they've seen this origin play
 * audio before (Chrome's media engagement index, Firefox/Safari's per-site
 * autoplay permission), so it lands silently for returning visitors and the
 * AudioContext otherwise comes up 'suspended' — the fade is scheduled either
 * way, it just doesn't audibly start until running.
 *
 * The pointerdown/keydown listener below is the fallback for that suspended
 * case. It resumes the existing context directly rather than calling
 * enableMusic() again: enableMusic() re-notifies radio.ts's subscriber every
 * time, which would restart the track with an abrupt 1s fade and cut off the
 * real 6s one that's already scheduled — capture-phase so a stray
 * stopPropagation elsewhere can't swallow it. Rendered only on the home
 * page: music over /book's long-form reading would be hostile.
 *
 * Skips clicks on the audio chip itself (data-audio-control) so that
 * muting as your very first action on the site works — the chip handles
 * its own click, and if that first click is a mute, this listener should
 * never fire at all.
 */
export function RadioMount() {
  useEffect(() => {
    if (isMusicMuted()) return;

    enableMusic();
    startRadio();

    const detach = () => {
      document.removeEventListener('pointerdown', onGesture, true);
      document.removeEventListener('keydown', onGesture, true);
    };

    function onGesture(event: Event) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-audio-control]')) return;
      getMusicGraph()?.ctx.resume();
      detach();
    }

    document.addEventListener('pointerdown', onGesture, true);
    document.addEventListener('keydown', onGesture, true);
    return detach;
  }, []);

  return null;
}

export default RadioMount;
