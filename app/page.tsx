import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

import { sectionIds } from './lib/content';
import { Nav } from './components/chrome/Nav';
import { Cursor } from './components/chrome/Cursor';
import { HUD } from './components/chrome/HUD';
import { ScrollProgress } from './components/chrome/ScrollProgress';
import { SmoothScroll } from './components/motion/SmoothScroll';
import { SceneGate } from './components/webgl/SceneGate';
import { TouchField } from './components/mobile/TouchField';
import { TapRipple } from './components/mobile/TapRipple';
import { TerminalProvider } from './components/terminal/TerminalProvider';
import { TerminalMount } from './components/terminal/TerminalMount';
import { DevTools } from './components/theme/DevTools';
import { RadioMount } from './components/audio/RadioMount';

import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Log } from './sections/Log';
import { Stack } from './sections/Stack';
import { CertWork } from './sections/CertWork';
import { Proof } from './sections/Proof';
import { Contact } from './sections/Contact';

// Title, description and og:image come from the layout defaults, which are
// the home page's; only the canonical has to live here (see layout.tsx).
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <TerminalProvider>
      <SmoothScroll />
      <SceneGate />
      <TouchField />
      <TapRipple />
      <ScrollProgress />
      <Nav />
      <Cursor />

      <main>
        <Hero />
        {/* Nothing here suspends — each boundary exists so React hydrates
            the sections below the fold as separate units, yielding to the
            main thread between them, instead of the whole page in one
            ~180ms task on a mid-range phone. Server HTML is unaffected. */}
        <Suspense>
          <About />
        </Suspense>
        <Suspense>
          <Log />
        </Suspense>
        <Suspense>
          <Stack />
        </Suspense>
        <Suspense>
          <CertWork />
        </Suspense>
        <Suspense>
          <Proof />
        </Suspense>
        <Suspense>
          <Contact />
        </Suspense>
      </main>

      <HUD sections={sectionIds} />
      <TerminalMount />
      <DevTools />
      <RadioMount />
      <SpeedInsights />
      <Analytics />
    </TerminalProvider>
  );
}
