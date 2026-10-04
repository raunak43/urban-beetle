import { pillars } from "@/lib/content";
import { Eyebrow, Words, pad2 } from "../Text";

export default function Statement() {
  return (
    <section className="statement" id="statement" aria-label="Brand statement">
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

      <div className="pillars container">
        <h2 className="sr-only">Strategy, creativity and technology</h2>
        <div className="pillars__grid" data-reveal="stagger">
          {pillars.map((p, i) => (
            <article key={p.word} className="pillar glow-card">
              <span className="pillar__num">{pad2(i + 1)}</span>
              <h3 className="pillar__word">{p.word}</h3>
              <p className="pillar__line">{p.line}</p>
              <p className="pillar__body">{p.body}</p>
              {i < pillars.length - 1 && (
                <span className="pillar__plus" aria-hidden="true">
                  +
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
