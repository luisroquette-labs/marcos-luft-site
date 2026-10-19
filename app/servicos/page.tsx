import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ClosingCTA from "../../components/ClosingCTA";
import Reveal from "../../components/Reveal";
import { person, servicos, competencias } from "../content";

export const metadata: Metadata = {
  title: `Serviços — ${person.name}`,
  description: servicos.lead,
};

/**
 * Página /servicos — versão aprofundada das 4 fichas que a home só
 * resume (FeatureSpotlight ali mostra título+benefício+CTA; aqui também
 * entram "para quem é" e o escopo defensável completo de cada linha,
 * perfil §3). Nenhuma frase nova: tudo vem de `servicos.items`/`competencias`
 * em app/content.ts, que por sua vez rastreia a profile-extraction.md.
 *
 * Reusa `ClosingCTA` (mesmo componente/âncora `#contato` da home) para que
 * o `item.href="#contato"` de cada ficha resolva nesta própria página —
 * nenhuma rota nova de contato foi inventada.
 */
export default function ServicosPage() {
  return (
    <>
      <SiteHeader />

      <section className="section" style={{ paddingTop: 64, paddingBottom: 0 }}>
        <div className="wrap">
          <Reveal className="section-head">
            <span className="eyebrow">{servicos.eyebrow}</span>
            <h1 style={{ fontSize: "clamp(2.4rem, 5.6vw, 4rem)", marginTop: 18 }}>{servicos.title}</h1>
            <p className="lead" style={{ marginTop: 18, maxWidth: "none" }}>{servicos.lead}</p>
          </Reveal>
          <Reveal as="div" className="chips" style={{ marginTop: 8 }}>
            {competencias.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          {servicos.items.map((item, index) => (
            <Reveal
              key={item.title}
              as="div"
              style={{
                borderTop: index === 0 ? "none" : "1px solid var(--ink-hairline)",
                paddingTop: index === 0 ? 0 : 40,
                paddingBottom: 40,
              }}
            >
              {/* <article> keeps each service a self-contained, addressable
                  unit — same semantic role FeatureSpotlight's cards play on
                  the home — so tests can count services independently of
                  the Reveal wrapper's div/section choice. */}
              <article>
                <span className="eyebrow">{`0${index + 1}`}</span>
                <h2 style={{ marginTop: 14 }}>{item.title}</h2>
                <p className="lead" style={{ maxWidth: "none", marginTop: 16 }}>
                  <strong>Para quem é:</strong> {item.forWhom}
                </p>
                <p className="lead" style={{ maxWidth: "none", marginTop: 10 }}>
                  {item.benefit}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
                  {item.scope.map((line) => (
                    <li key={line} className="lead" style={{ maxWidth: "none" }}>
                      → {line}
                    </li>
                  ))}
                </ul>
                <a href={item.href} className="btn btn-primary" style={{ marginTop: 22, display: "inline-flex" }}>
                  {item.cta} →
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal as="div">
        <ClosingCTA
          heading="Vamos conversar sobre a comunicação da sua instituição"
          note={person.thesis}
          ctaLabel={person.whatsappLabel}
          ctaHref={person.whatsapp}
          marqueePhrase={person.name}
        />
      </Reveal>

      <div className="wrap" style={{ marginTop: 28, marginBottom: 56 }}>
        <Link href="/" className="back-link">
          ← Voltar ao início
        </Link>
      </div>

      <SiteFooter />
    </>
  );
}
