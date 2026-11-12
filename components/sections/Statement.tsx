import type { CSSProperties } from "react";
import Image from "next/image";
import { pillars } from "@/lib/content";
import { Eyebrow, Words, pad2 } from "../Text";

// One surface per pillar card, in order.
const SURFACES = ["ink", "gold", "scarab"] as const;

export default function Statement() {
  return (
    <section className="statement sheet" id="statement" data-surface="paper" aria-label="Brand statement">
      <div className="container">
        <Eyebrow index="01">The Statement</Eyebrow>
        <p className="statement__text" data-scrub-words="">
          <Words
            parts={[
              "Urban Beetle is a creative marketing agency for brands that",
              { em: "refuse to stand still." },
              "We fuse strategy, creativity and technology to turn ordinary businesses into brands people",
              { em: "remember." },
            ]}
          />
        </p>
        <div className="statement__foot" data-reveal="stagger">
          <p>Attention is earned through craft. Growth is earned through clarity. We deliver both.</p>
          <a href="#services" className="link-arrow">
            Explore our services <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      {/* Strategy, creativity and technology as cards that pile up while you scroll. */}
      <div className="container">
        <h2 className="sr-only">Strategy, creativity and technology</h2>
        <div className="stack" data-stack="">
          {pillars.map((p, i) => (
            <article
              key={p.word}
              className="stack__card"
              data-surface={SURFACES[i % SURFACES.length]}
              style={{ "--i": i } as CSSProperties}
            >
              <div className="stack__copy">
                <span className="stack__num" aria-hidden="true">
                  {pad2(i + 1)} / {pad2(pillars.length)}
                </span>
                <h3 className="stack__word">{p.word}</h3>
                <p className="stack__line">{p.line}</p>
                <p className="stack__body">{p.body}</p>
              </div>
              <div className="stack__media">
                <Image src={p.image} alt={p.alt} width={1320} height={810} sizes="(max-width: 899px) 100vw, 55vw" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
