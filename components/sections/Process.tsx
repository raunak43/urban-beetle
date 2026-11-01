"use client";

import { useEffect, useRef } from "react";
import { process } from "@/lib/content";
import { gsap } from "@/lib/motion";
import { Eyebrow, Words, pad2 } from "../Text";

export default function Process() {
  const listRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const bigRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = listRef.current!;
    const rail = railRef.current!;
    const steps = gsap.utils.toArray<HTMLElement>(".step", list);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: list,
            start: "top center",
            end: "bottom center",
            scrub: true,
            // Measured after the pinned Capabilities row above, whose pin is created later and adds
            // its scroll length to everything below it.
            refreshPriority: -1,
            // The spark that runs down the rail stays within the lit part.
            onUpdate: (self) => rail.style.setProperty("--fill", self.progress.toFixed(4)),
          },
        },
      );
    });

    // Focus follows the middle of the screen: the step crossing a thin band at the centre is sharp,
    // the rest blur back. The browser measures this itself on every frame, so it stays exact on
    // phones even while Safari's toolbar resizes the viewport. The last focused step stays sharp
    // when the band moves past the list.
    const focus = (index: number) => {
      steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
      bigRef.current!.textContent = pad2(index + 1);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) focus(steps.indexOf(entry.target as HTMLElement));
      },
      { rootMargin: "-49% 0px -50% 0px" },
    );
    steps.forEach((step) => observer.observe(step));

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section className="process section" id="process">
      <div className="container process__grid">
        <div className="process__aside">
          <div className="process__sticky">
            <Eyebrow index="05">Creative Process</Eyebrow>
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
          <span ref={railRef} className="process__rail" aria-hidden="true">
            <span ref={lineRef} />
            <span className="process__comet" />
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
