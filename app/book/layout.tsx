import type { Metadata } from 'next';

// Relative canonical/og URLs in this tree must resolve against the book host,
// not the root layout's www.yashsiwach.in.
export const metadata: Metadata = { metadataBase: new URL('https://book.yashsiwach.in') };

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
