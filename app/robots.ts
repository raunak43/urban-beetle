import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

// Served as /robots.txt. Everything is open to search engines except the form's API and the WhatsApp
// chat redirects, which are only meant for the enquiry alerts.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/chat/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
