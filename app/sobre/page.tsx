import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Reveal from "../../components/Reveal";
import PigmentLedger from "../../components/PigmentLedger";
import { BASE } from "../base";
import { person, trajetoria, formacao } from "../content";

export const metadata: Metadata = {
  title: `Sobre — ${person.name}`,
  description: person.thesis,
};

/**
 * Página /sobre — narrativa de trajetória estendida (CK-2/CK-3/CK-9/CK-12).
 *
 * Reusa `PigmentLedger` (substitui `EditorialTimeline`, 08) para a trajetória
 * completa — evita duplicar a lógica do marcador "atual" que ela já implementa
 * (CK-17) — e as classes
 * `.sobre-split`/`.plate--photo`/`.prova-band` (03/08) para enquadrar as duas
 * fotos fornecidas, em vez de reimplementar o mesmo grid em CSS novo.
 *
 * Toda frase nova aqui é paráfrase de `person.thesis`/`trajetoria.items[*].body`
 * — nenhum cliente, prêmio ou métrica fora de `content.ts` é introduzido.
 */
export default function SobrePage() {
  return (
    <>
      <SiteHeader />

      <section className="section" style={{ paddingTop: 64, paddingBottom: 32 }}>
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

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal as="div" className="sobre-split">
            <div className="sobre-split-photo">
              <div className="plate plate--photo">
                <img src={`${BASE}/headshot.jpeg`} alt={person.name} />
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

      <section className="section" id="trajetoria-completa">
        <div className="wrap">
          <Reveal as="div" className="section-head">
            <span className="eyebrow">{trajetoria.eyebrow}</span>
            <h2>{trajetoria.title}</h2>
          </Reveal>
          <PigmentLedger items={trajetoria.items} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal as="div" className="prova-band">
            <img
              className="prova-band-image"
              src={`${BASE}/hero-banner.jpeg`}
              alt="Marcos Luft em cobertura jornalística"
            />
            <div className="prova-band-content">
              <span className="eyebrow">Em cobertura</span>
              <h2 className="prova-band-title">Da redação nacional ao plenário da Câmara</h2>
              <p className="prova-band-framing">
                A mesma rotina de texto, foto e vídeo sob deadline — aprendida em 14 anos de TV aberta — hoje
                aplicada à comunicação institucional e à cobertura de eventos.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
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

      <section className="section" style={{ paddingTop: 0 }}>
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

      <SiteFooter />
    </>
  );
}
