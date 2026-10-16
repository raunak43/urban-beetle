import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import { PageFooter, PageHeader } from "@/components/PageChrome";
import { phoneHref, site } from "@/lib/content";
import { breadcrumbJsonLd, jsonLdHtml, openGraphBase } from "@/lib/seo";
import "../services/services.css";

// Describes what the site really does with personal data. Update it whenever a form field, alert channel
// or third-party service changes (app/api/enquiry, lib/telegram, lib/whatsapp, lib/email, lib/sheets).
const UPDATED = "16 October 2026";

const description =
  "How Urban Beetle collects, uses and protects the personal information you share through urbanbeetle.com, and your rights under India's DPDP Act.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: "/privacy" },
  openGraph: { ...openGraphBase, url: "/privacy", title: "Privacy Policy | Urban Beetle", description },
};

export default function PrivacyPage() {
  const email = <a href={`mailto:${site.generalEmail}`}>{site.generalEmail}</a>;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(breadcrumbJsonLd({ name: "Privacy Policy", path: "/privacy" }))} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <PageHeader />

      <main className="sp">
        <section className="sp-hero">
          <nav className="sp-crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Privacy Policy</span>
          </nav>
          <h1 className="sp-title">
            Privacy <span className="gold-text">policy</span>
          </h1>
          <p className="sp-lede">
            This policy explains what personal information Urban Beetle collects through {site.url.replace("https://", "")}, why,
            who it is shared with, and the choices you have. Last updated {UPDATED}.
          </p>
        </section>

        <article className="sp-section sp-prose">
          <h2>Who we are</h2>
          <p>
            Urban Beetle is a creative marketing agency based in {site.address.locality}, {site.address.region}, India.
            We decide how the information described here is used, and we are responsible for it under India&apos;s
            Digital Personal Data Protection Act, 2023. You can reach us at {email} or{" "}
            <a href={phoneHref}>{site.phone}</a>.
          </p>

          <h2>What we collect</h2>
          <p>When you fill in our project enquiry form, we collect what you choose to give us:</p>
          <ul>
            <li>Your name, company or brand name, email address and phone number.</li>
            <li>Your city, website, social media profile and, if you add it, your business location (an address, a Google Maps link, or your current location if you tap &quot;Use my current location&quot;).</li>
            <li>The services you&apos;re interested in, details about your business and project, your budget, timeline and how you heard about us.</li>
            <li>Any photos of your business you choose to upload.</li>
          </ul>
          <p>To protect the form from spam and abuse, we also record:</p>
          <ul>
            <li>A scrambled (hashed) version of your IP address, used to limit repeated submissions. We don&apos;t store the IP address itself.</li>
            <li>Your browser&apos;s user-agent (the browser and device type), and the time of your enquiry.</li>
          </ul>
          <p>
            Your current location is only read if you tap &quot;Use my current location&quot; and your browser asks you to
            allow it. Location access is never requested otherwise.
          </p>

          <h2>How we use it</h2>
          <ul>
            <li>To reply to your enquiry, understand your needs and prepare a proposal.</li>
            <li>To send you a confirmation email that we&apos;ve received your enquiry.</li>
            <li>To keep a record of enquiries and the work we discuss with you.</li>
            <li>To keep the website and form secure and free of spam.</li>
          </ul>
          <p>We don&apos;t sell your information, and we don&apos;t use it for advertising to you without your permission.</p>

          <h2>Who we share it with</h2>
          <p>We use a small number of trusted services to run the website and handle enquiries:</p>
          <ul>
            <li><strong>Supabase</strong>: stores enquiries in our database.</li>
            <li><strong>Telegram</strong> and <strong>WhatsApp (Meta)</strong>: send our team an alert with your enquiry details, including any photos, so we can reply quickly. Photos are kept only in these alerts, not in our database.</li>
            <li><strong>Google</strong>: keeps a copy of enquiry details in our private Google Sheet. If you add a business location, the map preview on the form is loaded from Google Maps.</li>
            <li><strong>Titan (our email provider)</strong>: sends your confirmation email.</li>
            <li><strong>Cloudflare</strong>: runs the security check on the form to tell people from bots.</li>
            <li><strong>Vercel</strong>: hosts the website and keeps short-lived technical logs.</li>
          </ul>
          <p>
            Some of these services store data outside India. They only process it to provide their service to us. We may
            also disclose information if the law requires it.
          </p>

          <h2>Cookies and tracking</h2>
          <p>
            This website doesn&apos;t use advertising or analytics cookies. While you fill in the enquiry form, your answers
            (not your photos) are saved in your own browser so you don&apos;t lose them if you leave the page; they are
            cleared once your enquiry is sent. The Cloudflare security check and the Google Maps preview may set their own
            cookies, as described in their privacy policies.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We keep enquiry details for as long as we need them to respond to you, work with you and keep our business
            records, and we delete them when they&apos;re no longer needed. You can ask us to delete yours at any time.
          </p>

          <h2>Your rights</h2>
          <p>Under the DPDP Act, you can ask us to:</p>
          <ul>
            <li>tell you what personal information we hold about you and how it&apos;s used;</li>
            <li>correct or update it;</li>
            <li>delete it, or withdraw consent you have given;</li>
            <li>nominate someone to exercise these rights on your behalf.</li>
          </ul>
          <p>
            Email {email} and we&apos;ll respond as soon as possible. If you&apos;re not satisfied with our reply, you can
            complain to the Data Protection Board of India.
          </p>

          <h2>Security</h2>
          <p>
            Our database can&apos;t be read from the website: only our team can view enquiries. The site uses HTTPS
            throughout. No system is perfectly secure, but we take reasonable steps to protect your information.
          </p>

          <h2>Children</h2>
          <p>Our services are for businesses. The enquiry form isn&apos;t meant for anyone under 18.</p>

          <h2>Changes</h2>
          <p>
            If we change how we handle personal information, we&apos;ll update this page and the date at the top.
          </p>

          <h2>Contact and grievances</h2>
          <p>
            For any privacy question, request or complaint, contact {site.founder.name}, {site.founder.role}, at {email} or{" "}
            <a href={phoneHref}>{site.phone}</a>.
          </p>
        </article>
      </main>

      <PageFooter />
    </>
  );
}
