// Component test for GhostAccordion (replaces Accordion): numbered,
// borderless FAQ rows that toggle open/closed via a native <button>, with
// aria-expanded reflecting state and only the open item rendering its answer.
//
// GhostAccordion has an onClick handler, so — like StatCounter's test — it
// needs a real jsdom DOM (click dispatch + React act()), not a static SSR
// render.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>");

(globalThis as unknown as { window: typeof window }).window = dom.window as unknown as typeof window;
(globalThis as unknown as { document: Document }).document = dom.window.document;
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Imported after the jsdom globals above are in place.
const { act } = await import("react");
const { createRoot } = await import("react-dom/client");
const { default: GhostAccordion } = await import("../../components/GhostAccordion.tsx");
const React = await import("react");
const { faq } = await import("../../app/content.ts");

test("GhostAccordion numbers items, starts collapsed, and toggles open/closed on click", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(React.createElement(GhostAccordion, { items: faq.items.slice(0, 2) }));
    });

    const buttons = container.querySelectorAll("button");
    assert.equal(buttons.length, 2, "expected one button per FAQ item");

    // Numbering is zero-padded and 1-indexed (01, 02, ...), not raw array index.
    assert.match(buttons[0].textContent ?? "", /^01/);
    assert.match(buttons[1].textContent ?? "", /^02/);

    // Collapsed by default: no answer text in the DOM, aria-expanded="false".
    assert.equal(buttons[0].getAttribute("aria-expanded"), "false");
    assert.equal(container.textContent?.includes(faq.items[0].a), false);

    await act(async () => {
      buttons[0].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    });

    assert.equal(buttons[0].getAttribute("aria-expanded"), "true", "clicking a closed item must open it");
    assert.ok(
      container.textContent?.includes(faq.items[0].a),
      "the opened item's answer text must appear in the DOM",
    );
    // The toggle glyph must flip from + to × when open.
    assert.ok(buttons[0].textContent?.includes("×"), "expected the × glyph once the item is open");

    // Opening the first item must not affect the second (independent toggles).
    assert.equal(buttons[1].getAttribute("aria-expanded"), "false");

    await act(async () => {
      buttons[0].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    });

    assert.equal(buttons[0].getAttribute("aria-expanded"), "false", "clicking an open item must close it");
    assert.equal(container.textContent?.includes(faq.items[0].a), false, "answer must be removed once closed");
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});
