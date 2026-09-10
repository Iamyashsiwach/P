'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWebGLGate } from './useWebGLGate';

/**
 * Keeps three/R3F/drei in a chunk that is only ever requested once the device
 * has passed the capability checks — so phones, reduced-motion users and
 * anything without WebGL2 never download it.
 */
const Scene = dynamic(() => import('./Scene').then(m => m.Scene), { ssr: false });

/**
 * Waits for the browser to actually be idle before mounting Scene. The gate
 * passing only means the device is capable — without this, three/R3F's parse
 * and first-frame setup lands on the main thread at the same moment the
 * hero's own text-reveal animation is trying to run, competing for the same
 * slot and pushing the hero's largest paint out by seconds. Safari has no
 * requestIdleCallback, hence the timeout fallback.
 */
function useIdle() {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback ?? (cb => window.setTimeout(cb, 200));
    const cic = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => setIdle(true));
    return () => cic(id);
  }, []);
  return idle;
}

export function SceneGate() {
  const capable = useWebGLGate();
  const idle = useIdle();
  if (!capable || !idle) return null;
  return <Scene />;
}

export default SceneGate;
