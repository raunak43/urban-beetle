"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, setLenis, prefersReducedMotion, isTouch, scrollToTarget, loader } from "@/lib/motion";

export default function SmoothScroll() {
  useEffect(() => {
    // The hero story only makes sense from the top, so don't restore a mid-page position on reload.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    // Every re-measure briefly resets the scroll position. On phones that can nudge the page (Safari's
    // toolbar reacts to it), so phones only re-measure on real resizes such as rotating the device,
    // never on the late "load" event or when returning to the tab. The address bar showing/hiding is
    // ignored too.
    ScrollTrigger.config({
      ignoreMobileResize: true,
      ...(isTouch() && { autoRefreshEvents: "DOMContentLoaded,resize" }),
    });

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    // Only mice and trackpads get Lenis. Phones and tablets keep native scrolling: it is smoother
    // there, and a JS scroller can fight the finger (e.g. during an animated jump), causing judder.
    if (!prefersReducedMotion() && !isTouch()) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // Scrolling stays locked while the preloader is on screen.
    lenis?.stop();
    const offIntro = loader.onIntro(() => lenis?.start());

    // In-page anchor links glide instead of jumping.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href")!;
      if (hash === "#") return;
      const target = hash === "#top" ? 0 : document.querySelector<HTMLElement>(hash);
      if (target === null) return;
      e.preventDefault();
      scrollToTarget(target);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      offIntro();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
