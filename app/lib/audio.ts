'use client';

/**
 * Fully synthesised sound — zero audio files, zero bundle weight. Every
 * voice, and the generative radio in radio.ts, is a handful of Web Audio
 * nodes with an envelope.
 *
 * The contract is non-negotiable: nothing plays until enableSound() or
 * enableMusic() is called, and that must only ever happen from inside a real
 * user gesture (a click/keydown handler) — that's also the only place an
 * AudioContext gets constructed at all, never eagerly on load.
 *
 * UI sound (opt-in, starts OFF) and music (opt-out, starts effectively ON
 * once a visitor unlocks it) are two independent booleans on purpose — they
 * have opposite defaults and get toggled from different places — but they
 * share one graph and one combined on-screen control (AudioToggle).
 *
 * Deliberately not persisted across page loads: a stored "on" preference
 * with no fresh gesture this session would leave the toggle reading ON
 * while nothing actually plays, which is a worse experience than just
 * asking again. Every load starts silent; enabling always takes one gesture.
 */

const MIN_VOICE_GAP_MS = 40;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let uiBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let reverbSend: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let enabled = false;
let musicEnabled = false;
let lastVoiceAt = 0;

// Toggled from more than one surface (the HUD chip, the terminal's
// sound/music commands) — this is the shared source of truth so neither
// surface can go stale relative to the other.
type Listener = (enabled: boolean) => void;
const listeners = new Set<Listener>();
const musicListeners = new Set<Listener>();

export function subscribeSound(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function subscribeMusic(listener: Listener) {
  musicListeners.add(listener);
  return () => {
    musicListeners.delete(listener);
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) ctx?.suspend();
    // Music is the common case with UI sound left off — resuming only when
    // `enabled` is true would leave a returning tab permanently silent.
    else if (enabled || musicEnabled) ctx?.resume();
  });
}

/**
 * One-pole lowpass applied while filling, with the coefficient itself
 * decaying over the buffer's length — early reflections stay bright, the
 * tail goes dark. That asymmetry (highs decaying faster than lows) is most
 * of the difference between "a room" and "a burst of filtered noise."
 * Independent noise per channel decorrelates L/R for width.
 */
function createReverbImpulse(context: AudioContext): AudioBuffer {
  const duration = 2.2;
  const preDelaySec = 0.02;
  const rate = context.sampleRate;
  const length = Math.floor(rate * duration);
  const preDelaySamples = Math.floor(rate * preDelaySec);
  const buffer = context.createBuffer(2, length, rate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < length; i++) {
      if (i < preDelaySamples) {
        data[i] = 0;
        continue;
      }
      const t = (i - preDelaySamples) / rate;
      const envelope = Math.exp(-t * 3.2);
      const cutoff = 0.5 * Math.exp(-t * 1.1) + 0.02;
      const raw = (Math.random() * 2 - 1) * envelope;
      lp += (raw - lp) * cutoff;
      data[i] = lp;
    }
  }
  return buffer;
}

/**
 * Builds the shared reverb send chain once. Under low core counts, a real
 * convolver is skipped for a two-delay feedback network — a fraction of the
 * cost, and it still reads as "a space" rather than "dry."
 */
function buildReverbChain(context: AudioContext, input: BiquadFilterNode, wet: GainNode) {
  const lowCpu = (navigator.hardwareConcurrency ?? 8) < 4;

  if (lowCpu) {
    const delayA = context.createDelay(1);
    delayA.delayTime.value = 0.31;
    const delayB = context.createDelay(1);
    delayB.delayTime.value = 0.47;
    const feedback = context.createGain();
    feedback.gain.value = 0.35;

    input.connect(delayA);
    delayA.connect(delayB);
    delayB.connect(feedback);
    feedback.connect(delayA);
    delayB.connect(wet);
    return;
  }

  const convolver = context.createConvolver();
  convolver.normalize = true;
  convolver.buffer = createReverbImpulse(context);
  input.connect(convolver);
  convolver.connect(wet);
}

/** Post-reverb tone shaping per theme — the only place a theme change
 * touches the room itself. The impulse response is generated once, ever;
 * regenerating it on a theme toggle would drop a stall into the view
 * transition. */
let reverbToneFilter: BiquadFilterNode | null = null;
let reverbWet: GainNode | null = null;

