"use client";

import { useEffect, useRef } from "react";
import BeetleMark from "../BeetleMark";
import Particles from "../Particles";

// Shown only after the server confirms the enquiry is stored in Supabase. `email` is set when the
// server is sending the client a confirmation email.
export default function SuccessScreen({ reference, email }: { reference: string; email: string | null }) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    titleRef.current?.focus();
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  return (
    <div className="eq-success" role="dialog" aria-modal="true" aria-labelledby="eq-success-title">
      <Particles className="eq-success__particles" density={0.8} />
      <div className="eq-success__inner">
        <div className="eq-success__emblem" aria-hidden="true">
          <span className="eq-success__halo" />
          <svg className="eq-success__ring" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="96" pathLength={1} />
          </svg>
          <svg className="eq-success__ring eq-success__ring--inner" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="96" pathLength={1} />
          </svg>
          <span className="eq-success__float">
            <BeetleMark className="eq-success__mark" />
          </span>
        </div>

        <p className="eyebrow eq-success__eyebrow">
          <span>✦</span> Enquiry received · {reference}
        </p>
        <h2 id="eq-success-title" ref={titleRef} tabIndex={-1} className="eq-success__title">
          Your request has been <span className="gold-text">submitted.</span>
        </h2>
        <p className="eq-success__text">
          Thank you for contacting Urban Beetle. Our team has received your enquiry and will contact you within 24 hours.
        </p>
        {email && (
          <p className="eq-success__note">
            A confirmation email is on its way to <strong>{email}</strong>. If you don&apos;t see it in a few minutes,
            please check your spam folder.
          </p>
        )}
        <a href="/" className="btn btn--gold eq-success__home" data-magnetic="0.25">
          <span>Back to home</span>
        </a>
      </div>
    </div>
  );
}
