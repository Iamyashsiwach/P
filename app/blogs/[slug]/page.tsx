import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { formatPostDate, getBlogPost, getBlogPosts, slugifyHeading } from '../lib/blog-data';

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
      images: post.image
        ? [{ url: post.image, width: 1280, height: 720, alt: post.title }]
        : [{ url: '/Hero_img.jpeg', width: 1254, height: 1254, alt: 'Yash Siwach' }],
    },
  };
}

function textOf(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join('');
  return '';
}

const markdown: Components = {
  h2: ({ children }) => (
    <h2
      id={slugifyHeading(textOf(children))}
      className="mt-12 scroll-mt-8 font-display text-display-m text-ink"
    >
      {children}
    </h2>
  ),
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
  strong: ({ children }) => <strong className="font-medium text-ink">{children}</strong>,
  // Every screenshot so far is 1920x1080; width/height only reserve the aspect
  // ratio, the image still scales to the column.
  img: ({ src, alt }) =>
    typeof src === 'string' ? (
      <span className="my-2 block">
        <Image
          src={src}
          alt={alt ?? ''}
          width={1920}
          height={1080}
          sizes="(min-width: 768px) 800px, 100vw"
          className="h-auto w-full border border-border"
        />
        {alt && <span className="mt-3 block text-sm text-ink-mute">{alt}</span>}
      </span>
    ) : null,
  hr: () => <hr className="rule my-12" />,
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const headings = [...post.content.matchAll(/^## (.+)$/gm)].map(match => match[1]);

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

        {post.video && (
          <figure className="mt-10">
            <video
              controls
              playsInline
              preload="none"
              poster={post.video.poster}
              className="aspect-video w-full border border-border bg-ink"
            >
              <source src={post.video.src} type="video/mp4" />
              <track kind="captions" src={post.video.captions} srcLang="en" label="English" />
            </video>
            <figcaption className="mt-3 text-sm text-ink-mute">{post.video.caption}</figcaption>
          </figure>
        )}

        {headings.length >= 4 && (
          <nav aria-label="On this page" className="mt-10 border-y border-border py-6">
            <p className="mono-label">On this page</p>
            <ol className="mt-4 space-y-2 text-body text-ink-dim">
              {headings.map(heading => (
                <li key={heading}>
                  <a
                    href={`#${slugifyHeading(heading)}`}
                    className="transition-colors hover:text-ink"
                  >
                    {heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Inline code gets a chip; fenced code is already boxed by <pre>. */}
        <div className="mt-10 space-y-6 text-body text-ink-dim [&_:not(pre)>code]:bg-paper-2 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.9em]">
          <ReactMarkdown components={markdown}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
