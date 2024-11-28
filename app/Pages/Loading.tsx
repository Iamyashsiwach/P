// Loading.tsx
"use client"; // Ensure this is a client component

import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="loading-screen">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 1 }}
        className="text-3xl md:text-5xl font-bold text-white text-center px-4"
      >
        Preparing Yash&apos;s Portfolio
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-lg md:text-xl text-gray-300 text-center px-4"
      >
        Just for You...
      </motion.p>
    </div>
  );
};

export default Loading;