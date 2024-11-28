// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import { motion, useScroll, useTransform } from "framer-motion";
// import Image from "next/image";

// // Utility function for class names
// function cn(...classes: string[]) {
//   return classes.filter(Boolean).join(" ");
// }

// // Background Beams Component
// const BackgroundBeams = React.memo(({ className }: { className?: string }) => {
//   const paths = [
//     "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
//     "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
//     "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
//     "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
//     "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
//     "M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835",
//     "M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827",
//     "M-331 -245C-331 -245 -263 160 201 287C665 414 733 819 733 819",
//     "M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811",
//     "M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803",
//     "M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795",
//     "M-303 -277C-303 -277 -235 128 229 255C693 382 761 787 761 787",
//     "M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779",
//     "M-289 -293C-289 -293 -221 112 243 239C707 366 775 771 775 771",
//     "M-282 -301C-282 -301 -214 104 250 231C714 358 782 763 782 763",
//     "M-275 -309C-275 -309 -207 96 257 223C721 350 789 755 789 755",
//     "M-268 -317C-268 -317 -200 88 264 215C728 342 796 747 796 747",
//     "M-261 -325C-261 -325 -193 80 271 207C735 334 803 739 803 739",
//     "M-254 -333C-254 -333 -186 72 278 199C742 326 810 731 810 731",
//     "M-247 -341C-247 -341 -179 64 285 191C749 318 817 723 817 723",
//     "M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715",
//     "M-233 -357C-233 -357 -165 48 299 175C763 302 831 707 831 707",
//     "M-226 -365C-226 -365 -158 40 306 167C770 294 838 699 838 699",
//     "M-219 -373C-219 -373 -151 32 313 159C777 286 845 691 845 691",
//     "M-212 -381C-212 -381 -144 24 320 151C784 278 852 683 852 683",
//     "M-205 -389C-205 -389 -137 16 327 143C791 270 859 675 859 675",
//     "M-198 -397C-198 -397 -130 8 334 135C798 262 866 667 866 667",
//     "M-191 -405C-191 -405 -123 0 341 127C805 254 873 659 873 659",
//     "M-184 -413C-184 -413 -116 -8 348 119C812 246 880 651 880 651",
//     "M-177 -421C-177 -421 -109 -16 355 111C819 238 887 643 887 643",
//     "M-170 -429C-170 -429 -102 -24 362 103C826 230 894 635 894 635",
//     "M-163 -437C-163 -437 -95 -32 369 95C833 222 901 627 901 627",
//     "M-156 -445C-156 -445 -88 -40 376 87C840 214 908 619 908 619",
//     "M-149 -453C-149 -453 -81 -48 383 79C847 206 915 611 915 611",
//     "M-142 -461C-142 -461 -74 -56 390 71C854 198 922 603 922 603",
//     "M-135 -469C-135 -469 -67 -64 397 63C861 190 929 595 929 595",
//     "M-128 -477C-128 -477 -60 -72 404 55C868 182 936 587 936 587",
//     "M-121 -485C-121 -485 -53 -80 411 47C875 174 943 579 943 579",
//     "M-114 -493C-114 -493 -46 -88 418 39C882 166 950 571 950 571",
//     "M-107 -501C-107 -501 -39 -96 425 31C889 158 957 563 957 563",
//     "M-100 -509C-100 -509 -32 -104 432 23C896 150 964 555 964 555",
//     "M-93 -517C-93 -517 -25 -112 439 15C903 142 971 547 971 547",
//     "M-86 -525C-86 -525 -18 -120 446 7C910 134 978 539 978 539",
//     "M-79 -533C-79 -533 -11 -128 453 -1C917 126 985 531 985 531",
//     "M-72 -541C-72 -541 -4 -136 460 -9C924 118 992 523 992 523",
//     "M-65 -549C-65 -549 3 -144 467 -17C931 110 999 515 999 515",
//     "M-58 -557C-58 -557 10 -152 474 -25C938 102 1006 507 1006 507",
//     "M-51 -565C-51 -565 17 -160 481 -33C945 94 1013 499 1013 499",
//     "M-44 -573C-44 -573 24 -168 488 -41C952 86 1020 491 1020 491",
//     "M-37 -581C-37 -581 31 -176 495 -49C959 78 1027 483 1027 483",
//     "M-30 -589C-30 -589 38 -184 502 -57C966 70 1034 475 1034 475",
//     "M103 -741C103 -741 171 -336 635 -209C1099 -82 1167 323 1167 323",
//     "M110 -749C110 -749 178 -344 642 -217C1106 -90 1174 315 1174 315",
//     "M117 -757C117 -757 185 -352 649 -225C1113 -98 1181 307 1181 307",
//     "M124 -765C124 -765 192 -360 656 -233C1120 -106 1188 299 1188 299",
//     "M131 -773C131 -773 199 -368 663 -241C1127 -114 1195 291 1195 291",
//     "M138 -781C138 -781 206 -376 670 -249C1134 -122 1202 283 1202 283",
//     "M145 -789C145 -789 213 -384 677 -257C1141 -130 1209 275 1209 275",
//     "M152 -797C152 -797 220 -392 684 -265C1148 -138 1216 267 1216 267",
//     "M159 -805C159 -805 227 -400 691 -273C1155 -146 1223 259 1223 259",
//     "M166 -813C166 -813 234 -408 698 -281C1162 -154 1230 251 1230 251",
//     "M173 -821C173 -821 241 -416 705 -289C1169 -162 1237 243 1237 243",
//     "M180 -829C180 -829 248 -424 712 -297C1176 -170 1244 235 1244 235",
//     "M187 -837C187 -837 255 -432 719 -305C1183 -178 1251 227 1251 227",
//     "M194 -845C194 -845 262 -440 726 -313C1190 -186 1258 219 1258 219",
//     "M201 -853C201 -853 269 -448 733 -321C1197 -194 1265 211 1265 211",
//     "M208 -861C208 -861 276 -456 740 -329C1204 -202 1272 203 1272 203",
//     "M215 -869C215 -869 283 -464 747 -337C1211 -210 1279 195 1279 195",
//     "M222 -877C222 -877 290 -472 754 -345C1218 -218 1286 187 1286 187",
//     "M229 -885C229 -885 297 -480 761 -353C1225 -226 1293 179 1293 179",
//     "M236 -893C236 -893 304 -488 768 -361C1232 -234 1300 171 1300 171",
//     "M243 -901C243 -901 311 -496 775 -369C1239 -242 1307 163 1307 163",
//     "M250 -909C250 -909 318 -504 782 -377C1246 -250 1314 155 1314 155",
//     "M257 -917C257 -917 325 -512 789 -385C1253 -258 1321 147 1321 147",
//     "M264 -925C264 -925 332 -520 796 -393C1260 -266 1328 139 1328 139",
//     "M271 -933C271 -933 339 -528 803 -401C1267 -274 1335 131 1335 131",
//     // Add other paths here...
//   ];

