'use client';

import { gsap } from '@/app/lib/motion';
import { getMusicGraph, setMusicTheme, isMusicEnabled, subscribeMusic } from '@/app/lib/audio';
import { readDomTheme, type Theme } from '@/app/lib/theme';

/**
 * The radio: a generative score built from a handful of Web Audio voices and
 * a lookahead scheduler, all driven off the site's one shared gsap.ticker.
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

type Voicing = { degree: number; octave: number }[];

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

// Degree-space shapes shared by both themes (transposed automatically by
// each theme's root/intervals) — spread voicings with at least a fourth
// between the two lowest notes, hand-authored rather than computed, which
// is what guarantees nothing muddy ever gets picked.
const PAD_VOICINGS: Voicing[] = [
  [
    { degree: 0, octave: -1 },
    { degree: 2, octave: 0 },
    { degree: 4, octave: 0 },
    { degree: 0, octave: 1 },
  ],
  [
    { degree: 3, octave: -1 },
    { degree: 0, octave: 0 },
    { degree: 2, octave: 0 },
    { degree: 4, octave: 1 },
  ],
  [
    { degree: 1, octave: -1 },
    { degree: 3, octave: 0 },
    { degree: 0, octave: 1 },
    { degree: 2, octave: 1 },
  ],
  [
    { degree: 4, octave: -1 },
    { degree: 1, octave: 0 },
    { degree: 3, octave: 0 },
    { degree: 0, octave: 1 },
  ],
  [
    { degree: 2, octave: -1 },
    { degree: 4, octave: 0 },
    { degree: 1, octave: 1 },
    { degree: 3, octave: 1 },
  ],
  [
    { degree: 0, octave: -1 },
    { degree: 3, octave: 0 },
    { degree: 4, octave: 0 },
    { degree: 1, octave: 1 },
  ],
];

let ctx: AudioContext | null = null;
let musicBus: GainNode | null = null;
let reverbSend: GainNode | null = null;
let theme: Theme = 'paper';
let suppressUntil = 0;
let bellDegree = 2;

type DroneState = {
  toneOscs: { osc: OscillatorNode; ratio: number }[];
  lfoOscs: OscillatorNode[];
  gain: GainNode;
};
let drone: DroneState | null = null;

type AirState = { source: AudioBufferSourceNode; gain: GainNode };
let air: AirState | null = null;
let airBuffer: AudioBuffer | null = null;

function scaleRoot(t: Theme) {
  // One octave below the melodic register the pad/bell live in.
  return SCALES[t].root / 2;
}

function ensureAirBuffer(context: AudioContext): AudioBuffer {
  if (airBuffer) return airBuffer;
  const length = Math.floor(context.sampleRate * 2);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  airBuffer = buffer;
  return buffer;
}

function startDrone(at: number) {
  if (!ctx || !musicBus || !reverbSend || drone) return;
  const root = scaleRoot(theme);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  filter.Q.value = 0.7;

  // Two incommensurate LFOs on the cutoff, plus per-oscillator detune —
  // without both a static drone reads as an appliance hum, not a room tone.
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 260;
  const lfo1 = ctx.createOscillator();
  lfo1.frequency.value = 0.037;
  const lfo2 = ctx.createOscillator();
  lfo2.frequency.value = 0.011;
  const lfoSum = ctx.createGain();
  lfoSum.gain.value = 0.5;
  lfo1.connect(lfoSum);
  lfo2.connect(lfoSum);
  lfoSum.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo1.start(at);
  lfo2.start(at);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.16, at + 3);
  filter.connect(gain);
  gain.connect(musicBus);
  const send = ctx.createGain();
  send.gain.value = 0.22;
  filter.connect(send);
  send.connect(reverbSend);

  const partials: { ratio: number; type: OscillatorType; detune: number }[] = [
    { ratio: 0.5, type: 'sine', detune: 0 },
    { ratio: 1, type: 'triangle', detune: -7 },
    { ratio: 1, type: 'triangle', detune: 7 },
    { ratio: 1.5, type: 'triangle', detune: 0 },
  ];
  const toneOscs = partials.map(p => {
    const osc = ctx!.createOscillator();
    osc.type = p.type;
    osc.frequency.value = root * p.ratio;
    osc.detune.value = p.detune;
    osc.connect(filter);
    osc.start(at);
    return { osc, ratio: p.ratio };
  });

  drone = { toneOscs, lfoOscs: [lfo1, lfo2], gain };
}

function stopDrone(at: number) {
  if (!drone || !ctx) return;
  const { gain, toneOscs, lfoOscs } = drone;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, at);
  [...toneOscs.map(t => t.osc), ...lfoOscs].forEach(o => o.stop(at + 0.1));
  drone = null;
}

function retuneDrone() {
  if (!drone || !ctx) return;
  const root = scaleRoot(theme);
  const now = ctx.currentTime;
  drone.toneOscs.forEach(({ osc, ratio }) => {
    osc.frequency.cancelScheduledValues(now);
    osc.frequency.setValueAtTime(osc.frequency.value, now);
    osc.frequency.linearRampToValueAtTime(root * ratio, now + 2);
  });
}

function startAir(at: number) {
  if (!ctx || !musicBus || !reverbSend || air) return;
  const source = ctx.createBufferSource();
  source.buffer = ensureAirBuffer(ctx);
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2200;
  filter.Q.value = 0.6;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.05, at + 4);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(musicBus);
  const send = ctx.createGain();
  send.gain.value = 0.3;
  filter.connect(send);
  send.connect(reverbSend);

  source.start(at);
  air = { source, gain };
}

function stopAir(at: number) {
  if (!air || !ctx) return;
  const { gain, source } = air;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, at);
  source.stop(at + 0.1);
  air = null;
}

/** Slow chord swells. Built and torn down inside this function only — no
 * array of live notes, no onended handler. Holding a JS reference is what
 * pins a finished node's graph and leaks it. */
