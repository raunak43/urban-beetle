import { services } from "@/lib/content";
import { SERVICE_SURFACES, ServiceArt } from "../ServiceArt";
import { Eyebrow, Words, pad2 } from "../Text";

// The services as a horizontal row of posters, each linking to its own page. On desktop the row is pinned
// and slides sideways as you scroll (MotionEffects, data-hscroll), and the cards hang from it and swing
// (LiveMotion, data-swing); on touch screens it's swiped.
export default function Services() {
  return (
    <section className="services section sheet" id="services" data-surface="ink">
      <div className="container">
        <header className="section-head">
          <Eyebrow index="02">Capabilities</Eyebrow>
          <h2 className="section-title" data-split="">
            <Words parts={["Everything a brand", "needs to", { em: "move.", alive: true }]} />
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
              <a
                href={`/services/${s.slug}`}
                className="svc-card"
                data-surface={SERVICE_SURFACES[i % SERVICE_SURFACES.length]}
                data-swing=""
                data-tilt=""
                data-cursor-label="View"
              >
                <span className="svc-card__top">
                  <span>{pad2(i + 1)}</span>
                  <span className="svc-card__arrow" aria-hidden="true">
                    ↗
                  </span>
                </span>
                <span className="svc-card__art">
                  <ServiceArt slug={s.slug} />
                </span>
                <h3 className="svc-card__name">{s.name}</h3>
                <span className="svc-card__body">{s.body}</span>
                <span className="svc-card__tags">
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

      <p className="container services__next" data-reveal="">
        Not sure which you need?
        <a href="/enquiry" className="link-arrow">
          Tell us your goals <span aria-hidden="true">→</span>
        </a>
      </p>
    </section>
  );
}
