"use client";

import { useEffect, useRef } from "react";
import { createDust } from "@/lib/dust";
import { ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

// The closing scene behind "Let's make your brand move.": gold dust gathers into the logo as the
// section arrives, and is thrown outward as you scroll on through it, so the page ends the way the
// hero began.

const BURST_AT = 0.7; // share of the section's scroll at which the logo flies apart

export default function DustScene({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const dust = createDust(canvas, {
      count: window.matchMedia("(max-width: 767px)").matches ? 3200 : 6000,
      still: prefersReducedMotion(),
      shapes: [{ image: "/brand/logo-mask.webp", height: 0.72 }],
    });

    let last = 0;
    const st = ScrollTrigger.create({
      trigger: canvas.closest("section"),
      start: "top 70%",
      end: "bottom bottom",
      // Measured after the pinned Capabilities row above, which is created later.
      refreshPriority: -1,
      onUpdate: (self) => {
        const p = self.progress;
        dust.set(0, p < BURST_AT ? Math.min(1, p / 0.25) : 0);
        if (last < BURST_AT && p >= BURST_AT) dust.burst();
        last = p;
      },
    });

    return () => {
      st.kill();
      dust.destroy();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
