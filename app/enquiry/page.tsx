import type { Metadata } from "next";
import BeetleMark from "@/components/BeetleMark";
import Cursor from "@/components/Cursor";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import "./enquiry.css";

export const metadata: Metadata = {
  title: "Start a Project | Urban Beetle",
  description:
    "Tell us about your brand, your goals and what you're looking to build. Our team will get back to you within 24 hours.",
};

export default function EnquiryPage() {
  return (
    <>
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
        <EnquiryForm />
      </main>
    </>
  );
}
