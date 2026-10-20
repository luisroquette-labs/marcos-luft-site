import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CrowdCanvas from "../components/CrowdCanvas";
import StatCounter from "../components/StatCounter";
import Reveal from "../components/Reveal";
import GhostAccordion from "../components/GhostAccordion";
import EditorialPostCard from "../components/EditorialPostCard";
import FeatureSpotlight from "../components/FeatureSpotlight";
import ProvaBand from "../components/ProvaBand";
import CareerTimeline from "../components/CareerTimeline";
import SobreSplit from "../components/SobreSplit";
import ClosingCTA from "../components/ClosingCTA";
import { person, hero, stats, servicos, competencias, trajetoria, prova, formacao, faq } from "./content";
import { posts } from "./posts";

/**
 * Home composition — as 12 seções da seção "High-Level Structure — Section →
 * Content Map" do task file, nesta ordem exata: Header, Hero (Crowd Canvas),
 * Stats, Serviços, Prova, Trajetória, Sobre teaser, Blog teaser, FAQ,
 * Formação, Contato, Footer. Todo o conteúdo vem de `content.ts`/`posts.ts` —
 * nenhuma frase factual é reescrita aqui.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
      {/* HERO — Crowd Canvas como camada de fundo; o badge do cargo atual
          (CK-2) fica dentro do bloco de texto, visualmente distinto do
          cargo atual na trajetória (seção 6, segundo lugar onde CK-2 se
          repete). */}
      <section className="hero" id="inicio">
        <CrowdCanvas />
        <div className="wrap hero-inner">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{hero.headline}</h1>
          <p className="lead">{hero.sub}</p>
          <span className="hero-badge">
            <b>Cargo atual —</b> {hero.currentRoleBadge}
          </span>
          <div className="hero-ctas">
            {hero.ctas.map((cta, i) => (
              <a key={cta.href} href={cta.href} className={i === 0 ? "btn btn-primary" : "btn btn-ghost"}>
                {cta.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* STATS — count-up (StatCounter já lê prefers-reduced-motion) dentro
          de Reveal para o scroll-in (CK-10, CK-13). */}
      <section className="section" id="stats">
        <div className="wrap">
          <Reveal>
            <div className="stats-row">
              {stats.map((s) => (
                <StatCounter key={s.label} n={s.n} suffix={s.suffix} label={s.label} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVIÇOS — exatamente 4 fichas via FeatureSpotlight, cada uma com
          seu próprio CTA (CK-1); a grade é renderizada pelo próprio
          componente (ver FeatureSpotlight.tsx). */}
      <section className="section" id="servicos">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{servicos.eyebrow}</span>
            <h2>{servicos.title}</h2>
            <p className="lead">{servicos.lead}</p>
          </div>
          <Reveal>
            <FeatureSpotlight items={servicos.items} />
          </Reveal>
          {/* Competências — resumo técnico (perfil §1/§3) entre os cartões de
              serviço e o link para a página aprofundada, cada um com seu
              próprio escopo defensável (CK-1 em app/servicos/page.tsx). */}
          <Reveal as="div" className="chips" style={{ marginTop: 28 }}>
            {competencias.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </Reveal>
          <p style={{ marginTop: 24 }}>
            <Link href="/servicos" className="btn btn-ghost">
              Ver todos os serviços →
            </Link>
          </p>
        </div>
      </section>

      {/* PROVA — ProvaBand já renderiza seu próprio eyebrow/título/framing/
          credenciais (JN, Globo Repórter, Jornal do Almoço, RBS Notícias —
          CK-4) e embute hero-banner.jpeg (CK-9); nunca duplicar o cabeçalho
          aqui fora. */}
      <section className="section" id="prova">
        <div className="wrap">
          <Reveal>
            <ProvaBand prova={prova} />
          </Reveal>
        </div>
      </section>

      {/* TRAJETÓRIA — 3 entradas em ordem ascendente por startDate; o item
          `current` ganha marcação visual própria dentro de CareerTimeline
          (CK-2/CK-3). */}
      <section className="section" id="trajetoria">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{trajetoria.eyebrow}</span>
            <h2>{trajetoria.title}</h2>
          </div>
          <CareerTimeline items={trajetoria.items} />
        </div>
      </section>

      {/* SOBRE teaser — retrato emoldurado (headshot.jpeg, CK-9) + chamada +
          link para /sobre; SobreSplit é auto-contido. */}
      <section className="section" id="sobre">
        <div className="wrap">
          <Reveal>
            <SobreSplit teaser={person.thesis} />
          </Reveal>
        </div>
      </section>

      {/* BLOG teaser — os 3 artigos do profile §7, mesma grade/card já usados
          no blog cheio (CK-5). */}
      <section className="section" id="blog">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Blog</span>
            <h2>Bastidores da assessoria de imprensa</h2>
          </div>
          <Reveal>
            <div className="post-list">
              {posts.slice(0, 3).map((p) => (
                <EditorialPostCard key={p.slug} post={p} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ — as 8 perguntas reais do perfil §6 (CK-10 exige ≥3). */}
      <section className="section" id="faq">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Perguntas frequentes</h2>
          </div>
          <Reveal>
            <GhostAccordion items={faq.items} />
          </Reveal>
        </div>
      </section>

      {/* FORMAÇÃO — status renderizado exatamente como vem de content.ts;
          nunca hardcoded "concluído" perto da graduação em Jornalismo
          (CK-12). */}
      <section className="section" id="formacao">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{formacao.eyebrow}</span>
            <h2>{formacao.title}</h2>
          </div>
          <Reveal>
            <ul className="formacao-list">
              {formacao.items.map((item) => (
                <li key={item.course} className="formacao-item">
                  <span className="formacao-course">{item.course}</span>
                  <span className="formacao-institution">{item.institution}</span>
                  <span className="timeline-badge">{item.status}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CONTATO — todo CTA da página que aponta para "#contato" (hero,
          cada ficha do FeatureSpotlight) resolve a esta seção; ClosingCTA já
          renderiza seu próprio id="contato" e o CTA externo declarado
          (WhatsApp) vem de `person`, nunca um link para si mesma (AD-2). */}
      <Reveal as="div">
        <ClosingCTA
          heading="Vamos conversar sobre a comunicação da sua instituição"
          note={person.thesis}
          ctaLabel={person.whatsappLabel}
          ctaHref={person.whatsapp}
          marqueePhrase={person.name}
        />
      </Reveal>
      </main>

      <SiteFooter />
    </>
  );
}
