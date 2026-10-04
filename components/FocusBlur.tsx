"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";

// Soft blur bands along the top and bottom of the screen so only the middle reads sharp, like a
// camera's focus plane. Off during the cinematic hero (its text sits at the screen edges), and the
// bottom band clears at the very end of the page.
export default function FocusBlur() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current!;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ".hero",
        start: "bottom bottom",
        end: "max",
        onToggle: (self) => root.classList.toggle("is-on", self.isActive),
      });
      ScrollTrigger.create({
        trigger: ".footer__bottom",
        start: "top bottom",
        end: "max",
        onToggle: (self) => root.classList.toggle("is-end", self.isActive),
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="focus-blur" aria-hidden="true">
      <span className="focus-blur__top" />
      <span className="focus-blur__bottom" />
    </div>
  );
}
