# MIGRATION-PROMPT — recriar/adaptar este site a partir do repositório

Cole o texto abaixo no seu agente de código (Claude Code, Codex, Cursor) **depois de clonar este repo**. Ele reaproveita o código EXATO — não redesenha nada.

---

Você vai personalizar este site (Next.js `output: "export"`, estático, publicado no GitHub Pages) para OUTRA pessoa, **usando o código EXATO deste repositório**. Regras inegociáveis:

1. **NÃO recrie nem redesenhe a partir de screenshots.** Use os componentes que já existem. O visual (editorial ink-on-cream, serifa Fraunces + Inter, monocromático) e as animações já estão prontos e aprovados.
2. **Preserve os componentes-assinatura** (não reescreva, só reutilize):
   - `CrowdCanvas.tsx` — hero com a multidão ilustrada (OpenPeeps / skiper39), walk em `requestAnimationFrame`, `mix-blend-mode` para o ink-on-cream, pausa fora da viewport, respeita `prefers-reduced-motion`.
   - `CareerTimeline.tsx` — linha do tempo **horizontal** (uma tela), nós alternando acima/abaixo, marco "atual" destacado.
   - `FeatureSpotlight.tsx` — serviços em cards com holofote/crosshair (carrossel horizontal no mobile).
   - `GhostAccordion.tsx` — FAQ numerado acessível.
   - `EditorialPostCard.tsx` — cards de blog editoriais.
   - `ClosingCTA.tsx` — CTA de fechamento com marquee.
   - `VideoShowcase.tsx` — seção de vídeo tela-cheia num frame (16:9 desktop / 9:16 mobile, autoplay mudo na viewport + botão de som).
   - `ProvaBand.tsx`, `SobreSplit.tsx`, `StatCounter.tsx`, `SmoothScroll.tsx`.
3. **Todo o conteúdo é data-driven — nada hardcoded.** Para trocar a pessoa, edite SOMENTE:
   - `app/content.ts` — `person` (nome, cargo, cidade, **whatsapp real**, instagram, mapsUrl), `hero`, `stats`, `servicos`, `trajetoria`, `prova`, `formacao`, `competencias`, `faq`, `nav`.
   - `app/posts.ts` — os posts do blog (slugs, títulos, datas, corpo). Fatos reais; nunca invente cliente/prêmio/métrica.
   - `public/` — `headshot.(jpeg|webp)`, `hero-banner.(jpeg|webp)`, `crowd-sprite.png` (sprite da multidão), `logo-primary.svg` + `app/icon.svg` (logo/favicon), `video-16x9.mp4` / `video-9x16.mp4` / `video-poster.jpg`.
4. **Conecte só as pontas soltas:**
   - `NEXT_PUBLIC_BASE_PATH` = `/` + nome do seu repo (o workflow `.github/workflows/pages.yml` já seta isso no build; ajuste o valor lá).
   - Links internos: âncoras de seção usam `<a href="/#secao">` (NÃO `next/link`, que burla o Lenis); rotas usam `next/link`. O `SmoothScroll.tsx` cuida do snap (`lenis/snap`) e do scroll suave das âncoras.
   - CTAs de contato leem `person.whatsapp` — **coloque o número real** (`https://wa.me/55DDDNUMERO`).
5. **Gates (nunca pule):** `./node_modules/.bin/tsc --noEmit` = 0; `npm test` + `npx playwright test --workers=1` verdes. O `next build` roda **só no GitHub Actions** (workflow já pronto, actions fixadas por SHA, permissões mínimas) — nunca localmente num Mac com RAM apertada.
6. **Regra de layout:** cada `<section>` = uma tela (`100svh`), conteúdo cabe sem scroll interno, rolagem magnética para exato na seção. Exceções (`.section--flow`, sem `data-snap`): índice do `/blog` e o artigo `/blog/[slug]`.

Entregue o site como repo público próprio + GitHub Pages (via o workflow incluído). Valide rotas, responsividade (1440/768/390) e os fluxos antes de considerar pronto.
