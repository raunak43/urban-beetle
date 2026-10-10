import type { NextConfig } from "next";

const turnstile = "https://challenges.cloudflare.com"; // Cloudflare's security check on the enquiry form

// The browser loads this site's own files (fonts, images and scripts are all self-hosted) plus Cloudflare's
// security check (a script and its frame), and nothing else. Inline scripts and styles stay allowed because
// Next.js and React need them.
// Skipped in development (hot reloading uses eval and a websocket) and on Vercel preview deployments, which
// are login-protected and inject Vercel's toolbar.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${turnstile}`,
  `frame-src ${turnstile}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");
const enforceCsp = process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";

const securityHeaders = [
  ...(enforceCsp ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    // WhatsApp alert buttons can't link to wa.me directly, so the "Chat with client" button opens
    // this, which forwards to a WhatsApp chat with that number.
    return [
      { source: "/chat/:number(\\d{7,15})", destination: "https://wa.me/:number", permanent: false },
      // Vercel also serves production at this address. Sending it to the real domain stops Google indexing
      // a duplicate copy of the site. (Per-deployment URLs already carry a noindex header from Vercel.)
      // Vercel's scheduled jobs call a *.vercel.app address and don't follow redirects, so they're let through.
      {
        source: "/:path*",
        has: [{ type: "host", value: "urban-beetle.vercel.app" }],
        missing: [{ type: "header", key: "x-vercel-cron-schedule" }],
        destination: "https://urbanbeetle.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Frame URLs carry a ?v= version from lib/frames.json (bumped on every extraction), so they can be cached forever.
      {
        source: "/frames/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
