import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Cursor from "@/components/Cursor";
import { PageFooter, PageHeader, areasLine } from "@/components/PageChrome";
import { external, process, services, site, whatsappHref } from "@/lib/content";
import { jsonLdHtml, openGraphBase, servicePageJsonLd } from "@/lib/seo";
import { servicePages } from "@/lib/service-pages";
import "../services.css";

type Props = { params: Promise<{ slug: string }> };

// One page per service, built at deploy time; any other /services/... address is a 404.
export const dynamicParams = false;
export const generateStaticParams = () => services.map((s) => ({ slug: s.slug }));

const find = (slug: string) => {
  const service = services.find((s) => s.slug === slug);
  const page = servicePages[slug];
  return service && page ? { service, page } : null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = find((await params).slug);
  if (!found) return {};
  const { service, page } = found;
  const path = `/services/${service.slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: { ...openGraphBase, url: path, title: `${page.title} | Urban Beetle`, description: page.description },
  };
}

export default async function ServicePage({ params }: Props) {
  const found = find((await params).slug);
  if (!found) notFound();
  const { service, page } = found;
  const path = `/services/${service.slug}`;
  const faqs = [
    ...page.faqs,
    {
      q: `Do you only work with businesses in ${site.address.locality}?`,
      a: `No. We're based in ${areasLine}, in person or online.`,
    },
  ];
  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdHtml(servicePageJsonLd({ name: service.name, path, description: page.description, faqs }))}
      />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <PageHeader />

      <main className="sp">
        <section className="sp-hero">
          <nav className="sp-crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <a href="/services">Services</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{service.name}</span>
          </nav>
          <h1 className="sp-title">
            {page.heading} <span className="gold-text">{site.address.locality}</span>
          </h1>
          <p className="sp-lede">{page.intro}</p>
          <div className="sp-ctas">
            <a href="/enquiry" className="btn btn--gold">
              Start a project
            </a>
            <a href={whatsappHref} {...external} className="btn">
              Chat on WhatsApp
            </a>
          </div>
          <ul className="tags sp-tags">
            {service.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="sp-section" aria-labelledby="included">
          <p className="sp-kicker">01 · What&apos;s included</p>
          <h2 className="sp-heading" id="included">
            Everything it takes, under one roof.
          </h2>
          <ul className="sp-cards">
            {page.included.map((item) => (
              <li key={item.title} className="sp-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="sp-section sp-split" aria-labelledby="for">
          <div>
            <p className="sp-kicker">02 · Who it&apos;s for</p>
            <h2 className="sp-heading" id="for">
              Made for businesses like yours.
            </h2>
          </div>
          <ul className="sp-checks">
            {page.idealFor.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="sp-section" aria-labelledby="how">
          <p className="sp-kicker">03 · How we work</p>
          <h2 className="sp-heading" id="how">
            From first call to full momentum.
          </h2>
          <ol className="sp-steps">
            {process.map((s, i) => (
              <li key={s.step}>
                <span className="sp-steps__num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.step}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="sp-section sp-split" aria-labelledby="faq">
          <div>
            <p className="sp-kicker">04 · Questions</p>
            <h2 className="sp-heading" id="faq">
              Questions, answered.
            </h2>
          </div>
          <div className="sp-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="sp-section" aria-labelledby="more">
          <p className="sp-kicker">05 · More from Urban Beetle</p>
          <h2 className="sp-heading" id="more">
            Other services.
          </h2>
          <ul className="sp-others">
            {others.map((s) => (
              <li key={s.slug}>
                <a href={`/services/${s.slug}`}>
                  {s.name} <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="sp-cta" aria-labelledby="cta">
          <h2 id="cta" className="sp-cta__title">
            Let&apos;s make your brand <span className="gold-text">move.</span>
          </h2>
          <p className="sp-cta__text">
            Tell us about your business and goals. Our team will get back to you within 24 hours.
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
