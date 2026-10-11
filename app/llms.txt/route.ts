import { services, site } from "@/lib/content";
import { servicePages } from "@/lib/service-pages";

// Served as /llms.txt: a plain summary of the agency for AI assistants and the crawlers behind them
// (the llmstxt.org convention). Built from the same content as the pages, so it never drifts.
export const dynamic = "force-static";

export function GET() {
  const nearby = site.serviceAreas.filter((a) => a !== site.address.locality).join(", ");
  const text = `# ${site.name}

> ${site.name} is a creative marketing agency based in ${site.address.locality}, ${site.address.region}, India, working with businesses in ${nearby} and across India. It blends strategy, creativity and technology: branding, website design, social media marketing, content creation, Google and Meta ads, photography, SEO, influencer marketing and graphic design.

- Website: ${site.url}
- Location: ${site.location}
- Phone and WhatsApp: ${site.phone}
- Email: ${site.generalEmail}
- Founder: ${site.founder.name}
- Start a project: ${site.url}/enquiry (the team replies within 24 hours)

## Services

${services.map((s) => `- [${servicePages[s.slug].title}](${site.url}/services/${s.slug}): ${s.body}`).join("\n")}

## Profiles

${site.socials.map((s) => `- ${s.label}: ${s.href}`).join("\n")}
`;
  return new Response(text, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
