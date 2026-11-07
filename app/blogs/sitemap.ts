import type { MetadataRoute } from 'next';
import { getBlogPosts } from './lib/blog-data';

const ORIGIN = 'https://blogs.yashsiwach.in';

// Served at blogs.yashsiwach.in/sitemap.xml (see rewrites in next.config.js);
// the www sitemap can't list another host's URLs.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();

  return [
    { url: ORIGIN, lastModified: posts[0]?.date, changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map(post => ({
      url: `${ORIGIN}/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
