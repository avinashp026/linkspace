import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cnyltwaanlrpiwqxgbon.supabase.co",
        pathname: "/storage/v1/object/public/profile-assets/**",
      },
    ],
  },
};

export default nextConfig;
