// CK-1 (e2e): a service's own CTA must land the visitor on the real
// #contato section — not a dead/placeholder link. Lenis (components/
// SmoothScroll.tsx) owns scrolling, so this exercises window.__lenis
// instead of relying on the browser's raw native anchor jump.
//
// EXTRA QA (requested alongside CK-1, not itself a CK case): a static guard
// against a hardcoded internal <a href="/..."> in the header/footer that
// would bypass next/link's automatic basePath prefixing and 404 once the
// GitHub Pages basePath is set (CK-16 — only the export build validates
// that in CI, never this local next-dev suite).
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

// Playwright's test runner transpiles these files to CommonJS, so plain
// __dirname is available (no import.meta.url dance needed).
const componentsDir = path.join(__dirname, "../../components");

test.describe("conversion flow: service CTA -> #contato (CK-1)", () => {
  test("clicking a service card's own CTA scrolls the page to the #contato section", async ({ page }) => {
    await page.goto("/");

    // SmoothScroll.tsx mounts Lenis (and its click interceptor) in a
    // useEffect, a beat after first paint. Clicking before that finishes
    // hits the plain pre-hydration anchor instead — wait for window.__lenis
    // so this exercises the app's steady-state interactive behavior.
    await page.waitForFunction(() => Boolean((window as unknown as { __lenis?: unknown }).__lenis));

    // Scoped to #servicos-detalhe (the FeatureSpotlight carousel's section
    // after the services teaser was split into two one-screen sections — see
    // app/page.tsx) so this click hits a service card's own CTA, not the
    // hero's "Solicitar diagnóstico" CTA (same target anchor, different
    // section — both are real content.ts hrefs, not a shared placeholder).
    const serviceCta = page.locator('#servicos-detalhe a[href="#contato"]').first();
    await expect(serviceCta).toBeVisible();
    await serviceCta.click();

    // Lenis tracks its own virtual scroll position and reapplies it every
    // animation frame; a native anchor jump that it doesn't know about gets
    // snapped back on the very next frame. SmoothScroll.tsx intercepts the
    // click and drives window.__lenis.scrollTo("#contato") instead — assert
    // the section actually ends up in view, not just that the click fired.
    await expect(page.locator("#contato")).toBeInViewport({ timeout: 5000 });
  });
});

test.describe("EXTRA QA: internal links stay basePath-safe", () => {
  test("header/footer never hardcode a raw internal href bypassing next/link", () => {
    const rawInternalAnchor = /<a\s[^>]*href=["']\/(?!\/)[^"']*["']/g;

    for (const file of ["SiteHeader.tsx", "SiteFooter.tsx"]) {
      const source = readFileSync(path.join(componentsDir, file), "utf8");
      expect(source.match(rawInternalAnchor), `${file} has a raw <a href="/...">`).toBeNull();
    }
  });
});
