'use client';

import { gsap } from '@/app/lib/motion';
import { getMusicGraph, setMusicTheme, isMusicEnabled, subscribeMusic } from '@/app/lib/audio';
import { readDomTheme, type Theme } from '@/app/lib/theme';

/**
 * The radio: one wind-chime voice, scheduled at random intervals off the
 * site's one shared gsap.ticker. Kept deliberately to a single sound —
 * an earlier version layered a drone, chord pads and a noise-based "air"
 * wash underneath the chimes, but a sustained drone and filtered noise
 * both read as an appliance hum/static rather than anything ambient, and
 * the whole point of a wind chime is that it's the only thing you hear.
 *
 * Why random can't sound wrong: both themes use a pentatonic set, and a
 * pentatonic set contains no minor 2nd and no tritone. Any two members, any
 * octaves, sounded together, are consonant — a random note picker is
 * architecturally incapable of choosing a clash.
 *
 *   paper     — D major pentatonic  {D E F# A B}
 *   blueprint — A minor pentatonic  {A C D E G}
 *
 * Roots a fifth apart, sharing D/E/A, so a theme switch reads as a modal
 * shift, not a key change. Their union has exactly one tritone (C <-> F#)
 * and those two notes belong to different themes — removed by the
 * note-suppression breath below, which is what actually rules it out rather
 * than the scale choice alone.
 */

const SCALES: Record<Theme, { root: number; offsets: number[] }> = {
  paper: { root: 146.83, offsets: [0, 2, 4, 7, 9] }, // D3, major pentatonic
  blueprint: { root: 220, offsets: [0, 3, 5, 7, 10] }, // A3, minor pentatonic
};

function noteFreq(theme: Theme, degree: number, octave: number): number {
  const { root, offsets } = SCALES[theme];
  const len = offsets.length;
  const idx = ((degree % len) + len) % len;
  const octaveShift = octave + Math.floor(degree / len);
  return root * 2 ** ((offsets[idx] + octaveShift * 12) / 12);
}

let ctx: AudioContext | null = null;
let musicBus: GainNode | null = null;
let reverbSend: GainNode | null = null;
let theme: Theme = 'paper';
let suppressUntil = 0;
let bellDegree = 2;

/** A struck chime — three inharmonic-ish partials with independent decay,
 * a melodic contour weighted toward ±1 scale steps, and frequent rests so
 * it reads as wind-driven rather than metronomic. Built and torn down
 * inside this function only — no array of live notes, no onended handler.
 * Holding a JS reference is what pins a finished node's graph and leaks it. */
function playChime(at: number) {
  if (!ctx || !musicBus || !reverbSend) return;
  if (Math.random() < 0.15) return;

  const step = Math.random() < 0.7 ? (Math.random() < 0.5 ? -1 : 1) : Math.random() < 0.5 ? -2 : 2;
  bellDegree += step;
  const octave = 1 + Math.floor(Math.random() * 2);
  const freq = noteFreq(theme, bellDegree, octave);

  const panner = ctx.createStereoPanner();
  panner.pan.value = (Math.random() * 2 - 1) * 0.6;
  panner.connect(musicBus);
  const send = ctx.createGain();
  send.gain.value = 0.4;
  panner.connect(send);
  send.connect(reverbSend);

  const partials = [
    { ratio: 1, decay: 1.6, level: 1 },
    { ratio: 2.76, decay: 0.9, level: 0.35 },
    { ratio: 5.4, decay: 0.5, level: 0.15 },
  ];
  partials.forEach(p => {
    const osc = ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * p.ratio;
    const gain = ctx!.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(p.level, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + p.decay);
    osc.connect(gain);
    gain.connect(panner);
    osc.start(at);
    osc.stop(at + p.decay + 0.05);
  });
}

let nextChimeTime = 0;
const MAX_NOTES_PER_TICK = 4;

/** Lookahead scheduler on the site's one shared gsap.ticker. The dangerous
 * case isn't a suspended context (currentTime just stops advancing) — it's
 * a long main-thread stall with the context still running, which would
 * otherwise schedule every missed note in the past and fire them all at
 * once the instant the browser clamps them to "now". Resyncing instead of
 * catching up is what prevents that burst. */
function tick() {
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  const horizon = now + 1.5;

  if (nextChimeTime < now) nextChimeTime = now + 0.05;
  let guard = 0;
  while (nextChimeTime < horizon && guard++ < MAX_NOTES_PER_TICK) {
    if (nextChimeTime >= suppressUntil) playChime(nextChimeTime);
    nextChimeTime += 2.5 + Math.random() * 3.5;
  }
}

let tickerAdded = false;
let started = false;

function enterMusic(initial: boolean) {
  if (!ctx || !musicBus) return;
  const now = ctx.currentTime;
  const delay = initial ? 0.35 : 0.05;
  const fadeDur = initial ? 6 : 1;

  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.setValueAtTime(Math.max(musicBus.gain.value, 0.0001), now);
  musicBus.gain.exponentialRampToValueAtTime(0.6, now + delay + fadeDur);

  nextChimeTime = now + delay + (initial ? 1.2 : 0.4);

  if (!tickerAdded) {
    gsap.ticker.add(tick);
    tickerAdded = true;
  }
}

function exitMusic() {
  if (!ctx || !musicBus) return;
  const now = ctx.currentTime;
  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.setValueAtTime(musicBus.gain.value, now);
  musicBus.gain.exponentialRampToValueAtTime(0.0001, now + 1);

  if (tickerAdded) {
    gsap.ticker.remove(tick);
    tickerAdded = false;
  }
}

function observeThemeChanges() {
  if (typeof MutationObserver === 'undefined') return;
  const observer = new MutationObserver(() => {
    const next = readDomTheme();
    if (next === theme) return;
    theme = next;
    if (ctx) suppressUntil = ctx.currentTime + 2.5;
    setMusicTheme(theme);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

/**
 * Idempotent — safe to call from more than one place (React StrictMode's
 * double-mount included; the module-level `started` guard is what stops
 * that from double-registering the subscribeMusic listener below). Call
 * once, from a real user gesture, then let subscribeMusic drive everything
 * after — including "keep it on until turned off": once enabled, the
 * scheduler just keeps chiming for as long as musicEnabled stays true,
 * with no timeout or fade-out of its own.
 */
export function startRadio() {
  if (started) return;
  const graph = getMusicGraph();
  if (!graph) return;
  started = true;

  ctx = graph.ctx;
  musicBus = graph.bus;
  reverbSend = graph.send;
  theme = readDomTheme();
  setMusicTheme(theme);
  observeThemeChanges();

  subscribeMusic(on => {
    if (on) enterMusic(false);
    else exitMusic();
  });

  if (isMusicEnabled()) enterMusic(true);
}
