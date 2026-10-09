import type { Metadata } from "next";
import BeetleMark from "@/components/BeetleMark";
import Cursor from "@/components/Cursor";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import { breadcrumbJsonLd, jsonLdHtml, openGraphBase } from "@/lib/seo";
import { turnstileSiteKey } from "@/lib/turnstile";
import "./enquiry.css";

const description =
  "Start a project with Urban Beetle, a creative marketing agency in Kalyan. Tell us about your brand and goals, and our team will reply within 24 hours.";

export const metadata: Metadata = {
  title: "Start a Project",
  description,
  alternates: { canonical: "/enquiry" },
  openGraph: { ...openGraphBase, url: "/enquiry", title: "Start a Project | Urban Beetle", description },
};

export default function EnquiryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(breadcrumbJsonLd("Start a project", "/enquiry"))} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <header className="eq-top">
        <a href="/" className="eq-top__logo" aria-label="Urban Beetle home">
          <BeetleMark className="eq-top__mark" />
          <span className="nav__word">
            Urban <span>Beetle</span>
          </span>
        </a>
        <a href="/" className="eq-top__back">
          <span aria-hidden="true">←</span> Back to home
        </a>
      </header>
      <main className="eq">
        <EnquiryForm turnstileSiteKey={turnstileSiteKey()} />
      </main>
    </>
  );
}
