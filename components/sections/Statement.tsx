import Image from "next/image";
import { pillars } from "@/lib/content";
import { Eyebrow, Words, pad2 } from "../Text";

// A line running into a gold ring, with a spark inside for Technology.
function PillarIcon({ spark }: { spark: boolean }) {
  return (
    <svg className="pillar__icon" viewBox="0 0 78 52" aria-hidden="true">
      <path d={spark ? "M0 26H28" : "M0 26H78"} />
      <circle cx="52" cy="26" r="24" />
      {spark ? (
        <>
          <path d="M52 11v8M52 33v8M37 26h8M59 26h8M44.2 18.2l2.8 2.8M57 31l2.8 2.8M59.8 18.2L57 21M47 31l-2.8 2.8" />
          <circle className="pillar__icon-fill" cx="52" cy="26" r="4.5" />
        </>
      ) : (
        <circle className="pillar__icon-fill" cx="52" cy="26" r="2" />
      )}
    </svg>
  );
}

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
              <div className="pillar__media">
                <Image src={p.image} alt={p.alt} width={1320} height={810} sizes="(max-width: 899px) 100vw, 33vw" />
              </div>
              <div className="pillar__head" aria-hidden="true">
                <span className="pillar__num">{pad2(i + 1)}</span>
                <PillarIcon spark={p.icon === "spark"} />
              </div>
              <h3 className="pillar__word">{p.word}</h3>
              <p className="pillar__line">{p.line}</p>
              <p className="pillar__body">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
