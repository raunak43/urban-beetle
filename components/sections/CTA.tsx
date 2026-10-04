import Image from "next/image";
import Particles from "../Particles";
import { Words } from "../Text";

export default function CTA() {
  return (
    <section className="cta" id="start" aria-label="Start a project">
      <Particles className="cta__particles" density={0.5} />
      <div className="cta__beetle" aria-hidden="true">
        <Image src="/images/beetle-landed.webp" alt="" width={1400} height={788} sizes="100vw" />
      </div>
      <div className="container cta__inner">
        <p className="eyebrow" data-reveal="">
          <span>(✦)</span> Ready when you are
        </p>
        <h2 className="cta__title" data-split="">
          <Words parts={["Let's make", "your brand", { em: "move." }]} />
        </h2>
        <a href="/enquiry" className="cta__button" data-magnetic="0.4">
          <svg viewBox="0 0 200 200" className="cta__ring" aria-hidden="true">
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
    </section>
  );
}
