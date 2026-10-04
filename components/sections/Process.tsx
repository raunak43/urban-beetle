"use client";

import { useEffect, useRef } from "react";
import { process } from "@/lib/content";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { Eyebrow, Words, pad2 } from "../Text";

export default function Process() {
  const listRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const bigRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = listRef.current!;
    const steps = gsap.utils.toArray<HTMLElement>(".step", list);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: list, start: "top 60%", end: "bottom 60%", scrub: true },
        },
      );
      steps.forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => {
            step.classList.toggle("is-active", self.isActive);
            if (self.isActive) bigRef.current!.textContent = pad2(i + 1);
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="process section" id="process">
      <div className="container process__grid">
        <div className="process__aside">
          <div className="process__sticky">
            <Eyebrow index="06">Creative Process</Eyebrow>
            <h2 className="section-title section-title--md" data-split="">
              <Words parts={["From first spark to", { em: "full momentum." }]} />
            </h2>
            <p className="process__big" aria-hidden="true">
              <span ref={bigRef}>01</span>
              <small>/ {pad2(process.length)}</small>
            </p>
          </div>
        </div>
        <div className="process__steps">
          <span className="process__rail" aria-hidden="true">
            <span ref={lineRef} />
          </span>
          <ol ref={listRef} className="process__list">
            {process.map((p, i) => (
              <li key={p.step} className="step">
                <span className="step__dot" aria-hidden="true" />
                <span className="step__num">{pad2(i + 1)}</span>
                <h3 className="step__name">{p.step}</h3>
                <p className="step__body">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
