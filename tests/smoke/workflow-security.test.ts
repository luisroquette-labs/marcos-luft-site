// Table-driven unit tests for .github/workflows/pages.yml — covers CK-22:
// the deploy workflow must grant only the two permissions GitHub Pages
// deployment needs (never a broader scope like `contents: write`) and must
// pin every third-party action to a full 40-character commit SHA, never a
// mutable tag like `@v4`. These checks only read the workflow file's text —
// no real Actions run or build is required, so they pass locally (CK-16).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(
  new URL("../../.github/workflows/pages.yml", import.meta.url),
  "utf8",
);

test("permissions block grants exactly pages:write and id-token:write", () => {
  // Captures only the consecutive indented "key: value" lines right after
  // `permissions:` — the block ends naturally at the first blank or
  // non-indented line, so this doesn't need an end-of-block lookahead (an
  // `m`-flag `$` matches end-of-line, not end-of-string, so that approach
  // silently truncated the block after its first line).
  const block = workflow.match(/^permissions:\n((?:[ \t]+\S.*\n?)+)/m);
  assert.ok(block, "permissions: block not found in pages.yml");

  const grantedScopes = [...block[1].matchAll(/^\s+([\w-]+):\s*(\S+)/gm)].map(
    ([, scope, access]) => `${scope}: ${access}`,
  );

  assert.deepEqual(grantedScopes.sort(), ["id-token: write", "pages: write"]);
});

test("every `uses:` step is pinned to a full 40-character commit SHA, never a tag", () => {
  const usesSteps = [...workflow.matchAll(/uses:\s*([\w.-]+\/[\w.-]+)@(\S+)/g)];
  assert.ok(usesSteps.length > 0, "no `uses:` steps found in pages.yml — nothing to pin-check");

  for (const [, action, ref] of usesSteps) {
    assert.match(ref, /^[0-9a-f]{40}$/, `${action}@${ref} is not pinned to a full 40-char commit SHA`);
  }
});

test("build step sets NEXT_PUBLIC_BASE_PATH to /marcos-luft-site", () => {
  assert.match(workflow, /NEXT_PUBLIC_BASE_PATH=\/marcos-luft-site\b/);
});

test("deploy trigger is a push to main, not pull_request (avoids deploying unreviewed forks)", () => {
  assert.match(workflow, /on:\s*\n\s*push:\s*\n\s*branches:\s*\[main\]/);
});
