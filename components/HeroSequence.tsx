"use client";

import { useEffect, useRef } from "react";
import frames from "@/lib/frames.json";
import BeetleMark from "./BeetleMark";
import Particles from "./Particles";
import { gsap, loader, isTouch, prefersReducedMotion } from "@/lib/motion";

// Share of the hero's scroll distance spent playing the video; the rest holds on the landed beetle.
const FRAME_END = 0.9;
// On portrait screens, show this fraction of the video's width instead of a full "cover" crop,
// so the beetle and its wings stay in frame. Text sits in the space above and below.
const PORTRAIT_VISIBLE = 0.56;
const BG = "#070707";
const BG_CLEAR = "rgba(7,7,7,0)";
const CONCURRENCY = 6;
const FAILSAFE_MS = 12000;

const CHAPTERS: [number, string][] = [
  [0, "Intro"],
  [0.1, "Origin"],
  [0.3, "Take-off"],
  [0.41, "The City"],
  [0.72, "Arrival"],
];

// Load order for progressive quality: a coarse pass across the whole video first (so scrubbing works
// almost immediately), then fill the gaps. The coarse pass is what the preloader waits for.
function buildLoadOrder(count: number) {
  const order: number[] = [];
  const seen = new Uint8Array(count);
  const push = (i: number) => {
    if (!seen[i]) {
      seen[i] = 1;
      order.push(i);
    }
  };
  push(0);
  push(count - 1);
  let critical = 0;
  for (const stride of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < count; i += stride) push(i);
    if (stride === 8) critical = order.length;
  }
  return { order, critical };
}

const Chars = ({ text }: { text: string }) => (
  <span className="split-chars" aria-hidden="true">
    {Array.from(text).map((c, i) => (
      <span key={i} className="ch">
        {c === " " ? " " : c}
      </span>
    ))}
  </span>
);

