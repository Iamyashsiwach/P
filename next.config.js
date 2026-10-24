const BOOK_HOST = 'book.yashsiwach.in';
const onBookHost = [{ type: 'host', value: BOOK_HOST }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // book.yashsiwach.in serves the /book tree at its root. The app/book routes
  // stay the implementation; the host never exposes the /book prefix.
  async rewrites() {
    return {
      // Before filesystem lookup: '/', robots and sitemap exist on the main site.
      beforeFiles: [
        { source: '/', has: onBookHost, destination: '/book' },
        { source: '/robots.txt', has: onBookHost, destination: '/book/robots.txt' },
        { source: '/sitemap.xml', has: onBookHost, destination: '/book/sitemap.xml' },
      ],
      // After filesystem lookup so public assets (/icon.png, ...) still win.
      afterFiles: [{ source: '/:slug', has: onBookHost, destination: '/book/:slug' }],
    };
  },
  async redirects() {
    return [
      { source: '/book', has: onBookHost, destination: '/', permanent: true },
      { source: '/book/:path*', has: onBookHost, destination: '/:path*', permanent: true },
      {
        source: '/blog',
        destination: '/book',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/book/:slug',
        permanent: true,
      },
      {
        source: '/book/chapter-1-the-beginning',
        destination: '/book/Understanding',
        permanent: true,
      },
    ];
  },
};

// Bundle analyzer support
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
