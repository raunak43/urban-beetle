import { phoneHref, site } from "@/lib/content";
import IconLink from "../IconLink";
import { Eyebrow, Words } from "../Text";

export default function Contact() {
  return (
    <section className="contact section" id="contact">
      <div className="container contact__grid">
        <div className="contact__intro">
          <Eyebrow index="08">Contact</Eyebrow>
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
                <IconLink href={`mailto:${site.generalEmail}`} icon="mail">
                  {site.generalEmail}
                </IconLink>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <IconLink href={phoneHref} icon="phone">
                  {site.phone}
                </IconLink>
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
                  <IconLink key={s.label} href={s.href} icon={s.label}>
                    {s.label}
                  </IconLink>
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
