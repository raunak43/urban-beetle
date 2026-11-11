import { reasons } from "@/lib/content";
import { ReasonGlyph } from "../ServiceArt";
import { Eyebrow, Words, pad2 } from "../Text";

// The surface of each cell in the grid, in the order of `reasons`.
const SURFACES = ["ink", "paper", "gold", "scarab", "paper", "ink"] as const;

export default function Why() {
  return (
    <section className="why section sheet" id="why" data-surface="paper">
      <div className="container">
        <header className="section-head section-head--split">
          <div>
            <Eyebrow index="03">Why Urban Beetle</Eyebrow>
            <h2 className="section-title" data-split="">
              <Words parts={["Small in ego.", { em: "Mighty in output." }]} />
            </h2>
          </div>
          <p className="section-lede" data-reveal="">
            Six reasons ambitious businesses choose to move with us, and stay with us.
          </p>
        </header>

        <div className="bento" data-reveal="flip">
          {reasons.map((r, i) => (
            <article key={r.title} className="bento__cell" data-surface={SURFACES[i % SURFACES.length]}>
              <div className="bento__top">
                <span className="bento__num">{pad2(i + 1)}</span>
                <ReasonGlyph index={i} className="bento__glyph" />
              </div>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
