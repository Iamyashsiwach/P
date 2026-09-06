import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Instrument_Serif } from 'next/font/google';
import { ThemeScript } from '@/app/components/theme/ThemeScript';
import { ThemeProvider } from '@/app/components/theme/ThemeProvider';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yashsiwach.in'),
  title: {
    default: 'Yash Siwach — Fullstack Engineer',
    template: '%s — Yash Siwach',
  },
  description:
    'Fullstack engineer in Gurugram. I build web products end to end — Next.js, TypeScript, Postgres, Three.js. Some of what I have shipped is here.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Yash Siwach — Fullstack Engineer',
    description:
      'Fullstack engineer in Gurugram. I build web products end to end — Next.js, TypeScript, Postgres, Three.js.',
    url: 'https://yashsiwach.in',
    siteName: 'Yash Siwach',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yash Siwach — Fullstack Engineer',
    description:
      'Fullstack engineer in Gurugram. I build web products end to end — Next.js, TypeScript, Postgres, Three.js.',
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
  url: 'https://yashsiwach.in',
  jobTitle: 'Software Engineer',
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
      // ThemeScript sets data-theme and style.colorScheme on this element
      // before hydration, outside React's own render — React must not warn
      // about attributes it never rendered itself.
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className="bg-background text-foreground font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