//   return (
//     <div
//       className={cn(
//         "absolute inset-0 h-full w-full flex items-center justify-center",
        
//       )}
//     >
//       <svg
//         className="z-0 h-full w-full pointer-events-none absolute"
//         width="100%"
//         height="100%"
//         viewBox="0 0 696 316"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         {paths.map((path, index) => (
//           <motion.path
//             key={`path-${index}`}
//             d={path}
//             stroke={`url(#linearGradient-${index})`}
//             strokeOpacity="0.7"
//             strokeWidth="0.3"
//           ></motion.path>
//         ))}
//         <defs>
//           {paths.map((_, index) => (
//             <motion.linearGradient
//               id={`linearGradient-${index}`}
//               key={`gradient-${index}`}
//               initial={{
//                 x1: "0%",
//                 x2: "0%",
//                 y1: "0%",
//                 y2: "0%",
//               }}
//               animate={{
//                 x1: ["0%", "100%"],
//                 x2: ["0%", "95%"],
//                 y1: ["0%", "100%"],
//                 y2: ["0%", `${93 + Math.random() * 8}%`],
//               }}
//               transition={{
//                 duration: Math.random() * 10 + 10,
//                 ease: "easeInOut",
//                 repeat: Infinity,
//                 delay: Math.random() * 10,
//               }}
//             >
//               <stop stopColor="#18CCFC" stopOpacity="0" />
//               <stop stopColor="#18CCFC" />
//               <stop offset="32.5%" stopColor="#6344F5" />
//               <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
//             </motion.linearGradient>
//           ))}
//         </defs>
//       </svg>
//     </div>
//   );
// });

