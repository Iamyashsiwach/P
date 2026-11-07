import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown, { type Components } from 'react-markdown';
import { formatPostDate, getBlogPost, getBlogPosts } from '../lib/blog-data';

// Only published slugs exist; anything else is a 404 without rendering.
export const dynamicParams = false;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getBlogPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: `/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/${post.slug}`,
      siteName: 'Yash Siwach',
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
      images: [{ url: '/Hero_img.jpeg', width: 1254, height: 1254, alt: 'Yash Siwach' }],
    },
  };
}

const markdown: Components = {
  h2: ({ children }) => <h2 className="mt-12 font-display text-display-m text-ink">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 font-display text-xl text-ink">{children}</h3>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink underline decoration-border underline-offset-4 transition-colors hover:decoration-signal"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="border-l border-border pl-6 italic text-ink-mute">{children}</blockquote>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto border border-border bg-paper-2 p-4 font-mono text-sm text-ink">
      {children}
    </pre>
  ),
  hr: () => <hr className="rule my-12" />,
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="grid-shell section-rhythm">
      <article className="col-span-12 md:col-span-8 md:col-start-3">
        <Link href="/" className="mono-label transition-colors hover:text-ink">
          ← All posts
        </Link>

        <header className="mt-10">
          <time dateTime={post.date} data-numeric className="mono-label">
            {formatPostDate(post.date)}
          </time>
          <h1 className="mt-6 font-display text-display-l text-ink">{post.title}</h1>
          <hr className="rule mt-10" />
        </header>

        {/* Inline code gets a chip; fenced code is already boxed by <pre>. */}
        <div className="mt-10 space-y-6 text-body text-ink-dim [&_:not(pre)>code]:bg-paper-2 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.9em]">
          <ReactMarkdown components={markdown}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
