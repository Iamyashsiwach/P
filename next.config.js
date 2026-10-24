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
    // Destinations go straight to the book host: no redirect chains.
    const book = `https://${BOOK_HOST}`;
    return [
      { source: '/blog', destination: book, permanent: true },
      { source: '/blog/:slug', destination: `${book}/:slug`, permanent: true },
      // Renamed chapter; must precede the generic /book/* rules.
      {
        source: '/book/chapter-1-the-beginning',
        destination: `${book}/Understanding`,
        permanent: true,
      },
      // On the book host the /book prefix is redundant.
      { source: '/book', has: onBookHost, destination: '/', permanent: true },
      { source: '/book/:path*', has: onBookHost, destination: '/:path*', permanent: true },
      // On every other host the book has moved.
      { source: '/book', missing: onBookHost, destination: book, permanent: true },
      {
        source: '/book/:path*',
        missing: onBookHost,
        destination: `${book}/:path*`,
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