// BackgroundBeams.displayName = "BackgroundBeams";

// // Timeline Component
// export function TimelineWithBackground() {
  
//   const data = [
//     {
//       title: "2024",
//       content: (
//         <div>
//           <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-6">
//             Major Achievements and Milestones
//           </h1>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    
//             {/* First Achievement - TonMate */}
//             <div className="flex flex-col items-center">
//               <Image
//                 src="/2024-1.jpeg"
//                 alt="TonMate"
//                 width={500}
//                 height={500}
//                 className="rounded-lg object-cover w-full h-60 shadow-md"
//               />
//               <br />
//               <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
//                 <b>2nd Place at the TON Hackathon:</b> <br /> <i>Oct 2024</i><br />
//                 Our project <b>TonMate</b> a copy treading platform won <b>2nd place</b> at the <b>TON Hackathon Bootcamp</b> and a <b>$1500 prize</b>. With my teammates, <b>Jayanth</b> and <b>Kartik</b>, for their dedication. 🚀
//               </p>
//             </div>
    
//             {/* Second Achievement - Starknet India Roadshow */}
//             <div className="flex flex-col items-center">
//               <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
//                 <b>Starknet India Roadshow: </b> <br /><i>Apr 2024</i><br />
//                 As <b>Chapter Lead</b>, I organized the <b>Starknet India Roadshow</b> with workshops, gaming sessions, and <b>32,000 STRK</b> in prizes. Great success in bringing together Web3 enthusiasts! 🌟
//               </p>
//               <br />
//               <Image
//                 src="/2024-2.jpeg"
//                 alt="Aleo Event"
//                 width={500}
//                 height={500}
//                 className="rounded-lg object-cover w-full h-60 shadow-md"
//               />
//             </div>
    
//             {/* Third Achievement - Aleo Chandigarh zkMeetup */}
//             <div className="flex flex-col items-center">
//               <Image
//                 src="/2024-3.jpeg"
//                 alt="zkMeetup"
//                 width={500}
//                 height={500}
//                 className="rounded-lg object-cover w-full h-60 shadow-md"
//               />
//               <br />
//               <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
//                 <b>Aleo Chandigarh zkMeetup:</b> <br /> <i>Jun 2024</i><br />
//                 Led the <b>Aleo Chandigarh zkMeetup</b> as <b>Chapter Lead</b>, discussing <b>Zero-Knowledge technology</b> with privacy and security experts. Stay tuned for more ZK events! 🔐
//               </p>
//             </div>
    
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "2023",
//       content: (
//         <div>
//         <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-6">
//           Major Achievements and Milestones
//         </h1>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      
//           {/* First Achievement - Hackathon at Rajasthan University */}
//           <div className="flex flex-col items-center">
//             <Image
//               src="/2023-1.jpeg"
//               alt="Rajasthan University Hackathon"
//               width={500}
//               height={500}
//               className="rounded-lg object-cover w-full h-60 shadow-md"
//             />
//             <br />
//             <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
//               <b>Hackathon at Rajasthan University, Jaipur:</b> <br /> <i>Mar 2023</i><br />
//               I had the opportunity to participate in a hackathon hosted by the <b>Government of Rajasthan</b> at <b>Rajasthan University, Jaipur</b>. My team developed a <b>P2P cash lending, sharing, and investing app</b>, which was a great learning experience.
//             </p>
//           </div>
      
//           {/* Second Achievement - TECHHACKS 3.0 Hackathon */}
//           <div className="flex flex-col items-center">
//             <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
//               <b>TECHHACKS 3.0 Hackathon at Chitkara University:</b> <br /> <i>Nov 2023</i><br />
//               I participated in the <b>TECHHACKS 3.0 Hackathon</b> at <b>Chitkara University</b>, where I had the chance to dive deep into <b>blockchain technology</b> and <b>NFTs</b>. It was my first 24-hour hackathon and an excellent learning experience.
//             </p>
//             <br />
//             <Image
//               src="/2023-2.jpeg"
//               alt="TECHHACKS 3.0 Hackathon"
//               width={500}
//               height={500}
//               className="rounded-lg object-cover w-full h-60 shadow-md"
//             />
//           </div>
      
