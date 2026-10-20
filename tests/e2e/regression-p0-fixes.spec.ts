// REGRESSÃO: guards for three P0 bugs found in the 2026-10-19 lapidação audit
// (see scratchpad/marcos-lapidacao.md). Each was fixed in code already; these
// tests fail if any of the three fixes is ever reverted.
//
//  (a) Logo.tsx rendered its 536×144 SVG at native size inside the 68px
//      sticky header — no height cap — so it blew past the header and
//      overlapped page content on scroll.
//  (b) `.chip`/`.chips` had no CSS at all, so the 6 competência items ran
//      together with zero visual separation ("…multiplataformaLocução…").
//  (c) In-page anchor nav items ("/#trajetoria") rendered via next/link's
//      <Link>, which only updates the hash when already on "/" — from any
//      other route (e.g. /sobre) the link did nothing.
import { test, expect } from "@playwright/test";

test("REGRESSÃO: the header logo never grows taller than the sticky header", async ({ page }) => {
  await page.goto("/");

  const header = page.locator(".site-header");
  const logo = page.locator(".site-header img");

  const headerBox = await header.boundingBox();
  const logoBox = await logo.boundingBox();

  expect(headerBox, "expected the sticky header to render").not.toBeNull();
  expect(logoBox, "expected the header logo <img> to render").not.toBeNull();
  expect(logoBox!.height).toBeLessThanOrEqual(headerBox!.height);
});

test("REGRESSÃO: competência chips render with visible gaps, not run together", async ({ page }) => {
  await page.goto("/");

  const chips = page.locator(".chip");
  const count = await chips.count();
  expect(count, "expected the competências list to render at least 2 chips").toBeGreaterThanOrEqual(2);

  const first = await chips.nth(0).boundingBox();
  const second = await chips.nth(1).boundingBox();
  expect(first, "expected the first chip to have a layout box").not.toBeNull();
  expect(second, "expected the second chip to have a layout box").not.toBeNull();

  // Both chips must actually be visually separated: either a horizontal gap
  // on the same row, or a vertical gap once wrapped to the next row — never
  // touching/overlapping (the bug this guards against: 0px of either).
  const sameRow = Math.abs(first!.y - second!.y) < 2;
  const gap = sameRow ? second!.x - (first!.x + first!.width) : second!.y - (first!.y + first!.height);
  expect(gap, "expected a visible gap between adjacent chips").toBeGreaterThan(0);
});

test("REGRESSÃO: a header anchor nav item resolves to the home page from a non-home route", async ({ page }) => {
  await page.goto("/sobre");

  const trajetoriaLink = page.locator('a[href="/#trajetoria"]').first();
  await expect(trajetoriaLink, 'expected a header nav link with href="/#trajetoria"').toBeVisible();

  await trajetoriaLink.click();
  await page.waitForURL(/\/#trajetoria$/);

  // Landed on the home page (not stuck on /sobre with a dead hash), and the
  // section the link promised to reach actually exists there.
  expect(new URL(page.url()).pathname).toBe("/");
  await expect(page.locator("#trajetoria")).toBeVisible();
});
