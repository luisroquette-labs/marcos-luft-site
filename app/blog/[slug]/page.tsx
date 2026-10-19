import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import PostCover from "../../../components/PostCover";
import { posts, getPost, type Block } from "../../posts";
import { person } from "../../content";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: `Artigo — ${person.name}` };
  return {
    title: `${post.title} — ${person.name}`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

function renderBlock(b: Block, i: number) {
  switch (b.t) {
    case "h2": return <h2 key={i}>{b.v}</h2>;
    case "h3": return <h3 key={i}>{b.v}</h3>;
    case "ul": return <ul key={i}>{b.v.map((li, j) => <li key={j}>{li}</li>)}</ul>;
    default: return <p key={i}>{b.v}</p>;
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      <article className="article">
        <div className="wrap" style={{ width: "100%" }}>
          <Link href="/blog" className="back-link">← Voltar ao blog</Link>
          <span className="pc-cat" style={{ display: "block", marginTop: 20, color: "var(--ink-soft)", fontFamily: "var(--font-ui)", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {post.category}
          </span>
          <h1>{post.title}</h1>
          <div className="art-meta">
            {new Date(post.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} · {post.readMin} min de leitura
          </div>
          <div style={{ borderRadius: "var(--radius)", overflow: "hidden", margin: "26px 0 32px", border: "1px solid var(--line)" }}>
            <PostCover slug={post.slug} />
          </div>
          <div className="article-body">
            {post.body.map(renderBlock)}
          </div>
          <div style={{ marginTop: 44, padding: 28, borderRadius: "var(--radius)", border: "1px solid var(--ink-hairline)" }}>
            <p style={{ margin: "0 0 16px", color: "var(--ink)", fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
              Precisa de assessoria de imprensa ou comunicação institucional?
            </p>
            <a href={person.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {person.whatsappLabel} →
            </a>
          </div>
        </div>
      </article>
      <SiteFooter />
    </>
  );
}
