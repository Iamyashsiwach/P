'use client';

import { useEffect, useRef, useState } from 'react';
import { createNoise3D } from 'simplex-noise';
import { gsap } from '@/app/lib/motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { useWebGLGate } from '@/app/components/webgl/useWebGLGate';
import { getTilt } from '@/app/lib/tilt';
import { getAudioLevel } from '@/app/lib/audio';

/* Tuned calmer than a first pass: the original settings (tight NOISE_SCALE,
 * fast TIME_SCALE, long FADE_ALPHA trails) produced a dense tangle of thin
 * curling threads — technically correct curl-noise, but it read as visual
 * noise/glitch on a phone rather than a deliberate graphic. Larger-scale,
 * slower-evolving noise gives broad, coherent swirls instead of tight
 * turbulence; a higher fade alpha keeps trails short (dots with a small
 * comet tail, not spaghetti); fewer, slightly bigger particles read as a
 * deliberate scattering rather than a fog. */
const NOISE_SCALE = 0.0012;
const TIME_SCALE = 0.00008;
const CURL_EPS = 0.0015;
const DRIFT = 20;
const MAX_SPEED = 55;
const DAMPING = 0.9;
const TOUCH_RADIUS = 90;
const TOUCH_FORCE = 480;
const FADE_ALPHA = 0.14;
/** Toned down from the original 0.7/0.85 — at full strength the field
 * competed with text everywhere it showed through, not just in the hero. */
const INK_ALPHA = 0.35;
const SIGNAL_ALPHA = 0.5;
/** getTilt() reports roughly ±18 degrees; this scales one degree of phone
 * tilt to a wind-like force, so opting into TiltToggle turns tilting the
 * phone into stirring the field. */
const TILT_FORCE = 2.6;
/** Every 11th particle carries the accent — same "a minority run hot"
 * language TraceField uses, so the two feel like one system. */
const HOT_EVERY = 11;

