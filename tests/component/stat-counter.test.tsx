// Component test for CK-13 (component level): under `prefers-reduced-motion: reduce`,
// StatCounter must render its final target value immediately, with zero animation
// frames — see sub-task 07-grafted-motion-components, Success Criteria #3.
//
// jsdom globals must exist before React/ReactDOM are imported (both packages read
// `window` at module-evaluation time), so the DOM is built and installed first.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>");

(globalThis as unknown as { window: typeof window }).window = dom.window as unknown as typeof window;
(globalThis as unknown as { document: Document }).document = dom.window.document;
// Node's own `navigator` global is read-only; StatCounter never reads it, so it is
// left untouched rather than fighting that getter.
// Lets React's `act()` know it is driving a real (jsdom) environment, not a no-op.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Simulate the OS/browser-level "prefers-reduced-motion: reduce" setting that
// StatCounter checks via `window.matchMedia(...).matches` before deciding whether
// to animate.
function mockReducedMotionMatchMedia(query: string): MediaQueryList {
  return {
    matches: query.includes("prefers-reduced-motion"),
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
dom.window.matchMedia = mockReducedMotionMatchMedia as typeof window.matchMedia;
window.matchMedia = mockReducedMotionMatchMedia as typeof window.matchMedia;

// Imported after the jsdom globals above are in place.
const { act } = await import("react");
const { createRoot } = await import("react-dom/client");
const { default: StatCounter } = await import("../../components/StatCounter.tsx");
const React = await import("react");

test("StatCounter renders its final value immediately under prefers-reduced-motion, with no animation frames", async () => {
  let rafCallCount = 0;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    rafCallCount += 1;
    return originalRequestAnimationFrame(callback);
  }) as typeof window.requestAnimationFrame;

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(
        React.createElement(StatCounter, { n: 26, suffix: "+ anos", label: "anos de experiência" }),
      );
    });

    assert.equal(
      rafCallCount,
      0,
      "requestAnimationFrame must never be scheduled when prefers-reduced-motion is set",
    );

    const statValue = container.querySelector(".stat-n");
    assert.ok(statValue, "expected a .stat-n element to render");
    assert.match(
      statValue!.textContent ?? "",
      /26/,
      `expected the final target value "26" to render immediately, got "${statValue!.textContent}"`,
    );
  } finally {
    act(() => root.unmount());
    container.remove();
    window.requestAnimationFrame = originalRequestAnimationFrame;
  }
});

test("StatCounter rounds to the configured decimal precision for non-integer targets, even under reduced motion", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(React.createElement(StatCounter, { n: 9.5, label: "anos na Câmara" }));
    });

    const statValue = container.querySelector(".stat-n");
    assert.match(statValue!.textContent ?? "", /9\.5/, "expected one decimal place for a non-integer target");
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});
