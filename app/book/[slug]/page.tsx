import React from 'react';
import { notFound } from 'next/navigation';
import { getBookPost, getBookPosts } from '../lib/book-data';
import { BookPostContent } from '../components';

interface BookPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getBookPosts();

  return posts.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BookPostPageProps) {
  const { slug } = await params;
  const post = getBookPost(slug);

  if (!post) {
    return {
      title: 'Book Post Not Found',
    };
  }

  return {
    title: `${post.title} | Yash Siwach Book`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://yashsiwach.space/book/${post.slug}`,
      siteName: 'Yash Siwach',
      images: post.image
        ? [
            {
              url: post.image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BookPostPage({ params }: BookPostPageProps) {
  const { slug } = await params;
  const post = getBookPost(slug);
  const allPosts = getBookPosts();

  if (!post) {
    notFound();
  }

  return <BookPostContent post={post} allPosts={allPosts} />;
}
