import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"; 
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with loading state handling
const Hero = dynamic(() => import('./Pages/Hero'), {
  loading: () => <div>Loading...</div>,
  ssr: true
});
const AboutMe = dynamic(() => import('./Pages/AboutMe'), {
  loading: () => <div>Loading...</div>,
  ssr: true
});
const TimelineWithBackground = dynamic(() => import('./Pages/TimelineWithBackground'));
const Skills = dynamic(() => import('./Pages/Skills'));
const Project = dynamic(() => import('./Pages/Project'));
const Footer = dynamic(() => import('./Pages/Footer'));
const Navbar = dynamic(() => import('./components/Navbar'));


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <AboutMe />
      <TimelineWithBackground />
      <Skills />
      <Project />
      <Footer />
      <SpeedInsights />
      <Analytics />
    </>
  );
}
