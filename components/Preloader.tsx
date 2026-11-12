"use client";

import { useEffect, useRef } from "react";
import { gsap, loader } from "@/lib/motion";

const MIN_VISIBLE_MS = 1700;
// Once the intro has played in this browser tab, returning to the home page (e.g. from a service page)
// doesn't hold the preloader for its minimum time; it leaves as soon as the page and fonts are ready.
const SEEN_KEY = "ub-intro-seen";
const FONT_WAIT_MS = 2500;
// One word per third of the count.
const WORDS = ["Strategy", "Creativity", "Technology"];

// The opening screen: a sheet of paper with a giant count and the three pillars turning over. When
// the count reaches 100 the sheet lifts away, and the gold dust behind it bursts out of the logo.
export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const words = Array.from(root.querySelectorAll<HTMLElement>(".preloader__word"));
    // Scrolling stays locked while the preloader is up (only pages with a preloader get this).
    document.documentElement.classList.add("is-loading");
    const started = performance.now();
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    const minVisible = seen ? 0 : MIN_VISIBLE_MS;
    const shown = { value: 0 };
    let leaving = false;

    const render = () => {
      countRef.current!.textContent = String(Math.round(shown.value * 100));
      barRef.current!.style.transform = `scaleX(${shown.value})`;
      const active = Math.min(WORDS.length - 1, Math.floor(shown.value * WORDS.length));
      words.forEach((w, i) => {
        w.classList.toggle("is-on", i === active);
        w.classList.toggle("is-past", i < active);
      });
    };
    render();

    const chase = (target: number, duration = 1.3) =>
      gsap.to(shown, { value: target, duration, ease: "power2.out", overwrite: true, onUpdate: render });

    let cancelled = false;
    const leave = async () => {
      if (leaving) return;
      leaving = true;
      // Let the web fonts land while the preloader still covers the page: a font swap after the
      // reveal re-flows text, and Safari (no scroll anchoring) shows that as the page jumping.
      await Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS)),
      ]);
      if (cancelled) return;
      const wait = Math.max(0, minVisible - (performance.now() - started)) / 1000;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      gsap
        .timeline({ delay: wait })
        .add(chase(1, 0.5))
        .to(root.querySelectorAll(".preloader__top, .preloader__words, .preloader__count"), {
          yPercent: -30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.in",
        })
        // The sheet lifts off the page.
        .to(root, { yPercent: -105, duration: 1.1, ease: "expo.inOut" }, "-=0.15")
        .add(() => {
          document.documentElement.classList.remove("is-loading");
          loader.startIntro();
        }, "-=0.6")
        .set(root, { display: "none" });
    };

    const offProgress = loader.onProgress(() => chase(loader.progress * 0.95));
    const offReady = loader.onReady(leave);
    return () => {
      cancelled = true;
      offProgress();
      offReady();
    };
  }, []);

  return (
    <div ref={rootRef} className="preloader" data-surface="paper" aria-hidden="true">
      <p className="preloader__top">
        <span>Urban Beetle</span>
        <span>Creative marketing agency</span>
      </p>
      <p className="preloader__words">
        {WORDS.map((word, i) => (
          <span key={word} className={i === 0 ? "preloader__word is-on" : "preloader__word"}>
            {word}
          </span>
        ))}
      </p>
      <p className="preloader__count">
        <span ref={countRef}>0</span>
        <small>%</small>
      </p>
      <div ref={barRef} className="preloader__bar" />
    </div>
  );
}
