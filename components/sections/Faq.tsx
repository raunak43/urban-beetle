import { external, faqs, whatsappHref } from "@/lib/content";
import { jsonLdHtml } from "@/lib/seo";
import { Eyebrow, Words } from "../Text";

// Common questions before an enquiry, as native <details> (keyboard and screen-reader friendly with no
// script), plus the same questions as FAQPage data for search engines and AI assistants.
export default function Faq({ index }: { index: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section className="faq section sheet" id="faq" data-surface="paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <div className="container faq__grid">
        <div className="faq__intro">
          <Eyebrow index={index}>Questions</Eyebrow>
          <h2 className="section-title section-title--md" data-split="">
            <Words parts={["Questions,", { em: "answered." }]} />
          </h2>
          <p className="section-lede" data-reveal="">
            Everything people usually ask before working with us. Something else on your mind? Just ask.
          </p>
          <div className="faq__ctas" data-reveal="">
            <a href="/enquiry" className="btn btn--gold">
              Start a project
            </a>
            <a href={whatsappHref} {...external} className="link-arrow">
              Ask on WhatsApp <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="faq__list" data-reveal="stagger">
          {faqs.map((f) => (
            <details key={f.q} className="faq__item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
