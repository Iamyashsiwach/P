import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPostDate, getBlogPosts } from './lib/blog-data';

const description =
  'Notes on building for the web, cloud and the things in between, by Yash Siwach.';

export const metadata: Metadata = {
  title: 'Blogs',
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Blogs — Yash Siwach',
    description,
    url: '/',
    siteName: 'Yash Siwach',
    type: 'website',
    images: [{ url: '/Hero_img.jpeg', width: 1254, height: 1254, alt: 'Yash Siwach' }],
  },
};

export default function BlogsPage() {
  const posts = getBlogPosts();

  return (
    <main className="grid-shell section-rhythm">
      <header className="col-span-12 md:col-span-10 md:col-start-2">
        <p className="mono-label">Yash Siwach</p>
        <h1 className="mt-6 max-w-4xl font-display text-display-l text-ink">Blogs</h1>
        <hr className="rule mt-10" />
      </header>

      {posts.length === 0 ? (
        <p className="col-span-12 mt-10 text-body text-ink-dim md:col-span-10 md:col-start-2">
          Nothing here yet.
        </p>
      ) : (
        <ul className="col-span-12 md:col-span-10 md:col-start-2">
          {posts.map(post => (
            <li key={post.slug} className="border-b border-border">
              <Link
                href={`/${post.slug}`}
                className="group grid gap-2 py-6 md:grid-cols-[8rem_1fr] md:gap-6"
              >
                <time dateTime={post.date} data-numeric className="mono-label pt-2">
                  {formatPostDate(post.date)}
                </time>
                <div>
                  <h2 className="font-display text-display-m text-ink transition-colors group-hover:text-signal">
                    {post.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-body text-ink-dim">{post.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
