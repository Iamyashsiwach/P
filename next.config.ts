import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
};
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Your existing Next.js config here
  reactStrictMode: true,

});

export default nextConfig;