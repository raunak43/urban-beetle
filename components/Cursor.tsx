"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

const INTERACTIVE = "a, button, [data-cursor-label], input, textarea, select, label";

// Gold dot + trailing ring with contextual labels, and magnetic pull on [data-magnetic] elements.
// Only on devices with a precise pointer; touch screens keep their normal behaviour.
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3" });
    const magnetic = !prefersReducedMotion();
    let pulled: HTMLElement | null = null;

    const release = () => {
      if (!pulled) return;
      gsap.to(pulled, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.4)" });
      pulled = null;
    };

    const onMove = (e: PointerEvent) => {
      root.classList.add("cursor-visible");
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      const target = e.target as HTMLElement;
      const hit = target.closest<HTMLElement>(INTERACTIVE);
      const text = target.closest<HTMLElement>("[data-cursor-label]")?.dataset.cursorLabel ?? "";
      ring.classList.toggle("is-hover", !!hit);
      ring.classList.toggle("is-label", !!text);
      if (label.textContent !== text) label.textContent = text;

      const mag = magnetic ? target.closest<HTMLElement>("[data-magnetic]") : null;
      if (mag !== pulled) release();
      if (mag) {
        pulled = mag;
        const r = mag.getBoundingClientRect();
        const strength = parseFloat(mag.dataset.magnetic || "0.35");
        gsap.to(mag, {
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
          duration: 0.6,
          ease: "power3.out",
        });
      }
    };
    const onLeave = () => {
      root.classList.remove("cursor-visible");
      release();
    };
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      root.classList.remove("has-cursor", "cursor-visible");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ringRef} className="cursor__ring">
        <span ref={labelRef} className="cursor__label" />
      </div>
      <div ref={dotRef} className="cursor__dot" />
    </div>
  );
}
