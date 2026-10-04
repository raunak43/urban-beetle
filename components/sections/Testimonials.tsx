"use client";

import { useEffect, useState } from "react";
import { testimonials } from "@/lib/content";
import { Eyebrow, pad2 } from "../Text";

const INTERVAL_MS = 7000;

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = testimonials.length;
  const go = (i: number) => setActive((i + total) % total);

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % total), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, total]);

  return (
    <section
      className="voices section"
      id="testimonials"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="container">
        <Eyebrow index="07">Client Voices</Eyebrow>
        {/* Only announce changes the visitor caused, not every autoplay tick. */}
        <div className="voices__stage" aria-live={paused ? "polite" : "off"} data-reveal="">
          <span className="voices__mark" aria-hidden="true">
            &ldquo;
          </span>
          {testimonials.map((t, i) => (
            <figure key={i} className={`quote${i === active ? " is-active" : ""}`} aria-hidden={i !== active}>
              <blockquote>
                <p>{t.quote}</p>
              </blockquote>
              <figcaption>
                <span className="quote__name">{t.name}</span>
                <span className="quote__role">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="voices__controls">
          <span className="voices__count">
            {pad2(active + 1)} / {pad2(total)}
          </span>
          <span className="voices__progress" aria-hidden="true">
            <span key={`${active}-${paused}`} className={paused ? "" : "is-running"} />
          </span>
          <div className="voices__buttons">
            <button type="button" onClick={() => go(active - 1)} aria-label="Previous testimonial" data-magnetic="0.3">
              ←
            </button>
            <button type="button" onClick={() => go(active + 1)} aria-label="Next testimonial" data-magnetic="0.3">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
