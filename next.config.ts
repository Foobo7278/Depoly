import type { NextConfig } from "next";

const isDev = process.env.NEXT_DEV === "true" || process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  distDir: isDev ? ".next_dev" : ".next",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
