import React from 'react';
import { AnimatedTooltip } from '../components/ui/animated-tooltip';

const tech = [
  {
    id: 1,
    name: 'Retrieval-Augmented Generation',
    designation: 'AI framework',
    image: '/Rag.png',
  },

  {
    id: 2,
    name: 'MongoDB',
    designation: 'Database',
    image: '/DB.png',
  },
  {
    id: 3,
    name: 'TypeScript',
    designation: 'Typed Superset of JavaScript',
    image: '/ts.png',
  },
  {
    id: 4,
    name: 'JavaScript',
    designation: 'Programming Language',
    image: '/js.png',
  },
  {
    id: 5,
    name: 'React.js',
    designation: 'Frontend Library',
    image: '/react.png',
  },
  {
    id: 6,
    name: 'Next.js',
    designation: 'Full-Stack Framework',
    image: '/next2.png',
  },
  {
    id: 7,
    name: 'Git',
    designation: 'Version Control System',
    image: '/git.png',
  },
  {
    id: 8,
    name: 'Unity',
    designation: 'Game Development Engine',
    image: '/u.png',
  },
  {
    id: 9,
    name: 'Xcode',
    designation: 'iOS Development IDE',
    image: '/x.png',
  },
  {
    id: 10,
    name: 'AdobeXD',
    designation: 'UI/UX Design Tool',
    image: '/adobexd.png',
  },
  {
    id: 11,
    name: 'Three.js',
    designation: 'JavaScript 3D library',
    image: '/three.png',
  },
  {
    id: 12,
    name: 'Figma',
    designation: 'UI/UX Design Tool',
    image: '/figma.png',
  },
];

export function Skills() {
  return (
    <div className="flex flex-col overflow-hidden items-center justify-center pb-20">
      {/* Title Section */}
      <div className="text-center mb-12 w-full">
        <h1 className="text-4xl font-semibold text-white">
          <div>My Knowledge</div>
          <div className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">And Expertise</div>
        </h1>
      </div>

      {/* Animated Tooltip Section */}
      <div className="w-full px-2 sm:px-4 sm:max-w-4xl md:max-w-5xl">
        <AnimatedTooltip items={tech} />
      </div>
    </div>
  );
}
export default Skills;