export default function HeroSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    const ctx2d = canvas.getContext("2d", { alpha: false })!;
    const set = window.matchMedia("(max-width: 767px)").matches ? frames.mobile : frames.desktop;
    const count = set.count;
    const url = (i: number) => `${set.path}/${String(i + 1).padStart(4, "0")}.webp?v=${frames.version}`;

    // ---------- frame loading ----------
    const images: HTMLImageElement[] = new Array(count);
    const ready = new Uint8Array(count);
    const { order, critical } = buildLoadOrder(count);
    let cursor = 0;
    let criticalDone = 0;
    let cancelled = false;

    const loadNext = () => {
      if (cancelled || cursor >= order.length) return;
      const idx = order[cursor];
      const isCritical = cursor < critical;
      cursor++;
      const img = new Image();
      img.decoding = "async";
      img.src = url(idx);
      const done = (ok: boolean) => {
        if (cancelled) return;
        if (ok) {
          images[idx] = img;
          ready[idx] = 1;
          draw();
        }
        if (isCritical) {
          criticalDone++;
          loader.setProgress(criticalDone / critical);
          if (criticalDone === critical) loader.setReady();
        }
        loadNext();
      };
      img.decode().then(
        () => done(true),
        () => done(img.complete && img.naturalWidth > 0),
      );
    };
    for (let i = 0; i < CONCURRENCY; i++) loadNext();
    const failsafe = window.setTimeout(() => loader.setReady(), FAILSAFE_MS);

    // ---------- drawing ----------
    const view = { frame: 0, zoom: 1 };
    let cw = 0;
    let ch = 0;
    let lastIdx = -1;
    let lastZoom = 0;

    const nearestLoaded = (i: number) => {
      if (ready[i]) return i;
      for (let d = 1; d < count; d++) {
        if (i - d >= 0 && ready[i - d]) return i - d;
        if (i + d < count && ready[i + d]) return i + d;
      }
      return -1;
    };

    function draw(force = false) {
      const idx = nearestLoaded(Math.min(count - 1, Math.max(0, Math.round(view.frame))));
      if (idx < 0 || !cw) return;
      if (!force && idx === lastIdx && view.zoom === lastZoom) return;
      lastIdx = idx;
      lastZoom = view.zoom;

      const img = images[idx];
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      let scale = Math.max(cw / iw, ch / ih);
      if (ch > cw * 1.05) scale = Math.min(scale, cw / (iw * PORTRAIT_VISIBLE));
      scale *= view.zoom;
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx2d.fillStyle = BG;
      ctx2d.fillRect(0, 0, cw, ch);
      ctx2d.drawImage(img, dx, dy, dw, dh);

      // When the frame doesn't fill the screen (phones), melt its top and bottom edges into the page.
      if (dh < ch) {
        const fade = dh * 0.24;
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
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      cw = canvas.width = Math.max(1, Math.round(rect.width * dpr));
      ch = canvas.height = Math.max(1, Math.round(rect.height * dpr));
      draw(true);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ---------- animation ----------
    const reduced = prefersReducedMotion();
    let chapter = -1;

    const gctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      // Time-based entrance once the preloader lifts: the logo rises out of a mask, then the wordmark follows.
      const intro = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .fromTo(
          q(".hero-intro__mark"),
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" },
          0,
        )
        .from(q(".hero-intro__logo"), { scale: 0.82, yPercent: 8, duration: 2.2 }, 0)
        .from(q(".hero-intro__word .ch"), { yPercent: 115, duration: 1.4, stagger: 0.045 }, 0.35)
        .from(q(".hero-intro__sub > *"), { y: 24, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.9)
        // Inner children only: the containers themselves are driven by the scroll timeline below.
        .from(q(".hero-intro__scroll > *, .hero-hud > *"), { opacity: 0, duration: 1.2 }, 1.2);
      const offIntro = loader.onIntro(() => (reduced ? intro.progress(1) : intro.play()));

      // Hidden states for the scroll-driven overlays.
      gsap.set(q(".hero-chapter"), { autoAlpha: 0, y: 50 });
      gsap.set(q(".hero-statement .hs-word"), { yPercent: 115 });
      gsap.set(q(".hero-outro > *"), { autoAlpha: 0, y: 40 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          // Desktop scroll is already smoothed by Lenis; on touch, a short scrub lag smooths native scrolling.
          scrub: isTouch() ? 0.5 : true,
          onUpdate: (self) => {
            barRef.current!.style.transform = `scaleY(${self.progress})`;
            let next = 0;
            for (let i = 0; i < CHAPTERS.length; i++) if (self.progress >= CHAPTERS[i][0]) next = i;
            if (next !== chapter) {
              chapter = next;
              chapterRef.current!.textContent = CHAPTERS[next][1];
            }
          },
        },
      });

      tl.to(view, { frame: count - 1, duration: FRAME_END, onUpdate: () => draw() }, 0)
        .to(view, { zoom: 1.07, duration: 1, onUpdate: () => draw() }, 0)
        // Intro lockup drifts away as the particles begin to gather.
        .to(q(".hero-intro__inner"), { yPercent: -18, autoAlpha: 0, scale: 0.94, duration: 0.07 }, 0.005)
        .to(q(".hero-intro__scroll"), { autoAlpha: 0, duration: 0.03 }, 0)
        // 01 Origin: beetle assembles.
        .to(q(".hero-chapter--origin"), { autoAlpha: 1, y: 0, duration: 0.04, ease: "power2.out" }, 0.13)
        .to(q(".hero-chapter--origin"), { autoAlpha: 0, y: -50, duration: 0.04, ease: "power2.in" }, 0.27)
        // 02 Take-off: wings open.
        .to(q(".hero-chapter--flight"), { autoAlpha: 1, y: 0, duration: 0.04, ease: "power2.out" }, 0.32)
        .to(q(".hero-chapter--flight"), { autoAlpha: 0, y: -50, duration: 0.04, ease: "power2.in" }, 0.42)
        // The statement lands while the beetle flies through the city of billboards.
        .to(q(".hs-line--1 .hs-word"), { yPercent: 0, duration: 0.05, stagger: 0.012, ease: "power3.out" }, 0.47)
        .to(q(".hs-line--2 .hs-word"), { yPercent: 0, duration: 0.05, ease: "power3.out" }, 0.52)
        .to(q(".hs-line--3 .hs-word"), { yPercent: 0, duration: 0.05, ease: "power3.out" }, 0.57)
        .to(q(".hero-statement"), { yPercent: -12, autoAlpha: 0, duration: 0.06, ease: "power2.in" }, 0.72)
        // Arrival.
        .to(q(".hero-outro > *"), { autoAlpha: 1, y: 0, duration: 0.06, stagger: 0.02, ease: "power2.out" }, 0.8)
        .to(q(".hero__shade"), { opacity: 1, duration: 0.08 }, 0.92);

      return () => offIntro();
    }, section);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      ro.disconnect();
      gctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero" id="top" aria-label="Urban Beetle: we make brands move">
      <div className="hero__stage">
        <canvas
          ref={canvasRef}
          className="hero__canvas"
          role="img"
          aria-label="A golden beetle forms from swirling particles, flies through a city of brand billboards and lands on a plinth."
        />
        <Particles className="hero__particles" density={0.7} />
        <div className="hero__vignette" aria-hidden="true" />
        <div className="hero__shade" aria-hidden="true" />

        <div className="hero-intro">
          <div className="hero-intro__inner">
            <span className="hero-intro__logo">
              <BeetleMark className="hero-intro__mark" />
            </span>
            <h1 className="hero-intro__word">
              <span className="sr-only">Urban Beetle, a creative marketing agency</span>
              <Chars text="URBAN" />
              <Chars text="BEETLE" />
            </h1>
            <p className="hero-intro__sub">
              <span>Creative Marketing Agency</span>
              <span className="hero-intro__rule" aria-hidden="true" />
              <span>Strategy · Creativity · Technology</span>
            </p>
          </div>
          <div className="hero-intro__scroll" aria-hidden="true">
            <span>Scroll to begin</span>
            <i />
          </div>
        </div>

        <div className="hero-chapter hero-chapter--origin">
          <p className="eyebrow">
            <span>01</span> Origin
          </p>
          <h2 className="hero-chapter__title">
            Born from a <em>thousand</em> ideas.
          </h2>
          <p className="hero-chapter__body">
            Every great brand begins as scattered potential. We give it shape, substance and a reason to exist.
          </p>
        </div>

        <div className="hero-chapter hero-chapter--flight">
          <p className="eyebrow">
            <span>02</span> Take-off
          </p>
          <h2 className="hero-chapter__title">
            Built to <em>adapt.</em>
            <br />
            Made to move.
          </h2>
          <p className="hero-chapter__body">
            Strength, agility and transformation: the instincts of a beetle, engineered into every brand we build.
          </p>
        </div>

        <p className="hero-statement">
          <span className="hs-line hs-line--1">
            <span className="hs-word">We</span> <span className="hs-word">make</span>
          </span>
          <span className="hs-line hs-line--2">
            <span className="hs-word gold-text">brands</span>
          </span>
          <span className="hs-line hs-line--3">
            <span className="hs-word">move.</span>
          </span>
        </p>

        <div className="hero-outro">
          <p className="hero-outro__title">
            Ordinary businesses in.
            <br />
            <em className="gold-text">Memorable brands</em> out.
          </p>
          <ul className="hero-outro__pillars" aria-label="Strategy, creativity and technology">
            <li>Strategy</li>
            <li aria-hidden="true">+</li>
            <li>Creativity</li>
            <li aria-hidden="true">+</li>
            <li>Technology</li>
          </ul>
        </div>

        <div className="hero-hud" aria-hidden="true">
          <span className="hero-hud__chapter">
            <i />
            <span ref={chapterRef}>Intro</span>
          </span>
          <span className="hero-hud__track">
            <span ref={barRef} className="hero-hud__bar" />
          </span>
        </div>
      </div>
    </section>
  );
}
