'use client';
import React from 'react';
import Link from 'next/link';
import { IconBook2, IconHome } from '@tabler/icons-react';

export function BookNavbar() {
  const bookNavItems = [
    {
      name: 'All Chapters',
      link: '/book',
      icon: <IconBook2 className="h-4 w-4" />,
    },
    {
      name: 'Portfolio',
      link: '/',
      icon: <IconHome className="h-4 w-4" />,
    },
  ];

  return (
    <nav className="fixed top-4 right-4 z-50 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-full px-4 py-2 shadow-xl">
      <div className="flex items-center gap-2">
        {bookNavItems.map((item, index) => (
          <React.Fragment key={item.name}>
            <Link
              href={item.link}
              className="relative group px-4 py-2 rounded-full transition-all duration-300 hover:bg-neutral-800"
            >
              <div className="flex items-center gap-2">
                <div className="text-neutral-400 group-hover:text-neutral-100 transition-colors">
                  {item.icon}
                </div>
                <span className="text-sm text-neutral-400 group-hover:text-neutral-100 font-serif tracking-wide transition-colors">
                  {item.name}
                </span>
              </div>
            </Link>
            {index < bookNavItems.length - 1 && <div className="w-px h-4 bg-neutral-800" />}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}

export default BookNavbar;
