#!/usr/bin/env node
// Smoke-tests out/ the way GitHub Pages will serve it, before the CI
// workflow publishes it. Runs only on GitHub Actions, after `next build` —
// never on the Mac (CK-16). CK-6: sitemap.xml/robots.txt list every route
// DISCOVERED from out/, so it can't go stale (see tests/unit/sitemap.test.ts).
// CK-7: every asset on home, /sobre, /blog, and one /blog/[slug] page resolves to a real file in the export, under the production basePath.
// Dev-only: lives under scripts/, never imported by app/ or components/.

import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.SMOKE_OUT_DIR
  ? path.resolve(process.env.SMOKE_OUT_DIR)
  : path.join(ROOT_DIR, "..", "out");
const BASE_PATH = "/marcos-luft-site";
const PORT = 4173;
const ORIGIN = `http://127.0.0.1:${PORT}`;

const MIME_TYPES = {
  ".html": "text/html",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// Resolves a request path to a file under OUT_DIR the way static hosts do:
// "/sobre" and "/sobre/" both serve "sobre/index.html".
async function resolveFile(urlPath) {
  const relative = decodeURIComponent(urlPath.slice(BASE_PATH.length)).split("?")[0].split("#")[0];
  const candidates = relative === "" || relative.endsWith("/")
    ? [path.join(relative || "/", "index.html")]
    : [relative, `${relative}/index.html`, `${relative}.html`];

  for (const candidate of candidates) {
    const filePath = path.join(OUT_DIR, candidate);
    if (path.relative(OUT_DIR, filePath).startsWith("..")) continue; // guard against path traversal
    const info = await stat(filePath).catch(() => null);
    if (info?.isFile()) return filePath;
  }
  return null;
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const filePath = await resolveFile(req.url ?? "/");
      if (!filePath) {
        res.writeHead(404).end("Not found");
        return;
      }
      res
        .writeHead(200, { "content-type": MIME_TYPES[path.extname(filePath)] ?? "application/octet-stream" })
        .end(await readFile(filePath));
    });
    server.listen(PORT, () => resolve(server));
  });
}

// Walks the export for every real route, e.g. ["/", "/sobre", "/blog/a"].
async function discoverRoutes(dir = OUT_DIR, routePrefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const routes = entries.some((entry) => entry.isFile() && entry.name === "index.html")
    ? [routePrefix || "/"]
    : [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "_next") continue;
    routes.push(...(await discoverRoutes(path.join(dir, entry.name), `${routePrefix}/${entry.name}`)));
  }

  return routes;
}

function withoutTrailingSlash(route) {
  return route !== "/" && route.endsWith("/") ? route.slice(0, -1) : route;
}

async function checkSitemapAndRobots(failures) {
  const [sitemapResponse, robotsResponse] = await Promise.all([
    fetch(`${ORIGIN}${BASE_PATH}/sitemap.xml`),
    fetch(`${ORIGIN}${BASE_PATH}/robots.txt`),
  ]);

  if (sitemapResponse.status !== 200) failures.push(`GET /sitemap.xml returned ${sitemapResponse.status}, expected 200`);
  if (robotsResponse.status !== 200) failures.push(`GET /robots.txt returned ${robotsResponse.status}, expected 200`);
  if (sitemapResponse.status !== 200 || robotsResponse.status !== 200) return;

  const [sitemapXml, robotsTxt] = await Promise.all([sitemapResponse.text(), robotsResponse.text()]);

  const sitemapRoutes = new Set(
    [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => withoutTrailingSlash(new URL(loc).pathname.slice(BASE_PATH.length) || "/")),
  );
  const exportedRoutes = new Set((await discoverRoutes()).map(withoutTrailingSlash));

  for (const route of exportedRoutes) {
    if (route !== "/404" && !sitemapRoutes.has(route)) failures.push(`sitemap.xml is missing route ${route}`); // a 404 page is correctly absent from sitemap.xml
  }
  for (const route of sitemapRoutes) {
    if (!exportedRoutes.has(route)) failures.push(`sitemap.xml lists route ${route}, which doesn't exist in the export`);
  }

  if (!/sitemap:/i.test(robotsTxt)) failures.push("robots.txt does not reference sitemap.xml");
  if (!/allow:\s*\//i.test(robotsTxt)) failures.push("robots.txt does not allow crawling (no \"Allow: /\" rule)");
}

/** Extracts every src/href/srcset URL from <img>, <script>, and <link> tags in an HTML document. */
function extractAssetUrls(html) {
  const urls = new Set();

  for (const [tag] of html.matchAll(/<(?:img|script|link)\b[^>]*>/gi)) {
    for (const [, url] of tag.matchAll(/\b(?:src|href)="([^"]+)"/gi)) urls.add(url);
    for (const [, srcset] of tag.matchAll(/\bsrcset="([^"]+)"/gi)) {
      for (const entry of srcset.split(",")) {
        const url = entry.trim().split(/\s+/)[0];
        if (url) urls.add(url);
      }
    }
  }

  return [...urls];
}

async function checkAssetReferencesResolve(pageRoute, html, failures) {
  for (const url of extractAssetUrls(html)) {
    if (/^(?:data:|https?:|\/\/)/i.test(url)) continue; // external or embedded — not ours to validate

    if (!url.startsWith(BASE_PATH)) {
      failures.push(`${pageRoute}: asset "${url}" is missing the "${BASE_PATH}" basePath prefix`);
      continue;
    }

    // Decode: rendered HTML percent-encodes "[slug]" as "%5Bslug%5D", but the on-disk file keeps literal brackets.
    const assetPath = decodeURIComponent(url.slice(BASE_PATH.length).split("?")[0].split("#")[0]);
    const exists = await stat(path.join(OUT_DIR, assetPath)).then(() => true, () => false);
    if (!exists) failures.push(`${pageRoute}: asset "${url}" does not exist in the export`);
  }
}

async function checkRequiredPagesAndAssets(failures) {
  const firstBlogPost = (await discoverRoutes()).find((route) => route.startsWith("/blog/"));
  const pagesToCheck = ["/", "/sobre", "/blog", firstBlogPost].filter(Boolean);

  // Each page's fetch + asset check is independent; run concurrently.
  await Promise.all(pagesToCheck.map(async (route) => {
    const response = await fetch(`${ORIGIN}${BASE_PATH}${route}`);
    if (response.status !== 200) {
      failures.push(`GET ${route} returned ${response.status}, expected 200`);
      return;
    }
    await checkAssetReferencesResolve(route, await response.text(), failures);
  }));
}

async function main() {
  const outDirInfo = await stat(OUT_DIR).catch(() => null);
  if (!outDirInfo?.isDirectory()) {
    console.error(`Smoke test aborted: export directory not found at ${OUT_DIR}. Run "npm run build" first.`);
    process.exitCode = 1;
    return;
  }

  // Guards the whole run: an unexpected error exits non-zero with one clean line, not a raw stack trace.
  try {
    const server = await startServer();
    const failures = [];
    try {
      await checkSitemapAndRobots(failures);
      await checkRequiredPagesAndAssets(failures);
    } finally {
      server.close();
    }

    if (failures.length > 0) {
      console.error(`Smoke test failed with ${failures.length} issue(s):`);
      for (const failure of failures) console.error(`  - ${failure}`);
      process.exitCode = 1;
      return;
    }

    console.log("Smoke test passed: sitemap/robots match the export, every checked page's assets resolve under the basePath.");
  } catch (error) {
    console.error(`Smoke test crashed unexpectedly: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