function playPad(at: number) {
  if (!ctx || !musicBus || !reverbSend) return;
  const voicing = PAD_VOICINGS[Math.floor(Math.random() * PAD_VOICINGS.length)];
  const attack = 3.5;
  const release = 4.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.14, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + release);
  gain.connect(musicBus);
  const send = ctx.createGain();
  send.gain.value = 0.35;
  gain.connect(send);
  send.connect(reverbSend);

  const stopAt = at + attack + release + 0.1;
  voicing.forEach(({ degree, octave }) => {
    const osc = ctx!.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = noteFreq(theme, degree, octave);
    osc.detune.value = (Math.random() * 2 - 1) * 4;
    osc.connect(gain);
    osc.start(at);
    osc.stop(stopAt);
  });
}

/** Struck bell tones — three integer-ish-ratio partials with independent
 * decay, a melodic contour weighted toward ±1 scale steps, occasional
 * rests so it never reads as metronomic. */
function playBell(at: number) {
  if (!ctx || !musicBus || !reverbSend) return;
  if (Math.random() < 0.22) return;

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

type Layer = { name: string; nextTime: number; gap: () => number; play: (at: number) => void };
const layers: Layer[] = [
  { name: 'pad', nextTime: 0, gap: () => 12 + Math.random() * 4, play: playPad },
  { name: 'bell', nextTime: 0, gap: () => 3.5 + Math.random() * 3, play: playBell },
];

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

  for (const layer of layers) {
    if (layer.nextTime < now) layer.nextTime = now + 0.05;
    let guard = 0;
    while (layer.nextTime < horizon && guard++ < MAX_NOTES_PER_TICK) {
      if (layer.nextTime >= suppressUntil) layer.play(layer.nextTime);
      layer.nextTime += layer.gap();
    }
  }
}

let tickerAdded = false;
let started = false;

function enterMusic(initial: boolean) {
  if (!ctx || !musicBus) return;
  const now = ctx.currentTime;
  const delay = initial ? 0.35 : 0.05;
  const fadeDur = initial ? 8 : 1.4;

  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.setValueAtTime(Math.max(musicBus.gain.value, 0.0001), now);
  musicBus.gain.exponentialRampToValueAtTime(0.55, now + delay + fadeDur);

  startDrone(now + delay);
  startAir(now + delay);

  const padDelay = initial ? 4 : 0.6;
  const bellDelay = initial ? 11 : 1.4;
  layers[0].nextTime = now + delay + padDelay;
  layers[1].nextTime = now + delay + bellDelay;

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
  musicBus.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
  stopDrone(now + 1.2);
  stopAir(now + 1.2);

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
    retuneDrone();
    setMusicTheme(theme);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

/**
 * Idempotent — safe to call from more than one place (React StrictMode's
 * double-mount included; the module-level `started` guard is what stops
 * that from producing two phased drones at +3dB). Call once, from a real
 * user gesture, then let subscribeMusic drive everything after.
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