//           {/* Third Achievement - Gas Cylinder Regulation Project */}
//           <div className="flex flex-col items-center">
//             <Image
//               src="/2023-3.png"
//               alt="Gas Cylinder Regulation Project"
//               width={500}
//               height={500}
//               className="rounded-lg object-cover w-full h-60 shadow-md"
//             />
//             <br />
//             <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
//               <b>Gas Cylinder Regulation Project:</b> <br /> <i>Sep 2023</i><br />
//               I developed a project focused on regulating <b>home gas cylinders</b>. The project includes safety features like <b>wheels for easy movement</b> and an <b>emergency shut-off valve</b> to prevent gas leaks. This project is designed to make it easier and safer for elderly people to handle gas cylinders at home. 🚨
//             </p>
//           </div>
      
//         </div>
//       </div>
//       ),
//     },
//     // {
//     //   title: "Changelog",
//     //   content: (
//     //     <div>
//     //       <p className=" dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
//     //         Deployed 5 new components on Aceternity today
//     //       </p>
//     //       <div className="mb-8">
//     //         <div className="flex gap-2 items-center  dark:text-neutral-300 text-xs md:text-sm">
//     //           ✅ Card grid component
//     //         </div>
//     //         <div className="flex gap-2 items-center  dark:text-neutral-300 text-xs md:text-sm">
//     //           ✅ Startup template Aceternity
//     //         </div>
//     //         <div className="flex gap-2 items-center  dark:text-neutral-300 text-xs md:text-sm">
//     //           ✅ Random file upload lol
//     //         </div>
//     //         <div className="flex gap-2 items-center  dark:text-neutral-300 text-xs md:text-sm">
//     //           ✅ Himesh Reshammiya Music CD
//     //         </div>
//     //         <div className="flex gap-2 items-center  dark:text-neutral-300 text-xs md:text-sm">
//     //           ✅ Salman Bhai Fan Club registrations open
//     //         </div>
//     //       </div>
//     //       <div className="grid grid-cols-2 gap-4">
//     //         <Image
//     //           src="https://assets.aceternity.com/pro/hero-sections.png"
//     //           alt="hero template"
//     //           width={500}
//     //           height={500}
//     //           className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
//     //         />
//     //         <Image
//     //           src="https://assets.aceternity.com/features-section.png"
//     //           alt="feature template"
//     //           width={500}
//     //           height={500}
//     //           className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
//     //         />
//     //         <Image
//     //           src="https://assets.aceternity.com/pro/bento-grids.png"
//     //           alt="bento template"
//     //           width={500}
//     //           height={500}
//     //           className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
//     //         />
//     //         <Image
//     //           src="https://assets.aceternity.com/cards.png"
//     //           alt="cards template"
//     //           width={500}
//     //           height={500}
//     //           className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
//     //         />
//     //       </div>
//     //     </div>
//     //   ),
//     // },
//   ];
//   // interface TimelineEntry {
//   //   title: string;
//   //   content: React.ReactNode;
//   // }
//   //  const Timeline = ({ data }: { data: TimelineEntry[] }) => {
//   const ref = useRef<HTMLDivElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [height, setHeight] = useState(0);

//   useEffect(() => {
//     if (ref.current) {
//       const rect = ref.current.getBoundingClientRect();
//       setHeight(rect.height);
//     }
//   }, [ref]);

//   const { scrollYProgress } = useScroll({
//     target: containerRef,
//     offset: ["start 10%", "end 50%"],
//   });

//   const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
//   const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
//   const [containerHeight, setContainerHeight] = useState(0);

//   useEffect(() => {
//     if (containerRef.current) {
//       setContainerHeight(containerRef.current.scrollHeight);
//     }
//   }, [containerRef]);

//   return (
    
//     <div className="relative min-h-screen">
//       {/* Background Component */}
//       <BackgroundBeams className="z-0" />

//       {/* Content */}
//       <div
//         ref={containerRef}
//         className="relative z-10 max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10"
//       >
//         <h2 className="text-lg md:text-4xl mb-4 text-white">
//           Changelog from my journey
//         </h2>
//         <p className="text-neutral-300 text-sm md:text-base">
//           Here's a timeline of my journey over the years.
//         </p>

//         <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
//           {data.map((item, index) => (
//             <div
//               key={index}
//               className="flex justify-start pt-10 md:pt-40 md:gap-10"
//             >
//               <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
//                 <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
//                   <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
//                 </div>
//                 <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500 ">
//                   {item.title}
//                 </h3>
//               </div>

