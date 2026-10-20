// CK-13 (e2e): with prefers-reduced-motion: reduce, scroll-reveal sections
// must already be visible (opacity 1) right after load — not hidden behind
// their normal scroll-triggered fade-in (globals.css's
// @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1 } } rule).
import { test, expect } from "@playwright/test";

test.describe("reduced motion: reveal sections skip the scroll-triggered fade (CK-13)", () => {
  test("every .reveal section is already opacity:1 immediately after load, with no scroll", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const revealSections = page.locator(".reveal");
    const count = await revealSections.count();
    expect(count).toBeGreaterThan(0);

    // Playwright's toBeVisible() ignores opacity, so it can't tell "already
    // shown" apart from "still animating in" — read the computed style
    // directly instead, for every reveal section, not just the first one.
    for (let i = 0; i < count; i++) {
      const opacity = await revealSections.nth(i).evaluate((el) => getComputedStyle(el).opacity);
      expect(opacity).toBe("1");
    }
  });

  // Regra de ouro: the magnetic snap must not fight a visitor who asked for
  // reduced motion. Lenis never mounts under reduced motion (SmoothScroll.tsx
  // bails), so the snap effect finds no Lenis instance and never instantiates
  // either — no inertia, no magnetic pull, native scrolling only.
  test("Lenis and the snap never instantiate under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(300); // give any (unwanted) mount a chance to happen

    const state = await page.evaluate(() => ({
      lenis: (window as unknown as { __lenis?: unknown }).__lenis,
      snapActive: !!(window as unknown as { lenis?: { snap?: boolean } }).lenis?.snap,
    }));

    expect(state.lenis, "Lenis must not mount under reduced motion").toBeUndefined();
    expect(state.snapActive, "snap must not instantiate under reduced motion").toBe(false);
  });
});
