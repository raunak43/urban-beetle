"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type Dust = { x: number; y: number; size: number; vx: number; vy: number; alpha: number; twinkle: number; phase: number };

// Drifting gold dust. Drawn from a pre-rendered glow sprite so even large counts stay cheap,
// reacts slightly to scroll speed, and pauses whenever it is off screen.
export default function Particles({ className, density = 1 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const still = prefersReducedMotion();

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
    let velocity = 0;

    const seed = () => {
      const area = (w * h) / (dpr * dpr);
      const n = Math.max(18, Math.min(90, Math.round((area / 20000) * density)));
      dust = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: (2 + Math.random() * 7) * dpr,
        vx: (Math.random() - 0.5) * 0.12 * dpr,
        vy: -(0.05 + Math.random() * 0.25) * dpr,
        alpha: 0.15 + Math.random() * 0.55,
        twinkle: 0.4 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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
        ctx.globalAlpha = p.alpha * flicker;
        ctx.drawImage(sprite, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      }
      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      const y = window.scrollY;
      velocity += (y - lastY - velocity) * 0.12;
      lastY = y;
      for (const p of dust) {
        // Bigger motes sit "closer", so they react more to scrolling (cheap parallax).
        p.x += p.vx;
        p.y += p.vy - velocity * 0.02 * p.size;
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
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
