import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import { PageFooter, PageHeader } from "@/components/PageChrome";
import { phoneHref, site } from "@/lib/content";
import { breadcrumbJsonLd, jsonLdHtml, openGraphBase } from "@/lib/seo";
import "../services/services.css";

// Terms for using the website and sending an enquiry. Project fees, payment, timelines and deliverables
// belong in each client's written proposal, which these terms defer to.
const UPDATED = "16 October 2026";

const description =
  "The terms for using urbanbeetle.com and sending Urban Beetle a project enquiry: website use, quotes, intellectual property, liability and governing law.";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description,
  alternates: { canonical: "/terms" },
  openGraph: { ...openGraphBase, url: "/terms", title: "Terms & Conditions | Urban Beetle", description },
};

export default function TermsPage() {
  const email = <a href={`mailto:${site.generalEmail}`}>{site.generalEmail}</a>;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdHtml(breadcrumbJsonLd({ name: "Terms & Conditions", path: "/terms" }))}
      />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <PageHeader />

      <main className="sp">
        <section className="sp-hero">
          <nav className="sp-crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Terms &amp; Conditions</span>
          </nav>
          <h1 className="sp-title">
            Terms &amp; <span className="gold-text">conditions</span>
          </h1>
          <p className="sp-lede">
            These terms apply when you use {site.url.replace("https://", "")} or send us a project enquiry. Please read
            them carefully. Last updated {UPDATED}.
          </p>
        </section>

        <article className="sp-section sp-prose">
          <h2>About us</h2>
          <p>
            This website is run by Urban Beetle, a creative marketing agency based in {site.address.locality},{" "}
            {site.address.region}, India (&quot;we&quot;, &quot;us&quot;). You can contact us at {email} or{" "}
            <a href={phoneHref}>{site.phone}</a>. By using the website, you agree to these terms. If you don&apos;t agree,
            please don&apos;t use it.
          </p>

          <h2>Using the website</h2>
          <p>You may browse the website and contact us for your own business purposes. You agree not to:</p>
          <ul>
            <li>use it for anything unlawful, misleading or harmful;</li>
            <li>send spam, false enquiries or someone else&apos;s details without their permission;</li>
            <li>try to break, overload or gain unauthorised access to the website or its systems;</li>
            <li>copy, scrape or reuse the website&apos;s content in bulk.</li>
          </ul>

          <h2>Enquiries and quotes</h2>
          <ul>
            <li>
              Sending an enquiry doesn&apos;t create a contract or oblige either of us to work together. It simply lets us
              understand your needs and get back to you.
            </li>
            <li>Please make sure the information you give us is accurate and that you&apos;re allowed to share it.</li>
            <li>
              If you upload photos or other material, you confirm you have the right to share them, and you allow us to
              use them to assess your enquiry and prepare a proposal.
            </li>
            <li>
              We aim to reply within 24 hours, but this is a goal rather than a guarantee. Any quote we give is an
              estimate until it&apos;s confirmed in a written proposal.
            </li>
          </ul>

          <h2>Projects</h2>
          <p>
            If we work together, the scope, deliverables, fees, payment schedule, timelines, revisions and ownership of
            the work are set out in a written proposal or agreement that we both accept. If that document and these terms
            differ, the proposal or agreement applies to the project.
          </p>

          <h2>Results</h2>
          <p>
            Marketing results depend on many things outside our control, such as platform algorithms, competition, budgets
            and market conditions. We don&apos;t guarantee specific outcomes such as search rankings, followers, leads or
            sales, unless a written agreement says otherwise.
          </p>

          <h2>Intellectual property</h2>
          <p>
            The website and its content, including the Urban Beetle name, logo, designs, images, videos and text, belong
            to Urban Beetle or are used with permission. You may not copy, reproduce or use them without our written
            permission. Ownership of work we create for clients is set out in each project&apos;s agreement.
          </p>

          <h2>Other websites and services</h2>
          <p>
            The website links to and uses services run by others, such as WhatsApp, Instagram, Facebook, YouTube and
            Google Maps. We aren&apos;t responsible for their content or how they work, and their own terms and privacy
            policies apply when you use them.
          </p>

          <h2>Availability and accuracy</h2>
          <p>
            We work to keep the website available and its information accurate, but we provide it &quot;as is&quot;. It
            may sometimes be unavailable or contain errors, and we may change or remove content at any time.
          </p>

          <h2>Liability</h2>
          <p>
            To the extent the law allows, we aren&apos;t liable for any indirect or consequential loss, or for loss of
            profit, data or business, arising from your use of the website. Nothing in these terms limits any liability
            that can&apos;t be limited under Indian law.
          </p>

          <h2>Privacy</h2>
          <p>
            How we handle your personal information is explained in our <a href="/privacy">privacy policy</a>.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The latest version will always be on this page, with the date at
            the top.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of India. Any dispute will be handled by the courts in Thane district,
            Maharashtra.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Contact us at {email} or <a href={phoneHref}>{site.phone}</a>.
          </p>
        </article>
      </main>

      <PageFooter />
    </>
  );
}
