'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isFirefox, setIsFirefox] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsFirefox(navigator.userAgent.toLowerCase().includes('firefox'));
  }, []);

  // Show simplified version until mounted, and for Firefox
  if (!mounted || isFirefox) {
    return (
      <div
        className={cn(
          'relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full rounded-md z-0',
          className
        )}
      >
        <div className="relative z-50 flex flex-col items-center px-5">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full rounded-md z-0',
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 ">
        {/* First Motion Element (Lamp) */}
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          whileInView={{ opacity: 1, width: '22rem' }} // Trigger animation when the element is in view
          exit={{ opacity: 0.5, width: '15rem' }} // Animation when exiting
          transition={{
            duration: 1,
            ease: 'easeInOut',
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-40 w-[18rem] overflow-visible xs:h-48 xs:w-[22rem] sm:h-56 sm:w-[24rem] md:w-[25rem] bg-gradient-conic from-cyan-500 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-[100%] left-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute left-0 bottom-0 z-20 h-[100%] w-20 bg-slate-950 [mask-image:linear-gradient(to_right,white,transparent)] xs:w-28 sm:w-40" />
        </motion.div>

        {/* Second Motion Element (Lamp) */}
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          whileInView={{ opacity: 1, width: '22rem' }}
          exit={{ opacity: 0.5, width: '15rem' }}
          transition={{
            duration: 1,
            ease: 'easeInOut',
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-40 w-[18rem] xs:h-48 xs:w-[22rem] sm:h-56 sm:w-[24rem] md:w-[25rem] bg-gradient-conic from-transparent via-transparent to-cyan-500 text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute right-0 bottom-0 z-20 h-[100%] w-20 bg-slate-950 [mask-image:linear-gradient(to_left,white,transparent)] xs:w-28 sm:w-40" />
          <div className="absolute w-[100%] right-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Other Static Visual Elements */}
        <div className="absolute top-1/2 h-40 w-full translate-y-10 scale-x-150 bg-slate-950 blur-2xl sm:h-48 sm:translate-y-12"></div>
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className="absolute inset-auto z-50 h-24 w-[16rem] -translate-y-[3.5rem] rounded-full bg-cyan-500 opacity-50 blur-3xl xs:h-28 xs:w-[20rem] sm:h-36 sm:w-[28rem] sm:-translate-y-1/2"></div>

        {/* Scroll-triggered motion */}
        <motion.div
          initial={{ width: '8rem' }}
          whileInView={{ width: '14rem' }}
          exit={{ width: '8rem' }}
          transition={{
            duration: 1,
            ease: 'easeInOut',
          }}
          className="absolute inset-auto z-30 h-24 w-40 -translate-y-[4.25rem] rounded-full bg-cyan-400 blur-2xl xs:h-28 xs:w-52 sm:h-36 sm:w-64 sm:-translate-y-[6rem]"
        ></motion.div>

        <motion.div
          initial={{ width: '15rem' }}
          whileInView={{ width: '22rem' }}
          exit={{ width: '15rem' }}
          transition={{
            duration: 1,
            ease: 'easeInOut',
          }}
          className="absolute inset-auto z-50 h-0.5 w-[16rem] -translate-y-[4.75rem] bg-cyan-400 xs:w-[20rem] sm:w-[24rem] sm:-translate-y-[7rem]"
        ></motion.div>

        <div className="absolute inset-auto z-40 h-24 w-full -translate-y-[8rem] bg-slate-950 xs:h-28 xs:-translate-y-[9rem] sm:h-44 sm:-translate-y-[12.5rem]"></div>
      </div>

      <div className="relative z-50 flex -translate-y-44 flex-col items-center px-4 pt-12 pb-16 xs:-translate-y-52 sm:px-5 sm:pt-0 sm:pb-0 md:-translate-y-72 lg:-translate-y-80">
        {children}
      </div>
    </div>
  );
};
