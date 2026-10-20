// Component test for the home composition (09-home-composition).
//
// Primary target: CK-9 — both provided images (headshot.jpeg via SobreSplit,
// hero-banner.jpeg via ProvaBand) must appear somewhere in the rendered home
// page. A few adjacent, cheap-to-verify structural facts from the same
// composition (the #contato anchor target, the 4 distinct FeatureSpotlight
// CTAs, the current-role badge text) are covered alongside it so this one
// file exercises the whole page render once rather than mounting it
// repeatedly.
//
// The CTA assertion below selects by tag/section (`#servicos-detalhe article a`),
// not by CSS Module class name: this loader stubs every `*.module.css`
// import to `export default {}` (see tsx-loader.mjs), so a class like
// `styles.cta` resolves to `undefined` at render time — a class-name
// selector would silently never match once a component moves to CSS
// Modules, same reason feature-spotlight.test.tsx asserts on `<a>`/`<article>`
// tags rather than class names. Scoping to `article a` (FeatureSpotlight's
// own card markup) excludes the home's separate "Ver todos os serviços →"
// link to /servicos. The services teaser was split into two one-screen
// sections (regra de ouro): `#servicos` holds the eyebrow/title/lead, and
// `#servicos-detalhe` holds the FeatureSpotlight carousel + "Ver todos" link.
//
// None of Home's child components (StatCounter/Reveal/GhostAccordion/CrowdCanvas)
// need a jsdom `window` to render their initial markup — hooks simply don't
// fire their effects during a static SSR pass — so `renderToStaticMarkup` is
// enough, same approach as tests/component/editorial-post-card.test.tsx.
//
// Dynamic imports are deferred into an async helper (never awaited at module
// top-level) — same workaround as tests/component/crowd-canvas.test.tsx —
// because this project's tsx/esbuild loader transpiles .tsx to CJS, where
// top-level await is a hard syntax error.
//
// The same loader also compiles JSX with the classic runtime
// (`React.createElement`, see crowd-canvas.test.tsx's comment on this), so
// every component module under test needs `React` resolvable as a bare
// identifier. None of the page/component files import React themselves
// (they rely on the automatic JSX runtime Next.js normally provides), so —
// exactly like crowd-canvas.test.tsx — this test exposes it on `globalThis`
// before importing anything that renders JSX.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

async function loadFixtures() {
  const React = await import("react");
  (globalThis as unknown as { React: typeof React }).React = React;

  const { renderToStaticMarkup } = await import("react-dom/server");
  const { default: Home } = await import("../../app/page.tsx");
  const { hero, servicos } = await import("../../app/content.ts");
  return { renderToStaticMarkup, React, Home, hero, servicos };
}

async function renderHome(): Promise<Document> {
  const { renderToStaticMarkup, React, Home } = await loadFixtures();
  const html = renderToStaticMarkup(React.createElement(Home));
  return new JSDOM(`<!doctype html><body>${html}</body>`).window.document;
}

test("home page renders both provided images (CK-9): hero-banner via ProvaBand, headshot via SobreSplit", async () => {
  const doc = await renderHome();
  const sources = Array.from(doc.querySelectorAll("img")).map((img) => img.getAttribute("src") ?? "");

  assert.ok(
    sources.some((src) => src.endsWith("/hero-banner.jpeg")),
    "expected an <img> sourced from hero-banner.jpeg (ProvaBand)"
  );
  assert.ok(
    sources.some((src) => src.endsWith("/headshot.jpeg")),
    "expected an <img> sourced from headshot.jpeg (SobreSplit)"
  );
});

test('home page renders a <section id="contato"> that every "#contato" CTA can resolve to', async () => {
  const doc = await renderHome();

  assert.ok(doc.querySelector("section#contato"), 'expected a <section id="contato"> to exist');

  const contatoLinks = doc.querySelectorAll('a[href="#contato"]');
  assert.ok(contatoLinks.length > 0, 'expected at least one CTA with href="#contato"');
});

test("home page renders exactly 4 FeatureSpotlight CTAs with distinct href/label combos (CK-1)", async () => {
  const { servicos } = await loadFixtures();
  const doc = await renderHome();
  const ctas = Array.from(doc.querySelectorAll("section#servicos-detalhe article a"));

  assert.equal(ctas.length, servicos.items.length, `expected exactly ${servicos.items.length} offer CTAs`);
  assert.equal(ctas.length, 4, "the services section must have exactly 4 offers");

  const combos = ctas.map((a) => `${a.getAttribute("href")}::${a.textContent}`);
  assert.equal(new Set(combos).size, 4, "all 4 offer CTAs must be distinct, not a shared placeholder");
});

test("home page surfaces the current-role badge text in the hero (CK-2)", async () => {
  const { hero } = await loadFixtures();
  const doc = await renderHome();
  const heroSection = doc.querySelector("section.hero");

  assert.ok(heroSection, 'expected a <section class="hero"> wrapping the Crowd Canvas');
  assert.ok(
    heroSection!.textContent?.includes(hero.currentRoleBadge),
    "expected the hero to render content.ts's hero.currentRoleBadge text"
  );
});
