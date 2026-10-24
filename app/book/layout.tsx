import type { Metadata } from 'next';
import { BOOK_URL } from '@/app/lib/urls';

// Relative canonical/og URLs in this tree must resolve against the book host,
// not the root layout's www.yashsiwach.in.
export const metadata: Metadata = { metadataBase: new URL(BOOK_URL) };

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
