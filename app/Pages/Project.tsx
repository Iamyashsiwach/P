import React from 'react';
import { SparklesCore } from '../components/ui/sparkles';
import { AnimatedTestimonials } from '../components/ui/animated-testimonials';

export function Project() {
  const testimonials = [
    {
      quote:
        'Led product strategy and user experience design for a freelance website using Three.js, Next.js, and RAG. Analyzed user needs and market requirements to deliver an interactive and dynamic web solution that drives business value.',
      name: 'Bluelayerstudio.com', // Keep as a string
      designation: 'Web Agency Product Strategy & Development',
      src: '/Screenshot (2).jpeg',
      link: 'https://www.bluelayerstudio.com', // Add a separate field for the link
    },
    {
      quote:
        'Managed end-to-end product development for a System Integrator company website. Conducted stakeholder interviews, defined user stories, and prioritized features to deliver a seamless customer experience that improved user engagement metrics.',
      name: 'reveeinfotech.com', // Keep as a string
      designation: 'B2B Product Management & Development',
      src: '/reveeinfotech.png',
      link: 'https://www.reveeinfotech.com', // Add a separate field for the link
    },
    {
      quote:
        'Identified market opportunity and led product innovation for a portable IoT-based Air Quality Index Monitor. Conducted user research, defined MVP requirements, and delivered a solution addressing key pain points for healthier family environments.',
      name: 'LinkedIn',
      designation: 'IoT Product Innovation & Market Research',
      src: '/p-1.jpeg',
      link: 'https://www.linkedin.com/posts/yash-siwach_iot-airquality-smarthome-activity-7207296630738341889-wHXx?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAD2PIUkBnJudFv2-2-HEiqgp0YqkhGaTwlI',
    },
    {
      quote:
        'Drove product roadmap and feature prioritization for an NGO website to maximize social impact. Analyzed user journeys, implemented A/B testing for donation flows, and integrated analytics to measure engagement KPIs and optimize conversion rates.',
      name: 'SmileFoundationScoiety.com',
      designation: 'Non-Profit Product Strategy & Growth',
      src: '/p-3.png',
      link: 'https://smilefoudationsociety.vercel.app',
    },
    {
      quote:
        'Conceptualized and executed product vision for an AR gaming experience using agile methodologies. Gathered user feedback through beta testing, iterated on core features, and delivered an engaging product that enhanced user retention and satisfaction.',
      name: 'LinkedIn',
      designation: 'AR Gaming Product Development & UX',
      src: '/p-2.png',
      link: 'https://www.linkedin.com/posts/yash-siwach_unity-csharp-argame-activity-7193535905696018432-jD3h?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAD2PIUkBnJudFv2-2-HEiqgp0YqkhGaTwlI',
    },
    {
      quote:
        'Collaborated with cross-functional teams to design and optimize user experience for a fintech copytrading platform. Conducted competitive analysis, defined success metrics, and implemented data-driven improvements to enhance user adoption and platform usability.',
      name: 'Yash',
      designation: 'Fintech Product Design & Analytics',
      src: '/p-4.png',
    },
  ];

  return (
    <div
      id="projects"
      className="h-auto min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md py-6"
    >
      {/* Title Section */}
      <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20 mb-2 sm:mb-5">
        Projects
      </h1>

      {/* Sparkles and Gradients Section */}
      <div className="w-full max-w-[40rem] h-20 sm:h-36 relative mt-0 -mb-10 sm:-mb-20">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core Sparkles Component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={800}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full">
        <AnimatedTestimonials testimonials={testimonials} />
      </div>
    </div>
  );
}

export default Project;
