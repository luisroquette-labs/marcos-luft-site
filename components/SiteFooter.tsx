import Link from "next/link";
import Logo from "./Logo";
import { person, nav } from "../app/content";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-col">
            <Logo />
            <p>
              {person.role} — {person.location}.
            </p>
          </div>
          <div className="footer-col">
            <h4>Navegação</h4>
            {nav.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </div>
          <div className="footer-col">
            <h4>Contato</h4>
            <a href={person.whatsapp} target="_blank" rel="noopener noreferrer">
              {person.whatsappLabel}
            </a>
            <span>{person.location}</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {person.year} {person.name}. Todos os direitos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}
