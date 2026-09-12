'use client';

import { useState } from 'react';
import * as THREE from 'three';

/** --ink/--signal are stored as an "H S% L%" triple, not a hsl() string. */
function readColor(varName: string): THREE.Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const [h, s, l] = raw.split(/\s+/).map(parseFloat);
  return new THREE.Color().setHSL(h / 360, s / 100, l / 100);
}

/** Reads --ink/--signal off the root once — kept as a hook (not a plain
 * function call) so TraceField only touches the DOM after mount, matching
 * every other read in that component. */
export function useThemeColors() {
  const [colors] = useState(() => ({
    ink: readColor('--ink'),
    signal: readColor('--signal'),
  }));

  return colors;
}

export default useThemeColors;
