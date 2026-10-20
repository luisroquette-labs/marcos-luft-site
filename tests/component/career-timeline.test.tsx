// Component test for CareerTimeline (replaces pigment-ledger.test.tsx — see
// PigmentLedger -> CareerTimeline swap). Covers:
//  1. Content + CK-2: every entry's employer/role/period/body renders, and
//     EXACTLY ONE entry carries the current-milestone marker + "atual"
//     badge that the others lack.
//  2. CK-3-adjacent: the 3 milestones alternate above/below the baseline
//     (above, below, above), the structural trait CareerTimeline.module.css
//     relies on to keep every dot on the shared baseline.
//  3. Reveal wiring: CareerTimeline's cards mount hidden (not yet
//     `is-visible`) and only gain the Reveal `is-visible` class once their
//     IntersectionObserver reports the card entered the viewport — the same
//     mechanism every other scroll-reveal section already uses.
// Run: node --import ./tests/support/register-tsx.mjs --test tests/component/career-timeline.test.tsx

import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React from "react";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type ObserveCall = { element: Element; callback: IntersectionObserverCallback };

/** jsdom has no IntersectionObserver — stub one that records every `observe()`
 *  call so a test can fire its callback manually and assert the result. */
function setupEnv(): { observed: ObserveCall[] } {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
  const { window } = dom;
  const observed: ObserveCall[] = [];

  class StubIntersectionObserver {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(element: Element) {
      observed.push({ element, callback: this.callback });
    }
    disconnect() {}
    unobserve() {}
  }
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = StubIntersectionObserver;

  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.document = window.document;
  (globalThis as unknown as { React: typeof React }).React = React;
  Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });
  globalThis.IntersectionObserver = window.IntersectionObserver as unknown as typeof IntersectionObserver;

  return { observed };
}

type TimelineItem = { employer: string; role: string; startDate: string; endDate: string; body: string };

async function mount(): Promise<{ items: ReadonlyArray<TimelineItem> }> {
  const { default: CareerTimeline } = await import("../../components/CareerTimeline.tsx");
  const { trajetoria } = await import("../../app/content.ts");
  const { createRoot } = await import("react-dom/client");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await React.act(async () => {
    root.render(React.createElement(CareerTimeline, { items: trajetoria.items }));
  });
  return { items: trajetoria.items };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("renders every entry's employer, role, period and body (and exactly one current marker, CK-2)", async () => {
  setupEnv();
  const { items } = await mount();

  const nodes = document.querySelectorAll("[data-timeline-node]");
  assert.equal(nodes.length, items.length, "one node per entry");

  const currentNodes = document.querySelectorAll('[data-timeline-node][data-timeline-current="true"]');
  assert.equal(currentNodes.length, 1, "exactly one entry carries the current-milestone marker");

  const badges = document.querySelectorAll("[data-timeline-badge]");
  assert.equal(badges.length, 1, "the 'atual' badge is current-only");
  assert.match(badges[0].textContent ?? "", /atual/i);
  assert.equal(currentNodes[0].querySelector("[data-timeline-badge]"), badges[0]);

  items.forEach((item, i) => {
    const node = nodes[i];
    assert.match(
      node.querySelector("[data-timeline-employer]")?.textContent ?? "",
      new RegExp(escapeRegExp(item.employer)),
    );
    assert.match(node.querySelector("[data-timeline-role]")?.textContent ?? "", new RegExp(escapeRegExp(item.role)));
    assert.match(
      node.querySelector("[data-timeline-years]")?.textContent ?? "",
      new RegExp(escapeRegExp(item.startDate)),
    );
    assert.match(node.querySelector("[data-timeline-body]")?.textContent ?? "", new RegExp(escapeRegExp(item.body)));
  });
});

test("the 3 milestones alternate above/below the baseline (above, below, above)", async () => {
  setupEnv();
  await mount();

  const positions = Array.from(document.querySelectorAll("[data-timeline-node]")).map((node) =>
    node.getAttribute("data-position"),
  );
  assert.deepEqual(positions, ["above", "below", "above"]);
});

test("a card mounts hidden and becomes visible once its IntersectionObserver reports it on screen", async () => {
  const { observed } = setupEnv();
  await mount();

  assert.ok(observed.length >= 3, "every card registers its own IntersectionObserver.observe() call");

  const firstCard = document.querySelector("[data-timeline-node] .reveal");
  assert.ok(firstCard, "the Reveal wrapper around the first card must be present");
  assert.equal(firstCard!.className.includes("is-visible"), false, "a card starts hidden, before it is observed");

  await React.act(async () => {
    observed[0].callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      null as unknown as IntersectionObserver,
    );
  });

  assert.ok(
    document.querySelectorAll("[data-timeline-node] .reveal.is-visible").length > 0,
    "firing the observer callback must reveal at least one card",
  );
});
