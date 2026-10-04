import BeetleMark from "../BeetleMark";
import { external, nav, phoneHref, services, site } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand" data-reveal="">
          <BeetleMark className="footer__mark" />
          <p>
            Urban Beetle is a creative marketing agency making brands move through strategy, creativity and technology.
          </p>
        </div>
        <div className="footer__cols" data-reveal="stagger">
          <nav aria-label="Footer">
            <h3>Navigate</h3>
            {nav.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <div>
            <h3>Services</h3>
            {services.slice(0, 6).map((s) => (
              <a key={s.name} href="#services">
                {s.name}
              </a>
            ))}
          </div>
          <div>
            <h3>Connect</h3>
            {site.socials.map((s) => (
              <a key={s.label} href={s.href} {...external}>
                {s.label}
              </a>
            ))}
            <a href={`mailto:${site.generalEmail}`}>{site.generalEmail}</a>
            <a href={phoneHref}>{site.phone}</a>
          </div>
        </div>
      </div>

      <p className="footer__word" aria-hidden="true" data-split="">
        {Array.from("URBAN BEETLE").map((c, i) =>
          c === " " ? (
            <span key={i} className="footer__gap" />
          ) : (
            <span key={i} className="sw">
              <span>{c}</span>
            </span>
          ),
        )}
      </p>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Urban Beetle. All rights reserved.</span>
        <span className="footer__motto">Made to move.</span>
        <a href="#top" className="footer__top-link">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
