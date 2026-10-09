import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter_Tight, JetBrains_Mono, Montserrat } from "next/font/google";
import { preload } from "react-dom";
import "lenis/dist/lenis.css";
import { site } from "@/lib/content";
import { jsonLdHtml, openGraphBase, siteJsonLd } from "@/lib/seo";
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

// Canonical links and share-image URLs always point at the real domain, whichever address served the page.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Urban Beetle | Creative Marketing Agency in Kalyan",
    template: "%s | Urban Beetle",
  },
  description:
    "Urban Beetle is a creative marketing agency in Kalyan, Maharashtra, offering branding, website design, social media, content, paid ads, SEO and photography.",
  alternates: { canonical: "/" },
  openGraph: {
    ...openGraphBase,
    url: "/",
    title: "Urban Beetle | Creative Marketing Agency",
    description: "Strategy + Creativity + Technology. A creative marketing agency for brands that refuse to stand still.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The logo is drawn as a CSS mask, so the browser would only find the image after the stylesheet loads.
  // It is the first thing painted (the preloader), so fetch it straight away.
  preload("/brand/logo-mask.webp", { as: "image", fetchPriority: "high" });

  return (
    // Client code adds/removes state classes here (is-loading, has-cursor, menu-open).
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable} ${brand.variable}`} suppressHydrationWarning>
      <body>
        <noscript>
          <style>{`.preloader{display:none}html.is-loading{overflow:auto}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(siteJsonLd)} />
        {children}
      </body>
    </html>
  );
}
