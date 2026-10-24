import type { MetadataRoute } from 'next';
import { getBookPosts } from './lib/book-data';

const ORIGIN = 'https://book.yashsiwach.in';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: ORIGIN, changeFrequency: 'weekly', priority: 0.8 },
    ...getBookPosts().map(post => ({
      url: `${ORIGIN}/${post.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
