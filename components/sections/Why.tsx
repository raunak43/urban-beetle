import { reasons } from "@/lib/content";
import { Eyebrow, Words, pad2 } from "../Text";

export default function Why() {
  return (
    <section className="why section" id="why">
      <div className="container">
        <header className="section-head section-head--split">
          <div>
            <Eyebrow index="04">Why Urban Beetle</Eyebrow>
            <h2 className="section-title" data-split="">
              <Words parts={["Small in ego.", { em: "Mighty in output." }]} />
            </h2>
          </div>
          <p className="section-lede" data-reveal="">
            Six reasons ambitious businesses choose to move with us, and stay with us.
          </p>
        </header>

        <div className="why__grid" data-reveal="stagger">
          {reasons.map((r, i) => (
            <article key={r.title} className="why__card glow-card">
              <span className="why__num">{pad2(i + 1)}</span>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
