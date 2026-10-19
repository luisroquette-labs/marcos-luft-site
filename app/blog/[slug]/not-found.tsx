import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";

/**
 * Renderizado pelo App Router quando `app/blog/[slug]/page.tsx` chama
 * `notFound()` para um slug inexistente (CK-15). Sem este arquivo, o Next
 * cairia na UI de not-found genérica/não estilizada — quebrando a
 * consistência ink-on-cream (CK-8) justamente na borda de erro.
 */
export default function BlogSlugNotFound() {
  return (
    <>
      <SiteHeader />
      <section className="section" style={{ minHeight: "48vh", display: "flex", alignItems: "center" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">404</span>
          <h1 className="display" style={{ marginTop: 18 }}>
            Este artigo não existe.
          </h1>
          <p className="lead" style={{ margin: "18px auto 0" }}>
            O link pode estar errado ou o artigo foi movido. Veja todos os artigos disponíveis no blog.
          </p>
          <p style={{ marginTop: 30 }}>
            <Link href="/blog" className="btn btn-primary">
              ← Voltar ao blog
            </Link>
          </p>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
