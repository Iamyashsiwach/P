'use client';

import { useEffect, useState } from 'react';

/**
 * GSDevTools — free in GSAP's npm build, mounted only behind ?debug=1 so it
 * never reaches a real visitor's bundle or screen. Its own chunk (bundled
 * with the rest of motion.heavy.ts) is fetched only when the query param is
 * actually present.
 */
export function DevTools() {
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).get('debug') === '1');
  }, []);

  useEffect(() => {
    if (!debug) return;
    let devTools: { kill: () => void } | null = null;

    import('@/app/lib/motion.heavy').then(({ gsap }) => {
      import('gsap/GSDevTools').then(({ GSDevTools }) => {
        gsap.registerPlugin(GSDevTools);
        devTools = GSDevTools.create();
      });
    });

    return () => devTools?.kill();
  }, [debug]);

  return null;
}

export default DevTools;
