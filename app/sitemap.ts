import type { MetadataRoute } from "next";
import { nav } from "./content.ts";
import { posts } from "./posts.ts";

export const dynamic = "force-static";

// Troque pelo domínio real via NEXT_PUBLIC_SITE_URL quando o domínio próprio existir.
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://luisroquette-labs.github.io/marcos-luft-site";

/**
 * Rotas reais do site: "/" + toda entrada de `content.nav` que aponta para
 * uma página própria (não uma âncora de seção, hoje escrita "/#secao" para
 * resolver de qualquer rota — por isso o filtro exclui "#", não só confere
 * o prefixo "/") + cada slug de `posts.ts`. Extraída do wrapper `sitemap()`
 * abaixo para que o teste unitário (CK-6) verifique a lista exata de rotas
 * sem depender do tipo/runtime `MetadataRoute.Sitemap` do Next.
 */
export function getRoutes(allPosts: { slug: string }[] = posts): string[] {
  const pageRoutes = nav
    .filter((item) => item.href.startsWith("/") && !item.href.includes("#"))
    .map((item) => item.href);
  return ["/", ...pageRoutes, ...allPosts.map((post) => `/blog/${post.slug}`)];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return getRoutes().map((route) => ({
    url: route === "/" ? BASE : `${BASE}${route}`,
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
