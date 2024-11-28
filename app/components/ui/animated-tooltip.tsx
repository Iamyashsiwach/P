// "use client";
// import Image from "next/image";
// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// export const AnimatedTooltip = ({
//   items,
// }: {
//   items: {
//     id: number;
//     name: string;
//     designation: string;
//     image: string;
//   }[];
// }) => {
//   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

//   return (
//     <>
//       {items.map((item) => (
//         <div
//           className="relative group"
//           key={item.id}
//           onMouseEnter={() => setHoveredIndex(item.id)}
//           onMouseLeave={() => setHoveredIndex(null)}
//         >
//           <AnimatePresence>
//             {hoveredIndex === item.id && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.8 }}
//                 transition={{ duration: 0.3 }}
//                 className="absolute -top-16 left-1/2 -translate-x-1/2 text-center bg-black text-white rounded-md px-4 py-2 shadow-md z-50"
//               >
//                 <div className="font-bold text-lg">{item.name}</div>
//                 <div className="text-sm">{item.designation}</div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//           <Image
//             height={100}
//             width={100}
//             src={item.image}
//             alt={item.name}
//             loading="lazy"
//             className="object-cover rounded-full h-20 w-20 border-2 border-white transition-transform duration-300 group-hover:scale-110"
//           />
//         </div>
//       ))}
//     </>
//   );
// };


"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

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
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const halfWidth = target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);// set the x value, which is then used in transform and rotate
  };

  return (
    <>
      {items.map((item, idx) => (
        <div
          className="-mr-4 relative group"
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
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-sm flex-col items-center justify-center rounded-md bg-black z-50 shadow-xl px-6 py-3"
              >
                <div className="absolute inset-x-10 z-30 w-[30%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px" />
                <div className="absolute left-10 w-[50%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />
                <div className="font-bold text-white relative z-30 text-lg">
                  {item.name}
                </div>
                <div className="text-white text-sm">{item.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <Image
            onMouseMove={handleMouseMove}
            height={250} // Increased image size
            width={250} // Increased image size
            src={item.image}
            alt={item.name}
            className="object-cover !m-0 !p-0 object-top rounded-full h-20 w-20 border-2 group-hover:scale-110 group-hover:z-30 border-white relative transition duration-500"
          />
        </div>
      ))}
    </>
  );
};