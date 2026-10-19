// Component test for PigmentLedger (jsdom). Covers:
//  1. Content + CK-2: every entry's employer/role/period/body renders, and
//     EXACTLY ONE entry carries the current-role marker + "atual" badge that
//     the others lack.
//  2. Reduced motion: rows resolve to their final legible state (all panels
//     open, no `hidden`) and the pointer canvas never schedules rAF.
//  3. Motion allowed: activating a row schedules rAF (the pigment bloom runs).
// Run: node --import ./tests/support/register-tsx.mjs --test tests/component/pigment-ledger.test.tsx

import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React from "react";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Recorder = { rafCalls: number };

/** jsdom env with a stubbed 2d context, an rAF counter (non-recursing), and a
 *  matchMedia reporting the given reduced-motion preference. */
function setupEnv(prefersReduced: boolean): Recorder {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    pretendToBeVisual: true,
    url: "http://localhost/",
  });
  const { window } = dom;
  const rec: Recorder = { rafCalls: 0 };

  const ctxStub = {
    setTransform() {},
    clearRect() {},
    save() {},
    restore() {},
    translate() {},
    scale() {},
    beginPath() {},
    arc() {},
    fill() {},
    createRadialGradient() {
      return { addColorStop() {} };
    },
    fillStyle: "",
    globalAlpha: 1,
  };
  (window.HTMLCanvasElement.prototype as unknown as { getContext: () => unknown }).getContext =
    () => ctxStub;

  (window as unknown as { requestAnimationFrame: (cb: FrameRequestCallback) => number }).requestAnimationFrame =
    () => {
      rec.rafCalls++;
      return 1; // do not recurse — we only count scheduling
    };
  (window as unknown as { cancelAnimationFrame: (id: number) => void }).cancelAnimationFrame = () => {};

  (window as unknown as { matchMedia: (q: string) => unknown }).matchMedia = (query: string) => ({
    matches: query.includes("reduce") ? prefersReduced : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });

  (window as unknown as { devicePixelRatio: number }).devicePixelRatio = 1;

  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.document = window.document;
  (globalThis as unknown as { React: typeof React }).React = React;
  Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });
  globalThis.requestAnimationFrame = window.requestAnimationFrame;
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame;

  return rec;
}

type LedgerItem = { employer: string; role: string; startDate: string; endDate: string; body: string };

async function mount(): Promise<{ items: ReadonlyArray<LedgerItem> }> {
  const { default: PigmentLedger } = await import("../../components/PigmentLedger.tsx");
  const { trajetoria } = await import("../../app/content.ts");
  const { createRoot } = await import("react-dom/client");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await React.act(async () => {
    root.render(React.createElement(PigmentLedger, { items: trajetoria.items }));
  });
  return { items: trajetoria.items };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("renders every entry's employer, role, period and body (and exactly one current marker, CK-2)", async () => {
  setupEnv(true); // reduced → static, deterministic DOM
  const { items } = await mount();

  const rows = document.querySelectorAll("[data-ledger-row]");
  assert.equal(rows.length, items.length, "one row per entry");

  const currentRows = document.querySelectorAll('[data-ledger-row][data-current="true"]');
  assert.equal(currentRows.length, 1, "exactly one entry carries the current-role marker");

  const badges = document.querySelectorAll("[data-ledger-badge]");
  assert.equal(badges.length, 1, "the 'atual' badge is current-only");
  assert.match(badges[0].textContent ?? "", /atual/i);
  assert.equal(currentRows[0].querySelector("[data-ledger-badge]"), badges[0]);

  items.forEach((item, i) => {
    const row = rows[i];
    assert.match(row.querySelector("[data-ledger-employer]")?.textContent ?? "", new RegExp(escapeRegExp(item.employer)));
    assert.match(row.querySelector("[data-ledger-role]")?.textContent ?? "", new RegExp(escapeRegExp(item.role)));
    assert.match(row.querySelector("[data-ledger-years]")?.textContent ?? "", new RegExp(escapeRegExp(item.startDate)));
    assert.match(row.querySelector("[data-ledger-body]")?.textContent ?? "", new RegExp(escapeRegExp(item.body)));
  });
});

test("reduced motion → all rows open/legible and the pointer canvas never starts", async () => {
  const rec = setupEnv(true);
  await mount();

  const rows = document.querySelectorAll("[data-ledger-row]");
  for (const row of Array.from(rows)) {
    assert.equal(row.getAttribute("data-open"), "true", "every row resolves to its open, legible state");
    assert.equal(row.querySelector("[data-ledger-body]")?.hasAttribute("hidden") ?? true, false);
  }
  assert.equal(rec.rafCalls, 0, "no bloom animation is scheduled under reduced motion");
});

test("motion allowed → activating a row schedules the bloom animation", async () => {
  const rec = setupEnv(false);
  await mount();

  assert.equal(rec.rafCalls, 0, "idle: no bloom until the pointer interacts");

  const toggle = document.querySelector("[data-ledger-toggle]") as HTMLButtonElement | null;
  assert.ok(toggle, "a row toggle must be present");
  await React.act(async () => {
    toggle!.click();
  });

  assert.ok(rec.rafCalls >= 1, "activating a row paints a pigment bloom (schedules rAF)");
});
