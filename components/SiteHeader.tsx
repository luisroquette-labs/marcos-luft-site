"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import { nav, person } from "../app/content";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" aria-label={`${person.name} — início`}>
          <Logo />
        </Link>
        <nav className="nav-links">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-cta">
          <a href={person.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            {person.whatsappLabel}
          </a>
          <button
            className="btn btn-ghost nav-toggle"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>
      {open && (
        <div className="wrap" style={{ paddingBottom: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              style={{ fontFamily: "var(--font-ui)", color: "var(--ink-soft)" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
