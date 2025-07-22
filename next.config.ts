import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Docker development optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable polling for file changes in Docker
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
