import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

// Every font here is preloaded at high priority on every page, so each one is
// cut to what the site actually renders: Geist and Geist Mono only ever appear
// at weight 400 (nothing uses a heavier weight — /book's font-light/-medium
// sit on the system serif stack), so a static 400 latin file replaces the
// geist package's full 100–900 variable fonts (~68KB each). Instrument Serif
// italic went unused entirely: /book's <em> is also system serif.
const geistSans = Geist({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-geist-mono',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const description =
  'Associate Software Engineer at Accenture, Gurugram. I build software end to end — schema to shader — and care how it gets used.';

// Site-wide defaults only. Every route under this layout inherits these, so
// nothing here may name a specific page: a canonical or og:url set here made
// /book and every post declare themselves duplicates of the home page, and
// Google ended up listing /book under the home page's title. Each page sets
// its own canonical (app/page.tsx, app/book/...). twitter: carries no
// title/description so X falls back to each page's own og: tags.
export const metadata: Metadata = {
  metadataBase: new URL('https://www.yashsiwach.in'),
  title: {
    default: 'Yash Siwach — Profile',
    template: '%s — Yash Siwach',
  },
  description,
  openGraph: {
    title: 'Yash Siwach — Profile',
    description,
    siteName: 'Yash Siwach',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/Hero_img.jpeg', width: 1254, height: 1254, alt: 'Yash Siwach' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/Hero_img.jpeg'],
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF8F4',
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Yash Siwach',
  url: 'https://www.yashsiwach.in',
  image: 'https://www.yashsiwach.in/Hero_img.jpeg',
  jobTitle: 'Associate Software Engineer',
  worksFor: {
    '@type': 'Organization',
    name: 'Accenture',
  },
  sameAs: [
    'https://twitter.com/iamyashsiwach',
    'https://linkedin.com/in/yash-siwach',
    'https://github.com/iamyashsiwach',
  ],
  knowsAbout: [
    'Full-stack web development',
    'TypeScript',
    'Next.js',
    'Three.js',
    'WebGL',
    'Product management',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Gurugram',
    addressRegion: 'Haryana',
    addressCountry: 'IN',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className="bg-background text-foreground font-sans">{children}</body>
    </html>
  );
}
