"use client";

import { useEffect, useRef } from "react";
import { isTouch, prefersReducedMotion } from "@/lib/motion";

type Dust = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  dx: number;
  dy: number;
  alpha: number;
  twinkle: number;
  phase: number;
};

// Drifting gold dust. Drawn from a pre-rendered glow sprite so even large counts stay cheap, and
// paused whenever it is off screen. It's alive even when nothing else moves: motes wander like
// fireflies, a mouse stirs them into eddies, and scrolling sweeps them along, stretched into streaks
// by the speed, before they coast back to a drift.
export default function Particles({ className, density = 1 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const still = prefersReducedMotion();
    // Phones draw fewer, lower-resolution motes to keep scrolling smooth.
    const touch = isTouch();
    const amount = touch ? density * 0.55 : density;

    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext("2d")!;
    const glow = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, "rgba(255, 228, 160, 1)");
    glow.addColorStop(0.18, "rgba(230, 186, 96, 0.85)");
    glow.addColorStop(0.5, "rgba(201, 150, 60, 0.18)");
    glow.addColorStop(1, "rgba(201, 150, 60, 0)");
    sctx.fillStyle = glow;
    sctx.fillRect(0, 0, 64, 64);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let dust: Dust[] = [];
    let raf = 0;
    let visible = false;
    let lastY = window.scrollY;
    let lastT = 0;
    let velocity = 0; // scroll, in px per 60fps frame

    // The pointer, in viewport pixels, and how fast it is moving.
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, active: false };
    const onPointer = (e: PointerEvent) => {
      if (pointer.active) {
        pointer.vx += (e.clientX - pointer.x - pointer.vx) * 0.5;
        pointer.vy += (e.clientY - pointer.y - pointer.vy) * 0.5;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    if (!touch && !still) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    const seed = () => {
      const area = (w * h) / (dpr * dpr);
      const n = Math.max(12, Math.min(90, Math.round((area / 20000) * amount)));
      dust = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: (2 + Math.random() * 7) * dpr,
        vx: (Math.random() - 0.5) * 0.12 * dpr,
        vy: -(0.05 + Math.random() * 0.25) * dpr,
        dx: 0,
        dy: 0,
        alpha: 0.15 + Math.random() * 0.55,
        twinkle: 0.4 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = Math.max(1, Math.round(rect.width * dpr));
      h = canvas.height = Math.max(1, Math.round(rect.height * dpr));
      seed();
      if (still) draw(0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of dust) {
        const flicker = 0.55 + 0.45 * Math.sin(t * 0.001 * p.twinkle + p.phase);
        // Motes "closer" to the camera (bigger) streak more at speed.
        const stretch = 1 + Math.min(Math.abs(velocity) * 0.012 * (p.size / dpr), 5);
        ctx.globalAlpha = (p.alpha * flicker) / Math.sqrt(stretch);
        ctx.drawImage(sprite, p.x - p.size, p.y - p.size * stretch, p.size * 2, p.size * 2 * stretch);
      }
      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      const k = lastT ? Math.min((t - lastT) / 16.67, 3) : 1; // 1 at 60fps
      lastT = t;
      const y = window.scrollY;
      // Slow to follow, so the dust carries on for a moment after the scroll stops.
      velocity += ((y - lastY) / k - velocity) * 0.06 * k;
      lastY = y;

      let stir: { x: number; y: number; vx: number; vy: number; r: number } | null = null;
      if (pointer.active) {
        const rect = canvas.getBoundingClientRect();
        stir = {
          x: (pointer.x - rect.left) * dpr,
          y: (pointer.y - rect.top) * dpr,
          vx: pointer.vx * dpr,
          vy: pointer.vy * dpr,
          r: 170 * dpr,
        };
        pointer.vx *= 0.9;
        pointer.vy *= 0.9;
      }

      const friction = Math.pow(0.95, k);
      for (const p of dust) {
        if (stir) {
          const ox = p.x - stir.x;
          const oy = p.y - stir.y;
          const d2 = ox * ox + oy * oy;
          if (d2 < stir.r * stir.r) {
            const d = Math.sqrt(d2) || 1;
            const f = 1 - d / stir.r;
            // Pushed gently away, swirled round the pointer, and dragged along in its wake.
            p.dx += ((ox / d) * 0.35 - (oy / d) * 0.25) * f * dpr + stir.vx * f * 0.04;
            p.dy += ((oy / d) * 0.35 + (ox / d) * 0.25) * f * dpr + stir.vy * f * 0.04;
          }
        }
        p.dx *= friction;
        p.dy *= friction;
        // Bigger motes sit "closer", so they react more to scrolling (cheap parallax).
        const wander = Math.sin(t * 0.0005 * p.twinkle + p.phase) * 0.12 * dpr;
        p.x += (p.vx + wander + p.dx) * k;
        p.y += (p.vy + p.dy - velocity * 0.02 * p.size) * k;
        if (p.y < -p.size) p.y = h + p.size;
        else if (p.y > h + p.size) p.y = -p.size;
        if (p.x < -p.size) p.x = w + p.size;
        else if (p.x > w + p.size) p.x = -p.size;
      }
      draw(t);
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !still) {
        lastY = window.scrollY;
        lastT = 0;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [density]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
