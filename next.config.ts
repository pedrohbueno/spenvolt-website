import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    API_URL: process.env.API_URL,
    APP_SECURITY_USER: process.env.APP_SECURITY_USER,
    APP_SECURITY_PASSWORD: process.env.APP_SECURITY_PASSWORD,
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
