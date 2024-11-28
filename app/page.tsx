// "use client";
// import { Suspense, useState } from "react";
// import dynamic from "next/dynamic";
// import { useInView } from "react-intersection-observer";

// // Dynamically import each section
// // const Navbar = dynamic(() => import("./components/Navbar"), { ssr: false });
// const Hero = dynamic(() => import("./Pages/Hero"));
// const AboutMe = dynamic(() => import("./Pages/AboutMe"));
// const TimelineWithBackground = dynamic(() =>
//   import("./Pages/TimelineWithBackground")
// );
// const Skills = dynamic(() => import("./Pages/Skills"));
// const Project = dynamic(() => import("./Pages/Project"));
// const Footer = dynamic(() => import("./Pages/Footer"));

// function LazySection({ children }: { children: React.ReactNode }) {
//   const { ref, inView } = useInView({
//     triggerOnce: true, // Load only once when the section enters the viewport
//     threshold: 0.1, // Trigger when 10% of the section is visible
//   });

//   return <div ref={ref}>{inView ? children : <Loading />}</div>;
// }

// export default function Home() {
//   return (
//     <div>
//       {/* <Navbar /> */}
//       <Suspense fallback={<Loading />}>
//         <Hero />
//       </Suspense>

//       <LazySection>
//         <Suspense fallback={<Loading />}>
//           <AboutMe />
//         </Suspense>
//       </LazySection>

//       <LazySection>
//         <Suspense fallback={<Loading />}>
//           <TimelineWithBackground />
//         </Suspense>
//       </LazySection>

//       <LazySection>
//         <Suspense fallback={<Loading />}>
//           <Skills />
//         </Suspense>
//       </LazySection>

//       <LazySection>
//         <Suspense fallback={<Loading />}>
//           <Project />
//         </Suspense>
//       </LazySection>

//       <LazySection>
//         <Suspense fallback={<Loading />}>
//           <Footer />
//         </Suspense>
//       </LazySection>
//     </div>
//   );
// }

// function Loading() {
//   return <h2>🌀 Loading...</h2>;
// }



// import React, { Suspense, lazy } from 'react';

// import { useInView } from 'react-intersection-observer';
// // Lazy load the components for the page
// const Navbar = lazy(() => import('./components/Navbar'));
// const Hero = lazy(() => import('./Pages/Hero'));
// const AboutMe = lazy(() => import('./Pages/AboutMe'));
// const TimelineWithBackground = lazy(() => import('./Pages/TimelineWithBackground'));
// const Skills = lazy(() => import('./Pages/Skills'));
// const Project = lazy(() => import('./Pages/Project'));
// const Footer = lazy(() => import('./Pages/Footer'));
// function LazySection({ children }: { children: React.ReactNode }) {
//       const { ref, inView } = useInView({
//         triggerOnce: true, // Load only once when the section enters the viewport
//         threshold: 0.1, // Trigger when 10% of the section is visible
//       });

//   return <div ref={ref}>{inView ? children : <Loading />}</div>;
// }
// export default function Home() {
//     return (
     
//     <Suspense>       
//             <Navbar />
//             <Hero />
//    <AboutMe /> 
//             <TimelineWithBackground />
//             <Skills />
//             <Project />
//             <Footer />
//            </Suspense>

//     );
// }
// function Loading() {
//       return <h2>🌀 Loading...</h2>;
//     }



import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
const Hero = dynamic(() => import('./Pages/Hero'));
const AboutMe = dynamic(() => import('./Pages/AboutMe'));
const TimelineWithBackground = dynamic(() => import('./Pages/TimelineWithBackground'));
const Skills = dynamic(() => import('./Pages/Skills'));
const Project = dynamic(() => import('./Pages/Project'));
const Footer = dynamic(() => import('./Pages/Footer'));
const Navbar = dynamic(() => import('./components/Navbar'));
const Loading = () => <h2>🌀 Loading...</h2>;

export default function Home() {

  return (
    <Suspense fallback={<Loading />}>
      <Navbar />
      <Hero />
      <AboutMe />
      <TimelineWithBackground />
      <Skills />
      <Project />
      <Footer />
    </Suspense>
  );
}