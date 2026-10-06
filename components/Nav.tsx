"use client";

import { useEffect, useRef, useState } from "react";
import BeetleMark from "./BeetleMark";
import SocialLink from "./SocialLink";
import { nav, phoneHref, site } from "@/lib/content";
import { getLenis, loader } from "@/lib/motion";
import { pad2 } from "./Text";

export default function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const header = headerRef.current!;
    const offIntro = loader.onIntro(() => header.classList.add("is-ready"));
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 40);
      // Tuck the bar away while reading downwards, bring it back on any upward scroll.
      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      if (goingDown && y > window.innerHeight * 0.5 && !openRef.current) header.classList.add("is-hidden");
      else if (goingUp || y < 10) header.classList.remove("is-hidden");
      lastY = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      offIntro();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const toggle = (next: boolean) => {
    setOpen(next);
    // The header's classes are all managed imperatively (scroll state too), so React never overwrites them.
    headerRef.current?.classList.toggle("is-open", next);
    if (next) headerRef.current?.classList.remove("is-hidden");
    document.documentElement.classList.toggle("menu-open", next);
    const lenis = getLenis();
    if (next) lenis?.stop();
    else lenis?.start();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && toggle(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header ref={headerRef} className="nav">
        <a href="#top" className="nav__logo" aria-label="Urban Beetle, back to top" onClick={() => toggle(false)}>
          <BeetleMark className="nav__mark" />
          <span className="nav__word">
            Urban <span>Beetle</span>
          </span>
        </a>
        <nav className="nav__links" aria-label="Primary">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="nav__link">
              <span data-text={item.label}>{item.label}</span>
            </a>
          ))}
        </nav>
        <a href="/enquiry" className="btn btn--small btn--gold nav__cta" data-magnetic="0.25">
          <span className="nav__cta-long">Start a project</span>
          <span className="nav__cta-short">Enquire</span>
        </a>
        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => toggle(!open)}
        >
          <i />
          <i />
        </button>
      </header>

      <div id="menu" className={`menu${open ? " is-open" : ""}`} aria-hidden={!open} inert={!open}>
        <nav className="menu__links" aria-label="Menu">
          {nav.map((item, i) => (
            <a key={item.href} href={item.href} className="menu__link" onClick={() => toggle(false)}>
              <span className="menu__num">{pad2(i + 1)}</span>
              <span className="menu__label">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          <a href="/enquiry" className="btn btn--gold menu__cta">
            <span>Start a project →</span>
          </a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={phoneHref}>{site.phone}</a>
          <div className="menu__socials">
            {site.socials.map((s) => (
              <SocialLink key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
