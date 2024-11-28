
import React from "react";
import { WavyBackground } from "../components/ui/wavy-background";
import { HiOutlineMail, HiOutlinePhone, HiOutlineMap } from "react-icons/hi";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";


export function Footer() {
  return (

    <div id="contact" className="relative w-full  bg-black">
      {/* Wavy Background */}
      <div className="absolute inset-0">
        <WavyBackground className="w-full h-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-12 space-y-8 text-white">
        {/* Header */}
        <div className="text-center">
          <p className="text-2xl md:text-4xl lg:text-5xl font-bold inter-var">
            Love what you see?
          </p>
          <p className="text-base md:text-lg mt-4 font-normal inter-var">
            Wanna work with me or share feedback?
          </p>
        </div>

        {/* Contact Details */}
        <div className="flex flex-col md:flex-row items-center justify-center md:space-x-8 space-y-4 md:space-y-0">
          <div className="text-center flex items-center space-x-2">
            <HiOutlineMail className="h-6 w-6 text-blue-400" />
            <a
              href="mailto:example@example.com"
              className="text-sm md:text-base text-blue-400 hover:underline"
            >
              Iamyashsiwach@gmail.com
            </a>
          </div>
          <div className="text-center flex items-center space-x-2">
            <HiOutlinePhone className="h-6 w-6 text-blue-400" />
            <a
              href="tel:+1234567890"
              className="text-sm md:text-base text-blue-400 hover:underline"
            >
              +91 7206099609
            </a>
          </div>
          <div className="text-center flex items-center space-x-2">
            <HiOutlineMap className="h-6 w-6 text-blue-400" />
            <p className="text-sm md:text-base">Gurugram, Haryana, India</p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="flex space-x-6">
          <a
            href="https://twitter.com/iamyashsiwach"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-white hover:text-blue-400"
          >
            <FaTwitter />
          </a>
          <a
            href="https://linkedin.com/in/yash-siwach"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-white hover:text-blue-400"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://github.com/iamyashsiwach"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-white hover:text-blue-400"
          >
            <FaGithub />
          </a>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Yash Siwach. All rights reserved.</p>
        </div>
      </div>
    </div>
 
  );
}
export default Footer;