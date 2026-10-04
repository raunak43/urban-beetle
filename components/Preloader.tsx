"use client";

import { useEffect, useRef } from "react";
import BeetleMark from "./BeetleMark";
import { gsap, loader } from "@/lib/motion";

const MIN_VISIBLE_MS = 1400;

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    // Scrolling stays locked while the preloader is up (only pages with a preloader get this).
    document.documentElement.classList.add("is-loading");
    const started = performance.now();
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

    const leave = () => {
      if (leaving) return;
      leaving = true;
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - started)) / 1000;
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
