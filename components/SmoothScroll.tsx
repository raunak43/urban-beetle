"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, setLenis, prefersReducedMotion, scrollToTarget, loader } from "@/lib/motion";

export default function SmoothScroll() {
  useEffect(() => {
    // The hero story only makes sense from the top, so don't restore a mid-page position on reload.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    // Touch devices keep native momentum scrolling (it already feels right and is cheaper);
    // ScrollTrigger scrub smoothing takes care of the animations there.
    ScrollTrigger.config({ ignoreMobileResize: true });

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    if (!prefersReducedMotion()) {
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
