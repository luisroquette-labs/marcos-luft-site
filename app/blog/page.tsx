import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Reveal from "../../components/Reveal";
import EditorialPostCard from "../../components/EditorialPostCard";
import { person } from "../content";
import { posts } from "../posts";

export const metadata: Metadata = {
  title: `Blog — ${person.name}`,
  description: "Assessoria de imprensa e comunicação institucional — bastidores da redação e da Câmara.",
};

export default function BlogIndex() {
  return (
    <>
      <SiteHeader />
      <section className="section" style={{ paddingTop: 64 }}>
        <div className="wrap">
          <Reveal className="section-head" >
            <span className="eyebrow">Blog</span>
            <h2>Bastidores da <span className="em">assessoria de imprensa</span>.</h2>
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
      <SiteFooter />
    </>
  );
}
