import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    API_URL: process.env.API_URL,
    API_USER: process.env.API_USER,
    API_PASSWORD: process.env.API_PASSWORD,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `https://spenvolt-api.onrender.com/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
