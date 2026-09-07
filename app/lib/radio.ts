'use client';

import { getMusicGraph, isMusicEnabled, subscribeMusic } from '@/app/lib/audio';

/** The radio: a real recorded track, looped through the shared music graph
 * (fade/mute control, analyser for the audio-reactive hero — see audio.ts).
 * Fetched and decoded once, on first enable, then just started/stopped —
 * no per-note scheduling, nothing to generate. */
const TRACK_URL = '/radio-music.mp3';

let ctx: AudioContext | null = null;
let musicBus: GainNode | null = null;
let buffer: AudioBuffer | null = null;
let source: AudioBufferSourceNode | null = null;
let started = false;

async function ensureBuffer(context: AudioContext): Promise<AudioBuffer> {
  if (buffer) return buffer;
  const res = await fetch(TRACK_URL);
  const data = await res.arrayBuffer();
  buffer = await context.decodeAudioData(data);
  return buffer;
}

function enterMusic(initial: boolean) {
  if (!ctx || !musicBus || !buffer) return;
  const now = ctx.currentTime;
  const delay = initial ? 0.2 : 0.05;
  const fadeDur = initial ? 2.5 : 1;

  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.setValueAtTime(Math.max(musicBus.gain.value, 0.0001), now);
  musicBus.gain.exponentialRampToValueAtTime(0.55, now + delay + fadeDur);

  source?.stop();
  source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(musicBus);
  source.start(now + delay);
}

function exitMusic() {
  if (!ctx || !musicBus) return;
  const now = ctx.currentTime;
  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.setValueAtTime(musicBus.gain.value, now);
  musicBus.gain.exponentialRampToValueAtTime(0.0001, now + 1);

  const dyingSource = source;
  source = null;
  dyingSource?.stop(now + 1.05);
}

/**
 * Idempotent — safe to call from more than one place (React StrictMode's
 * double-mount included; the module-level `started` guard is what stops
 * that from double-decoding the track or double-registering the listener
 * below). Call once, from a real user gesture.
 */
export function startRadio() {
  if (started) return;
  const graph = getMusicGraph();
  if (!graph) return;
  started = true;

  ctx = graph.ctx;
  musicBus = graph.bus;

  ensureBuffer(ctx).then(() => {
    subscribeMusic(on => {
      if (on) enterMusic(false);
      else exitMusic();
    });
    if (isMusicEnabled()) enterMusic(true);
  });
}
