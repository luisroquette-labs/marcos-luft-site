import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CrowdCanvas from "../components/CrowdCanvas";
import VideoShowcase from "../components/VideoShowcase";
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
      <section className="hero" id="inicio" data-snap>
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

      {/* VÍDEO — showcase de motion design em tela cheia, dentro de uma moldura
          ink-on-cream. Autoplay mudo só na viewport + botão de som; respeita
          prefers-reduced-motion. VideoShowcase é auto-contido (traz seu próprio
          id="video" + data-snap). */}
      <VideoShowcase />

      {/* STATS — count-up (StatCounter já lê prefers-reduced-motion) dentro
          de Reveal para o scroll-in (CK-10, CK-13). */}
      <section className="section" id="stats" data-snap>
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

      {/* SERVIÇOS — tela 1: eyebrow + título + lead. O conteúdo denso (4 fichas)
          não cabe junto do cabeçalho numa única tela (regra de ouro), então a
          seção foi partida em duas: esta abre o assunto, a próxima mostra as
          fichas em carrossel. */}
      <section className="section" id="servicos" data-snap>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">{servicos.eyebrow}</span>
            <h2>{servicos.title}</h2>
            <p className="lead">{servicos.lead}</p>
          </div>
        </div>
      </section>

      {/* SERVIÇOS — tela 2: as 4 fichas via FeatureSpotlight, agora em carrossel
          horizontal (scroll-snap x) para caber numa tela, cada uma com seu
          próprio CTA (CK-1). Competências (perfil §1/§3) e o link para a página
          aprofundada fecham a tela. */}
      <section className="section" id="servicos-detalhe" data-snap>
        <div className="wrap">
          <Reveal>
            <FeatureSpotlight items={servicos.items} />
          </Reveal>
          <Reveal as="div" className="chips" style={{ marginTop: 24 }}>
            {competencias.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </Reveal>
          <p style={{ marginTop: 22 }}>
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
      <section className="section" id="prova" data-snap>
        <div className="wrap">
          <Reveal>
            <ProvaBand prova={prova} />
          </Reveal>
        </div>
      </section>

      {/* TRAJETÓRIA — 3 entradas em ordem ascendente por startDate; o item
          `current` ganha marcação visual própria dentro de CareerTimeline
          (CK-2/CK-3). */}
      <section className="section" id="trajetoria" data-snap>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: 24 }}>
            <span className="eyebrow">{trajetoria.eyebrow}</span>
            <h2>{trajetoria.title}</h2>
          </div>
          <CareerTimeline items={trajetoria.items} />
        </div>
      </section>

      {/* SOBRE teaser — retrato emoldurado (headshot.jpeg, CK-9) + chamada +
          link para /sobre; SobreSplit é auto-contido. */}
      <section className="section" id="sobre" data-snap>
        <div className="wrap">
          <Reveal>
            <SobreSplit teaser={person.thesis} />
          </Reveal>
        </div>
      </section>

      {/* BLOG teaser — os 3 artigos do profile §7, mesma grade/card já usados
          no blog cheio (CK-5). */}
      <section className="section" id="blog" data-snap>
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

      {/* FAQ — as 8 perguntas reais do perfil §6 (CK-10 exige ≥3). Partidas em
          duas telas de 4 (regra de ouro: 8 perguntas abertas não cabem numa
          única tela). Só o array é fatiado aqui; o GhostAccordion é intacto. */}
      <section className="section" id="faq-1" data-snap>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Perguntas frequentes</h2>
          </div>
          <Reveal>
            <GhostAccordion items={faq.items.slice(0, 4)} />
          </Reveal>
        </div>
      </section>

      <section className="section" id="faq-2" data-snap>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Perguntas frequentes — continuação</h2>
          </div>
          <Reveal>
            <GhostAccordion items={faq.items.slice(4)} />
          </Reveal>
        </div>
      </section>

      {/* FORMAÇÃO — status renderizado exatamente como vem de content.ts;
          nunca hardcoded "concluído" perto da graduação em Jornalismo
          (CK-12). */}
      <section className="section" id="formacao" data-snap>
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
