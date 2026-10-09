import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

// Served as /sitemap.xml and listed in robots.txt. Add every new page here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/enquiry`, changeFrequency: "yearly", priority: 0.6 },
  ];
}
