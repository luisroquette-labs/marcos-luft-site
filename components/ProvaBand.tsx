import { BASE } from "../app/base";
import type { prova } from "../app/content";

/** Forma de `prova` em app/content.ts (eyebrow/title/framing/items). */
type ProvaData = typeof prova;

/**
 * Faixa de prova em largura total (hero-07-style image band, reimplementado
 * framework-free): a foto de cobertura ao lado dos créditos nomeados —
 * programa, emissora/rede e período — com a frase de enquadramento honesta
 * ("contribuiu com reportagens para…") em destaque. Nunca atribuir autoria
 * de matéria específica (CK-11) — `prova.framing` já carrega essa cautela.
 */
export default function ProvaBand({ prova }: { prova: ProvaData }) {
  return (
    <section className="prova-band">
      {/* .webp (sharp, quality 82) with the original .jpeg as fallback for
          browsers without WebP support — intrinsic width/height reserve the
          layout box before the image loads (no CLS); it's below the hero,
          so lazy-loading it costs nothing. */}
      <picture>
        <source srcSet={`${BASE}/hero-banner.webp`} type="image/webp" />
        <img
          className="prova-band-image"
          src={`${BASE}/hero-banner.jpeg`}
          alt="Marcos Luft em cobertura jornalística"
          width={1400}
          height={350}
          loading="lazy"
        />
      </picture>
      <div className="prova-band-content">
        <span className="eyebrow">{prova.eyebrow}</span>
        <h2 className="prova-band-title">{prova.title}</h2>
        <p className="prova-band-framing">{prova.framing}</p>
        <ul className="prova-credentials">
          {prova.items.map((item) => (
            <li key={`${item.program}-${item.network}`} className="prova-credential">
              <span className="prova-credential-program">{item.program}</span>
              <span className="prova-credential-network">{item.network}</span>
              <span className="prova-credential-years">{item.years}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
