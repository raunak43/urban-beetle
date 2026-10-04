import { services } from "@/lib/content";
import { Eyebrow, Words, pad2 } from "../Text";

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

        <ol className="service-list">
          {services.map((s, i) => (
            <li key={s.name} className="service" tabIndex={0} data-reveal="">
              <span className="service__num">{pad2(i + 1)}</span>
              <h3 className="service__name">
                <span className="service__name-text" data-text={s.name}>
                  {s.name}
                </span>
              </h3>
              <div className="service__detail">
                <div>
                  <p>{s.body}</p>
                  <ul className="tags">
                    {s.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <span className="service__arrow" aria-hidden="true">
                ↗
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
