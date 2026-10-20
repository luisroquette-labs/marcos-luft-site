import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Reveal from "../../components/Reveal";
import EditorialPostCard from "../../components/EditorialPostCard";
import { BASE } from "../base";
import { person } from "../content";
import { posts } from "../posts";

const DESCRIPTION = "Assessoria de imprensa e comunicação institucional — bastidores da redação e da Câmara.";

export const metadata: Metadata = {
  title: `Blog — ${person.name}`,
  description: DESCRIPTION,
  openGraph: {
    title: `Blog — ${person.name}`,
    description: DESCRIPTION,
    images: [{ url: `${BASE}/hero-banner.jpeg` }],
  },
};

export default function BlogIndex() {
  return (
    <>
      <SiteHeader />
      <main>
      {/* site10x: seção rolável por necessidade — o índice do blog é uma lista
          longa (conteúdo corrido), exceção explícita à regra "uma tela". Sem
          data-snap: o SmoothScroll não instancia snap em páginas sem seções
          snapáveis, então /blog rola normal. */}
      <section className="section section--flow" style={{ paddingTop: 64 }}>
        <div className="wrap">
          <Reveal className="section-head" >
            <span className="eyebrow">Blog</span>
            {/* Explicit size/margin: `.section-head h2` carries this clamp in
                globals.css, but that selector only targets h2 — this heading
                moved to h1 for document outline (CK: one h1 per page). */}
            <h1 style={{ fontSize: "clamp(2rem, 4.6vw, 3.3rem)", marginTop: 18 }}>
              Bastidores da <span className="em">assessoria de imprensa</span>.
            </h1>
            <p className="lead">Critérios reais de pauta, comunicação institucional e cobertura de eventos, escritos por quem passou 26 anos dos dois lados da câmera.</p>
          </Reveal>
          <div className="post-list">
            {posts.map((p) => <EditorialPostCard key={p.slug} post={p} />)}
          </div>
          <p style={{ marginTop: 36 }}>
            <Link href="/" className="back-link">← Voltar ao início</Link>
          </p>
        </div>
      </section>
      </main>
      <SiteFooter />
    </>
  );
}
