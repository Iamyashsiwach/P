import React from 'react';
import type { Metadata } from 'next';
import { BookGate, Fireflies } from './components';

// Force dynamic rendering to ensure data updates immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const description = 'Chapters — personal writing by Yash Siwach.';

// Without its own metadata this page inherited the home page's title,
// description and canonical, so Google treated it as a duplicate of the
// home page and listed /book under the home page's title.
export const metadata: Metadata = {
  title: 'Chapters',
  description,
  // Private writing behind a friends-and-family wall: it must not be what a
  // recruiter finds when they search the name. noindex (not a robots.txt
  // Disallow) because Google has to crawl the page to see the directive.
  robots: { index: false },
  alternates: { canonical: '/book' },
  openGraph: {
    title: 'Chapters — Yash Siwach',
    description,
    url: '/book',
    siteName: 'Yash Siwach',
    type: 'website',
    images: [{ url: '/Hero_img.jpeg', width: 1254, height: 1254, alt: 'Yash Siwach' }],
  },
};

export default function BookPage() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center py-20 px-4">
      <Fireflies count={2} />
      <BookGate />
    </div>
  );
}
