// import React from "react";
// import { ContainerScroll } from "../components/ui/container-scroll-animation";
// import Image from "next/image";

// export function AboutMe() {
//   return (
//     <div className="flex flex-col overflow-hidden">
//       <ContainerScroll
//         titleComponent={
//           <>
//             <h1 className="text-4xl font-semibold text-white">
//               A Little <br />
//               <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
//                 About Me
//               </span>
//             </h1>
//           </>
//         }
//       >
//         {/* Image with priority loading */}
//         <div className="relative w-full h-[500px] md:h-[720px]">
//           <Image
//             src="/bbgg.png" // Path to the image
//             alt="Background image for About Me section"
//             height={720}
//             width={1400}
//             className="mx-auto rounded-2xl object-cover w-full h-full"
//             draggable={false}
//             priority
//           />
//         </div>
//       </ContainerScroll>
//     </div>
//   );
// // }

// // pages/AboutMe.tsx
// import React from "react";
// import { ContainerScroll } from "../components/ui/container-scroll-animation"; // Import the ContainerScroll component
// import Layout from '../components/Layout'; // Import the Layout component
// import Image from "next/image";

// export function AboutMe() {
//   return (
//     <Layout>
//       <ContainerScroll
//         titleComponent={
//           <>
//             <h1 className="text-4xl font-semibold text-white">
//               A Little <br />
//               <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
//                 About Me
//               </span>
//             </h1>
//           </>
//         }
//       >
//         {/* Content Section */}
//         <div className="relative w-full h-[500px] md:h-[720px]">
//           <Image
//             src="/bbgg.png" // Path to the image
//             alt="Background image for About Me section"
//             height={720}
//             width={1400}
//             className="mx-auto rounded-2xl object-cover w-full h-full"
//             draggable={false}
//             priority
//           />
//           <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
//             <p className="text-lg md:text-xl">
//               Hello! I'm Yash Siwach, a passionate developer with expertise in various technologies.
//             </p>
//             <p className="text-lg md:text-xl">
//               I love creating web applications that provide excellent user experiences.
//             </p>
//             {/* Add more content as needed */}
//           </div>
//         </div>
//       </ContainerScroll>
//     </Layout>
//   );
// }

// export default AboutMe;

// AboutMe.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';
import Image from 'next/image';

const AboutMe = () => {
  return (
    <ContainerScroll
      titleComponent={
        <>
          <h1 id="about" className="text-4xl font-semibold text-white">
            A Little <br />
            <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">About Me</span>
          </h1>
        </>
      }
    >
      {/* Content Section */}
      <div className="relative w-full h-[500px] md:h-[720px] ">
        <Image
          src="/bbgg.png" // Path to the image
          alt="Background image for About Me section"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover w-full h-full"
          draggable={false}
          priority
        />
      </div>
    </ContainerScroll>
  );
};

export default AboutMe;

// Subcomponents used in AboutMe
export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.9] : [1.05, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: '1000px',
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => (
  <motion.div
    style={{
      translateY: translate,
    }}
    className="max-w-5xl mx-auto text-center"
  >
    {titleComponent}
  </motion.div>
);

const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => (
  <motion.div
    style={{
      rotateX: rotate,
      scale,
      boxShadow:
        '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
    }}
    className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
  >
    <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4">
      {children}
    </div>
  </motion.div>
);
