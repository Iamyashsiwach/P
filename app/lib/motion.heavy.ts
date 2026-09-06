'use client';

import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { Observer } from 'gsap/Observer';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

/**
 * Plugins only a lazily-mounted feature needs (the terminal, the sticker
 * drawer, the receipts carousel, the copy-success burst). Importing this file
 * pulls all of them into whatever chunk imports it, so only import it from
 * components already behind `next/dynamic` — never from `app/lib/motion.ts`
 * or anything it's imported by, or every visitor pays for this on first load.
 */
gsap.registerPlugin(
  Draggable,
  InertiaPlugin,
  Physics2DPlugin,
  Observer,
  DrawSVGPlugin,
  MorphSVGPlugin,
  ScrambleTextPlugin
);

export {
  gsap,
  Draggable,
  InertiaPlugin,
  Physics2DPlugin,
  Observer,
  DrawSVGPlugin,
  MorphSVGPlugin,
  ScrambleTextPlugin,
};
