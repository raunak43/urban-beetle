import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter_Tight, JetBrains_Mono, Montserrat } from "next/font/google";
import "lenis/dist/lenis.css";
import { site } from "@/lib/content";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// The optical-size axis gives the footer wordmark Bodoni's fine display hairlines (see .footer__word).
const serif = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
// Montserrat is the typeface of the Urban Beetle logo, so the wordmark on the site matches it.
const brand = Montserrat({ subsets: ["latin"], variable: "--font-brand", display: "swap" });

// Absolute base for social-share image URLs; Vercel provides the production domain automatically.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Urban Beetle | We Make Brands Move",
  description:
    "Urban Beetle is a creative marketing agency blending strategy, creativity and technology to turn ordinary businesses into memorable brands.",
  openGraph: {
    title: "Urban Beetle | We Make Brands Move",
    description: "Strategy + Creativity + Technology. A creative marketing agency for brands that refuse to stand still.",
    images: ["/images/beetle-landed.webp"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
};

// Lets search engines connect the site to the agency's social profiles and contact details.
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: siteUrl,
  logo: `${siteUrl}/apple-icon.png`,
  email: site.email,
  telephone: site.phone.replace(/\s/g, ""),
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Client code adds/removes state classes here (is-loading, has-cursor, menu-open).
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable} ${brand.variable}`} suppressHydrationWarning>
      <body>
        <noscript>
          <style>{`.preloader{display:none}html.is-loading{overflow:auto}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
