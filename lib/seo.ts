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

// The towns the agency works in, then the rest of India.
const areaServed = [
  ...site.serviceAreas.map((name) => ({ "@type": "City", name })),
  { "@type": "Country", name: "India" },
];

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
  areaServed,
  founder: { "@type": "Person", name: site.founder.name, jobTitle: site.founder.role },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: site.phone.replace(/\s/g, ""),
    email: site.generalEmail,
    areaServed: "IN",
  },
  knowsAbout: services.map((s) => s.name),
  // The services and their pages, so search engines and AI assistants can tell what the agency offers.
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Marketing services",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, url: `${site.url}/services/${s.slug}` },
    })),
  },
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

type Crumb = { name: string; path: string };

// Breadcrumb trail for an inner page, so results show "Urban Beetle › Services › SEO" instead of the URL.
const breadcrumbList = (trail: Crumb[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: [{ name: site.name, path: "" }, ...trail].map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: `${site.url}${crumb.path}`,
  })),
});

export const breadcrumbJsonLd = (...trail: Crumb[]) => ({ "@context": "https://schema.org", ...breadcrumbList(trail) });

// A service page: the service itself (offered by the agency in its towns), its questions and answers,
// and the breadcrumb trail.
export function servicePageJsonLd(page: {
  name: string;
  path: string;
  description: string;
  faqs: { q: string; a: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: page.name,
        serviceType: page.name,
        url: `${site.url}${page.path}`,
        description: page.description,
        provider: { "@id": orgId },
        areaServed,
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      breadcrumbList([
        { name: "Services", path: "/services" },
        { name: page.name, path: page.path },
      ]),
    ],
  };
}

// JSON-LD goes into a <script> tag, so "<" is escaped to keep text like "</script>" from ending it early.
export const jsonLdHtml = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
