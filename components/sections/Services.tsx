import { services } from "@/lib/content";
import { Eyebrow, Words, pad2 } from "../Text";

// The services as a horizontal row of cards, each linking to its own page. On desktop the row is pinned and
// slides sideways as you scroll (MotionEffects, data-hscroll); on touch screens it's swiped.
export default function Services() {
  return (
    <section className="services section" id="services">
      <div className="container">
        <header className="section-head">
          <Eyebrow index="02">Capabilities</Eyebrow>
          <h2 className="section-title" data-split="">
            <Words parts={["Everything a brand", "needs to", { em: "move." }]} />
          </h2>
          <p className="section-lede" data-reveal="">
            Nine disciplines under one roof, so strategy, creative and performance never lose each other in a handoff.
          </p>
        </header>
      </div>

      <div className="hs" data-hscroll="">
        <ol className="hs__track" data-reveal="stagger">
          {services.map((s, i) => (
            <li key={s.slug} className="hs__item">
              <a href={`/services/${s.slug}`} className="hs-card glow-card">
                <span className="hs-card__top">
                  <span>{pad2(i + 1)}</span>
                  <span className="hs-card__arrow" aria-hidden="true">
                    ↗
                  </span>
                </span>
                <h3 className="hs-card__name">{s.name}</h3>
                <span className="hs-card__body">{s.body}</span>
                <span className="hs-card__tags">
                  {s.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </span>
              </a>
            </li>
          ))}
        </ol>
        <div className="container hs__foot" aria-hidden="true">
          <span className="hs__progress">
            <i />
          </span>
          <span className="hs__hint hs__hint--scroll">Scroll to explore →</span>
          <span className="hs__hint hs__hint--swipe">Swipe to explore →</span>
        </div>
      </div>
    </section>
  );
}
