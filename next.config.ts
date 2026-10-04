import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Frame URLs carry a ?v= version from lib/frames.json (bumped on every extraction), so they can be cached forever.
    return [
      {
        source: "/frames/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