function readColorVar(varName: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/**
 * Mobile's answer to the desktop WebGL hero: a canvas-2D curl-noise flow
 * field, cheap enough to run continuously on a mid-tier phone. Mounted only
 * when the device didn't qualify for WebGL and has a coarse pointer — a
 * different experience for a different device class, not a downgrade of the
 * desktop one.
 *
 * Curl of a scalar noise field (∂n/∂y, -∂n/∂x) rather than the noise vector
 * itself: a curl field has zero divergence, so particles swirl and never
 * clump or evaporate at sinks/sources the way raw noise-driven velocity does.
 */
export function TouchField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const webglCapable = useWebGLGate();
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setCoarsePointer(mq.matches);
    const onChange = () => setCoarsePointer(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // WebGL wins when a device qualifies for both — this is the fallback for
  // devices that don't, not a second background layer stacked on the first.
  const active = coarsePointer && !webglCapable && !reduced;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) return;

    const noise = createNoise3D();
    let width = 0;
    let height = 0;
    let count = 0;
    let pos = new Float32Array(0);
    let vel = new Float32Array(0);

    // Cached so the hot loop below never calls getComputedStyle — it used
    // to call it three times per frame (ink, signal, paper-trail), on
    // exactly the devices that already failed the WebGL gate. Recomputed
    // only when the theme actually changes.
    let paperRaw = '';
    let inkRaw = '';
    let signalRaw = '';
    const updateColorCache = () => {
      paperRaw = readColorVar('--paper');
      inkRaw = readColorVar('--ink-mute');
      signalRaw = readColorVar('--signal');
    };
    updateColorCache();
    const colorObserver = new MutationObserver(updateColorCache);
    colorObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const seed = () => {
      for (let i = 0; i < count; i++) {
        pos[i * 2] = Math.random() * width;
        pos[i * 2 + 1] = Math.random() * height;
      }
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Fewer particles on a small screen — this runs on the phones WebGL
      // already declined, so the budget has to be real. Also fewer overall
      // than the first pass: a sparser field of slightly bigger points reads
      // as deliberate, where a dense one read as noise.
      count = width < 480 ? 380 : 550;
      pos = new Float32Array(count * 2);
      vel = new Float32Array(count * 2);
      seed();

      ctx.fillStyle = `hsl(${paperRaw} / 1)`;
      ctx.fillRect(0, 0, width, height);
    };
    resize();
    window.addEventListener('resize', resize);

    // The desktop WebGL scene fades to 0 opacity by the time you've scrolled
    // past the hero (Scene.tsx uses this exact formula) — this had no
    // equivalent at all, so the field kept competing with text in every
    // section for the whole page, not just the hero. Written straight to
    // style so scrolling never triggers a React render.
    let fade = 1;
    const onScroll = () => {
      const vh = window.innerHeight;
      fade = 1 - Math.min(1, Math.max(0, (window.scrollY - vh * 0.55) / (vh * 0.5)));
      canvas.style.opacity = String(fade);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    let touch: { x: number; y: number } | null = null;
    const onPointerMove = (e: PointerEvent) => {
      touch = { x: e.clientX, y: e.clientY };
    };
    const clearTouch = () => {
      touch = null;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', clearTouch);
    window.addEventListener('pointercancel', clearTouch);

    let time = 0;
    const tick = (_time: number, deltaMs: number) => {
      // Fully scrolled past — skip the per-particle work entirely rather
      // than paying for a canvas nobody can see.
      if (fade <= 0.01) return;

      // gsap.ticker's deltaTime is milliseconds; clamp so a stalled tab
      // doesn't fling every particle across the screen on the next tick.
      const dt = Math.min(deltaMs, 48) / 1000;
      time += deltaMs;

      const ink = `hsl(${inkRaw} / ${INK_ALPHA})`;
      const signal = `hsl(${signalRaw} / ${SIGNAL_ALPHA})`;
      const tilt = getTilt();

      // Three cheap, bounded audio hooks: louder music means a longer trail
      // (a lower wash alpha lets more of the past linger), a bit more
      // drift, and a bigger hot dot. Reduced motion already keeps this
      // field from mounting at all, so there's no conflict with that.
      const level = getAudioLevel();
      const trailAlpha = FADE_ALPHA * (1 - level * 0.4);
      const drift = DRIFT * (1 + level * 0.6);
      const hotSize = 2.6 + level * 1.4;

      // Trail: wash a translucent paper-color rect instead of clearRect —
      // free motion blur, no filter:blur() (see README).
      ctx.fillStyle = `hsl(${paperRaw} / ${trailAlpha})`;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < count; i++) {
        const xi = i * 2;
        const yi = xi + 1;
        let x = pos[xi];
        let y = pos[yi];

        const nx = x * NOISE_SCALE;
        const ny = y * NOISE_SCALE;
        const nz = time * TIME_SCALE;
        const curlX =
          (noise(nx, ny + CURL_EPS, nz) - noise(nx, ny - CURL_EPS, nz)) / (2 * CURL_EPS);
        const curlY =
          -(noise(nx + CURL_EPS, ny, nz) - noise(nx - CURL_EPS, ny, nz)) / (2 * CURL_EPS);

        let vx = vel[xi] + curlX * drift * dt + tilt.x * TILT_FORCE * dt;
        let vy = vel[yi] + curlY * drift * dt + tilt.y * TILT_FORCE * dt;

        if (touch) {
          const dx = x - touch.x;
          const dy = y - touch.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < TOUCH_RADIUS * TOUCH_RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const force = (1 - d / TOUCH_RADIUS) * TOUCH_FORCE;
            vx += (dx / d) * force * dt;
            vy += (dy / d) * force * dt;
          }
        }

        const speed = Math.hypot(vx, vy);
        if (speed > MAX_SPEED) {
          vx = (vx / speed) * MAX_SPEED;
          vy = (vy / speed) * MAX_SPEED;
        }
        vel[xi] = vx * DAMPING;
        vel[yi] = vy * DAMPING;

        x += vx * dt;
        y += vy * dt;

        // Wrap rather than respawn: respawning reads as particles vanishing
        // and popping back in, wrapping reads as one continuous field.
        if (x < 0) x += width;
        else if (x > width) x -= width;
        if (y < 0) y += height;
        else if (y > height) y -= height;

        pos[xi] = x;
        pos[yi] = y;

        const hot = i % HOT_EVERY === 0;
        ctx.fillStyle = hot ? signal : ink;
        const size = hot ? hotSize : 1.8;
        ctx.fillRect(x, y, size, size);
      }
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      colorObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', clearTouch);
      window.removeEventListener('pointercancel', clearTouch);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}

export default TouchField;
