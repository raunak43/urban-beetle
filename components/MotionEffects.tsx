"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, isTouch, loader, prefersReducedMotion, scrollToTarget } from "@/lib/motion";

// Wires up the declarative animation attributes used throughout the page:
//   data-reveal / data-reveal="stagger"   fade + rise when scrolled into view
//   data-split                            word-by-word masked reveal (words from <Words>)
//   data-scrub-words                      words brighten as the reader scrolls through
//   data-parallax="0.15"                  drifts against the scroll
//   data-clip                             wipes open from the bottom
//   data-hscroll                          a horizontal row (Capabilities): pinned and scrolled sideways on desktop
// plus the top scroll-progress line and the pointer glow on .glow-card elements.
export default function MotionEffects() {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      const all = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);

      gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

      // Horizontal rows. Swiped natively by default; with a mouse and full motion, the row is pinned
      // while the page scrolls and slides sideways instead. The thin line under it shows how far along it is.
      all("[data-hscroll]").forEach((row) => {
        const track = row.querySelector<HTMLElement>(".hs__track")!;
        const bar = row.querySelector<HTMLElement>(".hs__progress i");
        const show = (progress: number) => bar && gsap.set(bar, { scaleX: progress });

        const onSwipe = () => {
          const room = track.scrollWidth - track.clientWidth;
          show(room > 0 ? track.scrollLeft / room : 1);
        };
        track.addEventListener("scroll", onSwipe, { passive: true });
        onSwipe();
        cleanups.push(() => track.removeEventListener("scroll", onSwipe));

        const mm = gsap.matchMedia();
        mm.add("(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
          row.classList.add("is-pinned");
          const distance = () => Math.max(0, track.scrollWidth - row.clientWidth);
          const slide = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "center center",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (st) => show(st.progress),
            },
          });
          show(0);

          // Tabbing to a card that's off to the side scrolls the page to where that card is in view.
          const onFocus = (e: FocusEvent) => {
            const item = (e.target as HTMLElement).closest<HTMLElement>(".hs__item");
            const st = slide.scrollTrigger;
            if (!item || !st) return;
            const offset = Math.min(distance(), Math.max(0, item.offsetLeft + item.offsetWidth - row.clientWidth + 40));
            const shown = -gsap.getProperty(track, "x") as number;
            if (item.offsetLeft < shown || item.offsetLeft + item.offsetWidth > shown + row.clientWidth)
              scrollToTarget(st.start + offset);
          };
          track.addEventListener("focusin", onFocus);

          return () => {
            track.removeEventListener("focusin", onFocus);
            row.classList.remove("is-pinned");
          };
        });
        cleanups.push(() => mm.revert());
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
          yPercent: 140, // starts fully below its mask, which reaches under the line for descenders
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
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return null;
}
