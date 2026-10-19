// CK-5 (e2e): /blog lists at least 2 real posts, and each one opens into a
// detail page that renders its full body — not a stub/teaser-only page.
// CK-6 (e2e): every real route (/, /sobre, /blog, and a real /blog/[slug])
// renders distinct real content with no error boundary triggered.
import { test, expect } from "@playwright/test";
import { posts, type Block } from "../../app/posts.ts";

/** First paragraph block's text — used to prove the detail page rendered the
 *  post's actual body, not just its title/excerpt. */
function firstParagraph(body: Block[]): string {
  const paragraph = body.find((block) => block.t === "p");
  if (!paragraph) throw new Error("post body has no paragraph block to assert against");
  return paragraph.v;
}

test.describe("blog index lists real posts (CK-5)", () => {
  test("at least 2 posts are listed on /blog", async ({ page }) => {
    await page.goto("/blog");
    const postLinks = page.locator('.post-list a[href^="/blog/"]');
    await expect(postLinks).toHaveCount(posts.length);
    expect(posts.length).toBeGreaterThanOrEqual(2);
  });

  for (const post of posts) {
    test(`opening "${post.slug}" renders its full body content (CK-5)`, async ({ page }) => {
      await page.goto("/blog");
      // next.config.mjs sets trailingSlash: true, so the real href is
      // "/blog/<slug>/" — match by prefix instead of hardcoding the slash.
      await page.locator(`.post-list a[href^="/blog/${post.slug}"]`).click();

      await expect(page.locator("h1")).toHaveText(post.title);
      await expect(page.locator(".article-body")).toContainText(firstParagraph(post.body));
    });
  }
});

test.describe("every real route renders distinct content with no error boundary (CK-6)", () => {
  const firstPost = posts[0];

  // /blog's own section heading is an <h2> (see app/blog/page.tsx) — every
  // other route here leads with an <h1>, so the heading tag is per-route,
  // not assumed to always be "h1".
  const routes: Array<{ path: string; heading: "h1" | "h2"; expectedHeading: string | RegExp }> = [
    { path: "/", heading: "h1", expectedHeading: /26 anos contando histórias/ },
    { path: "/sobre", heading: "h1", expectedHeading: "Marcos Luft" },
    { path: "/blog", heading: "h2", expectedHeading: /Bastidores da/ },
    { path: `/blog/${firstPost.slug}`, heading: "h1", expectedHeading: firstPost.title },
  ];

  for (const route of routes) {
    test(`${route.path} renders real content, no error boundary`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("pageerror", (error) => consoleErrors.push(error.message));

      await page.goto(route.path);

      await expect(page.locator(route.heading).first()).toContainText(route.expectedHeading);
      // Next's dev-tools indicator also renders as <nextjs-portal> on every
      // page (error or not), so it can't signal a crash by itself — the
      // absence of any page-level JS error is the real "no error boundary
      // triggered" signal here.
      expect(consoleErrors).toEqual([]);
    });
  }
});
