// CK-14 (e2e): at a genuine 390px mobile width, the services grid, the
// trajectory timeline, and the FAQ must not overflow horizontally or clip
// text. A plain viewport resize alone can't be trusted (a stale layout can
// report an innerWidth that doesn't match what's actually painted), so this
// also reads document.documentElement.scrollWidth/clientWidth directly from
// inside that 390px page — the real signal for horizontal overflow.
import { test, expect, type Page } from "@playwright/test";

const MOBILE_WIDTH = 390;

test.use({ viewport: { width: MOBILE_WIDTH, height: 844 } });

/** True once the real DOM reports no horizontal scroll at this width. */
async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
}

test.describe("mobile 390px: no horizontal overflow (CK-14)", () => {
  test("document reports the real 390px viewport width", async ({ page }) => {
    await page.goto("/");
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(innerWidth).toBe(MOBILE_WIDTH);
  });

  test("page has no horizontal overflow at 390px", async ({ page }) => {
    await page.goto("/");
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  for (const sectionId of ["servicos", "trajetoria", "faq"]) {
    test(`#${sectionId} fits inside the 390px viewport with no clipped text`, async ({ page }) => {
      await page.goto("/");
      const section = page.locator(`#${sectionId}`);
      await section.scrollIntoViewIfNeeded();

      const box = await section.boundingBox();
      expect(box).not.toBeNull();
      // A section wider than the viewport is exactly how clipped/overflowing
      // text shows up at this width — the box's right edge must stay inside
      // the 390px frame, not just its left edge at 0.
      expect(box!.x + box!.width).toBeLessThanOrEqual(MOBILE_WIDTH + 1); // +1px rounding slack

      expect(await hasNoHorizontalOverflow(page)).toBe(true);
    });
  }
});
