import React from 'react';
import Link from 'next/link';
import { WavyBackground } from '../components/ui/wavy-background';
import { Mail, Phone, MapPin, BookOpen } from 'lucide-react';
import { GithubMark, XMark, LinkedinMark } from '../components/icons/Brand';

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
          <p className="text-2xl md:text-4xl lg:text-5xl font-bold inter-var">Love what you see?</p>
          <p className="text-base md:text-lg mt-4 font-normal inter-var">
            Wanna work with me or share feedback?
          </p>
        </div>

        {/* Contact Details */}
        <div className="flex flex-col md:flex-row items-center justify-center md:space-x-8 space-y-4 md:space-y-0">
          <div className="text-center flex items-center space-x-2">
            <Mail className="h-6 w-6 text-blue-400" />
            <a
              href="mailto:me@yashsiwach.in"
              className="text-sm md:text-base text-blue-400 hover:underline"
            >
              me@yashsiwach.in
            </a>
          </div>
          <div className="text-center flex items-center space-x-2">
            <Phone className="h-6 w-6 text-blue-400" />
            <a
              href="tel:+917206099609"
              className="text-sm md:text-base text-blue-400 hover:underline"
            >
              +91 7206099609
            </a>
          </div>
          <div className="text-center flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-blue-400" />
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
            <XMark />
          </a>
          <a
            href="https://linkedin.com/in/yash-siwach"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-white hover:text-blue-400"
          >
            <LinkedinMark />
          </a>
          <a
            href="https://github.com/iamyashsiwach"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-white hover:text-blue-400"
          >
            <GithubMark />
          </a>
        </div>

        {/* Book Link */}
        <div className="mt-4">
          <Link href="/book">
            <div className="group inline-flex items-center gap-2 px-4 py-2 border border-gray-600/30 rounded-full hover:border-blue-400/50 transition-all duration-300">
              <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors font-serif">
                📖 Reading my life story?
              </span>
            </div>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-sm text-gray-400">
          <p>Yash Siwach. All rights reserved. &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
export default Footer;
