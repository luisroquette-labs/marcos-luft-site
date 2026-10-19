// Proves scripts/smoke-test.mjs actually CATCHES a broken export instead of
// just passing a clean one — complements tests/smoke/workflow-security.test.ts
// (which checks the CI workflow file's text, not this script's behavior).
//
// Each case builds a synthetic static export under a temp dir (not a real
// `next build` — CK-16) and runs the real script against it via its
// SMOKE_OUT_DIR override, asserting the specific failure CK-6/CK-7 require
// it to detect: a missing asset file, a sitemap route that doesn't match
// the export, and an asset reference missing the production basePath
// prefix. One case also proves a clean export still passes, so these
// failure assertions aren't just the script always failing.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const SCRIPT_PATH = fileURLToPath(new URL("../../scripts/smoke-test.mjs", import.meta.url));
const BASE_PATH = "/marcos-luft-site";

/** Every route the fixture export has — mirrors a real build's directory shape. */
const ROUTES = ["/", "/sobre", "/blog", "/blog/post-1"];

const PAGE_HTML = (title: string) => `<!DOCTYPE html><html><head>
<link rel="stylesheet" href="${BASE_PATH}/_next/style.css">
</head><body><h1>${title}</h1>
<img src="${BASE_PATH}/_next/image.png">
<script src="${BASE_PATH}/_next/app.js"></script>
</body></html>`;

/** Same page, but its stylesheet href is missing the production basePath prefix. */
const PAGE_HTML_MISSING_PREFIX = (title: string) => `<!DOCTYPE html><html><head>
<link rel="stylesheet" href="/_next/style.css">
</head><body><h1>${title}</h1>
<img src="${BASE_PATH}/_next/image.png">
<script src="${BASE_PATH}/_next/app.js"></script>
</body></html>`;

/** Same page, but its script src is percent-encoded the way Next renders dynamic-segment chunk paths. */
const PAGE_HTML_ENCODED_ASSET = (title: string) => `<!DOCTYPE html><html><head>
<link rel="stylesheet" href="${BASE_PATH}/_next/style.css">
</head><body><h1>${title}</h1>
<img src="${BASE_PATH}/_next/image.png">
<script src="${BASE_PATH}/_next/static/chunks/app/blog/%5Bslug%5D/page-abc123.js"></script>
</body></html>`;

const SITEMAP_XML = (routes: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes
    .map((route) => `<url><loc>https://example.github.io${BASE_PATH}${route === "/" ? "/" : `${route}/`}</loc></url>`)
    .join("")}</urlset>`;

const ROBOTS_TXT = `User-agent: *\nAllow: /\nSitemap: https://example.github.io${BASE_PATH}/sitemap.xml\n`;

interface FixtureOverrides {
  /** Per-route HTML override; defaults to a clean PAGE_HTML(route) when omitted. */
  pageHtml?: (route: string) => string;
  /** When true, the _next/ asset files are never written, even though the HTML references them. */
  skipAssets?: boolean;
  sitemapXml?: string;
  /** Extra files to write under the fixture root, keyed by relative path (parent dirs auto-created). */
  extraFiles?: Record<string, string>;
}

/**
 * Builds a synthetic static export under a fresh temp dir: one index.html
 * per route plus the shared _next/ assets every page references. Passing
 * `overrides` lets a test break exactly one thing while everything else
 * stays a clean, passing export — isolating what that test case proves.
 */
async function buildFixture(overrides: FixtureOverrides = {}): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "smoke-fixture-"));

  for (const route of ROUTES) {
    const routeDir = path.join(dir, route === "/" ? "" : route.slice(1));
    await mkdir(routeDir, { recursive: true });
    const html = overrides.pageHtml ? overrides.pageHtml(route) : PAGE_HTML(route);
    await writeFile(path.join(routeDir, "index.html"), html);
  }

  if (!overrides.skipAssets) {
    await mkdir(path.join(dir, "_next"), { recursive: true });
    await writeFile(path.join(dir, "_next", "style.css"), "body{}");
    await writeFile(path.join(dir, "_next", "image.png"), "fake-png-bytes");
    await writeFile(path.join(dir, "_next", "app.js"), "console.log(1)");
  }

  await writeFile(path.join(dir, "sitemap.xml"), overrides.sitemapXml ?? SITEMAP_XML(ROUTES));
  await writeFile(path.join(dir, "robots.txt"), ROBOTS_TXT);

  for (const [relativePath, content] of Object.entries(overrides.extraFiles ?? {})) {
    const filePath = path.join(dir, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content);
  }

  return dir;
}

