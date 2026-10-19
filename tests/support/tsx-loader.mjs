// Node's built-in TypeScript type-stripping (node:module --experimental-strip-types,
// default-on since Node 23) erases TS types but has no JSX transform — it hard-fails
// on the .tsx extension itself (ERR_UNKNOWN_FILE_EXTENSION), independent of content.
// This loader hook fills that one gap using the TypeScript compiler (already a
// devDependency) so .tsx component test files can run under plain `node --test`.
import ts from "typescript";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Candidate extensions tried, in order, for an extensionless import (e.g.
// `../components/SiteHeader`) that Node's resolver can't find as-is. .tsx
// first: every component/page in this project is .tsx; a handful of
// plain-data modules (content.ts, posts.ts) are .ts.
const RELATIVE_IMPORT_EXTENSIONS = [".tsx", ".ts"];

// tsconfig.json maps the `@/*` path alias to the project root (one level up
// from this file's tests/support/ directory) — see tsconfig.json's
// `"paths": { "@/*": ["./*"] }`. Node's ESM resolver has no concept of
// tsconfig path aliases and treats "@/app/base" as a scoped package name.
const PROJECT_ROOT = new URL("../../", import.meta.url);

/** Retry `specifier` against each candidate extension; first resolve wins. */
async function resolveWithExtensions(specifier, context, nextResolve) {
  for (const ext of RELATIVE_IMPORT_EXTENSIONS) {
    try {
      return await nextResolve(`${specifier}${ext}`, context);
    } catch {
      // try the next candidate extension
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err.code !== "ERR_MODULE_NOT_FOUND") throw err;

    // `next`'s package.json has no "exports" map, so Node's ESM resolver (unlike
    // webpack/CJS require) won't infer ".js" on a bare extension-less deep import
    // like "next/link". Retry once with ".js" appended — narrowly scoped to the
    // "next/" package so unrelated resolution failures still surface normally.
    if (specifier.startsWith("next/") && !specifier.endsWith(".js")) {
      return nextResolve(`${specifier}.js`, context);
    }

    // Next.js resolves the `@/*` tsconfig path alias at webpack build time
    // (components/Logo.tsx imports `@/app/base`); plain Node ESM does not.
    // Rewrite it to the absolute path tsconfig.json's mapping describes,
    // then fall through to the same extension retry used for relative
    // imports below.
    if (specifier.startsWith("@/")) {
      specifier = new URL(specifier.slice(2), PROJECT_ROOT).href;
    }

    // Next.js itself resolves extensionless relative imports (e.g.
    // `../components/SiteHeader`, written that way throughout app/ and
    // components/ because Next's webpack config infers the extension) —
    // plain Node ESM does not. Retry each candidate extension in turn; the
    // first one that resolves wins. Scoped to relative/rewritten-alias
    // specifiers only, so a genuinely missing bare/package import still
    // fails normally.
    const isRelativeImport =
      specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("file://");
    if (isRelativeImport && !RELATIVE_IMPORT_EXTENSIONS.some((ext) => specifier.endsWith(ext))) {
      const resolved = await resolveWithExtensions(specifier, context, nextResolve);
      if (resolved) return resolved;
    }

    throw err;
  }
}

export async function load(url, context, nextLoad) {
  // CSS Modules (`import styles from "./X.module.css"`) are a Next.js/webpack
  // build-time feature with no meaning under plain `node --test` — Node has no
  // loader for .css at all, so without this it hard-fails with
  // ERR_UNKNOWN_FILE_EXTENSION. Tests never assert on className strings this
  // import would normally supply, so an empty module is a safe stand-in.
  if (url.endsWith(".css")) {
    return { format: "module", source: "export default {};", shortCircuit: true };
  }

  if (!url.endsWith(".tsx") && !url.endsWith(".ts")) {
    return nextLoad(url, context);
  }

  const source = await readFile(fileURLToPath(url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: url,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });

  return { format: "module", source: outputText, shortCircuit: true };
}
