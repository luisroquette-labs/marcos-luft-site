// CK-2 (e2e): the current-role badge must be visible in the hero area on
// first viewport load, with no scrolling — it is the headline proof that
// the career trajectory is current, not stale.
import { test, expect } from "@playwright/test";
import { hero } from "../../app/content.ts";

test.describe("hero current-role badge visible on first viewport (CK-2)", () => {
  test("hero.currentRoleBadge renders inside the hero section without scrolling", async ({ page }) => {
    await page.goto("/");

    const heroSection = page.locator("#inicio");
    const badge = heroSection.getByText(hero.currentRoleBadge, { exact: false });

    // No scroll action happens anywhere above this assertion — toBeInViewport
    // confirms the badge is already within the viewport Playwright loaded at
    // (top of page), proving it needs no scroll to be seen.
    await expect(badge).toBeInViewport();
  });
});
