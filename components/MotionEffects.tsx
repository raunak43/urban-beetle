"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, isTouch, loader, prefersReducedMotion } from "@/lib/motion";

// Wires up the declarative animation attributes used throughout the page:
//   data-reveal / data-reveal="stagger"   fade + rise when scrolled into view
//   data-split                            word-by-word masked reveal (words from <Words>)
//   data-scrub-words                      words brighten as the reader scrolls through
//   data-parallax="0.15"                  drifts against the scroll
//   data-clip                             wipes open from the bottom
//   data-count="120"                      number counts up once visible
// plus the top scroll-progress line and the pointer glow on .glow-card elements.
export default function MotionEffects() {
  useEffect(() => {
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const all = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);

      gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

      if (reduced) return;

      all("[data-reveal]").forEach((el) => {
        const targets = el.dataset.reveal === "stagger" ? Array.from(el.children) : el;
        gsap.from(targets, {
          y: 70,
          autoAlpha: 0,
          duration: 1.4,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      all("[data-split]").forEach((el) => {
        gsap.from(el.querySelectorAll(".sw > span"), {
          yPercent: 115,
          rotate: 4,
          duration: 1.3,
          stagger: 0.04,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      all("[data-scrub-words]").forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll(".sw"),
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: true },
          },
        );
      });

      // Parallax is desktop-only: on touch screens the browser scrolls on its own thread, so
      // script-driven offsets land a frame late and the images visibly wobble.
      if (!isTouch()) all("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.15");
        gsap.fromTo(
          el,
          { yPercent: -speed * 100 },
          {
            yPercent: speed * 100,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      all("[data-clip]").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.6,
            ease: "expo.inOut",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      });
    });

    // Counters run even with reduced motion (they just jump straight to the value).
    const counters = gsap.utils.toArray<HTMLElement>("[data-count]").map((el) => {
      const target = parseFloat(el.dataset.count || "0");
      const obj = { v: 0 };
      el.textContent = reduced ? String(target) : "0";
      return ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          if (reduced) return;
          gsap.to(obj, {
            v: target,
            duration: 2.2,
            ease: "power3.out",
            onUpdate: () => (el.textContent = String(Math.round(obj.v))),
          });
        },
      });
    });

    // Gold light that follows the pointer across cards.
    const onPointer = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".glow-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onPointer, { passive: true });

    // Web fonts change text metrics, so re-measure every trigger once they are in. The "safe" refresh
    // waits until the visitor stops scrolling: a forced one briefly resets the scroll position, which
    // cuts off momentum scrolling on phones and reads as the page jumping.
    // On phones, only while the preloader still covers the page; afterwards the reset could be seen.
    document.fonts?.ready.then(() => {
      if (!isTouch() || !loader.introStarted) ScrollTrigger.refresh(true);
    });

    return () => {
      document.removeEventListener("pointermove", onPointer);
      counters.forEach((st) => st.kill());
      ctx.revert();
    };
  }, []);

  return null;
}
