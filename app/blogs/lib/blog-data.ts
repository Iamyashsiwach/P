// No imports on purpose: blog-data.test.mjs transpiles this file on its own.

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO date (YYYY-MM-DD); sorts correctly as a plain string. */
  date: string;
  excerpt: string;
  tags: string[];
  /** Markdown. Raw HTML is not rendered. */
  content: string;
}

// To publish: add an entry. Slugs are the URL (blogs.yashsiwach.in/<slug>).
const posts: BlogPost[] = [
  {
    slug: 'hello-world',
    title: 'Hello, world',
    date: '2026-11-07',
    excerpt: 'What this is, and what to expect.',
    tags: ['meta'],
    content: `I write things down once I have finished figuring them out, mostly so I stop figuring them out again.

Expect notes on building for the web (Next.js, Three.js, the occasional shader), cloud and infrastructure on AWS, and whatever I am learning at work. Every so often something with no business being a hobby, like archery, will sneak in.

Posts show up here when they are done, not before.`,
  },
];

export function getBlogPosts(): BlogPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return posts.find(post => post.slug === slug);
}

/** '2026-11-07' -> '7 Nov 2026'. UTC so the date never shifts with the reader's timezone. */
export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
