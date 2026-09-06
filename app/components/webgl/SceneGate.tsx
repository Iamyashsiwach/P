'use client';

import dynamic from 'next/dynamic';
import { useWebGLGate } from './useWebGLGate';

/**
 * Keeps three/R3F/drei in a chunk that is only ever requested once the device
 * has passed the capability checks — so phones, reduced-motion users and
 * anything without WebGL2 never download it.
 */
const Scene = dynamic(() => import('./Scene').then(m => m.Scene), { ssr: false });

export function SceneGate() {
  const capable = useWebGLGate();
  if (!capable) return null;
  return <Scene />;
}

export default SceneGate;
