/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
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