/** Runs the real smoke-test script against a fixture export, via the env-var override it already supports. */
function runSmokeTest(outDir: string): { exitCode: number | null; stderr: string } {
  const result = spawnSync(process.execPath, [SCRIPT_PATH], {
    env: { ...process.env, SMOKE_OUT_DIR: outDir },
    encoding: "utf8",
  });
  return { exitCode: result.status, stderr: result.stderr };
}

/** Builds a fixture, runs the real script against it, and always cleans the fixture up afterward. */
async function buildAndRun(overrides: FixtureOverrides): Promise<{ exitCode: number | null; stderr: string }> {
  const dir = await buildFixture(overrides);
  try {
    return runSmokeTest(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("passes against a clean, well-formed export (happy path)", async () => {
  const { exitCode, stderr } = await buildAndRun({});
  assert.equal(exitCode, 0, `expected a clean export to pass, got:\n${stderr}`);
});

test("fails when an asset the HTML references is missing from the export", async () => {
  const { exitCode, stderr } = await buildAndRun({ skipAssets: true });
  assert.notEqual(exitCode, 0, "expected the script to fail when referenced assets don't exist");
  assert.match(stderr, /does not exist in the export/);
});

test("fails when sitemap.xml is missing one of the export's real routes", async () => {
  const routesMissingBlogPost = ROUTES.filter((route) => route !== "/blog/post-1");
  const { exitCode, stderr } = await buildAndRun({ sitemapXml: SITEMAP_XML(routesMissingBlogPost) });
  assert.notEqual(exitCode, 0, "expected the script to fail when the sitemap omits a real route");
  assert.match(stderr, /sitemap\.xml is missing route \/blog\/post-1/);
});

test("fails when a page's asset reference is missing the production basePath prefix", async () => {
  const overrides: FixtureOverrides = {
    pageHtml: (route) => (route === "/" ? PAGE_HTML_MISSING_PREFIX(route) : PAGE_HTML(route)),
  };
  const { exitCode, stderr } = await buildAndRun(overrides);
  assert.notEqual(exitCode, 0, "expected the script to fail when an asset href lacks the basePath prefix");
  assert.match(stderr, /is missing the "\/marcos-luft-site" basePath prefix/);
});

// REGRESSÃO: a 404 page absent from sitemap.xml is correct, not a bug — see smoke-test.mjs checkSitemapAndRobots.
test("passes when the export has a /404 page that isn't listed in sitemap.xml", async () => {
  const overrides: FixtureOverrides = {
    extraFiles: {
      "404.html": "<!DOCTYPE html><html><body>Not found</body></html>",
      "404/index.html": "<!DOCTYPE html><html><body>Not found</body></html>",
    },
  };
  const { exitCode, stderr } = await buildAndRun(overrides);
  assert.equal(exitCode, 0, `expected a /404 page missing from sitemap.xml to still pass, got:\n${stderr}`);
});

// REGRESSÃO: Next percent-encodes dynamic segments ("[slug]" -> "%5Bslug%5D") in rendered HTML, but the
// on-disk chunk keeps literal brackets — see smoke-test.mjs checkAssetReferencesResolve's decodeURIComponent call.
test("passes when an asset reference is percent-encoded but the real file exists at the decoded path", async () => {
  const overrides: FixtureOverrides = {
    pageHtml: (route) => (route === "/blog/post-1" ? PAGE_HTML_ENCODED_ASSET(route) : PAGE_HTML(route)),
    extraFiles: {
      "_next/static/chunks/app/blog/[slug]/page-abc123.js": "console.log('chunk')",
    },
  };
  const { exitCode, stderr } = await buildAndRun(overrides);
  assert.equal(exitCode, 0, `expected a percent-encoded asset path to resolve against its decoded file, got:\n${stderr}`);
});
