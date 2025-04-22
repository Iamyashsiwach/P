import React from 'react';
import { SparklesCore } from '../components/ui/sparkles';
import { AnimatedTestimonials } from '../components/ui/animated-testimonials';

export function Project() {
  const testimonials = [
    {
      quote:
        'Developed a freelance website using Three.js, Next.js, and RAG, delivering an interactive and dynamic web experience.',
      name: 'www.GoOnline.site', // Keep as a string
      designation: 'Freelance website with AI Chatbot using RAG',
      src: '/Screenshot (2).jpeg',
      link: 'https://www.GoOnline.site', // Add a separate field for the link
    },
    {
      quote:
        'Innovated a portable IoT-based Air Quality Index Monitor using Arduino and advanced sensors, offering real-time feedback for safer, healthier family environments.',
      name: 'LinkedIn',
      designation: 'Portable Air Quality Monitoring for Healthier Homes',
      src: '/p-1.jpeg',
      link: 'https://www.linkedin.com/posts/yash-siwach_iot-airquality-smarthome-activity-7207296630738341889-wHXx?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAD2PIUkBnJudFv2-2-HEiqgp0YqkhGaTwlI',
    },
    {
      quote:
        'Designed and developed a responsive and user-friendly NGO website to amplify outreach and engagement. Integrated intuitive navigation, impactful visuals, and donation tools to drive social impact and support..',
      name: 'SmileFoundationScoiety.com',
      designation: 'Dynamic and Responsive NGO Website Design',
      src: '/p-3.png',
      link: 'https://smilefoudationsociety.vercel.app',
    },
    {
      quote:
        'Created an AR game with Unity, featuring majestic dragons and dynamic joystick controls. Players embark on thrilling quests, experiencing immersive dragon-riding adventures in a captivating virtual world.',
      name: 'LinkedIn',
      designation: 'Immersive AR Dragon Adventure Game',
      src: '/p-2.png',
      link: 'https://www.linkedin.com/posts/yash-siwach_unity-csharp-argame-activity-7193535905696018432-jD3h?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAD2PIUkBnJudFv2-2-HEiqgp0YqkhGaTwlI',
    },
    {
      quote:
        'Designed  a user-friendly interface for a copytrading platform, ensuring seamless navigation, real-time data visualization, and enhanced user engagement for effortless trading experiences.',
      name: 'Yash',
      designation: 'Intuitive UI for Copytrading Platform',
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
