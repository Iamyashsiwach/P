"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "../components/ui/lamp";
import { FlipWords } from "../components/ui/flip-words";

export function Hero() {
  const words = [ "UI/UX Designer", "Product Manager", "Web Developer" ]; // Words to flip

  return (
    <LampContainer>
      {/* Hero Heading */}
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }} // Animation trigger when in viewport
        exit={{ opacity: 0, y: 100 }} // Animation on exit (when scrolling up)
        transition={{
          duration: 1.8,
          ease: "easeInOut",
        }}
        className="mt-0 sm:mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl sm:text-5xl xs:text-3xl"
      >
        Yash Siwach <br />
        <div className="mt-4 text-center">
          <FlipWords
            words={words}
            className="text-xl md:text-3xl font-bold text-gray-700 sm:text-2xl xs:text-xl"
          />
        </div>
      </motion.h1>
    </LampContainer>
  );
}

export default Hero;