export function setMusicTheme(theme: 'paper' | 'blueprint') {
  if (!ctx || !reverbToneFilter || !reverbWet) return;
  const now = ctx.currentTime;
  const freq = theme === 'blueprint' ? 2200 : 3400;
  const wet = theme === 'blueprint' ? 0.32 : 0.26;
  reverbToneFilter.frequency.cancelScheduledValues(now);
  reverbToneFilter.frequency.setValueAtTime(reverbToneFilter.frequency.value, now);
  reverbToneFilter.frequency.linearRampToValueAtTime(freq, now + 1.5);
  reverbWet.gain.cancelScheduledValues(now);
  reverbWet.gain.setValueAtTime(reverbWet.gain.value, now);
  reverbWet.gain.linearRampToValueAtTime(wet, now + 1.5);
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;

  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  ctx = new Ctor();

  // Retuned to glue rather than the default 12:1 limiter: nothing sustained
  // ran through this before, so it never engaged, but a pad drone left the
  // defaults set to make every blip and keystroke audibly duck the music.
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -16;
  compressor.knee.value = 20;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.008;
  compressor.release.value = 0.3;
  compressor.connect(ctx.destination);

  master = ctx.createGain();
  master.gain.value = 0.16;
  master.connect(compressor);

  // UI voices get their own bus at unity gain — existing sounds stay
  // bit-identical to before this graph grew a music side.
  uiBus = ctx.createGain();
  uiBus.gain.value = 1;
  uiBus.connect(master);

  // Music: dry signal and the reverb return both land on musicBus, whose
  // own gain is the fade/mute control for the entire radio.
  musicBus = ctx.createGain();
  musicBus.gain.value = 0.0001;
  musicBus.connect(master);

  reverbSend = ctx.createGain();
  reverbSend.gain.value = 1;
  const reverbHP = ctx.createBiquadFilter();
  reverbHP.type = 'highpass';
  reverbHP.frequency.value = 160;
  reverbSend.connect(reverbHP);

  reverbToneFilter = ctx.createBiquadFilter();
  reverbToneFilter.type = 'lowpass';
  reverbToneFilter.frequency.value = 3400;
  reverbWet = ctx.createGain();
  reverbWet.gain.value = 0.26;
  reverbToneFilter.connect(reverbWet);
  reverbWet.connect(musicBus);
  buildReverbChain(ctx, reverbHP, reverbToneFilter);

  // Analyser taps musicBus — post-fade, post-mute, pre-master, so muting
  // drives the visual read to zero for free and a UI blip can never spike
  // it. A zero-gain sink keeps the branch connected: Chrome has historically
  // culled an analyser whose output goes nowhere.
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.minDecibels = -80;
  analyser.maxDecibels = -20;
  levelData = new Uint8Array(analyser.frequencyBinCount);
  musicBus.connect(analyser);
  const analyserSink = ctx.createGain();
  analyserSink.gain.value = 0;
  analyser.connect(analyserSink);
  analyserSink.connect(master);

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

export function isMusicEnabled() {
  return musicEnabled;
}

/** Must be called from a user gesture — this is the only place an
 * AudioContext is constructed or resumed. */
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

/** Must be called from a user gesture. Does not itself start the radio's
 * oscillators — radio.ts subscribes to this and reacts. */
export function enableMusic() {
  musicEnabled = true;
  ensureContext();
  ctx?.resume();
  musicListeners.forEach(l => l(musicEnabled));
}

export function disableMusic() {
  musicEnabled = false;
  writeMusicMuted(true);
  musicListeners.forEach(l => l(musicEnabled));
}

const MUSIC_SESSION_KEY = 'ys.radio';

function writeMusicMuted(muted: boolean) {
  try {
    if (muted) sessionStorage.setItem(MUSIC_SESSION_KEY, 'off');
    else sessionStorage.removeItem(MUSIC_SESSION_KEY);
  } catch {
    // Private mode / storage disabled — the in-memory state still holds for this visit.
  }
}

/** Whether the radio was explicitly muted earlier this tab session — checked
 * by RadioMount before arming its first-gesture listener, so muting as your
 * very first action on the site stays muted for the rest of the visit. */
export function isMusicMuted(): boolean {
  try {
    return sessionStorage.getItem(MUSIC_SESSION_KEY) === 'off';
  } catch {
    return false;
  }
}

/** The connect points radio.ts needs: `bus` for dry voice output and as the
 * overall fade control, `send` as the shared reverb input. Only meaningful
 * after a gesture has called ensureContext via enableSound/enableMusic. */
export function getMusicGraph() {
  if (!ctx || !musicBus || !reverbSend || !analyser) return null;
  return { ctx, bus: musicBus, send: reverbSend, analyser };
}

let levelData: Uint8Array | null = null;
const levelSmoothed = { value: 0 };

/** Smoothed 0..1 music level, cheap enough to call once per rendered frame.
 * Rises fast (a struck bell should feel struck) and falls slow (a tail
 * should feel like a tail). Returns 0 with no analyser or with music off —
 * every consumer degrades to today's static behaviour with no branch. */
export function getAudioLevel(): number {
  if (!analyser || !levelData || !musicEnabled) {
    levelSmoothed.value += (0 - levelSmoothed.value) * 0.08;
    return levelSmoothed.value;
  }
  analyser.getByteFrequencyData(levelData);

  const bins = Math.min(48, levelData.length);
  let sum = 0;
  for (let i = 0; i < bins; i++) sum += levelData[i];
  const raw = sum / bins / 255;

  const rate = raw > levelSmoothed.value ? 0.35 : 0.06;
  levelSmoothed.value += (raw - levelSmoothed.value) * rate;
  return levelSmoothed.value;
}

export function blip(freq = 660) {
  const c = enabled && canPlayVoice() ? ensureContext() : null;
  if (!c || !uiBus) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(uiBus);

  const now = c.currentTime;
  envelope(gain, now, 1, 0.06);
  osc.start(now);
  osc.stop(now + 0.07);
}

/** A keystroke: a short filtered noise burst, not a tone. */
export function key() {
  const c = enabled && canPlayVoice() ? ensureContext() : null;
  if (!c || !uiBus) return;

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
  gain.connect(uiBus);

  const now = c.currentTime;
  envelope(gain, now, 0.7, dur);
  noise.start(now);
  noise.stop(now + dur + 0.01);
}

/** The theme toggle's press — low, short, felt more than heard. */
export function thunk() {
  const c = enabled && canPlayVoice() ? ensureContext() : null;
  if (!c || !uiBus) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = 120;
  osc.connect(gain);
  gain.connect(uiBus);

  const now = c.currentTime;
  envelope(gain, now, 1, 0.14);
  osc.start(now);
  osc.stop(now + 0.16);
}
