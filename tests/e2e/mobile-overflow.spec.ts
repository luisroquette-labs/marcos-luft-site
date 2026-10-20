// Regra de ouro da fábrica ("uma seção = uma tela") + CK-14 (no horizontal
// overflow). Two guarantees, checked at four real viewports:
//
//  1. Every snap section (`[data-snap]`) fits one screen: its box is no taller
//     than the viewport AND its content doesn't overflow it (no internal
//     vertical scroll). scrollHeight > clientHeight is exactly how "content
//     spills past one screen" shows up, even though the box height is locked
//     to 100svh.
//  2. No horizontal overflow (the original CK-14 signal), read straight from
//     document.documentElement.scrollWidth vs clientWidth.
//
// Plus a snap-behaviour check (desktop): scrolling to a section's registered
// snap target lands its top exactly under the sticky header — "para certinho
// no topo de cada seção", header compensado — and same-page header anchors
// smooth-scroll through Lenis instead of doing a full navigation.
import { test, expect } from "@playwright/test";

type LenisWindow = {
  __lenis?: { scrollTo: (target: number, opts?: { immediate?: boolean }) => void };
  lenis?: { snap?: boolean };
};

const VIEWPORTS = [
  { label: "desktop 1440×900", width: 1440, height: 900 },
  { label: "tablet 768×1024", width: 768, height: 1024 },
  { label: "mobile 390×844", width: 390, height: 844 },
  { label: "android 360×800", width: 360, height: 800 },
];

// Panel routes only — /blog index and /blog/[slug] are flow pages by design.
const PANEL_ROUTES = ["/", "/servicos", "/sobre"];

for (const vp of VIEWPORTS) {
  test.describe(`one section = one screen @ ${vp.label}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of PANEL_ROUTES) {
      test(`${route}: every snap section fits one screen, no internal/horizontal overflow`, async ({ page }) => {
        await page.goto(route);
        await page.evaluate(() => document.fonts?.ready);

        const result = await page.evaluate(() => ({
          innerH: window.innerHeight,
          xOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          sections: [...document.querySelectorAll<HTMLElement>("[data-snap]")].map((el, i) => ({
            id: el.id || `snap-${i}`,
            clientH: el.clientHeight,
            scrollH: el.scrollHeight,
          })),
        }));

        expect(result.sections.length).toBeGreaterThan(0);
        expect(result.xOverflow, "horizontal overflow (CK-14)").toBeLessThanOrEqual(1);

        for (const section of result.sections) {
          expect(
            section.clientH,
            `${route} #${section.id}: box taller than the ${result.innerH}px viewport`,
          ).toBeLessThanOrEqual(result.innerH + 1);
          expect(
            section.scrollH,
            `${route} #${section.id}: content overflows its screen (would need internal scroll)`,
          ).toBeLessThanOrEqual(section.clientH + 2);
        }
      });
    }
  });
}

test.describe("magnetic snap + anchor smooth-scroll (desktop)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("snapping to a section lands its top exactly under the sticky header", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts?.ready);
    // Lenis + snap mount in a useEffect a beat after first paint — wait for
    // the instance before driving it (same guard as conversion-flow.spec.ts).
    await page.waitForFunction(() => Boolean((window as unknown as LenisWindow).__lenis));

    const res = await page.evaluate(async () => {
      const win = window as unknown as LenisWindow;
      const headerH = document.querySelector<HTMLElement>(".site-header")!.offsetHeight;
      const el = document.querySelector<HTMLElement>("#faq-1")!;
      const absTop = el.getBoundingClientRect().top + window.scrollY;
      // Scroll to the exact value the snap registers for this section.
      win.__lenis!.scrollTo(absTop - headerH, { immediate: true });
      await new Promise((r) => setTimeout(r, 150));
      return {
        headerH,
        top: Math.round(el.getBoundingClientRect().top),
        snapActive: !!(win.lenis && win.lenis.snap),
      };
    });

    expect(res.snapActive, "lenis/snap should be instantiated on a panel page").toBe(true);
    // The section top sits ~headerH below the viewport top — not under the
    // header (0), not overshot — i.e. "para certinho no topo da seção".
    expect(Math.abs(res.top - res.headerH)).toBeLessThanOrEqual(2);
  });

  test("a same-page header #anchor smooth-scrolls via Lenis, with no full navigation", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.click('a[href$="#trajetoria"]');
    await page.waitForFunction(() => window.scrollY > 200);

    // Lenis drove the scroll (scrollTo takes a pixel value) — it never pushes a
    // "#trajetoria" hash onto the URL, which a native hash jump would.
    expect(page.url()).not.toContain("#");
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
  });
});

test("/blog index is a flow page: no snap sections at all", async ({ page }) => {
  await page.goto("/blog");
  const count = await page.evaluate(() => document.querySelectorAll("[data-snap]").length);
  expect(count).toBe(0);
});
