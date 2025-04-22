'use client';
import React from 'react';
import { FloatingNav } from './ui/floating-navbar';
import { IconHome, IconUser, IconFolder, IconMessage } from '@tabler/icons-react';

export function Navbar() {
  const navItems = [
    {
      name: 'Home',
      link: '#home', // Adjust this if you have a home section
      icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: 'About',
      link: '#about',
      icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: 'Projects',
      link: '#projects',
      icon: <IconFolder className="h-4 w-4 text-neutral-500 dark:text-white" />, // Changed to IconFolder for differentiation
    },
    {
      name: 'Contact',
      link: '#contact',
      icon: <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />, // Changed to IconMail for contact
    },
  ];

  return (
    <nav role="navigation" className="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
      <FloatingNav navItems={navItems} />
    </nav>
  );
}

export default Navbar;
