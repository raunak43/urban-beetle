import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import { PageFooter, PageHeader, areasLine } from "@/components/PageChrome";
import { external, services, site, whatsappHref } from "@/lib/content";
import { breadcrumbJsonLd, jsonLdHtml, openGraphBase } from "@/lib/seo";
import { servicePages } from "@/lib/service-pages";
import "./services.css";

const description =
  "Marketing services in Kalyan from Urban Beetle: branding, website design, social media, content, Google and Meta ads, photography, SEO and influencer marketing.";

export const metadata: Metadata = {
  title: "Marketing Services in Kalyan",
  description,
  alternates: { canonical: "/services" },
  openGraph: { ...openGraphBase, url: "/services", title: "Marketing Services in Kalyan | Urban Beetle", description },
};

export default function ServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(breadcrumbJsonLd({ name: "Services", path: "/services" }))} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <PageHeader />

      <main className="sp">
        <section className="sp-hero">
          <nav className="sp-crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Services</span>
          </nav>
          <h1 className="sp-title">
            Marketing services in <span className="gold-text">{site.address.locality}</span>
          </h1>
          <p className="sp-lede">
            Nine disciplines under one roof, so strategy, creative and performance never lose each other in a handoff.
            We&apos;re based in {areasLine}.
          </p>
        </section>

        <section className="sp-section" aria-label="All services">
          <ol className="sp-index">
            {services.map((s, i) => (
              <li key={s.slug}>
                <a href={`/services/${s.slug}`} className="sp-index__item">
                  <span className="sp-index__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="sp-index__body">
                    <span className="sp-index__name">{servicePages[s.slug].title}</span>
                    <span className="sp-index__text">{s.body}</span>
                  </span>
                  <span className="sp-index__arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section className="sp-cta" aria-labelledby="cta">
          <h2 id="cta" className="sp-cta__title">
            Not sure where to <span className="gold-text">start?</span>
          </h2>
          <p className="sp-cta__text">
            Tell us about your business and goals, and we&apos;ll recommend the right mix. We reply within 24 hours.
          </p>
          <div className="sp-ctas sp-ctas--center">
            <a href="/enquiry" className="btn btn--gold">
              Start a project
            </a>
            <a href={whatsappHref} {...external} className="btn">
              Chat on WhatsApp
            </a>
          </div>
        </section>
      </main>

      <PageFooter />
    </>
  );
}
