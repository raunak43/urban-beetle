import { external, phoneHref, site } from "@/lib/content";
import { Eyebrow, Words } from "../Text";

export default function Contact() {
  return (
    <section className="contact section" id="contact">
      <div className="container contact__grid">
        <div className="contact__intro">
          <Eyebrow index="10">Contact</Eyebrow>
          <h2 className="section-title" data-split="">
            <Words parts={["Tell us where", "you want to", { em: "go." }]} />
          </h2>
          <p className="section-lede" data-reveal="">
            Share your goals through our project enquiry and our team will get back to you within 24 hours.
          </p>
          <dl className="contact__details" data-reveal="stagger">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={phoneHref}>{site.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Studio</dt>
              <dd>{site.location}</dd>
            </div>
            <div>
              <dt>Follow</dt>
              <dd className="contact__socials">
                {site.socials.map((s) => (
                  <a key={s.label} href={s.href} {...external}>
                    {s.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <a href="/enquiry" className="contact__card glow-card" data-reveal="">
          <span className="contact__kicker">Project enquiry · about 4 minutes</span>
          <span className="contact__title">
            Start a <span className="gold-text">project</span>
          </span>
          <ol className="contact__steps">
            <li>About you</li>
            <li>What you need</li>
            <li>Your project</li>
            <li>Budget &amp; timeline</li>
          </ol>
          <span className="contact__cta">
            Begin your enquiry <span aria-hidden="true">→</span>
          </span>
        </a>
      </div>
    </section>
  );
}
