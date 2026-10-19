// Smoke test for app/servicos/page.tsx — the dedicated services page added
// to deepen the site's expertise signal (sitemap/nav task). Mirrors
// tests/component/home-images.test.tsx's render approach: static SSR via
// `renderToStaticMarkup` is enough because none of this page's components
// (Reveal/ClosingCTA/SiteHeader) need a jsdom `window` for their initial
// markup — hooks' effects simply don't fire during a static pass.
//
// Same classic-JSX-runtime workaround as home-images.test.tsx: this loader
// compiles JSX to `React.createElement`, so `React` must be resolvable as a
// bare global before importing anything that renders JSX.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

async function renderServicosPage(): Promise<Document> {
  const React = await import("react");
  (globalThis as unknown as { React: typeof React }).React = React;

  const { renderToStaticMarkup } = await import("react-dom/server");
  const { default: ServicosPage } = await import("../../app/servicos/page.tsx");
  const html = renderToStaticMarkup(React.createElement(ServicosPage));
  return new JSDOM(`<!doctype html><body>${html}</body>`).window.document;
}

test("/servicos renders all 4 services with title, forWhom, benefit, scope and a CTA", async () => {
  const { servicos } = await import("../../app/content.ts");
  const doc = await renderServicosPage();

  const articles = Array.from(doc.querySelectorAll("article"));
  assert.equal(articles.length, servicos.items.length, `expected one <article> per service`);
  assert.equal(articles.length, 4, "the services page must render exactly 4 services");

  servicos.items.forEach((item, index) => {
    const article = articles[index]!;
    const text = article.textContent ?? "";

    assert.ok(text.includes(item.title), `service ${index} missing title "${item.title}"`);
    assert.ok(text.includes(item.forWhom), `service ${index} missing "para quem é" copy`);
    assert.ok(text.includes(item.benefit), `service ${index} missing benefit copy`);
    for (const scopeLine of item.scope) {
      assert.ok(text.includes(scopeLine), `service ${index} missing scope bullet: ${scopeLine}`);
    }

    const cta = article.querySelector(`a[href="${item.href}"]`);
    assert.ok(cta, `service ${index} missing its own CTA link to "${item.href}"`);
    assert.ok(cta!.textContent?.includes(item.cta), `service ${index} CTA text must include "${item.cta}"`);
  });
});

test("/servicos surfaces the competências strip", async () => {
  const { competencias } = await import("../../app/content.ts");
  const doc = await renderServicosPage();
  const text = doc.body.textContent ?? "";

  for (const item of competencias) {
    assert.ok(text.includes(item), `missing competência: ${item}`);
  }
});
