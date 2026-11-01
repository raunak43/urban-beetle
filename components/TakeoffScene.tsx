"use client";

import { useEffect, useRef } from "react";
import frames from "@/lib/frames-takeoff.json";
import { gsap, ScrollTrigger, isTouch, prefersReducedMotion } from "@/lib/motion";
import { buildLoadOrder } from "@/lib/sequence";

// The closing scene behind "Let's make your brand move.": the gold beetle on its plinth opens its wings
// and takes off toward the camera as you scroll through the section. It's a Google Flow (Veo) clip, cut
// into frames by `npm run frames -- assets/beetle-takeoff.mp4 takeoff`. Frames load only once the
// visitor gets near, and neighbouring frames are cross-faded so the short sequence still scrubs
// smoothly. Like the hero, the scene keeps moving gently when the scroll stops.

// On portrait screens, show this fraction of the video's width instead of a full "cover" crop.
const PORTRAIT_VISIBLE = 0.78;
const BG = "#070707";
const BG_CLEAR = "rgba(7,7,7,0)";
const CONCURRENCY = 4;
const ROCK = 0.025; // idle sway either side of the resting frame, as a share of the clip
const IDLE_AFTER_MS = 260;

export default function TakeoffScene({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const section = canvas.closest("section")!;
    const ctx2d = canvas.getContext("2d", { alpha: false })!;
    const set = window.matchMedia("(max-width: 767px)").matches ? frames.mobile : frames.desktop;
    const count = set.count;
    const url = (i: number) => `${set.path}/${String(i + 1).padStart(4, "0")}.webp?v=${frames.version}`;
    const reduced = prefersReducedMotion();

    // ---------- loading, once the section is near ----------
    const images: HTMLImageElement[] = new Array(count);
    const ready = new Uint8Array(count);
    const { order } = buildLoadOrder(count);
    let cursor = 0;
    let cancelled = false;
    const loadNext = () => {
      if (cancelled || cursor >= order.length) return;
      const idx = order[cursor++];
      const img = new Image();
      img.decoding = "async";
      img.src = url(idx);
      img.decode().then(
        () => done(true),
        () => done(img.complete && img.naturalWidth > 0),
      );
      function done(ok: boolean) {
        if (cancelled) return;
        if (ok) {
          images[idx] = img;
          ready[idx] = 1;
          draw(true);
        }
        loadNext();
      }
    };
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        for (let i = 0; i < CONCURRENCY; i++) loadNext();
      },
      { rootMargin: "200% 0px" },
    );
    near.observe(section);

    // ---------- drawing ----------
    const view = { frame: 0, rock: 0 };
    let cw = 0;
    let ch = 0;
    let drawn = "";

    const nearestLoaded = (i: number) => {
      if (ready[i]) return i;
      for (let d = 1; d < count; d++) {
        if (i - d >= 0 && ready[i - d]) return i - d;
        if (i + d < count && ready[i + d]) return i + d;
      }
      return -1;
    };

    const paint = (img: HTMLImageElement, alpha: number) => {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      let scale = Math.max(cw / iw, ch / ih);
      if (ch > cw * 1.05) scale = Math.min(scale, cw / (iw * PORTRAIT_VISIBLE));
      const dw = iw * scale;
      const dh = ih * scale;
      ctx2d.globalAlpha = alpha;
      ctx2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      return dh;
    };

    // When the frame doesn't fill the screen (phones), melt its top and bottom edges into the page.
    const melt = (dh: number) => {
      if (dh >= ch) return;
      const dy = (ch - dh) / 2;
      const fade = dh * 0.28;
      let g = ctx2d.createLinearGradient(0, dy, 0, dy + fade);
      g.addColorStop(0, BG);
      g.addColorStop(1, BG_CLEAR);
      ctx2d.fillStyle = g;
      ctx2d.fillRect(0, dy - 1, cw, fade + 1);
      g = ctx2d.createLinearGradient(0, dy + dh - fade, 0, dy + dh);
      g.addColorStop(0, BG_CLEAR);
      g.addColorStop(1, BG);
      ctx2d.fillStyle = g;
      ctx2d.fillRect(0, dy + dh - fade, cw, fade + 1);
    };

    function draw(force = false) {
      if (!cw) return;
      let f = view.frame + view.rock;
      if (f < 0) f = -f;
      else if (f > count - 1) f = 2 * (count - 1) - f;
      const i0 = Math.floor(f);
      const i1 = Math.min(count - 1, i0 + 1);
      const mix = Math.round((f - i0) * 16) / 16; // 16 blend steps between frames are plenty
      const base = nearestLoaded(i0);
      if (base < 0) return;
      const key = `${base}:${ready[i1] ? mix : 0}`;
      if (!force && key === drawn) return;
      drawn = key;

      ctx2d.globalAlpha = 1;
      ctx2d.fillStyle = BG;
      ctx2d.fillRect(0, 0, cw, ch);
      const dh = paint(images[base], 1);
      if (mix > 0 && ready[i1] && i1 !== base) paint(images[i1], mix);
      ctx2d.globalAlpha = 1;
      melt(dh);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, isTouch() ? 1.5 : 2);
      cw = canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      ch = canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      draw(true);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ---------- scroll: wings open as the section settles, and it flies at you on the way out ----------
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 40%",
      end: "bottom bottom",
      // Measured after the pinned Capabilities row above, which is created later.
      refreshPriority: -1,
      onUpdate: (self) => {
        view.frame = self.progress * (count - 1);
        draw();
      },
    });

    // ---------- idle sway ----------
    let inView = false;
    let lastY = window.scrollY;
    let lastScroll = 0;
    let amp = 0;
    const sway = (_time: number, dt: number) => {
      if (!inView) return;
      const now = performance.now();
      const y = window.scrollY;
      if (y !== lastY) lastScroll = now;
      lastY = y;
      const still = now - lastScroll > IDLE_AFTER_MS;
      amp += ((still ? count * ROCK : 0) - amp) * (1 - Math.exp(-dt / (still ? 900 : 90)));
      const t = now / 1000;
      view.rock = amp * (0.8 * Math.sin(t * 1.7) + 0.2 * Math.sin(t * 3.9 + 1));
      draw();
    };
    const seen = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting));
    if (!reduced) {
      seen.observe(section);
      gsap.ticker.add(sway);
    }

    return () => {
      cancelled = true;
      near.disconnect();
      seen.disconnect();
      ro.disconnect();
      st.kill();
      gsap.ticker.remove(sway);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
