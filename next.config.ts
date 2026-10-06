import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // WhatsApp alert buttons can't link to wa.me directly, so the "Chat with client" button opens
    // this, which forwards to a WhatsApp chat with that number.
    return [{ source: "/chat/:number(\\d{7,15})", destination: "https://wa.me/:number", permanent: false }];
  },
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
