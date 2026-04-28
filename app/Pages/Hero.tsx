'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LampContainer } from '../components/ui/lamp';
import { FlipWords } from '../components/ui/flip-words';

export function Hero() {
  const words = ['Product Manager', 'AI Developer', 'DevOps & MLops Engineer']; // Words to flip

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <LampContainer className="px-4 sm:px-6">
        {/* Hero Heading */}
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }} // Animation trigger when in viewport
          exit={{ opacity: 0, y: 100 }} // Animation on exit (when scrolling up)
          transition={{
            duration: 1.8,
            ease: 'easeInOut',
          }}
          className="mx-auto max-w-[18rem] xs:max-w-[20rem] sm:max-w-2xl md:max-w-4xl bg-gradient-to-br from-slate-300 to-slate-500 py-2 sm:py-4 bg-clip-text text-center text-3xl font-medium leading-tight tracking-tight text-transparent xs:text-4xl sm:text-5xl md:text-7xl"
        >
          Yash Siwach <br />
          <div className="mt-3 sm:mt-4 text-center">
            <FlipWords
              words={words}
              className="block min-h-[3.5rem] text-base font-bold leading-snug text-gray-700 xs:min-h-[4rem] xs:text-lg sm:min-h-[3rem] sm:text-2xl md:text-3xl"
            />
          </div>
        </motion.h1>
      </LampContainer>

      {/* Elegant Book Link - Mobile Optimized */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 2,
          delay: 2.5,
        }}
        className="fixed bottom-6 left-4 md:bottom-8 md:left-8 z-40"
      >
        <Link href="/book">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 md:gap-3"
          >
            <div className="h-px w-6 md:w-8 bg-slate-700 group-hover:w-10 md:group-hover:w-12 transition-all duration-500" />
            <div className="relative">
              <span className="text-xs md:text-sm font-light tracking-[0.25em] md:tracking-[0.3em] text-slate-600 group-hover:text-slate-400 transition-colors duration-300 uppercase">
                My Book
              </span>
              <motion.div
                className="absolute -bottom-1 left-0 h-px bg-slate-500"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </Link>
      </motion.div> */}
    </section>
  );
}

export default Hero;
