"use client";

import { useEffect, useRef } from "react";
import frames from "@/lib/frames.json";
import BeetleMark from "./BeetleMark";
import Particles from "./Particles";
import { gsap, loader, isTouch, prefersReducedMotion } from "@/lib/motion";
import { buildLoadOrder } from "@/lib/sequence";

// Share of the hero's scroll distance spent playing the video; the rest holds on the landed beetle.
const FRAME_END = 0.9;
// On portrait screens, show this fraction of the video's width instead of a full "cover" crop,
// so the beetle and its wings stay in frame. Text sits in the space above and below.
const PORTRAIT_VISIBLE = 0.56;
const BG = "#070707";
const BG_CLEAR = "rgba(7,7,7,0)";
const CONCURRENCY = 6;
const FAILSAFE_MS = 12000;
// When scrolling stops, the video keeps rocking this far either side of where it stopped (a share of
// the whole video, so phones' half-length sequence rocks over the same stretch of time).
const ROCK = 0.014;
const IDLE_AFTER_MS = 260;
// The gold word at the end of "We make brands ...", and how long each one stays.
const SWAP_WORDS = ["move.", "grow.", "sell.", "shine.", "matter."];
const SWAP_EVERY_MS = 2600;

const CHAPTERS: [number, string][] = [
  [0, "Intro"],
  [0.1, "Origin"],
  [0.3, "Take-off"],
  [0.41, "The City"],
  [0.72, "Arrival"],
];

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
    // `frame` follows the scroll; `rock` is the idle sway added on top (see the living scene below).
    const view = { frame: 0, zoom: 1, rock: 0 };
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
      // The sway bounces off the ends of the video rather than stalling there.
      let f = view.frame + view.rock;
      if (f < 0) f = -f;
      else if (f > count - 1) f = 2 * (count - 1) - f;
      const idx = nearestLoaded(Math.min(count - 1, Math.max(0, Math.round(f))));
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
      // Phones get a slightly lighter canvas (1.5x) so every frame draws fast.
      const dpr = Math.min(window.devicePixelRatio || 1, isTouch() ? 1.5 : 2);
      // Layout size, not the on-screen box: the camera float scales the canvas slightly.
      cw = canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      ch = canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      draw(true);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ---------- animation ----------
    const reduced = prefersReducedMotion();
    let chapter = -1;

    // ---------- living scene ----------
    // The hero never freezes. When scrolling stops, the video keeps rocking gently around the moment it
    // stopped on, so the dust keeps swirling and the wings keep beating. The camera floats, leans toward
    // the pointer on desktop and pushes in a little while you scroll fast, and the dust layer moves the
    // other way for depth. Scrolling hands the video straight back to the scroll.
    const dust = section.querySelector<HTMLElement>(".hero__particles");
    const rockFrames = count * ROCK;
    let inView = false;
    let lastY = window.scrollY;
    let lastScroll = 0;
    let amp = 0;
    let punch = 0;
    let px = 0;
    let py = 0;
    let lx = 0;
    let ly = 0;

    const onPointer = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine && !reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    const live = (_time: number, dt: number) => {
      if (!inView) return;
      const now = performance.now();
      const ease = (ms: number) => 1 - Math.exp(-dt / ms);
      const y = window.scrollY;
      const speed = (Math.abs(y - lastY) / Math.max(dt, 1)) * 1000;
      if (y !== lastY) lastScroll = now;
      lastY = y;

      const still = now - lastScroll > IDLE_AFTER_MS;
      amp += ((still ? rockFrames : 0) - amp) * ease(still ? 900 : 90);
      const t = now / 1000;
      view.rock = amp * (0.8 * Math.sin(t * 1.9) + 0.2 * Math.sin(t * 4.3 + 1));
      draw();

      punch += (Math.min(speed / 5000, 0.04) - punch) * ease(300);
      lx += (px - lx) * ease(600);
      ly += (py - ly) * ease(600);
      const cx = lx * 14 + Math.sin(t * 0.5) * 6;
      const cy = ly * 10 + Math.sin(t * 0.37 + 1) * 5;
      canvas.style.transform = `translate3d(${(-cx).toFixed(2)}px,${(-cy).toFixed(2)}px,0) scale(${(1.04 + punch).toFixed(4)})`;
      if (dust) dust.style.transform = `translate3d(${(cx * 0.9).toFixed(2)}px,${(cy * 0.9).toFixed(2)}px,0)`;
    };
    const seen = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting));
    if (!reduced) {
      seen.observe(section);
      gsap.ticker.add(live);
    }

    const gctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      // Time-based entrance once the preloader lifts: the headline's letters rise out of their masks, the
      // gold word follows, and the stamp spins in.
      const swapWords = q(".hero-swap__word");
      gsap.set(swapWords.slice(1), { yPercent: 130 });
      const intro = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from(q(".hero-title .ch"), { yPercent: 115, duration: 1.4, stagger: 0.04 }, 0.1)
        .from(swapWords[0], { yPercent: 130, duration: 1.5 }, 0.6)
        .from(q(".hero-intro__kicker, .hero-intro__foot > *"), { y: 24, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.8)
        .from(q(".hero-badge__inner"), { scale: 0, rotate: -120, opacity: 0, duration: 1.8 }, 0.7)
        // Inner children only: the containers themselves are driven by the scroll timeline below.
        .from(q(".hero-intro__scroll > *, .hero-hud > *"), { opacity: 0, duration: 1.2 }, 1.2);

      // The gold word keeps changing for as long as the headline is on screen.
      let shown = 0;
      let swapTimer = 0;
      const swap = () => {
        if (window.scrollY > window.innerHeight * 0.4 || document.hidden) return;
        const leaving = swapWords[shown];
        shown = (shown + 1) % swapWords.length;
        gsap.to(leaving, { yPercent: -130, duration: 1, ease: "expo.inOut" });
        gsap.fromTo(swapWords[shown], { yPercent: 130 }, { yPercent: 0, duration: 1, ease: "expo.inOut" });
      };
      const offIntro = loader.onIntro(() => {
        if (reduced) {
          intro.progress(1);
          return;
        }
        intro.play();
        swapTimer = window.setInterval(swap, SWAP_EVERY_MS);
      });

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
          // Follow the scroll exactly: desktop scroll is already smoothed by Lenis, and on touch any lag
          // makes the scene keep moving after the finger stops, which reads as the page scrolling itself.
          scrub: true,
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
        // The headline and its stamp drift away as the particles begin to gather.
        .to(q(".hero-intro__inner"), { yPercent: -18, autoAlpha: 0, scale: 0.94, duration: 0.07 }, 0.005)
        .to(q(".hero-badge"), { autoAlpha: 0, scale: 0.6, duration: 0.06 }, 0.005)
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

      return () => {
        offIntro();
        window.clearInterval(swapTimer);
      };
    }, section);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      ro.disconnect();
      seen.disconnect();
      gsap.ticker.remove(live);
      window.removeEventListener("pointermove", onPointer);
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
            <p className="hero-intro__kicker">
              <span>Urban Beetle</span> Creative marketing agency · Kalyan, India
            </p>
            <h1 className="hero-title">
              <span className="sr-only">Urban Beetle, a creative marketing agency. We make brands move.</span>
              <span className="hero-title__row" aria-hidden="true">
                <Chars text="We" />
                <Chars text="make" />
              </span>
              <span className="hero-title__row" aria-hidden="true">
                <Chars text="brands" />
                <span className="hero-swap">
                  {SWAP_WORDS.map((word) => (
                    <span key={word} className="hero-swap__word">
                      {word}
                    </span>
                  ))}
                </span>
              </span>
            </h1>
            <div className="hero-intro__foot">
              <p className="hero-intro__lede">
                Strategy, creativity and technology for businesses that refuse to stand still.
              </p>
              <div className="hero-intro__ctas">
                <a href="/enquiry" className="btn btn--gold" data-magnetic="0.25">
                  Start a project
                </a>
                <a href="#services" className="link-arrow">
                  See what we do <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>
          <div className="hero-badge" aria-hidden="true">
            <div className="hero-badge__inner">
              <svg viewBox="0 0 200 200" className="hero-badge__ring" data-spin="">
                <defs>
                  <path id="hero-badge-circle" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
                </defs>
                <text>
                  <textPath href="#hero-badge-circle" textLength="494" lengthAdjust="spacing">
                    Strategy · Creativity · Technology · Strategy · Creativity · Technology ·
                  </textPath>
                </text>
              </svg>
              <BeetleMark className="hero-badge__mark" />
            </div>
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
            <span className="hs-word">Seen</span> <span className="hs-word">on</span>
          </span>
          <span className="hs-line hs-line--2">
            <span className="hs-word gold-text">every</span>
          </span>
          <span className="hs-line hs-line--3">
            <span className="hs-word">screen.</span>
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
