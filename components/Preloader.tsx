"use client";

import { useEffect, useRef } from "react";
import BeetleMark from "./BeetleMark";
import { gsap, loader } from "@/lib/motion";

const MIN_VISIBLE_MS = 1400;
// Once the intro has played in this browser tab, returning to the home page (e.g. from a service page)
// doesn't hold the preloader for its minimum time; it leaves as soon as the frames and fonts are ready.
const SEEN_KEY = "ub-intro-seen";
const FONT_WAIT_MS = 2500;

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
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
      const pct = Math.round(shown.value * 100);
      countRef.current!.textContent = String(pct).padStart(3, "0");
      fillRef.current!.style.transform = `scaleX(${shown.value})`;
      root.style.setProperty("--fill", `${(1 - shown.value) * 100}%`);
    };

    const chase = (target: number, duration = 0.6) =>
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
        .to(root.querySelectorAll(".preloader__inner > *"), {
          yPercent: -40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power3.in",
        })
        .to(root, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "-=0.15")
        .add(() => {
          document.documentElement.classList.remove("is-loading");
          loader.startIntro();
        }, "-=0.55")
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
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="preloader__inner">
        <div className="preloader__mark">
          <BeetleMark className="preloader__mark-base" />
          <BeetleMark className="preloader__mark-fill" />
        </div>
        <p className="preloader__name">Urban Beetle</p>
        <div className="preloader__meter">
          <div ref={fillRef} className="preloader__bar" />
        </div>
        <p className="preloader__meta">
          <span>Preparing the experience</span>
          <span ref={countRef} className="preloader__count">
            000
          </span>
        </p>
      </div>
    </div>
  );
}
