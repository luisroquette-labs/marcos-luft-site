"use client";

// Sprite asset: OWN self-produced fallback (AD-2), NOT the vendor sheet.
// The skiper39 reference (reuno-ui/skiper39, fetched via 21st MCP get_component)
// ships an OpenPeeps sheet under Skiper UI's "attribution-required" free-tier terms
// — not cleanly reusable for a commercial client site — so per AD-2 it is not shipped.
// public/crowd-sprite.png is a procedurally generated ink-silhouette walk cycle
// (8 frames, flat #1b1813 on transparent). Motion is reimplemented in vanilla
// requestAnimationFrame (no GSAP): frame-index advance + x-translate + edge-wrap.

import { useEffect, useRef, useState } from "react";
import { BASE } from "../app/base.ts";

const INK = "#1b1813";
const FRAMES = 8;
const FRAME_W = 48;
const FRAME_H = 96;
const FRAME_INTERVAL_MS = 110; // walk-cycle frame advance cadence

// 3 depth bands → cheap parallax: farther figures are smaller, slower, higher up.
const BANDS = [
  { scale: 0.55, speed: 18, baselineFrac: 0.6, count: 3 },
  { scale: 0.78, speed: 30, baselineFrac: 0.78, count: 3 },
  { scale: 1.0, speed: 46, baselineFrac: 0.95, count: 3 },
] as const;

type Figure = {
  x: number;
  baselineY: number;
  scale: number;
  speed: number;
  dir: 1 | -1;
  frameOffset: number;
};

/** Deterministic PRNG (mulberry32) so the crowd layout is stable per render. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lay out the crowd across depth bands, evenly spread so the first frame is populated. */
function buildFigures(width: number, height: number): Figure[] {
  const rng = makeRng(0x9e3779b1);
  const figures: Figure[] = [];

  for (const band of BANDS) {
    const baselineY = height * band.baselineFrac;
    for (let i = 0; i < band.count; i++) {
      const slot = (i + rng() * 0.6) / band.count;
      figures.push({
        x: slot * width,
        baselineY,
        scale: band.scale,
        speed: band.speed * (0.85 + rng() * 0.3),
        dir: rng() > 0.5 ? 1 : -1,
        frameOffset: Math.floor(rng() * FRAMES),
      });
    }
  }
  return figures;
}

export default function CrowdCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // null = not yet detected; splitting detection and the loop into two effects
  // guarantees the canvas ref is attached before the loop reads it (factory gotcha).
  const [reduced, setReduced] = useState<boolean | null>(null);

  // Effect 1 — detect prefers-reduced-motion.
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) {
      setReduced(false);
      return;
    }
    setReduced(mql.matches);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Effect 2 — draw. Gated on the detection result; starts the rAF loop only when
  // motion is allowed, otherwise paints a single static frame and never schedules rAF.
  useEffect(() => {
    if (reduced === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    let figures: Figure[] = [];
    let raf = 0;
    // Mirrors out-of-viewport state from the IntersectionObserver below —
    // read inside `loop` so a frame in flight stops rescheduling itself
    // instead of fighting the observer over who owns `raf`.
    let inView = true;
    let lastTime = 0;
    let frameAccMs = 0;
    let globalFrame = 0;
    let width = 0;
    let height = 0;

    const sizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth || 1200;
      height = canvas.clientHeight || 600;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFigure = (fig: Figure) => {
      const sx = ((globalFrame + fig.frameOffset) % FRAMES) * FRAME_W;
      const dw = FRAME_W * fig.scale;
      const dh = FRAME_H * fig.scale;
      const dy = fig.baselineY - dh;
      if (fig.dir === -1) {
        ctx.save();
        ctx.translate(fig.x + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, 0, FRAME_W, FRAME_H, 0, 0, dw, dh);
        ctx.restore();
      } else {
        ctx.drawImage(img, sx, 0, FRAME_W, FRAME_H, fig.x, dy, dw, dh);
      }
    };

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);
      for (const fig of figures) drawFigure(fig);
    };

    const loop = (time: number) => {
      if (!inView) {
        raf = 0; // stop rescheduling; the observer restarts the loop on re-entry
        return;
      }
      const dt = Math.min(time - lastTime, 100); // clamp tab-switch jumps
      lastTime = time;

      frameAccMs += dt;
      if (frameAccMs >= FRAME_INTERVAL_MS) {
        globalFrame = (globalFrame + Math.floor(frameAccMs / FRAME_INTERVAL_MS)) % FRAMES;
        frameAccMs %= FRAME_INTERVAL_MS;
      }

      for (const fig of figures) {
        fig.x += (fig.speed * fig.dir * dt) / 1000;
        const dw = FRAME_W * fig.scale;
        if (fig.dir === 1 && fig.x > width) fig.x = -dw;
        else if (fig.dir === -1 && fig.x < -dw) fig.x = width;
      }

      renderFrame();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      sizeCanvas();
      figures = buildFigures(width, height);
      if (reduced) {
        renderFrame(); // single static frame; loop never starts
        return;
      }
      lastTime = performance.now();
      raf = requestAnimationFrame(loop);
    };

    img.onload = start;
    img.src = `${BASE}/crowd-sprite.png`;

    const onResize = () => {
      if (!img.complete) return;
      sizeCanvas();
      figures = buildFigures(width, height);
      if (reduced) renderFrame();
    };
    window.addEventListener("resize", onResize);

    // Scroll past the hero and the crowd walk cycle keeps burning rAF/CPU for
    // a canvas nobody can see — pause it offscreen, same pattern as
    // Reveal.tsx/StatCounter.tsx's IntersectionObserver, and resume on return.
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!reduced && raf === 0) {
        lastTime = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      io.disconnect();
      img.onload = null;
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "transparent", color: INK }}
    />
  );
}
