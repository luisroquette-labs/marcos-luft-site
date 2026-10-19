import Link from "next/link";
import { BASE } from "../app/base";

/**
 * Seção "Sobre" teaser da home (hero-05-style left-tagline/right-headline
 * split, reimplementado framework-free): retrato emoldurado (`.plate`,
 * padrão já portado em 03-theme-tokens-and-fonts) + texto-chamada + link
 * para a página `/sobre` completa. Auto-contido — quem compõe a home só
 * precisa passar o texto e o destino do link.
 */
export default function SobreSplit({
  teaser,
  href = "/sobre",
}: {
  teaser: string;
  href?: string;
}) {
  return (
    <section className="sobre-split">
      <div className="sobre-split-photo">
        <div className="plate plate--photo">
          <img src={`${BASE}/headshot.jpeg`} alt="Marcos Luft" />
        </div>
      </div>
      <div className="sobre-split-text">
        <p className="sobre-split-teaser">{teaser}</p>
        <Link href={href} className="btn btn-ghost">
          Conhecer a trajetória completa →
        </Link>
      </div>
    </section>
  );
}
