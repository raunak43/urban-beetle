"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

let lenis: Lenis | null = null;
export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};
export const getLenis = () => lenis;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

// A damped spring for motion that keeps going after the scroll stops: it chases a target, overshoots
// and settles. `frequency` is how many swings per second; `damping` below 1 lets it bounce (0.1 swings
// for a long time, 0.5 barely overshoots). Call step() once per frame with the frame time in ms.
export function spring(frequency: number, damping: number) {
  const omega = 2 * Math.PI * frequency;
  const s = {
    x: 0,
    v: 0,
    step(target: number, dtMs: number) {
      const dt = Math.min(dtMs, 34) / 1000;
      s.v += (omega * omega * (target - s.x) - 2 * damping * omega * s.v) * dt;
      s.x += s.v * dt;
      return s.x;
    },
    get resting() {
      return Math.abs(s.x) < 0.01 && Math.abs(s.v) < 0.01;
    },
  };
  return s;
}

export function scrollToTarget(target: string | HTMLElement | number) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }
}

// Shared loading state: the hero reports frame-loading progress, the preloader shows it,
// and once the preloader leaves it fires "intro" so time-based entrance animations can start.
type Listener = () => void;
const state = { progress: 0, ready: false, intro: false };
const progressListeners = new Set<Listener>();
const readyListeners = new Set<Listener>();
const introListeners = new Set<Listener>();

export const loader = {
  get progress() {
    return state.progress;
  },
  get ready() {
    return state.ready;
  },
  get introStarted() {
    return state.intro;
  },
  setProgress(value: number) {
    state.progress = Math.max(state.progress, Math.min(1, value));
    progressListeners.forEach((fn) => fn());
  },
  setReady() {
    if (state.ready) return;
    state.ready = true;
    state.progress = 1;
    progressListeners.forEach((fn) => fn());
    readyListeners.forEach((fn) => fn());
  },
  startIntro() {
    if (state.intro) return;
    state.intro = true;
    introListeners.forEach((fn) => fn());
  },
  onProgress(fn: Listener) {
    progressListeners.add(fn);
    return () => progressListeners.delete(fn);
  },
  onReady(fn: Listener) {
    if (state.ready) fn();
    readyListeners.add(fn);
    return () => readyListeners.delete(fn);
  },
  onIntro(fn: Listener) {
    if (state.intro) {
      fn();
      return () => {};
    }
    introListeners.add(fn);
    return () => introListeners.delete(fn);
  },
};
