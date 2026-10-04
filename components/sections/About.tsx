import Image from "next/image";
import { beetleTraits } from "@/lib/content";
import { Eyebrow, Words } from "../Text";

export default function About() {
  return (
    <section className="about section" id="about">
      <div className="container about__grid">
        <div className="about__visual">
          <div className="about__halo" aria-hidden="true" />
          <div className="about__beetle" data-parallax="0.12">
            <Image
              src="/images/beetle-profile.webp"
              alt="The golden Urban Beetle, a rhinoceros beetle in profile"
              width={1400}
              height={788}
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
          <p className="about__caption">
            <span>Dynastinae</span> The rhinoceros beetle carries many times its own weight.
          </p>
        </div>

        <div className="about__content">
          <Eyebrow index="05">About the Agency</Eyebrow>
          <h2 className="section-title section-title--md" data-split="">
            <Words parts={["A studio named after nature's most", { em: "resilient engineer." }]} />
          </h2>
          <div className="about__copy" data-reveal="stagger">
            <p>
              Urban Beetle is a creative marketing agency built for the way brands live now: across feeds, screens, streets
              and search. We are strategists, designers, storytellers and technologists who share one obsession, making
              brands move.
            </p>
            <p>
              Like our namesake, we carry ambitious ideas further than their size suggests, adapt to every environment and
              never stop moving forward.
            </p>
          </div>
          <ul className="traits" data-reveal="stagger">
            {beetleTraits.map((t) => (
              <li key={t.word}>
                <span className="traits__word">{t.word}</span>
                <span className="traits__body">{t.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
