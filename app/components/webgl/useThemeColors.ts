'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/app/components/theme/ThemeProvider';

/** --ink/--signal are stored as an "H S% L%" triple, not a hsl() string. */
function readColor(varName: string): THREE.Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const [h, s, l] = raw.split(/\s+/).map(parseFloat);
  return new THREE.Color().setHSL(h / 360, s / 100, l / 100);
}

/**
 * Re-reads --ink/--signal off the root whenever the theme changes, so
 * TraceField's colors track Blueprint mode instead of freezing at whatever was
 * true on first mount.
 */
export function useThemeColors() {
  const { theme } = useTheme();
  const [colors, setColors] = useState(() => ({
    ink: readColor('--ink'),
    signal: readColor('--signal'),
  }));

  useEffect(() => {
    setColors({ ink: readColor('--ink'), signal: readColor('--signal') });
  }, [theme]);

  return colors;
}

export default useThemeColors;