//               <div className="relative pl-20 pr-4 md:pl-4 w-full">
//                 <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
//                   {item.title}
//                 </h3>
//                 {item.content}{" "}
//               </div>
//             </div>
//           ))}
//           <div
//             style={{
//               height: height + "px",
//             }}
//             className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
//           >
//             <motion.div
//               style={{
//                 height: heightTransform,
//                 opacity: opacityTransform,
//               }}
//               className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
  
//   );
// };
// export default TimelineWithBackground;

"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

// Utility function for class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// Background Beams Component
const BackgroundBeams = React.memo(() => {
  const paths = [
"M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
    "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
    "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
    "M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835",
    "M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827",
    "M-331 -245C-331 -245 -263 160 201 287C665 414 733 819 733 819",
    "M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811",
    "M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803",
    "M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795",
    "M-303 -277C-303 -277 -235 128 229 255C693 382 761 787 761 787",
    "M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779",
    "M-289 -293C-289 -293 -221 112 243 239C707 366 775 771 775 771",
    "M-282 -301C-282 -301 -214 104 250 231C714 358 782 763 782 763",
    "M-275 -309C-275 -309 -207 96 257 223C721 350 789 755 789 755",
    "M-268 -317C-268 -317 -200 88 264 215C728 342 796 747 796 747",
    "M-261 -325C-261 -325 -193 80 271 207C735 334 803 739 803 739",
    "M-254 -333C-254 -333 -186 72 278 199C742 326 810 731 810 731",
    "M-247 -341C-247 -341 -179 64 285 191C749 318 817 723 817 723",
    "M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715",
    "M-233 -357C-233 -357 -165 48 299 175C763 302 831 707 831 707",
    "M-226 -365C-226 -365 -158 40 306 167C770 294 838 699 838 699",
    "M-219 -373C-219 -373 -151 32 313 159C777 286 845 691 845 691",
    "M-212 -381C-212 -381 -144 24 320 151C784 278 852 683 852 683",
    "M-205 -389C-205 -389 -137 16 327 143C791 270 859 675 859 675",
    "M-198 -397C-198 -397 -130 8 334 135C798 262 866 667 866 667",
    "M-191 -405C-191 -405 -123 0 341 127C805 254 873 659 873 659",
    "M-184 -413C-184 -413 -116 -8 348 119C812 246 880 651 880 651",
    "M-177 -421C-177 -421 -109 -16 355 111C819 238 887 643 887 643",
    "M-170 -429C-170 -429 -102 -24 362 103C826 230 894 635 894 635",
    "M-163 -437C-163 -437 -95 -32 369 95C833 222 901 627 901 627",
    "M-156 -445C-156 -445 -88 -40 376 87C840 214 908 619 908 619",
    "M-149 -453C-149 -453 -81 -48 383 79C847 206 915 611 915 611",
    "M-142 -461C-142 -461 -74 -56 390 71C854 198 922 603 922 603",
    "M-135 -469C-135 -469 -67 -64 397 63C861 190 929 595 929 595",
    "M-128 -477C-128 -477 -60 -72 404 55C868 182 936 587 936 587",
    "M-121 -485C-121 -485 -53 -80 411 47C875 174 943 579 943 579",
    "M-114 -493C-114 -493 -46 -88 418 39C882 166 950 571 950 571",
    "M-107 -501C-107 -501 -39 -96 425 31C889 158 957 563 957 563",
    "M-100 -509C-100 -509 -32 -104 432 23C896 150 964 555 964 555",
    "M-93 -517C-93 -517 -25 -112 439 15C903 142 971 547 971 547",
    "M-86 -525C-86 -525 -18 -120 446 7C910 134 978 539 978 539",
    "M-79 -533C-79 -533 -11 -128 453 -1C917 126 985 531 985 531",
    "M-72 -541C-72 -541 -4 -136 460 -9C924 118 992 523 992 523",
    "M-65 -549C-65 -549 3 -144 467 -17C931 110 999 515 999 515",
    "M-58 -557C-58 -557 10 -152 474 -25C938 102 1006 507 1006 507",
    "M-51 -565C-51 -565 17 -160 481 -33C945 94 1013 499 1013 499",
    "M-44 -573C-44 -573 24 -168 488 -41C952 86 1020 491 1020 491",
    "M-37 -581C-37 -581 31 -176 495 -49C959 78 1027 483 1027 483",
    "M-30 -589C-30 -589 38 -184 502 -57C966 70 1034 475 1034 475",

  ];

  // return 
  // (
//     <div className="svg-container">
//       <svg
//         className="z-0 h-full w-full pointer-events-none absolute"
//         width="100%"
//         height="100%"
//         viewBox="0 0 696 316"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         {paths.map((path, index) => (
//           <motion.path
//             key={`path-${index}`}
//             d={path}
//             stroke={`url(#linearGradient-${index})`}
//             strokeOpacity="0.7"
//             strokeWidth="0.3"
//           />
//         ))}
//         <defs>
//           {paths.map((_, index) => (
//             <motion.linearGradient
//               id={`linearGradient-${index}`}
//               key={`gradient-${index}`}
//               initial={{
//                 x1: "0%",
//                 x2: "0%",
//                 y1: "0%",
//                 y2: "0%",
//               }}
//               animate={{
//                 x1: ["0%", "100%"],
//                 x2: ["0%", "95%"],
//                 y1: ["0%", "100%"],
//                 y2: ["0%", `${93 + Math.random() * 8}%`],
//               }}
//               transition={{
//                 duration: Math.random() * 10 + 10,
//                 ease: "easeInOut",
//                 repeat: Infinity,
//                 delay: Math.random() * 10,
//               }}
//             >
//               <stop stopColor="#18CCFC" stopOpacity="0" />
//               <stop stopColor="#18CCFC" />
//               <stop offset="32.5%" stopColor="#6344F5" />
//               <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
//             </motion.linearGradient>
//           ))}
//         </defs>
//       </svg>
//     </div>
//   );
// });

return (
      <div
        className={cn(
          "absolute inset-0 h-full w-full flex items-center justify-center",
          
        )}
      >
        <svg
          className="z-0 h-full w-full pointer-events-none absolute"
          width="100%"
          height="100%"
          viewBox="0 0 696 316"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {paths.map((path, index) => (
            <motion.path
              key={`path-${index}`}
              d={path}
              stroke={`url(#linearGradient-${index})`}
              strokeOpacity="0.7"
              strokeWidth="0.3"
            ></motion.path>
          ))}
          <defs>
            {paths.map((_, index) => (
              <motion.linearGradient
                id={`linearGradient-${index}`}
                key={`gradient-${index}`}
                initial={{
                  x1: "0%",
                  x2: "0%",
                  y1: "0%",
                  y2: "0%",
                }}
                animate={{
                  x1: ["0%", "100%"],
                  x2: ["0%", "95%"],
                  y1: ["0%", "100%"],
                  y2: ["0%", `${93 + Math.random() * 8}%`],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: Math.random() * 10,
                }}
              >
                <stop stopColor="#18CCFC" stopOpacity="0" />
                <stop stopColor="#18CCFC" />
                <stop offset="32.5%" stopColor="#6344F5" />
                <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
              </motion.linearGradient>
            ))}
          </defs>
        </svg>
      </div>
    );
  });
  
