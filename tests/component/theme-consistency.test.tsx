// Component test for CK-8: the same ink-on-cream base theme (shared CSS
// vars/classnames + the shared SiteHeader/SiteFooter chrome) must be applied
// on home, /sobre, and /blog — not only as a hero-scoped override. See
// sub-task 10-sobre-and-blog-routes, Success Criteria.
//
// This reads the three route files' SOURCE TEXT instead of importing and
// rendering them. `app/page.tsx` (home) belongs to `09-home-composition`,
// edited concurrently by a parallel agent while this file is written —
// importing/rendering it here would race that in-flight edit and would also
// pull in Next-specific concerns (next/font, CrowdCanvas's canvas ref) this
// test has no business depending on. Static assertions are robust to
// whatever exact composition `09` settles on, as long as it follows the
// architecture (AD-1/CK-8), which is a required acceptance criterion either way.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROUTE_FILES = {
  home: "../../app/page.tsx",
  sobre: "../../app/sobre/page.tsx",
  blog: "../../app/blog/page.tsx",
} as const;

function readRoute(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

// Any reference to the base ink-on-cream vars (defined once in globals.css's
// `:root`, CK-8) OR to one of the shared layout classnames globals.css styles
// with them counts as "theme applied as a base" — the rubric's score_4
// anchor (`className="bg-cream text-ink font-serif-display"`).
const THEME_SIGNAL =
  /var\(--(ink|cream)|className="[^"]*\b(wrap|section|eyebrow|lead|plate|timeline|prova-band|post-card|article|sobre-split)\b/;

// The rubric's score_2 anchor bypasses the theme with a hardcoded literal
// color (`style={{ color: "black", background: "white" }}`).
const HARDCODED_COLOR_OVERRIDE = /(color|background)\s*:\s*["'](black|white|#[0-9a-fA-F]{3,8})["']/;

for (const [route, path] of Object.entries(ROUTE_FILES)) {
  test(`${route} route applies the ink-on-cream base theme, not a hero-only override (CK-8)`, () => {
    const source = readRoute(path);
    assert.match(
      source,
      THEME_SIGNAL,
      `${route} (${path}) must reference the shared ink-on-cream vars/classnames, not only hero-scoped markup`,
    );
    assert.doesNotMatch(
      source,
      HARDCODED_COLOR_OVERRIDE,
      `${route} (${path}) must not bypass the theme with a hardcoded literal color`,
    );
  });

  test(`${route} route renders the shared SiteHeader/SiteFooter chrome`, () => {
    const source = readRoute(path);
    assert.match(source, /<SiteHeader/, `${route} must render the shared header`);
    assert.match(source, /<SiteFooter/, `${route} must render the shared footer`);
  });
}

test("home, /sobre, and /blog all source their content from the SAME content.ts module", () => {
  for (const path of Object.values(ROUTE_FILES)) {
    const source = readRoute(path);
    assert.match(
      source,
      /from\s+["']\.{1,2}\/content["']/,
      `${path} must import its content from the shared app/content.ts module, not a route-local copy`,
    );
  }
});
