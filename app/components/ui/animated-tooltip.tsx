'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { motion, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
  }[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
  // translate the tooltip
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const halfWidth = target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth); // set the x value, which is then used in transform and rotate
  };

  // Split items into two rows of 6 items each
  const firstRow = items.slice(0, 6);
  const secondRow = items.slice(6, 12);

  return (
    <div className="flex flex-col items-center">
      {/* First Row */}
      <div className="flex justify-center mb-6">
        {firstRow.map((item, idx) => (
          <div
            className="-mr-2 sm:-mr-3 md:-mr-4 relative group"
            key={`${item.name}-${idx}`}
            onMouseEnter={() => setHoveredIndex(item.id)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence mode="popLayout">
              {hoveredIndex === item.id && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 260,
                      damping: 10,
                    },
                  }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  style={{
                    translateX: translateX,
                    rotate: rotate,
                    whiteSpace: 'nowrap',
                  }}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 flex text-sm flex-col items-center justify-center rounded-md bg-black z-50 shadow-xl px-3 py-1.5"
                >
                  <div className="absolute inset-x-10 z-30 w-[30%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px" />
                  <div className="absolute left-10 w-[50%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />
                  <div className="font-bold text-white relative z-30 text-xs sm:text-sm md:text-base">
                    {item.name}
                  </div>
                  <div className="text-white text-[10px] sm:text-xs">{item.designation}</div>
                </motion.div>
              )}
            </AnimatePresence>
            <Image
              onMouseMove={handleMouseMove}
              height={150}
              width={150}
              src={item.image}
              alt={item.name}
              className="object-cover !m-0 !p-0 object-top rounded-full h-16 w-16 sm:h-18 sm:w-18 md:h-24 md:w-24 border-2 group-hover:scale-110 group-hover:z-30 border-white relative transition duration-500"
            />
          </div>
        ))}
      </div>

      {/* Second Row */}
      <div className="flex justify-center">
        {secondRow.map((item, idx) => (
          <div
            className="-mr-2 sm:-mr-3 md:-mr-4 relative group"
            key={`${item.name}-${idx + 6}`}
            onMouseEnter={() => setHoveredIndex(item.id)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence mode="popLayout">
              {hoveredIndex === item.id && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 260,
                      damping: 10,
                    },
                  }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  style={{
                    translateX: translateX,
                    rotate: rotate,
                    whiteSpace: 'nowrap',
                  }}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 flex text-sm flex-col items-center justify-center rounded-md bg-black z-50 shadow-xl px-3 py-1.5"
                >
                  <div className="absolute inset-x-10 z-30 w-[30%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px" />
                  <div className="absolute left-10 w-[50%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />
                  <div className="font-bold text-white relative z-30 text-xs sm:text-sm md:text-base">
                    {item.name}
                  </div>
                  <div className="text-white text-[10px] sm:text-xs">{item.designation}</div>
                </motion.div>
              )}
            </AnimatePresence>
            <Image
              onMouseMove={handleMouseMove}
              height={150}
              width={150}
              src={item.image}
              alt={item.name}
              className="object-cover !m-0 !p-0 object-top rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-20 md:w-20 border-2 group-hover:scale-110 group-hover:z-30 border-white relative transition duration-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
