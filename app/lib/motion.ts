'use client';

import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';

// This file is imported by every section, so it enters the shared client
// chunk for every visitor. Plugins only a lazily-mounted feature needs
// (ScrambleTextPlugin, Draggable, ...) register in `motion.heavy.ts` instead —
// see that file before adding anything here.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase, Flip);

/**
 * Two eases for the whole site. Everything that moves uses one of them, which
 * is what makes unrelated components feel like the same object.
 *
 *   out  — things arriving. Fast start, long settle.
 *   move — things rearranging in place. Symmetric, no overshoot.
 */
CustomEase.create('out', '0.16, 1, 0.3, 1');
CustomEase.create('move', '0.65, 0, 0.35, 1');
CustomEase.create('snap', '0.2, 0, 0, 1');

export const ease = {
  out: 'out',
  move: 'move',
  /** Terminal-mode UI: things should snap into place, not settle luxuriously. */
  snap: 'snap',
} as const;

export const duration = {
  fast: 0.35,
  base: 0.7,
  slow: 1.1,
  reveal: 1.4,
} as const;

/** Default trigger position: fire when the element is a quarter into view. */
export const START = 'top 78%';

export { gsap, useGSAP, ScrollTrigger, SplitText, Flip };
