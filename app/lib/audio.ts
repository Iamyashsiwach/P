'use client';

/**
 * Fully synthesised UI sound — zero audio files, zero bundle weight. Every
 * voice is a couple of Web Audio nodes with a short envelope.
 *
 * The contract is non-negotiable: nothing plays until enableSound() is
 * called, and that must only ever happen from inside a real user gesture
 * (a click handler) — that's also the only place an AudioContext gets
 * constructed at all, never eagerly on load. Sound never plays on scroll or
 * any other ambient event, only on deliberate acts (clicks, keystrokes,
 * toggles) — a page that makes noise while you scroll is the pattern that
 * makes people close the tab.
 *
 * Deliberately not persisted across page loads: a stored "on" preference
 * with no fresh gesture this session would leave the toggle reading ON
 * while nothing actually plays, which is a worse experience than just
 * asking again. Every load starts muted; enabling always takes one click.
 */

const MIN_VOICE_GAP_MS = 40;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;
let lastVoiceAt = 0;

// Sound is toggleable from more than one surface (the mobile HUD chip, the
// terminal's `sound` command) — this is the shared source of truth so
// neither can go stale relative to the other.
type Listener = (enabled: boolean) => void;
const listeners = new Set<Listener>();

export function subscribeSound(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) ctx?.suspend();
    else if (enabled) ctx?.resume();
  });
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;

  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  ctx = new Ctor();
  const compressor = ctx.createDynamicsCompressor();
  master = ctx.createGain();
  master.gain.value = 0.16;
  master.connect(compressor);
  compressor.connect(ctx.destination);
  return ctx;
}

function canPlayVoice(): boolean {
  const now = performance.now();
  if (now - lastVoiceAt < MIN_VOICE_GAP_MS) return false;
  lastVoiceAt = now;
  return true;
}

function envelope(gain: GainNode, at: number, peak: number, decay: number) {
  gain.gain.cancelScheduledValues(at);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
}

export function isSoundEnabled() {
  return enabled;
}

/** Must be called from a user gesture (a click handler) — this is the only
 * place an AudioContext is constructed or resumed. */
export function enableSound() {
  enabled = true;
  ensureContext();
  ctx?.resume();
  listeners.forEach(l => l(enabled));
}

export function disableSound() {
  enabled = false;
  listeners.forEach(l => l(enabled));
}

export function blip(freq = 660) {
  const c = enabled && canPlayVoice() ? ensureContext() : null;
  if (!c || !master) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(master);

  const now = c.currentTime;
  envelope(gain, now, 1, 0.06);
  osc.start(now);
  osc.stop(now + 0.07);
}

/** A keystroke: a short filtered noise burst, not a tone. */
export function key() {
  const c = enabled && canPlayVoice() ? ensureContext() : null;
  if (!c || !master) return;

  const dur = 0.012;
  const size = Math.max(1, Math.floor(c.sampleRate * dur));
  const buffer = c.createBuffer(1, size, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;

  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  const gain = c.createGain();
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  const now = c.currentTime;
  envelope(gain, now, 0.7, dur);
  noise.start(now);
  noise.stop(now + dur + 0.01);
}

/** The theme toggle's press — low, short, felt more than heard. */
export function thunk() {
  const c = enabled && canPlayVoice() ? ensureContext() : null;
  if (!c || !master) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = 120;
  osc.connect(gain);
  gain.connect(master);

  const now = c.currentTime;
  envelope(gain, now, 1, 0.14);
  osc.start(now);
  osc.stop(now + 0.16);
}
