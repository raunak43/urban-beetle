"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

// Endless ticker that speeds up with scroll velocity and follows the scroll direction.
export default function Marquee({
  items,
  speed = 0.035,
  reverse = false,
  className = "",
}: {
  items: string[];
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = rootRef.current!;
    const track = trackRef.current!;
    let x = 0;
    let dir = reverse ? 1 : -1;
    let boost = 0;
    let lastY = window.scrollY;
    let visible = false;

    const tick = (_t: number, dt: number) => {
      if (!visible) return;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (Math.abs(delta) > 0.5) dir = (delta > 0 ? -1 : 1) * (reverse ? -1 : 1);
      boost += (Math.min(Math.abs(delta) * 0.02, 0.6) - boost) * 0.08;
      // One copy of the items is exactly half the track, so wrapping at -50% is seamless.
      x += dir * (speed + boost) * (dt / 16.67);
      if (x <= -50) x += 50;
      else if (x > 0) x -= 50;
      track.style.transform = `translate3d(${x}%,0,0)`;
    };
    gsap.ticker.add(tick);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      lastY = window.scrollY;
    });
    io.observe(root);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [reverse, speed]);

  // Items are doubled inside each copy so one copy is always wider than the screen.
  const row = (copy: number) =>
    [...items, ...items].map((item, i) => (
      <span key={`${copy}-${i}`} className="marquee__item" aria-hidden={copy > 0 || i >= items.length || undefined}>
        {item}
        <span className="marquee__sep" aria-hidden="true">
          +
        </span>
      </span>
    ));

  return (
    <div ref={rootRef} className={`marquee ${className}`}>
      <div ref={trackRef} className="marquee__track">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
