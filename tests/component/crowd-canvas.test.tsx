// Component test for CrowdCanvas (jsdom). Verifies the two-effect reduced-motion
// gate (CK-13 / AD-2): with prefers-reduced-motion:reduce the component paints
// exactly one static frame and never schedules requestAnimationFrame; with motion
// allowed it starts the rAF loop. Run via the tsx loader (see package.json test script).

import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React from "react";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Recorder = {
  rafCalls: number;
  clearRectCalls: number;
  drawImageCalls: number;
  cancelCalls: number;
  /** Fires the most recently constructed IntersectionObserver's callback,
   *  simulating the canvas entering/leaving the viewport. */
  fireIntersection: (isIntersecting: boolean) => void;
};

/** Build a jsdom environment with stubbed canvas/image/rAF/IntersectionObserver
 *  and a matchMedia that reports the given reduced-motion preference. Returns
 *  the call recorder. */
function setupEnv(prefersReduced: boolean): Recorder {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    pretendToBeVisual: true,
    url: "http://localhost/",
  });
  const { window } = dom;

  const rec: Recorder = {
    rafCalls: 0,
    clearRectCalls: 0,
    drawImageCalls: 0,
    cancelCalls: 0,
    fireIntersection: () => {
      throw new Error("fireIntersection called before CrowdCanvas constructed an IntersectionObserver");
    },
  };

  // jsdom has no IntersectionObserver; stub one that records its callback so
  // a test can simulate the canvas entering/leaving the viewport by calling
  // rec.fireIntersection(isIntersecting) directly.
  class FakeIntersectionObserver {
    constructor(private callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
      rec.fireIntersection = (isIntersecting) => this.callback([{ isIntersecting }]);
    }
    observe() {}
    disconnect() {}
  }
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeIntersectionObserver;
  globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;

  const ctxStub = {
    setTransform() {},
    clearRect() {
      rec.clearRectCalls++;
    },
    drawImage() {
      rec.drawImageCalls++;
    },
    save() {},
    restore() {},
    translate() {},
    scale() {},
  };
  // jsdom has no 2d context; stub it so the component can draw.
  (window.HTMLCanvasElement.prototype as unknown as { getContext: () => unknown }).getContext =
    () => ctxStub;

  // Synchronous image: fire onload as soon as src is set.
  class FakeImage {
    onload: (() => void) | null = null;
    complete = false;
    private _src = "";
    set src(v: string) {
      this._src = v;
      this.complete = true;
      if (this.onload) this.onload();
    }
    get src() {
      return this._src;
    }
  }

  // Count rAF scheduling without recursing into the loop.
  (window as unknown as { requestAnimationFrame: (cb: FrameRequestCallback) => number }).requestAnimationFrame =
    () => {
      rec.rafCalls++;
      return 1;
    };
  (window as unknown as { cancelAnimationFrame: (id: number) => void }).cancelAnimationFrame = () => {
    rec.cancelCalls++;
  };

  (window as unknown as { matchMedia: (q: string) => unknown }).matchMedia = (query: string) => ({
    matches: query.includes("reduce") ? prefersReduced : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });

  (window as unknown as { devicePixelRatio: number }).devicePixelRatio = 1;

  // Expose jsdom globals that react-dom/client reads (navigator is getter-only → defineProperty).
  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.document = window.document;
  // The tsx/esbuild loader compiles JSX with the classic runtime (React.createElement),
  // so the component needs React in global scope under the test loader.
  (globalThis as unknown as { React: typeof React }).React = React;
  Object.defineProperty(globalThis, "navigator", {
    value: window.navigator,
    configurable: true,
  });
  globalThis.Image = FakeImage as unknown as typeof Image;
  globalThis.requestAnimationFrame = window.requestAnimationFrame;
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame;

  return rec;
}

async function mount(): Promise<void> {
  const { default: CrowdCanvas } = await import("../../components/CrowdCanvas.tsx");
  const { createRoot } = await import("react-dom/client");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await React.act(async () => {
    root.render(React.createElement(CrowdCanvas));
  });
}

test("reduced motion → paints exactly one static frame, never schedules rAF", async () => {
  const rec = setupEnv(true);
  await mount();

  assert.equal(rec.rafCalls, 0, "requestAnimationFrame must not be called under reduced motion");
  assert.equal(rec.clearRectCalls, 1, "static path should render exactly one frame");
  assert.ok(rec.drawImageCalls > 0, "static frame should still draw the crowd figures");
});

test("motion allowed → starts the requestAnimationFrame loop", async () => {
  const rec = setupEnv(false);
  await mount();

  assert.ok(rec.rafCalls >= 1, "requestAnimationFrame must be scheduled when motion is allowed");
});

// REGRESSÃO: CrowdCanvas burned rAF/CPU forever, even scrolled fully out of
// view — this is the IntersectionObserver pause/resume added to fix that.
test("leaving the viewport cancels the rAF loop; re-entering restarts it", async () => {
  const rec = setupEnv(false);
  await mount();

  const rafCallsOnMount = rec.rafCalls;
  assert.ok(rafCallsOnMount >= 1, "expected the initial mount to schedule a frame");

  rec.fireIntersection(false);
  assert.ok(rec.cancelCalls >= 1, "scrolling the canvas out of view must call cancelAnimationFrame");

  rec.fireIntersection(true);
  assert.ok(
    rec.rafCalls > rafCallsOnMount,
    "scrolling the canvas back into view must reschedule requestAnimationFrame",
  );
});
