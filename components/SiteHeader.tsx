"use client";

import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";
import Logo from "./Logo";
import { nav, person } from "../app/content";
import { BASE } from "../app/base";

/**
 * One nav item. Items that jump to a section on the home page (e.g.
 * "/#trajetoria") render as a native `<a>` — never `next/link`'s `<Link>` —
 * so the browser's own hash jump drives the scroll, instead of Next's
 * router-mediated one fighting Lenis (components/SmoothScroll.tsx). A raw
 * `<a>` never gets the GitHub Pages basePath applied automatically the way
 * `<Link>` does, so BASE (app/base.ts) is prefixed by hand here. Real routes
 * (/servicos, /sobre, /blog) keep `<Link>` for client-side navigation.
 */
function NavLink({
  href,
  label,
  onNavigate,
  style,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
  style?: CSSProperties;
}) {
  if (href.includes("#")) {
    return (
      <a href={`${BASE}${href}`} onClick={onNavigate} style={style}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onNavigate} style={style}>
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const mobileNavId = useId();

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" aria-label={`${person.name} — início`}>
          <Logo />
        </Link>
        <nav className="nav-links">
          {nav.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} />
          ))}
        </nav>
        <div className="header-cta">
          <a href={person.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            {person.whatsappLabel}
          </a>
          <button
            type="button"
            className="btn btn-ghost nav-toggle"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls={mobileNavId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <div
          id={mobileNavId}
          className="wrap"
          style={{ paddingBottom: 18, display: "flex", flexDirection: "column", gap: 10 }}
        >
          {nav.map((n) => (
            <NavLink
              key={n.href}
              href={n.href}
              label={n.label}
              onNavigate={() => setOpen(false)}
              style={{ fontFamily: "var(--font-ui)", color: "var(--ink-soft)" }}
            />
          ))}
        </div>
      )}
    </header>
  );
}
