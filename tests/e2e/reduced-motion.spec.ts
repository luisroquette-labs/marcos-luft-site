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
});
