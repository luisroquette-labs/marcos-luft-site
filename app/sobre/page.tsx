import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Reveal from "../../components/Reveal";
import CareerTimeline from "../../components/CareerTimeline";
import ProvaBand from "../../components/ProvaBand";
import { BASE } from "../base";
import { person, trajetoria, formacao, prova } from "../content";

export const metadata: Metadata = {
  title: `Sobre — ${person.name}`,
  description: person.thesis,
  openGraph: {
    title: `Sobre — ${person.name}`,
    description: person.thesis,
    images: [{ url: `${BASE}/hero-banner.jpeg` }],
  },
};

/**
 * Splits `person.location` ("Santo Ângelo, RS") into Schema.org's
 * addressLocality/addressRegion — reads the one value `content.ts` already
 * has instead of hardcoding the city/state a second time in the JSON-LD below.
 */
function splitLocation(location: string): { addressLocality: string; addressRegion: string } {
  const [addressLocality, addressRegion] = location.split(",").map((part) => part.trim());
  return { addressLocality, addressRegion };
}

/**
 * Person JSON-LD (GEO/SEO — AI Overviews and search engines read this to
 * resolve who Marcos is and what he does). Every field traces to `person` in
 * content.ts; no `sameAs` is emitted because no literal LinkedIn/social URL
 * exists in the source profile (`profile-extraction.md`) — same [SEM DADO]
 * discipline as `person.whatsapp`'s placeholder note (AD-2: never invent a
 * link that would read as verified).
 */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  jobTitle: person.role,
  address: {
    "@type": "PostalAddress",
    ...splitLocation(person.location),
    addressCountry: "BR",
  },
};

/**
 * Página /sobre — narrativa de trajetória estendida (CK-2/CK-3/CK-9/CK-12).
 *
 * Reusa `CareerTimeline` (substitui `PigmentLedger`/`EditorialTimeline`, 08)
 * para a trajetória completa — evita duplicar a lógica do marcador "atual"
 * que ela já implementa (CK-17) — e as classes
 * `.sobre-split`/`.plate--photo`/`.prova-band` (03/08) para enquadrar as duas
 * fotos fornecidas, em vez de reimplementar o mesmo grid em CSS novo.
 *
 * Toda frase nova aqui é paráfrase de `person.thesis`/`trajetoria.items[*].body`
 * — nenhum cliente, prêmio ou métrica fora de `content.ts` é introduzido.
 */
export default function SobrePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <SiteHeader />

      <main>
      <section className="section" data-snap style={{ paddingTop: 64, paddingBottom: 32 }}>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">{person.role}</span>
            <h1 className="display" style={{ fontSize: "clamp(2.4rem, 5.6vw, 4rem)", marginTop: 18 }}>
              {person.name}
            </h1>
            <p className="lead" style={{ marginTop: 18 }}>
              {person.thesis}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" data-snap style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal as="div" className="sobre-split">
            <div className="sobre-split-photo">
              <div className="plate plate--photo">
                {/* .webp (sharp, quality 82) with the original .jpeg as
                    fallback; intrinsic width/height reserve the layout box
                    (no CLS). */}
                <picture>
                  <source srcSet={`${BASE}/headshot.webp`} type="image/webp" />
                  <img src={`${BASE}/headshot.jpeg`} alt={person.name} width={400} height={400} loading="lazy" />
                </picture>
              </div>
            </div>
            <div className="sobre-split-text">
              <p className="sobre-split-teaser">
                26 anos entre os dois lados da notícia: da câmera da Rede Globo/RBS TV à comunicação
                institucional pública.
              </p>
              <p className="lead" style={{ maxWidth: "none" }}>
                Catorze deles operando câmera e locução na RBS TV, afiliada Rede Globo, contribuindo com
                reportagens para o Jornal Nacional, o Globo Repórter, o Jornal do Almoço e o RBS Notícias;
                outros sete, à frente do microfone na Rádio Novos Horizontes, em Santo Ângelo/RS. Desde 2017,
                aplica essa vivência de redação à comunicação institucional pública na Câmara de Vereadores
                de Santo Ângelo — hoje como Especialista em Comunicação de Marketing em tempo integral.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" id="trajetoria-completa" data-snap>
        <div className="wrap">
          <Reveal as="div" className="section-head">
            <span className="eyebrow">{trajetoria.eyebrow}</span>
            <h2>{trajetoria.title}</h2>
          </Reveal>
          <CareerTimeline items={trajetoria.items} />
        </div>
      </section>

      {/* PROVA — reusa ProvaBand (mesmo componente/dados da home, 09) em vez
          de reimplementar a faixa de imagem+credenciais com JSX próprio;
          evita duas fontes de verdade pro mesmo bloco (CK-4/CK-9). */}
      <section className="section" data-snap>
        <div className="wrap">
          <Reveal>
            <ProvaBand prova={prova} />
          </Reveal>
        </div>
      </section>

      <section className="section" data-snap>
        <div className="wrap">
          <Reveal as="div" className="section-head">
            <span className="eyebrow">{formacao.eyebrow}</span>
            <h2>{formacao.title}</h2>
          </Reveal>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {formacao.items.map((item) => (
              <li key={item.course} className="lead" style={{ maxWidth: "none" }}>
                <strong>{item.course}</strong> — {item.institution} · <em>{item.status}</em>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" data-snap style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <p className="lead" style={{ margin: 0 }}>
            Precisa de assessoria de imprensa ou comunicação institucional?
          </p>
          <a href={person.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            {person.whatsappLabel} →
          </a>
        </div>
        <div className="wrap" style={{ marginTop: 28 }}>
          <Link href="/" className="back-link">
            ← Voltar ao início
          </Link>
        </div>
      </section>
      </main>

      <SiteFooter />
    </>
  );
}
