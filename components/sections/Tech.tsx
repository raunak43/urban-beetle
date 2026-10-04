import Image from "next/image";
import { tech } from "@/lib/content";
import { Eyebrow, Words, pad2 } from "../Text";

const terminal = [
  ["analysing audience signals", "done"],
  ["generating concept routes", "24 routes"],
  ["human creative review", "approved"],
  ["launching campaign", "live"],
];

export default function Tech() {
  return (
    <section className="tech section" id="technology">
      <div className="tech__bg" aria-hidden="true">
        <span className="tech__scan" />
      </div>

      <div className="container tech__grid">
        <div className="tech__intro">
          <Eyebrow index="07">AI + Technology</Eyebrow>
          <h2 className="section-title section-title--md" data-split="">
            <Words parts={["Intelligence, applied to", { em: "imagination." }]} />
          </h2>
          <p className="section-lede" data-reveal="">
            We pair human taste with modern tools: AI for speed and insight, engineering for scale, and data to prove what
            works. The technology accelerates the craft; it never replaces it.
          </p>
          <div className="terminal" data-reveal="stagger" aria-label="Example of an AI-assisted campaign workflow">
            {terminal.map(([task, status]) => (
              <p key={task}>
                <span className="terminal__prompt" aria-hidden="true">
                  &gt;
                </span>
                <span className="terminal__task">{task}</span>
                <span className="terminal__dots" aria-hidden="true" />
                <span className="terminal__status">{status}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="tech__visual" aria-hidden="true">
          <div className="tech__rings">
            <span />
            <span />
            <span />
          </div>
          <div className="tech__orb" data-parallax="0.08">
            <Image src="/images/beetle-forming.webp" alt="" width={1400} height={788} sizes="(max-width: 900px) 90vw, 45vw" />
          </div>
        </div>
      </div>

      <div className="container">
        <ul className="tech__list" data-reveal="stagger">
          {tech.map((t, i) => (
            <li key={t.title} className="glow-card">
              <span className="tech__code">[{pad2(i + 1)}]</span>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
