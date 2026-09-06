/**
 * Module-singleton tilt reading, in the same spirit as lib/lenis.ts: the
 * hook that owns the deviceorientation listener (useTiltParallax) and the
 * consumer (TouchField's flow field) don't share a React tree, so this is
 * cheaper and more precise than round-tripping through a CSS custom
 * property and re-parsing it every animation frame.
 */
let tiltX = 0;
let tiltY = 0;

export function setTilt(x: number, y: number) {
  tiltX = x;
  tiltY = y;
}

export function getTilt() {
  return { x: tiltX, y: tiltY };
}
