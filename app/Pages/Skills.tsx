
import React from "react";
import { AnimatedTooltip } from "../components/ui/animated-tooltip";


const tech = [
        {
          id: 1,
          name: "Figma",
          designation: "UI/UX Design Tool",
          image: "/figma.png",
        },
        {
          id: 2,
          name: "AdobeXD",
          designation: "UI/UX Design Tool",
          image: "/adobexd.png",
        },
        {
          id: 3,
          name: "Xcode",
          designation: "iOS Development IDE",
          image: "/x.png",
        },
        {
          id: 4,
          name: "JavaScript",
          designation: "Programming Language",
          image: "/js.png",
        },
        {
          id: 5,
          name: "React.js",
          designation: "Frontend Library",
          image: "/react.png",
        },
        {
          id: 6,
          name: "Next.js",
          designation: "Full-Stack Framework",
          image: "/next2.png",
        },
        {
          id: 7,
          name: "Git",
          designation: "Version Control System",
          image: "/git.png",
        },
        {
          id: 8,
          name: "Unity",
          designation: "Game Development Engine",
          image: "/Unity.jpg",
        },
        {
          id: 9,
          name: "TypeScript",
          designation: "Typed Superset of JavaScript",
          image: "/ts.png",
        },
      ];

export function Skills() {
  return (
   
    <div className="flex flex-col overflow-hidden items-center justify-center pb-20">
      {/* Title Section */}
      <div className="text-center mb-10 w-full">
        <h1 className="text-4xl font-semibold text-white">
          <div>My Knowledge</div>
          <div className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
            And Expertise
          </div>
        </h1>
      </div>

      {/* Animated Tooltip Section */}
      <div className="flex justify-center">
        <AnimatedTooltip items={tech} />
      </div>
    </div>
   
  );
}
export default Skills;