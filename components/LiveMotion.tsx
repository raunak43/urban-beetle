"use client";

import { useEffect, useRef } from "react";
import BeetleMark from "./BeetleMark";
import { gsap, isTouch, prefersReducedMotion, spring } from "@/lib/motion";

// Keeps the home page alive between scrolls: motion builds while you scroll, then carries on (settling,
// swinging or idling) after you stop.
//   Elastic headlines and card text   trail the scroll, then spring back into line with a small bounce
//   [data-swing]                      hangs from its top edge and swings as the row slides, like a sign
//   [data-tilt]                       tilts toward the pointer and wobbles back when it leaves
//   [data-lean="16"]                  drifts toward the pointer by up to that many pixels (negative: away)
//   [data-spin]                       spins up while you scroll and coasts back to its own pace
// plus the gold beetle walking along the scroll-progress line and the slow aurora behind the page.
// The pointer and spring effects are for mice only: touch screens scroll on their own thread, where
// script-driven offsets land a frame late and judder.

const ELASTIC = [
  ".section-title .sw",
  ".cta__title .sw",
  ".stack__word, .stack__line, .stack__body",
  ".bento__cell > *",
  ".traits li",
  ".faq__item",
].join(",");

// How far an element trails the scroll. Later words and lines trail more, and so do cards further to
// the right, so a headline ripples like a ribbon and a row of cards like a wave.
function weightOf(el: HTMLElement) {
  const group = el.closest(".section-title, .cta__title, .stack__card, .bento__cell, .traits, .faq__list");
  const i = group ? Array.from(group.querySelectorAll(ELASTIC)).indexOf(el) : 0;
  const card = el.closest(".bento__cell");
  const column = card?.parentElement ? Array.from(card.parentElement.children).indexOf(card) % 3 : 0;
  return Math.min(2, 0.6 + 0.14 * i + 0.3 * column);
}

