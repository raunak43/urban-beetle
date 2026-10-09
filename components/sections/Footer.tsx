import type { CSSProperties } from "react";
import BeetleMark from "../BeetleMark";
import IconLink from "../IconLink";
import { nav, phoneHref, services, site } from "@/lib/content";

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
            <h2>Navigate</h2>
            {nav.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
            <a href="/enquiry">Start a project</a>
          </nav>
          <div>
            <h2>Services</h2>
            {services.slice(0, 6).map((s) => (
              <a key={s.name} href="#services">
                {s.name}
              </a>
            ))}
          </div>
          <div>
            <h2>Connect</h2>
            {site.socials.map((s) => (
              <IconLink key={s.label} href={s.href} icon={s.label}>
                {s.label}
              </IconLink>
            ))}
            <IconLink href={`mailto:${site.generalEmail}`} icon="mail">
              {site.generalEmail}
            </IconLink>
            <IconLink href={phoneHref} icon="phone">
              {site.phone}
            </IconLink>
          </div>
        </div>
      </div>

      {/* "URBAN" upright and "BEETLE" in italic, letter by letter so each can rise in and catch the light. */}
      <p className="footer__word" aria-hidden="true" data-split="">
        {Array.from("URBAN BEETLE").map((c, i) =>
          c === " " ? (
            <span key={i} className="footer__gap" />
          ) : (
            <span key={i} className={i > 5 ? "sw is-italic" : "sw"} style={{ "--i": i } as CSSProperties}>
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
