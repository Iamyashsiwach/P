import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type NavItem = {
  name: string;
  link: string;
  icon?: JSX.Element;
};

type BookNavItem = {
  name: string;
  link: string;
  icon?: JSX.Element;
};

export const FloatingNav = ({
  navItems,
  bookNavItems,
  className,
}: {
  navItems: NavItem[];
  bookNavItems?: BookNavItem[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();

  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, 'change', current => {
    // Check if current is not undefined and is a number
    if (typeof current === 'number') {
      const direction = current! - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <div className="fixed top-10 inset-x-0 z-[5000] flex items-center justify-center gap-3">
        {/* Main Navigation */}
        <motion.div
          initial={{
            opacity: 1,
            y: -100,
          }}
          animate={{
            y: visible ? 0 : -100,
            opacity: visible ? 1 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className={cn(
            'flex max-w-fit border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] pr-2 pl-8 py-2 items-center justify-center space-x-4',
            className
          )}
        >
          {navItems.map((navItem: NavItem, idx: number) => (
            <Link
              key={`link=${idx}`}
              href={navItem.link}
              className={cn(
                'relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500'
              )}
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block text-sm">{navItem.name}</span>
            </Link>
          ))}
          <a
            href="https://drive.google.com/file/d/1ZKDsqFIP8bYJbzc60ojeXw0EfuP5OBux/view?usp=sharing"
            target="_blank"
          >
            <button className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full">
              <span>Resume</span>
              <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent  h-px" />
            </button>
          </a>
        </motion.div>

        {/* Book Navigation - Attached */}
        {bookNavItems && bookNavItems.length > 0 && (
          <motion.div
            initial={{
              opacity: 1,
              y: -100,
            }}
            animate={{
              y: visible ? 0 : -100,
              opacity: visible ? 1 : 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="flex max-w-fit border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] px-6 py-2 items-center justify-center space-x-3"
          >
            {bookNavItems.map((bookItem: BookNavItem, idx: number) => (
              <Link
                key={`book-link=${idx}`}
                href={bookItem.link}
                className={cn(
                  'relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500'
                )}
              >
                <span className="block sm:hidden">{bookItem.icon}</span>
                <span className="hidden sm:block text-sm">{bookItem.name}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
