import React from 'react';
import Link from 'next/link';
import { getBlogPosts } from './lib/blog-data';

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-3xl w-full">
        {/* Minimalist Title */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-serif font-light text-neutral-200 mb-6 tracking-tight">
            Chapters
          </h1>
          <p className="text-sm text-neutral-600 font-serif tracking-widest uppercase">
            Yash Siwach
          </p>
        </div>

        {/* Minimalist Chapter List */}
        <div className="space-y-1">
          {posts.map((post, index) => {
            const chapterMatch = post.title.match(/Chapter (\d+)/i);
            const chapterNumber = chapterMatch ? chapterMatch[1] : index + 1;

            return (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <div className="flex items-baseline gap-6 py-6 border-b border-neutral-900 hover:border-neutral-700 transition-colors duration-300">
                  <span className="text-sm text-neutral-600 font-mono w-12 flex-shrink-0">
                    {String(chapterNumber).padStart(2, '0')}
                  </span>
                  <div className="flex-grow">
                    <h3 className="text-xl font-serif text-neutral-300 group-hover:text-neutral-100 transition-colors duration-300">
                      {post.title}
                    </h3>
                  </div>
                  <span className="text-xs text-neutral-700 font-mono flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Back Link */}
        <div className="mt-20 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors font-serif tracking-wider"
          >
            ← Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
