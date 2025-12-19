import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: process.env.BLOB_BASE_URL
      ? [
          {
            protocol: "https",
            hostname: new URL(process.env.BLOB_BASE_URL).hostname,
            pathname: "/**",
          },
        ]
      : [
          // Allow Vercel Blob storage by default
          {
            protocol: "https",
            hostname: "*.public.blob.vercel-storage.com",
            pathname: "/**",
          },
        ],
  },
  /* config options here */
};

export default nextConfig;
