'use client';
import React from 'react';
import { FloatingNav } from './ui/floating-navbar';
import {
  IconHome,
  IconUser,
  IconFolder,
  IconMessage,
  IconBook,
  IconTags,
  IconList,
} from '@tabler/icons-react';

export function Navbar({ showBlogNav = false }: { showBlogNav?: boolean }) {
  const navItems = [
    {
      name: 'Home',
      link: '#home',
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
      icon: <IconFolder className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    // {
    //   name: 'Blog',
    //   link: '/blog',
    //   icon: <IconBook className="h-4 w-4 text-neutral-500 dark:text-white" />,
    // },
    {
      name: 'Contact',
      link: '#contact',
      icon: <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];

  const blogNavItems = showBlogNav
    ? [
        {
          name: 'Blog',
          link: '/blog',
          icon: <IconList className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        // {
        //   name: 'Tags',
        //   link: '/blog#tags',
        //   icon: <IconTags className="h-4 w-4 text-neutral-500 dark:text-white" />,
        // },
      ]
    : undefined;

  return (
    <nav role="navigation" className="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
      <FloatingNav navItems={navItems} blogNavItems={blogNavItems} />
    </nav>
  );
}

export default Navbar;
