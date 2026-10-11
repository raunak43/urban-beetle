import type { MetadataRoute } from "next";
import { services, site } from "@/lib/content";

// Served as /sitemap.xml and listed in robots.txt. Add every new page here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/services`, changeFrequency: "monthly", priority: 0.9 },
    ...services.map((s) => ({
      url: `${site.url}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${site.url}/enquiry`, changeFrequency: "yearly", priority: 0.6 },
  ];
}
