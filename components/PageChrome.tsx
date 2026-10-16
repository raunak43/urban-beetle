import BeetleMark from "./BeetleMark";
import IconLink from "./IconLink";
import { phoneHref, site, whatsappHref } from "@/lib/content";

// Header and footer for the inner pages (the services pages). The home page has its own nav and footer,
// whose links jump to sections of the home page.

export function PageHeader() {
  return (
    <header className="pg-top">
      <a href="/" className="pg-top__logo" aria-label="Urban Beetle home">
        <BeetleMark className="pg-top__mark" />
        <span className="nav__word">
          Urban <span>Beetle</span>
        </span>
      </a>
      <nav className="pg-top__links" aria-label="Main">
        <a href="/services" className="pg-top__link">
          Services
        </a>
        <a href="/enquiry" className="btn btn--small btn--gold">
          <span className="nav__cta-long">Start a project</span>
          <span className="nav__cta-short">Enquire</span>
        </a>
      </nav>
    </header>
  );
}

export function PageFooter() {
  return (
    <footer className="pg-foot">
      <div className="pg-foot__inner">
        <p className="pg-foot__about">
          <strong>Urban Beetle</strong> is a creative marketing agency based in {areasLine}.
        </p>
        <div className="pg-foot__contact">
          <IconLink href={`mailto:${site.generalEmail}`} icon="mail">
            {site.generalEmail}
          </IconLink>
          <IconLink href={phoneHref} icon="phone">
            {site.phone}
          </IconLink>
          <IconLink href={whatsappHref} icon="WhatsApp">
            WhatsApp
          </IconLink>
          {site.socials.map((s) => (
            <IconLink key={s.label} href={s.href} icon={s.label}>
              {s.label}
            </IconLink>
          ))}
        </div>
      </div>
      <p className="pg-foot__legal">
        © {new Date().getFullYear()} Urban Beetle. All rights reserved. · <a href="/privacy">Privacy policy</a>
      </p>
    </footer>
  );
}

/** "Kalyan, Maharashtra, working with businesses in Dombivli, Thane, Navi Mumbai, Mumbai and across India" */
export const areasLine = `${site.address.locality}, ${site.address.region}, working with businesses in ${site.serviceAreas
  .filter((a) => a !== site.address.locality)
  .join(", ")} and across India`;
