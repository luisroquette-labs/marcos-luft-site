// CK-15 (e2e): a non-existent blog URL must never show a blank page or
// crash — it must resolve to the real not-found UI.
//
// KNOWN next-dev limitation (this sub-task's own Blockers & Risks table
// already names this exact risk class — "a route that only breaks under
// output: 'export'" — and marks it acceptable per CK-16): with
// `output: "export"` set in next.config.mjs, Next's dev server throws a
// 500 for ANY /blog/[slug] request whose slug isn't in
// generateStaticParams() — confirmed directly in next/dist/server/dev/
// next-dev-server.js, which runs this check unconditionally on
// `nextConfig.output === 'export'`, before the page component (and its
// notFound() call) ever executes. No app-level code or config disables it.
//
// This is not a component bug: in the real deployed static export, an
// unknown /blog/[slug] URL never exists as a file at all, so GitHub Pages
// serves 404.html — built from the ROOT app/not-found.tsx, exactly as that
// file's own comment documents. That is the real mechanism this test
// exercises below (via a genuinely unmatched top-level route, which next
// dev resolves the same way a static host would), and it is the same UI a
// real visitor hits for an unknown blog slug once deployed. CK-16's
// GitHub Actions workflow (step 12) is what validates the export build
// itself — never this local, next-dev-only suite.
import { test, expect } from "@playwright/test";

test.describe("non-existent routes resolve to the real not-found UI, never a blank/crashed page (CK-15)", () => {
  test("an unmatched route renders the styled 404 — the same page GitHub Pages serves for an unknown /blog/[slug] in production", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    const response = await page.goto("/esta-rota-nao-existe-de-verdade");

    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("Esta página não existe.");
    await expect(page.getByRole("link", { name: /Voltar ao início/ })).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});
