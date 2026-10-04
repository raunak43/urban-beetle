"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { work } from "@/lib/content";
import { gsap, ScrollTrigger } from "@/lib/motion";
import ProjectArt from "../ProjectArt";
import { Eyebrow, Words, pad2 } from "../Text";

// Desktop: the gallery pins (CSS sticky) and scrolling moves it sideways.
// Phones / reduced motion: a normal vertical stack.
export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const track = trackRef.current!;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const setHeight = () => {
        // Extra length covers the start/end holds, so the slide itself still moves 1:1 with the scroll.
        section.style.height = `${distance() * 1.16 + window.innerHeight}px`;
      };
      setHeight();
      ScrollTrigger.addEventListener("refreshInit", setHeight);

      const cards = gsap.utils.toArray<HTMLElement>(".project", track);
      let active = -1;

      // Short holds before and after the slide so the first and last panels get a beat on screen.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            barRef.current!.style.transform = `scaleX(${self.progress})`;
            // Depth: each poster's artwork drifts against the direction of travel.
            const x = gsap.getProperty(track, "x") as number;
            const vw = window.innerWidth;
            let closest = 0;
            let best = Infinity;
            cards.forEach((card, i) => {
              const centre = card.offsetLeft + card.offsetWidth / 2 + x - vw / 2;
              card.style.setProperty("--shift", (centre / vw).toFixed(3));
              if (Math.abs(centre) < best) {
                best = Math.abs(centre);
                closest = i;
              }
            });
            if (closest !== active) {
              active = closest;
              countRef.current!.textContent = pad2(closest + 1);
            }
          },
        },
      });
      tl.to({}, { duration: 0.08 })
        .to(track, { x: () => -distance(), duration: 1 })
        .to({}, { duration: 0.08 });

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", setHeight);
        section.style.height = "";
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="work" id="work">
      <div className="work__sticky">
        <div className="work__head container">
          <div>
            <Eyebrow index="03">Selected Work</Eyebrow>
            <h2 className="section-title" data-split="">
              <Words parts={["Brands we've", { em: "set in motion." }]} />
            </h2>
          </div>
          <p className="work__meta" aria-hidden="true">
            <span className="work__count">
              <span ref={countRef}>01</span> / {pad2(work.length)}
            </span>
            <span className="work__hint">Keep scrolling →</span>
          </p>
        </div>

        <div ref={trackRef} className="work__track">
          {work.map((p, i) => (
            <article key={p.slug} className="project" style={{ "--accent": p.accent } as CSSProperties} data-reveal="">
              <div className="project__media">
                <ProjectArt project={p} index={i} total={work.length} />
              </div>
              <div className="project__info">
                <div className="project__row">
                  <h3 className="project__name">{p.name}</h3>
                  <span className="project__year">{p.year}</span>
                </div>
                <p className="project__line">{p.line}</p>
                <ul className="tags">
                  {p.services.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
          <div className="work__end">
            <p>
              Your brand
              <br />
              <em className="gold-text">could be next.</em>
            </p>
            <a href="/enquiry" className="btn" data-magnetic="">
              <span>Start a project</span>
            </a>
          </div>
        </div>

        <div className="work__progress container" aria-hidden="true">
          <span ref={barRef} />
        </div>
      </div>
    </section>
  );
}
