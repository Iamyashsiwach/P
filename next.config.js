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
      // Before filesystem lookup: '/' is the main site's home page.
      beforeFiles: [{ source: '/', has: onBookHost, destination: '/book' }],
      // After filesystem lookup so public assets (/icon.png, ...) still win.
      afterFiles: [{ source: '/:slug', has: onBookHost, destination: '/book/:slug' }],
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
      // The book is a separate site now; the portfolio has no trace of it, so
      // its old URLs land on the home page.
      { source: '/book', missing: onBookHost, destination: '/', permanent: true },
      { source: '/book/:path*', missing: onBookHost, destination: '/', permanent: true },
      { source: '/blog', missing: onBookHost, destination: '/', permanent: true },
      { source: '/blog/:slug', missing: onBookHost, destination: '/', permanent: true },
    ];
  },
};

// Bundle analyzer support
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
