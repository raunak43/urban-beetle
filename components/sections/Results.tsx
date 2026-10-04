import Image from "next/image";
import { results } from "@/lib/content";
import { Eyebrow, Words } from "../Text";

export default function Results() {
  return (
    <section className="results section" id="results">
      <div className="results__beetle" aria-hidden="true" data-parallax="0.2">
        <Image src="/images/beetle-wings.webp" alt="" width={1400} height={788} sizes="80vw" />
      </div>
      <div className="container">
        <header className="section-head">
          <Eyebrow index="07">Results</Eyebrow>
          <h2 className="section-title" data-split="">
            <Words parts={["Momentum you can", { em: "measure." }]} />
          </h2>
        </header>
        <dl className="results__grid" data-reveal="stagger">
          {results.map((r) => (
            <div key={r.label} className="stat">
              <dt>{r.label}</dt>
              <dd>
                <span data-count={r.value}>{r.value}</span>
                <span className="stat__suffix">{r.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
