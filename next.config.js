const BOOK_HOST = 'book.yashsiwach.in';
const onBookHost = [{ type: 'host', value: BOOK_HOST }];
const BLOGS_HOST = 'blogs.yashsiwach.in';
const onBlogsHost = [{ type: 'host', value: BLOGS_HOST }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // book.yashsiwach.in and blogs.yashsiwach.in serve the /book and /blogs trees
  // at their roots. The app/book and app/blogs routes stay the implementation;
  // the hosts never expose the path prefix.
  async rewrites() {
    return {
      // Before filesystem lookup: '/', robots.txt and sitemap.xml exist on the main site.
      beforeFiles: [
        { source: '/', has: onBookHost, destination: '/book' },
        { source: '/', has: onBlogsHost, destination: '/blogs' },
        { source: '/robots.txt', has: onBlogsHost, destination: '/blogs/robots.txt' },
        { source: '/sitemap.xml', has: onBlogsHost, destination: '/blogs/sitemap.xml' },
      ],
      // After filesystem lookup so public assets (/icon.png, ...) still win.
      afterFiles: [
        { source: '/:slug', has: onBookHost, destination: '/book/:slug' },
        { source: '/:slug', has: onBlogsHost, destination: '/blogs/:slug' },
      ],
    };
  },
  async redirects() {
    return [
      // On the book host the /book prefix is redundant.
      {
        source: '/book/chapter-1-the-beginning',
        has: onBookHost,
        destination: '/Understanding',
        permanent: true,
      },
      { source: '/book', has: onBookHost, destination: '/', permanent: true },
      { source: '/book/:path*', has: onBookHost, destination: '/:path*', permanent: true },
      { source: '/blogs', has: onBlogsHost, destination: '/', permanent: true },
      { source: '/blogs/:path*', has: onBlogsHost, destination: '/:path*', permanent: true },
      // The book is a separate site now; the portfolio has no trace of it, so
      // its old URLs land on the home page.
      { source: '/book', missing: onBookHost, destination: '/', permanent: true },
      { source: '/book/:path*', missing: onBookHost, destination: '/', permanent: true },
      { source: '/blog', missing: onBookHost, destination: '/', permanent: true },
      { source: '/blog/:slug', missing: onBookHost, destination: '/', permanent: true },
      // Same for the blog: its own host, nothing on the portfolio.
      { source: '/blogs', missing: onBlogsHost, destination: '/', permanent: true },
      { source: '/blogs/:path*', missing: onBlogsHost, destination: '/', permanent: true },
    ];
  },
};

// Bundle analyzer support
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
