/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
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
  // Make sure static assets like favicon are properly handled
  webpack(config) {
    return config;
  },
};

// Bundle analyzer support
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
