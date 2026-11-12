import Image from "next/image";
import DustScene from "../DustScene";
import Particles from "../Particles";
import { Words } from "../Text";

// The closing call to action. The section is taller than the screen and its stage stays pinned while the
// gold dust behind the headline forms the logo and flies apart (DustScene), so the page ends as the hero began.
export default function CTA() {
  return (
    <section className="cta sheet" id="start" data-surface="ink" aria-label="Start a project">
      <div className="cta__stage">
        <div className="cta__backdrop" aria-hidden="true">
          <Image src="/images/gold-dust.webp" alt="" fill sizes="100vw" />
        </div>
        <DustScene className="cta__scene" />
        <Particles className="cta__particles" density={0.5} />
        <div className="cta__shade" aria-hidden="true" />
        <div className="container cta__inner">
          <p className="eyebrow" data-reveal="">
            <span>(✦)</span> Ready when you are
          </p>
          <h2 className="cta__title" data-split="">
            <Words parts={["Let's make", "your brand", { em: "move.", alive: true }]} />
          </h2>
          <a href="/enquiry" className="cta__button" data-magnetic="0.4">
            <svg viewBox="0 0 200 200" className="cta__ring" aria-hidden="true" data-spin="">
              <defs>
                <path id="cta-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
              </defs>
              <text>
                <textPath href="#cta-circle">Start a project · Start a project · Start a project · </textPath>
              </text>
            </svg>
            <span className="cta__arrow" aria-hidden="true">
              ↗
            </span>
            <span className="sr-only">Start a project</span>
          </a>
        </div>
      </div>
    </section>
  );
}
