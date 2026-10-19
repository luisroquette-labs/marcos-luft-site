# Marcos Luft — Assessoria de Imprensa

Site pessoal de **Marcos Luft**, assessor de imprensa com 26+ anos de carreira unindo jornalismo de rede nacional (RBS TV / afiliada Rede Globo) e comunicação institucional pública (Câmara de Vereadores de Santo Ângelo/RS). O site **vende** quatro frentes de serviço e serve de vitrine da trajetória.

Ao vivo: **https://luisroquette-labs.github.io/marcos-luft-site/**

## Identidade

Estética editorial **ink-on-cream** (fundo creme, tinta quase-preta, serifa de alto contraste Fraunces + Inter). O hero é um **Crowd Canvas** — uma multidão ilustrada que caminha em loop (HTML5 Canvas, `requestAnimationFrame`, sem dependências), metáfora do ofício: alcançar o público. Trajetória em **Pigment Ledger** (wordmarks gigantes dos empregadores com florescimento de aquarela no hover). Tudo respeita `prefers-reduced-motion`.

## Stack

- **Next.js** (App Router) com `output: "export"` — site 100% estático.
- Zero dependência de runtime além de `lenis` (smooth-scroll). Fontes via `next/font` (bundladas).
- Conteúdo tipado em `app/content.ts` / `app/posts.ts` (fonte única da verdade).
- Testes: `node:test` (unit/component), Playwright (e2e), scripts de smoke do export.

## Rodar localmente

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unit + component
npx playwright test  # e2e
```

## Deploy

GitHub Pages via GitHub Actions (`.github/workflows/pages.yml`). Todo push em `main` dispara: typecheck → testes → smoke meta-tests → `next build` (export estático) → publish no Pages. O build roda **apenas no Actions** (`NEXT_PUBLIC_BASE_PATH=/marcos-luft-site`). Ações de terceiros fixadas por SHA; permissões mínimas (`pages: write`, `id-token: write`).

## Estrutura

```
app/            páginas (home, /servicos, /sobre, /blog, /blog/[slug]) + content.ts/posts.ts + sitemap/robots
components/     CrowdCanvas, PigmentLedger, FeatureSpotlight, GhostAccordion, EditorialPostCard, ClosingCTA, ProvaBand, SobreSplit, StatCounter…
public/         imagens, logo, favicon
tests/          unit · component · e2e · smoke
```

---

Feito na fábrica **Site 10x**.
