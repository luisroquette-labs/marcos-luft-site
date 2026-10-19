// Component test for FeatureSpotlight — the premium services grid that
// replaces OfferCard (see components/FeatureSpotlight.tsx).
//
// Covers the two behavioral contracts that matter here:
//  1. CK-1 (same rule OfferCard.tsx already enforces): each card wires its
//     OWN href/cta — never a shared placeholder link.
//  2. prefers-reduced-motion: the spotlight must not track the pointer —
//     mousemove must not update the card's --spot-x/--spot-y custom
//     properties when the OS/browser asks for reduced motion.
//
// Both tests build their own jsdom `window` before dynamically importing
// react/react-dom (those packages probe `window` at import time), so the
// import must happen after the DOM is installed — done here inside each
// test's async body (dynamic `await import(...)`) rather than as
// module-level top-level await.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

/** Installs a fresh jsdom window as the global `window`/`document`, mocking
 * `matchMedia` to report the given reduced-motion preference. Returns the
 * dom's document so callers can read rendered markup. */
function installJsdom(prefersReducedMotion: boolean): Document {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  (globalThis as unknown as { window: typeof window }).window = dom.window as unknown as typeof window;
  (globalThis as unknown as { document: Document }).document = dom.window.document;
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  function mockMatchMedia(query: string): MediaQueryList {
    return {
      matches: query.includes("prefers-reduced-motion") && prefersReducedMotion,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    } as MediaQueryList;
  }
  dom.window.matchMedia = mockMatchMedia as typeof window.matchMedia;
  window.matchMedia = mockMatchMedia as typeof window.matchMedia;

  return dom.window.document;
}

test("FeatureSpotlight wires each offer's own href/cta — never a shared placeholder link (CK-1)", async () => {
  installJsdom(false);
  const { act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const React = await import("react");
  const { default: FeatureSpotlight } = await import("../../components/FeatureSpotlight.tsx");
  const { servicos } = await import("../../app/content.ts");

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(React.createElement(FeatureSpotlight, { items: servicos.items }));
    });

    const ctas = Array.from(container.querySelectorAll("a"));
    assert.equal(ctas.length, servicos.items.length, "expected one CTA link per offer");

    const combos = new Set<string>();
    servicos.items.forEach((item, index) => {
      const link = ctas[index]!;
      assert.equal(link.getAttribute("href"), item.href);
      assert.ok(link.textContent?.includes(item.cta), `expected "${item.cta}" in CTA text`);
      combos.add(`${link.getAttribute("href")}::${link.textContent}`);
    });

    // Every (href, label) combo must be distinct — a shared-placeholder bug
    // would collapse several cards onto the same combo.
    assert.equal(combos.size, servicos.items.length, "every offer's href+label combo must be unique");
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});

test("FeatureSpotlight renders each offer's title and benefit as description", async () => {
  installJsdom(false);
  const { act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const React = await import("react");
  const { default: FeatureSpotlight } = await import("../../components/FeatureSpotlight.tsx");
  const { servicos } = await import("../../app/content.ts");

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(React.createElement(FeatureSpotlight, { items: servicos.items }));
    });

    const text = container.textContent ?? "";
    for (const item of servicos.items) {
      assert.ok(text.includes(item.title), `expected title "${item.title}" to render`);
      assert.ok(text.includes(item.benefit), `expected benefit "${item.benefit}" to render as description`);
    }
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});

test("under prefers-reduced-motion, pointer movement does not update the spotlight position", async () => {
  installJsdom(true);
  const { act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const React = await import("react");
  const { default: FeatureSpotlight } = await import("../../components/FeatureSpotlight.tsx");
  const { servicos } = await import("../../app/content.ts");

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(React.createElement(FeatureSpotlight, { items: servicos.items }));
    });

    const card = container.querySelector("article");
    assert.ok(card, "expected a card <article> to render");

    const before = (card as HTMLElement).style.getPropertyValue("--spot-x");
    await act(async () => {
      card!.dispatchEvent(new window.MouseEvent("mousemove", { bubbles: true, clientX: 42, clientY: 42 }));
    });
    const after = (card as HTMLElement).style.getPropertyValue("--spot-x");

    assert.equal(after, before, "spotlight position must not change under prefers-reduced-motion");
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});

test("without prefers-reduced-motion, pointer movement updates the spotlight position", async () => {
  installJsdom(false);
  const { act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const React = await import("react");
  const { default: FeatureSpotlight } = await import("../../components/FeatureSpotlight.tsx");
  const { servicos } = await import("../../app/content.ts");

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(React.createElement(FeatureSpotlight, { items: servicos.items }));
    });

    const card = container.querySelector("article") as HTMLElement;
    assert.ok(card, "expected a card <article> to render");

    await act(async () => {
      card.dispatchEvent(new window.MouseEvent("mousemove", { bubbles: true, clientX: 42, clientY: 24 }));
    });

    assert.ok(
      card.style.getPropertyValue("--spot-x").length > 0,
      "expected --spot-x to be set once pointer tracking is enabled",
    );
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});
