import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

/**
 * Not-found global do site (CK-15). Com `output: "export"`, não existe
 * servidor: um slug inexistente em `/blog/[slug]` nunca é pré-renderizado
 * (não está em `generateStaticParams()`), então o `notFound()` chamado
 * dentro de `app/blog/[slug]/page.tsx` nunca chega a executar em produção —
 * o arquivo simplesmente não existe em `/out`. Quem resolve a visita real a
 * uma URL inexistente é o host estático (GitHub Pages serve `404.html` da
 * raiz do export), e ESTE arquivo é o que o Next usa para gerar esse
 * `404.html` — por isso ele precisa existir na raiz de `app/`, e não só no
 * segmento `app/blog/[slug]/` (aquele continua valendo como defesa em
 * profundidade para qualquer cenário futuro com servidor/SSR).
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <section className="section" style={{ minHeight: "48vh", display: "flex", alignItems: "center" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">404</span>
          <h1 className="display" style={{ marginTop: 18 }}>
            Esta página não existe.
          </h1>
          <p className="lead" style={{ margin: "18px auto 0" }}>
            O link pode estar errado ou a página foi movida.
          </p>
          <p style={{ marginTop: 30 }}>
            <Link href="/" className="btn btn-primary">
              ← Voltar ao início
            </Link>
          </p>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
