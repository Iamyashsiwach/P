import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

import { sectionIds } from './lib/content';
import { Nav } from './components/chrome/Nav';
import { Cursor } from './components/chrome/Cursor';
import { HUD } from './components/chrome/HUD';
import { ScrollProgress } from './components/chrome/ScrollProgress';
import { SmoothScroll } from './components/motion/SmoothScroll';
import { SceneGate } from './components/webgl/SceneGate';
import { CrtOverlay } from './components/theme/CrtOverlay';

import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Log } from './sections/Log';
import { Stack } from './sections/Stack';
import { Certifications } from './sections/Certifications';
import { Work } from './sections/Work';
import { Contact } from './sections/Contact';

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <SceneGate />
      <ScrollProgress />
      <CrtOverlay />
      <Nav />
      <Cursor />

      <main>
        <Hero />
        <About />
        <Log />
        <Stack />
        <Certifications />
        <Work />
        <Contact />
      </main>

      <HUD sections={sectionIds} />
      <SpeedInsights />
      <Analytics />
    </>
  );
}
