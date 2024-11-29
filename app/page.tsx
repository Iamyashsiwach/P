import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"; 
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with loading state handling
const Hero = dynamic(() => import('./Pages/Hero'), { loading: () => <Loading /> });
const AboutMe = dynamic(() => import('./Pages/AboutMe'), { loading: () => <Loading /> });
const TimelineWithBackground = dynamic(() => import('./Pages/TimelineWithBackground'), { loading: () => <Loading /> });
const Skills = dynamic(() => import('./Pages/Skills'), { loading: () => <Loading /> });
const Project = dynamic(() => import('./Pages/Project'), { loading: () => <Loading /> });
const Footer = dynamic(() => import('./Pages/Footer'), { loading: () => <Loading /> });
const Navbar = dynamic(() => import('./components/Navbar'), { loading: () => <Loading /> });

// Loading component to show while dynamic imports are being resolved
const Loading = () => <h2>🌀 Loading...</h2>;

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
