import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import { PageFooter, PageHeader } from "@/components/PageChrome";
import { external, whatsappHref } from "@/lib/content";
import "./services/services.css";

// Shown for any address that doesn't exist (a mistyped or outdated link): a way back to the useful pages.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <PageHeader />

      <main className="sp">
        <section className="sp-hero sp-404">
          <p className="sp-kicker">Error 404</p>
          <h1 className="sp-title">
            This page has <span className="gold-text">flown off.</span>
          </h1>
          <p className="sp-lede">
            The link may be mistyped or out of date. Here are the places most people are looking for.
          </p>
          <div className="sp-ctas">
            <a href="/" className="btn btn--gold">
              Back to home
            </a>
            <a href="/services" className="btn">
              Our services
            </a>
            <a href="/enquiry" className="btn">
              Start a project
            </a>
          </div>
          <p className="sp-404__help">
            Can&apos;t find what you need?{" "}
            <a href={whatsappHref} {...external}>
              Ask us on WhatsApp
            </a>
            .
          </p>
        </section>
      </main>

      <PageFooter />
    </>
  );
}
