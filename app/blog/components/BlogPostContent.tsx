'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
  image?: string;
  author: string;
  published: boolean;
}

interface BlogPostContentProps {
  post: BlogPost;
  allPosts?: BlogPost[];
}

// Scroll reveal component - only appears when reaching middle of viewport
function MidPageReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0,
        // Only trigger when element reaches middle of viewport
        rootMargin: '-45% 0px -45% 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className="transition-all duration-1000 ease-out">
      <div
        className={`transform transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function BlogPostContent({ post, allPosts = [] }: BlogPostContentProps) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
  const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const chapterMatch = post.title.match(/Chapter (\d+)/i);
  const chapterNumber = chapterMatch ? chapterMatch[1] : '';

  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-black relative">
      {/* Minimal Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 h-px bg-neutral-800 origin-left z-50"
        style={{ width: progressWidth }}
      />

      {/* Minimal Back Button */}
      <div className="fixed top-8 left-8 z-40">
        <Link
          href="/blog"
          className="text-neutral-600 hover:text-neutral-400 transition-colors text-sm font-mono"
        >
          ←
        </Link>
      </div>

      {/* Content Container */}
      <div className="max-w-2xl mx-auto px-8 py-32">
        {/* Chapter Number - Minimal */}
        {chapterNumber && (
          <div className="mb-2">
            <span className="text-xs text-neutral-700 font-mono tracking-wider">
              {String(chapterNumber).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Title - Appears immediately */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-4xl md:text-6xl font-serif font-light text-neutral-200 mb-24 leading-tight tracking-tight"
        >
          {post.title}
        </motion.h1>

        {/* Content - Each element hidden until it reaches midpage */}
        <article className="space-y-8">
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <MidPageReveal>
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      className="rounded text-sm my-8"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </MidPageReveal>
                ) : (
                  <code className="bg-neutral-900 text-neutral-400 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              },
              h1: ({ children }) => (
                <MidPageReveal>
                  <h1 className="text-3xl md:text-4xl font-serif font-light text-neutral-300 mt-20 mb-8">
                    {children}
                  </h1>
                </MidPageReveal>
              ),
              h2: ({ children }) => (
                <MidPageReveal>
                  <h2 className="text-2xl md:text-3xl font-serif font-light text-neutral-300 mt-16 mb-6">
                    {children}
                  </h2>
                </MidPageReveal>
              ),
              h3: ({ children }) => (
                <MidPageReveal>
                  <h3 className="text-xl md:text-2xl font-serif font-light text-neutral-400 mt-12 mb-4">
                    {children}
                  </h3>
                </MidPageReveal>
              ),
              p: ({ children }) => (
                <MidPageReveal>
                  <p className="text-neutral-500 leading-[2] text-lg font-serif font-light">
                    {children}
                  </p>
                </MidPageReveal>
              ),
              ul: ({ children }) => (
                <MidPageReveal>
                  <ul className="text-neutral-500 space-y-3 my-8 list-none">{children}</ul>
                </MidPageReveal>
              ),
              ol: ({ children }) => (
                <MidPageReveal>
                  <ol className="text-neutral-500 space-y-3 my-8 list-decimal ml-6">{children}</ol>
                </MidPageReveal>
              ),
              li: ({ children }) => (
                <li className="leading-[2] font-serif font-light pl-0">{children}</li>
              ),
              blockquote: ({ children }) => (
                <MidPageReveal>
                  <blockquote className="border-l border-neutral-800 pl-6 py-2 my-12 italic text-neutral-500 text-xl font-serif font-light">
                    {children}
                  </blockquote>
                </MidPageReveal>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-neutral-400 hover:text-neutral-300 underline underline-offset-4 decoration-neutral-700 hover:decoration-neutral-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              hr: () => (
                <MidPageReveal>
                  <hr className="my-16 border-neutral-900" />
                </MidPageReveal>
              ),
              em: ({ children }) => <em className="italic font-serif">{children}</em>,
              strong: ({ children }) => (
                <strong className="font-medium text-neutral-400">{children}</strong>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Navigation - Minimal */}
        <div className="mt-32 pt-16 border-t border-neutral-900">
          <div className="flex items-center justify-between text-sm">
            {previousPost ? (
              <Link
                href={`/blog/${previousPost.slug}`}
                className="text-neutral-600 hover:text-neutral-400 transition-colors font-mono"
              >
                ← Previous
              </Link>
            ) : (
              <div />
            )}

            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="text-neutral-600 hover:text-neutral-400 transition-colors font-mono"
              >
                Next →
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Chapter titles on hover */}
          <div className="flex items-start justify-between mt-6 text-xs">
            {previousPost && (
              <div className="text-neutral-800 max-w-[40%] font-serif">{previousPost.title}</div>
            )}
            {nextPost && (
              <div className="text-neutral-800 max-w-[40%] text-right font-serif">
                {nextPost.title}
              </div>
            )}
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-32" />
      </div>
    </div>
  );
}

export default BlogPostContent;
