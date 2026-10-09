// Search and social-sharing details shared by every page: Open Graph defaults and schema.org structured data.
import type { Metadata } from "next";
import { services, site } from "@/lib/content";

// The picture shown when a link is shared (WhatsApp, LinkedIn, Facebook, X). Rebuild it with `npm run og`.
const shareImage = "/og-image.jpg";

// A page that sets its own openGraph replaces the layout's entirely, so pages spread these back in.
// X (twitter:*) falls back to these too.
export const openGraphBase = {
  type: "website",
  siteName: site.name,
  locale: "en_IN",
  images: [
    {
      url: shareImage,
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: "Urban Beetle, a creative marketing agency: gold beetle logo with the tagline Strategy, Creativity, Technology",
    },
  ],
} satisfies Metadata["openGraph"];

const orgId = `${site.url}/#organization`;

// Lets search engines connect the site to the agency's name, logo, location, contact details and social profiles.
const organization = {
  "@type": "Organization",
  "@id": orgId,
  name: site.name,
  url: site.url,
  logo: { "@type": "ImageObject", url: `${site.url}/apple-icon.png`, width: 180, height: 180 },
  image: `${site.url}${shareImage}`,
  description:
    "Creative marketing agency blending strategy, creativity and technology to turn ordinary businesses into memorable brands.",
  email: site.generalEmail,
  telephone: site.phone.replace(/\s/g, ""),
  address: {
    "@type": "PostalAddress",
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
  areaServed: { "@type": "Country", name: "India" },
  founder: { "@type": "Person", name: site.founder.name, jobTitle: site.founder.role },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: site.phone.replace(/\s/g, ""),
    email: site.generalEmail,
    areaServed: "IN",
  },
  knowsAbout: services.map((s) => s.name),
  sameAs: site.socials.map((s) => s.href),
};

// Gives Google the site name to show in results instead of the bare domain.
const website = {
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  name: site.name,
  url: site.url,
  inLanguage: "en-IN",
  publisher: { "@id": orgId },
};

export const siteJsonLd = { "@context": "https://schema.org", "@graph": [organization, website] };

// Breadcrumb trail for an inner page, so results show "Urban Beetle › Start a project" instead of the URL.
export function breadcrumbJsonLd(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: site.name, item: site.url },
      { "@type": "ListItem", position: 2, name, item: `${site.url}${path}` },
    ],
  };
}

// JSON-LD goes into a <script> tag, so "<" is escaped to keep text like "</script>" from ending it early.
export const jsonLdHtml = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
