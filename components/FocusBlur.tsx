"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";

// A soft blur band along the top of the screen, like a camera's focus falling off. Off during the
// cinematic hero, where its text sits at the top of the screen.
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
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="focus-blur" aria-hidden="true">
      <span className="focus-blur__top" />
    </div>
  );
}