export default function LiveMotion() {
  const auroraRef = useRef<HTMLDivElement>(null);
  const riderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const aurora = auroraRef.current!;
    const rider = riderRef.current!;
    const mouse = !isTouch();

    // ---------- scroll speed ----------
    let lastY = window.scrollY;
    let velocity = 0; // px per second, positive while scrolling down
    let lastMove = 0;
    let maxScroll = 1;
    let width = window.innerWidth;
    const measure = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      width = window.innerWidth;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    // ---------- elastic text ----------
    const bodies = (mouse ? gsap.utils.toArray<HTMLElement>(ELASTIC) : []).map((el) => {
      const weight = weightOf(el);
      // Heavier elements are also slower springs, so they fall out of step with the lighter ones.
      return { el, weight, s: spring(2.3 / Math.sqrt(weight), 0.3), on: false, shown: 0 };
    });
    const byEl = new Map(bodies.map((b) => [b.el as Element, b]));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const b = byEl.get(entry.target);
          if (b) b.on = entry.isIntersecting;
        }
      },
      { rootMargin: "20% 0px" },
    );
    bodies.forEach((b) => io.observe(b.el));

    // ---------- swinging cards ----------
    // They swing with the row's own movement (the pinned Capabilities row), not the page's.
    const row = document.querySelector<HTMLElement>("[data-hscroll]");
    const track = row?.querySelector<HTMLElement>(".hs__track");
    const swings = (mouse ? gsap.utils.toArray<HTMLElement>("[data-swing]") : []).map((el, i) => ({
      el,
      s: spring(0.95 + (i % 3) * 0.08, 0.16),
      shown: 0,
    }));
    let trackX = 0;
    let trackV = 0;

    // ---------- pointer: tilt and lean ----------
    const leaners = (mouse ? gsap.utils.toArray<HTMLElement>("[data-lean]") : []).map((el) => ({
      el,
      depth: parseFloat(el.dataset.lean || "12"),
    }));
    let px = 0;
    let py = 0;
    let lx = 0;
    let ly = 0;
    let tilted: HTMLElement | null = null;
    const untilt = (el: HTMLElement) =>
      gsap.to(el, { rotationX: 0, rotationY: 0, duration: 1.6, ease: "elastic.out(1, 0.35)", overwrite: "auto" });

    const onPointer = (e: PointerEvent) => {
      px = (e.clientX / width) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
      const card = (e.target as Element).closest<HTMLElement>("[data-tilt]");
      if (card !== tilted) {
        if (tilted) untilt(tilted);
        tilted = card;
      }
      if (!card) return;
      const r = card.getBoundingClientRect();
      gsap.to(card, {
        rotationY: ((e.clientX - r.left) / r.width - 0.5) * 12,
        rotationX: -((e.clientY - r.top) / r.height - 0.5) * 9,
        transformPerspective: 1000,
        duration: 0.7,
        ease: "power3.out",
        overwrite: "auto",
      });
    };
    const onLeave = () => {
      px = py = 0;
      if (tilted) untilt(tilted);
      tilted = null;
    };
    if (mouse) {
      document.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    // ---------- spinners ----------
    const spinners = gsap.utils.toArray<HTMLElement>("[data-spin]").map((el) => ({ el, angle: 0 }));
    let spinSpeed = 0; // degrees per second on top of the element's own spin

    // ---------- the beetle on the progress line ----------
    const facing = spring(1.1, 0.5);
    facing.x = 90;
    let heading = 90; // 90 faces right (scrolling down), -90 faces left
    let gait = 0;
    let idle = 0;
    let glow = 0;

    const tick = (time: number, dt: number) => {
      const now = time * 1000;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (dy !== 0) lastMove = now;
      velocity += ((dt > 0 ? (dy / dt) * 1000 : 0) - velocity) * Math.min(1, dt / 50);
      const progress = Math.min(1, Math.max(0, y / maxScroll));
      const ease = (ms: number) => 1 - Math.exp(-dt / ms);

      // Elastic text.
      const pull = gsap.utils.clamp(-30, 30, velocity * 0.013);
      for (const b of bodies) {
        if (!b.on) {
          if (b.shown) {
            b.s.x = b.s.v = b.shown = 0;
            b.el.style.translate = "";
          }
          continue;
        }
        const x = b.s.step(pull * b.weight, dt);
        if (Math.abs(x - b.shown) > 0.05) {
          b.shown = x;
          b.el.style.translate = `0 ${x.toFixed(2)}px`;
        } else if (b.shown && b.s.resting) {
          b.shown = 0;
          b.el.style.translate = "";
        }
      }

      // Swinging cards: a pinned row leans its cards back against the direction it slides.
      if (track && swings.length) {
        const x = row!.classList.contains("is-pinned") ? (gsap.getProperty(track, "x") as number) : 0;
        trackV += ((dt > 0 ? ((x - trackX) / dt) * 1000 : 0) - trackV) * Math.min(1, dt / 40);
        trackX = x;
        const lean = gsap.utils.clamp(-4, 4, trackV * 0.003);
        for (const c of swings) {
          const angle = c.s.step(lean, dt);
          if (Math.abs(angle - c.shown) > 0.01) {
            c.shown = angle;
            c.el.style.rotate = `${angle.toFixed(2)}deg`;
          }
        }
      }

      // Pointer lean.
      if (leaners.length && (Math.abs(px - lx) > 0.0005 || Math.abs(py - ly) > 0.0005)) {
        lx += (px - lx) * ease(450);
        ly += (py - ly) * ease(450);
        for (const l of leaners) l.el.style.translate = `${(lx * l.depth).toFixed(2)}px ${(ly * l.depth).toFixed(2)}px`;
      }

      // Spinners speed up with the scroll and coast back down.
      spinSpeed += (Math.min(Math.abs(velocity) * 0.12, 360) - spinSpeed) * ease(700);
      if (spinSpeed > 0.05) {
        for (const s of spinners) {
          s.angle = (s.angle + (spinSpeed * dt) / 1000) % 360;
          s.el.style.rotate = `${s.angle.toFixed(2)}deg`;
        }
      }

      // The beetle walks along the progress line, facing the way you scroll, legs scuttling with its speed.
      // Left alone, it breathes and looks around now and then.
      if (Math.abs(velocity) > 40) heading = velocity > 0 ? 90 : -90;
      const turn = facing.step(heading, dt);
      gait += Math.abs(dy) * 0.3;
      const scuttle = Math.sin(gait) * Math.min(Math.abs(velocity) * 0.004, 9);
      idle += ((now - lastMove > 900 ? 1 : 0) - idle) * ease(500);
      const t = now / 1000;
      const look = 24 * Math.sin(t * 2.2) * Math.max(0, Math.sin(t * 0.45)) ** 4 * idle;
      const breathe = 1 + 0.07 * (0.5 + 0.5 * Math.sin(t * 2.6)) * idle;
      const x = 3 + progress * (width - 22);
      rider.style.transform = `translate3d(${x.toFixed(1)}px,0,0) rotate(${(turn + scuttle + look).toFixed(2)}deg) scale(${breathe.toFixed(3)})`;

      // The aurora drifts up as you go down the page and brightens a little while you scroll.
      glow += (Math.min(Math.abs(velocity) / 2500, 1) - glow) * ease(400);
      aurora.style.transform = `translate3d(0, ${((0.5 - progress) * 20).toFixed(2)}vh, 0)`;
      aurora.style.opacity = (0.8 + 0.2 * glow).toFixed(3);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={auroraRef} className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div ref={riderRef} className="rider" aria-hidden="true">
        <BeetleMark className="rider__mark" />
      </div>
    </>
  );
}
