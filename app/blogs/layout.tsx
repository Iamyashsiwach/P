import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Relative canonical/og URLs in this tree must resolve against the blog host,
// not the root layout's www.yashsiwach.in.
export const metadata: Metadata = { metadataBase: new URL('https://blogs.yashsiwach.in') };

export default function BlogsLayout({ children }: { children: ReactNode }) {
  return children;
}
