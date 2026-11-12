"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import BeetleMark from "./BeetleMark";
import { pillars } from "@/lib/content";
import { createDust } from "@/lib/dust";
import { gsap, loader, prefersReducedMotion } from "@/lib/motion";

// The opening scene: gold dust (lib/dust.ts) that starts as the logo, scatters behind the headline,
// then gathers into the logo again and into each of the three pillars as you scroll. The backdrop
// photo of gold dust was made with Google Flow.

const FAILSAFE_MS = 8000;
// The gold word at the end of "We make brands ...", and how long each one stays.
const SWAP_WORDS = ["move.", "grow.", "sell.", "shine.", "matter."];
const SWAP_EVERY_MS = 2600;

// What the dust forms over each stretch of the hero's scroll (0 to 1). Shape 0 is the logo; the rest
// are the pillars, each with its line underneath.
const STAGES = [
  { from: 0.09, to: 0.3, chapter: "Origin", caption: "" },
  ...pillars.map((p, i) => ({ from: 0.36 + i * 0.18, to: 0.5 + i * 0.18, chapter: p.word, caption: p.line })),
];
const GATHER_FROM = 0.04; // the dust starts to pull together here
const LOOSE = 0.3; // how firmly it holds between two shapes
const LAST = STAGES[STAGES.length - 1].to;

const Chars = ({ text }: { text: string }) => (
  <span className="split-chars" aria-hidden="true">
    {Array.from(text).map((c, i) => (
      <span key={i} className="ch">
        {c}
      </span>
    ))}
  </span>
);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const caption = captionRef.current!;
    const reduced = prefersReducedMotion();
    const small = window.matchMedia("(max-width: 767px)").matches;

    const dust = createDust(canvasRef.current!, {
      count: small ? 4200 : 7500,
      still: reduced,
      shapes: [
        { image: "/brand/logo-mask.webp", height: 0.6 },
        ...pillars.map((p) => ({ text: p.word.toUpperCase(), height: 0.3 })),
      ],
    });

    // Behind the preloader the dust already sits in the shape of the logo; when the page is revealed
    // it bursts apart and drifts behind the headline.
    let revealed = false;
    dust.set(0, 1);
    const failsafe = window.setTimeout(() => loader.setReady(), FAILSAFE_MS);
    dust.ready.then(() => {
      if (!revealed) dust.snap();
      loader.setProgress(1);
      loader.setReady();
    });

    // ---------- what the scroll asks of the dust ----------
    let stage = -2;
    let last = 0;
    const follow = (p: number) => {
      barRef.current!.style.transform = `scaleY(${p})`;
      let shape = 0;
      let hold = 0;
      let at = -1; // the stage whose words are on screen, if any
      if (p > LAST) {
        shape = STAGES.length - 1;
        hold = Math.max(0, 1 - (p - LAST) / 0.03);
      } else if (p >= STAGES[0].from) {
        for (let i = 0; i < STAGES.length; i++) {
          const next = STAGES[i + 1];
          if (p <= STAGES[i].to) {
            shape = at = i;
            hold = 1;
            break;
          }
          if (next && p < next.from) {
            shape = p < (STAGES[i].to + next.from) / 2 ? i : i + 1;
            hold = LOOSE;
            break;
          }
        }
      } else if (p > GATHER_FROM) {
        hold = (p - GATHER_FROM) / (STAGES[0].from - GATHER_FROM);
      }
      if (revealed) {
        dust.set(shape, hold);
        // Leaving the last word, the dust is thrown outward.
        if (last <= LAST && p > LAST) dust.burst(0.7);
      }
      last = p;

      if (at !== stage) {
        stage = at;
        chapterRef.current!.textContent = at >= 0 ? STAGES[at].chapter : p > LAST ? "Arrival" : "Intro";
        const text = at >= 0 ? STAGES[at].caption : "";
        if (text) caption.textContent = text;
        caption.classList.toggle("is-on", !!text);
      }
    };

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
        revealed = true;
        follow(last);
        if (reduced) {
          intro.progress(1);
          return;
        }
        if (last < GATHER_FROM) dust.burst();
        intro.play();
        swapTimer = window.setInterval(swap, SWAP_EVERY_MS);
      });

      // Hidden states for the scroll-driven overlays.
      gsap.set(q(".hero-chapter"), { autoAlpha: 0, y: 50 });
      gsap.set(q(".hero-outro > *"), { autoAlpha: 0, y: 40 });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => follow(self.progress),
          },
        })
        // The headline and its stamp drift away as the dust begins to gather.
        .to(q(".hero-intro__inner"), { yPercent: -18, autoAlpha: 0, scale: 0.94, duration: 0.07 }, 0.005)
        .to(q(".hero-badge"), { autoAlpha: 0, scale: 0.6, duration: 0.06 }, 0.005)
        .to(q(".hero-intro__scroll"), { autoAlpha: 0, duration: 0.03 }, 0)
        // The logo forms.
        .to(q(".hero-chapter"), { autoAlpha: 1, y: 0, duration: 0.04, ease: "power2.out" }, 0.13)
        .to(q(".hero-chapter"), { autoAlpha: 0, y: -50, duration: 0.04, ease: "power2.in" }, 0.28)
        // After the last word.
        .to(q(".hero-outro > *"), { autoAlpha: 1, y: 0, duration: 0.05, stagger: 0.02, ease: "power2.out" }, 0.91)
        .to(q(".hero__shade"), { opacity: 1, duration: 0.04 }, 0.96);

      return () => {
        offIntro();
        window.clearInterval(swapTimer);
      };
    }, section);

    return () => {
      window.clearTimeout(failsafe);
      dust.destroy();
      gctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero" id="top" aria-label="Urban Beetle: we make brands move">
      <div className="hero__stage">
        <div className="hero__backdrop" aria-hidden="true">
          <Image src="/images/gold-dust.webp" alt="" fill sizes="100vw" priority />
        </div>
        <canvas
          ref={canvasRef}
          className="hero__canvas"
          role="img"
          aria-label="Gold dust gathers into the Urban Beetle logo, then into the words strategy, creativity and technology."
        />
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

        <div className="hero-chapter">
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

        {/* The line under each word the dust spells out. */}
        <p ref={captionRef} className="hero-caption" aria-hidden="true" />

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
