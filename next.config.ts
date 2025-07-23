import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // Docker development optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable polling for file changes in Docker
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules", "**/.git", "**/.next"],
      };
    }
    return config;
  },
  // Enable experimental features for better hot reloading
  experimental: {
    // Enable webpack 5 persistent caching
    webpackBuildWorker: true,
    // Enable faster refresh
    optimizePackageImports: ["@/components", "@/utils"],
  },
  // Development optimizations
  ...(process.env.NODE_ENV === "development" && {
    // Enable source maps for better debugging
    productionBrowserSourceMaps: false,
  }),
};

export default nextConfig;
