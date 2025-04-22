/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Make sure static assets like favicon are properly handled
  webpack(config) {
    return config;
  },
};

module.exports = nextConfig;