BackgroundBeams.displayName = "BackgroundBeams";

// Timeline Component
export function TimelineWithBackground() {
  const data = [
    {
      title: "2024",
      content: (
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-6">
            Major Achievements and Milestones
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* First Achievement - TonMate */}
            <div className="flex flex-col items-center">
              <Image
                src="/2024-1.jpeg"
                alt="TonMate"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-60 shadow-md"
              />
              <br />
              <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
                <b>2nd Place at the TON Hackathon:</b> <br /> <i>Oct 2024</i><br />
                Our project <b>TonMate</b> a copy treading platform won <b>2nd place</b> at the <b>TON Hackathon Bootcamp</b> and a <b>$1500 prize</b>. With my teammates, <b>Jayanth</b> and <b>Kartik</b>, for their dedication. 🚀
              </p>
            </div>

            {/* Second Achievement - Starknet India Roadshow */}
            <div className="flex flex-col items-center">
              <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
                <b>Starknet India Roadshow: </b> <br /><i>Apr 2024</i><br />
                As <b>Chapter Lead</b>, I organized the <b>Starknet India Roadshow</b> with workshops, gaming sessions, and <b>32,000 STRK</b> in prizes. Great success in bringing together Web3 enthusiasts! 🌟
              </p>
              <br />
              <Image
                src="/2024-2.jpeg"
                alt="Aleo Event"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-60 shadow-md"
              />
            </div>

            {/* Third Achievement - Aleo Chandigarh zkMeetup */}
            <div className="flex flex-col items-center">
              <Image
                src="/2024-3.jpeg"
                alt="zkMeetup"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-60 shadow-md"
              />
              <br />
              <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
                <b>Aleo Chandigarh zkMeetup:</b> <br /> <i>Jun 2024</i><br />
                Led the <b>Aleo Chandigarh zkMeetup</b> as <b>Chapter Lead</b>, discussing <b>Zero-Knowledge technology</b> with privacy and security experts. Stay tuned for more ZK events! 🔐
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2023",
      content: (
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-6">
            Major Achievements and Milestones
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* First Achievement - Hackathon at Rajasthan University */}
            <div className="flex flex-col items-center">
              <Image
                src="/2023-1.jpeg"
                alt="Rajasthan University Hackathon"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-60 shadow-md"
              />
              <br />
              <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
                <b>Hackathon at Rajasthan University, Jaipur:</b> <br /> <i>Mar 2023</i><br />
                I had the opportunity to participate in a hackathon hosted by the <b>Government of Rajasthan</b> at <b>Rajasthan University, Jaipur</b>. My team developed a <b>P2P cash lending, sharing, and investing app</b>, which was a great learning experience.
              </p>
            </div>

            {/* Second Achievement - TECHHACKS 3.0 Hackathon */}
            <div className="flex flex-col items-center">
              <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
                <b>TECHHACKS 3.0 Hackathon at Chitkara University:</b> <br /> <i>Nov 2023</i><br />
                I participated in the <b>TECHHACKS 3.0 Hackathon</b> at <b>Chitkara University</b>, where I had the chance to dive deep into <b>blockchain technology</b> and <b>NFTs</b>. It was my first 24-hour hackathon and an excellent learning experience.
              </p>
              <br />
              <Image
                src="/2023-2.jpeg"
                alt="TECHHACKS 3.0 Hackathon"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-60 shadow-md"
              />
            </div>

            {/* Third Achievement - Gas Cylinder Regulation Project */}
            <div className="flex flex-col items-center">
              <Image
                src="/2023-3.png"
                alt="Gas Cylinder Regulation Project"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-60 shadow-md"
              />
              <br />
              <p className="dark:text-neutral-200 text-xs sm:text-sm font-normal mb-4 text-center">
                <b>Gas Cylinder Regulation Project:</b> <br /> <i>Sep 2023</i><br />
                I developed a project focused on regulating <b>home gas cylinders</b>. The project includes safety features like <b>wheels for easy movement</b> and an <b>emergency shut-off valve</b> to prevent gas leaks. This project is designed to make it easier and safer for elderly people to handle gas cylinders at home. 🚨
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="relative min-h-screen"> 
    {/* Background Component */} 
    <BackgroundBeams /> 

    {/* Content */} 
    <div 
      ref={containerRef} 
      className="relative z-10 max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10" 
    > 
      <h2 className="text-lg md:text-4xl mb-4 text-white"> 
        Changelog from my journey 
      </h2> 
      <p className="text-neutral-300 text-sm md:text-base"> 
        Here&apos;s a timeline of my journey over the years. 
      </p> 

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20"> 
        {data.map((item, index) => ( 
          <div 
            key={index} 
            className="flex justify-start pt-10 md:pt-40 md:gap-10" 
          > 
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full"> 
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center"> 
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" /> 
              </div> 
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500 "> 
                {item.title} 
              </h3> 
            </div> 

            <div className="relative pl-20 pr-4 md:pl-4 w-full"> 
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500"> 
                {item.title} 
              </h3> 
              {item.content}{" "} 
            </div> 
          </div> 
        ))} 
        <div 
          style={{ 
            height: height + "px", 
          }} 
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] " 
        > 
          <motion.div 
            style={{ 
              height: heightTransform, 
              opacity: opacityTransform, 
            }} 
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full" 
          /> 
        </div> 
      </div> 
    </div> 
  </div> 
); 
} 

export default TimelineWithBackground; 