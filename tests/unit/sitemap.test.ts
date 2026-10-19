// Table-driven unit tests for app/sitemap.ts's getRoutes() — covers CK-6:
// the sitemap must list home, /servicos, /sobre, /blog, and exactly one
// entry per post slug, no more, no fewer. Tests pass a posts fixture rather
// than depending on the real posts.ts, so this suite keeps passing however
// many articles get written later (see sub-task 05-route-cleanup-and-skeleton).
//
// /servicos joined the static-route set when "Serviços" moved from the
// home's "#servicos" anchor to its own page in content.ts's nav (see
// app/servicos/page.tsx) — getRoutes() picks it up automatically because it
// derives page routes from `nav`, no sitemap.ts code change needed.

import { test } from "node:test";
import assert from "node:assert/strict";
import { getRoutes } from "../../app/sitemap.ts";

const cases: { name: string; posts: { slug: string }[]; expected: string[] }[] = [
  {
    name: "three post slugs",
    posts: [{ slug: "a" }, { slug: "b" }, { slug: "c" }],
    expected: ["/", "/servicos", "/sobre", "/blog", "/blog/a", "/blog/b", "/blog/c"],
  },
  {
    name: "zero posts — only the 4 static routes remain",
    posts: [],
    expected: ["/", "/servicos", "/sobre", "/blog"],
  },
  {
    name: "one post slug",
    posts: [{ slug: "only-post" }],
    expected: ["/", "/servicos", "/sobre", "/blog", "/blog/only-post"],
  },
];

for (const { name, posts, expected } of cases) {
  test(`getRoutes(${name}) returns exactly the expected route set`, () => {
    assert.deepEqual(getRoutes(posts), expected);
  });
}

test("getRoutes() against the real posts.ts has no /projetos route and no duplicates", () => {
  const routes = getRoutes();

  assert.ok(!routes.some((route) => route.includes("/projetos")), "a /projetos route leaked into the sitemap");
  assert.equal(new Set(routes).size, routes.length, "sitemap has duplicate routes");
});

test("getRoutes() includes /servicos — the dedicated services page must be crawlable", () => {
  assert.ok(getRoutes().includes("/servicos"), "/servicos is missing from the sitemap routes");
});
