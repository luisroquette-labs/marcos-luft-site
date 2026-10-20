"use client";

// Canvas crowd — a faithful rAF port of reuno-ui/skiper39 ("Canvas Crowd").
// Sprite: public/crowd-sprite.png — the real OpenPeeps sheet shipped by skiper39,
// 3600×2268, a 15×7 grid of 105 bust/portrait line-art characters (cell 240×324,
// black ink on transparent). Credit lives in SiteFooter.tsx (license requires it).
//
// skiper39 drives this with GSAP; here it is reimplemented in vanilla
// requestAnimationFrame (no GSAP), preserving the same behaviour: each peep is a
// random grid cell that walks across the stage (X, ~10s linear, random timeScale
// 0.5–1.5) while bobbing in Y (sine, ±10px, ~0.25s half-cycle); random direction
// flips scaleX; a random depth offsetY scatters them vertically; peeps are drawn
// back-to-front (sorted by baseline) so lower ones overlap higher ones; on exit a
// peep is recycled back into the pool and re-enters from the far edge.
//
// Ink-on-cream: the canvas is transparent and the hero section is cream. The
// OpenPeeps line-art has white interior fills, so the <canvas> uses
// mix-blend-mode:multiply — white multiplies to the cream behind it (vanishes),
// black ink stays. No per-pixel work, no extra ctx calls.

import { useEffect, useRef, useState } from "react";
import { BASE } from "../app/base.ts";

const INK = "#1b1813";

// Sprite grid: 15 columns × 7 rows = 105 characters, each cell 240×324 px.
const COLS = 15;
const ROWS = 7;
const CELL_W = 240;
const CELL_H = 324;

const WALK_BASE_MS = 10_000; // full edge-to-edge crossing at timeScale 1
const BOB_AMPLITUDE = 10; // px of vertical bob while walking
const BOB_HALF_CYCLE_MS = 250; // up in 0.25s, down in 0.25s (skiper39 yoyo 0.25)

type Peep = {
  col: number; // sprite grid cell
  row: number;
  dir: 1 | -1; // 1 = walks right, -1 = walks left (scaleX flip)
  renderW: number;
  renderH: number;
  startX: number;
  endX: number;
  baseY: number; // top edge at rest (before bob), includes depth offsetY
  timeScale: number; // 0.5–1.5 → faster/slower walk
  elapsedMs: number; // progress along the current crossing
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

/** How many peeps fill a stage of this width — a modest, legible crowd. */
function crowdSize(width: number): number {
  return Math.max(10, Math.min(22, Math.round(width / 110)));
}

/**
 * Configure a peep for one crossing: new random cell, direction, depth and speed.
 * `offsetY = 100 - 250 * e²` (skiper39's easeInPow2 depth) scatters peeps from the
 * foreground (lower, larger) to the background (higher, smaller); the same depth
 * drives a subtle size falloff. `atRandomX` seeds the initial fill so the first
 * painted frame is already populated instead of empty at the edge.
 */
function placePeep(peep: Peep, rng: () => number, width: number, height: number, atRandomX: boolean): void {
  const e = rng();
  const offsetY = 100 - 250 * e * e;
  const scale = (0.82 + 0.18 * (1 - e)) * Math.min(height * 0.62, 340) / CELL_H;

  peep.col = Math.floor(rng() * COLS);
  peep.row = Math.floor(rng() * ROWS);
  peep.dir = rng() > 0.5 ? 1 : -1;
  peep.renderH = CELL_H * scale;
  peep.renderW = CELL_W * scale;
  peep.baseY = height - peep.renderH + offsetY;
  peep.timeScale = 0.5 + rng();
  peep.startX = peep.dir === 1 ? -peep.renderW : width;
  peep.endX = peep.dir === 1 ? width : -peep.renderW;

  const totalMs = WALK_BASE_MS / peep.timeScale;
  peep.elapsedMs = atRandomX ? rng() * totalMs : 0;
}

/** Build a freshly scattered crowd spread across the whole stage. */
function buildCrowd(width: number, height: number): Peep[] {
  const rng = makeRng(0x9e3779b1);
  const peeps: Peep[] = [];
  const count = crowdSize(width);
  for (let i = 0; i < count; i++) {
    const peep = {} as Peep;
    placePeep(peep, rng, width, height, true);
    peeps.push(peep);
  }
  return peeps;
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
    const rng = makeRng(0x1234abcd); // drives recycling once the loop is running
    let peeps: Peep[] = [];
    let raf = 0;
    // Mirrors out-of-viewport state from the IntersectionObserver below —
    // read inside `loop` so a frame in flight stops rescheduling itself
    // instead of fighting the observer over who owns `raf`.
    let inView = true;
    let lastTime = 0;
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

    const drawPeep = (peep: Peep, x: number, y: number) => {
      const sx = peep.col * CELL_W;
      const sy = peep.row * CELL_H;
      if (peep.dir === -1) {
        ctx.save();
        ctx.translate(x + peep.renderW, y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, sy, CELL_W, CELL_H, 0, 0, peep.renderW, peep.renderH);
        ctx.restore();
      } else {
        ctx.drawImage(img, sx, sy, CELL_W, CELL_H, x, y, peep.renderW, peep.renderH);
      }
    };

    /** X along the current crossing (linear), plus the sine bob on Y. */
    const positionOf = (peep: Peep): { x: number; y: number } => {
      const totalMs = WALK_BASE_MS / peep.timeScale;
      const t = Math.min(peep.elapsedMs / totalMs, 1);
      const x = peep.startX + (peep.endX - peep.startX) * t;
      const bob = Math.sin((peep.elapsedMs / BOB_HALF_CYCLE_MS) * Math.PI) * BOB_AMPLITUDE;
      return { x, y: peep.baseY + bob };
    };

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);
      // Back-to-front: smaller baseY (further up/back) first, so lower (nearer)
      // peeps are drawn last and overlap on top.
      const ordered = [...peeps].sort((a, b) => a.baseY - b.baseY);
      for (const peep of ordered) {
        const { x, y } = positionOf(peep);
        drawPeep(peep, x, y);
      }
    };

    const loop = (time: number) => {
      if (!inView) {
        raf = 0; // stop rescheduling; the observer restarts the loop on re-entry
        return;
      }
      const dt = Math.min(time - lastTime, 100); // clamp tab-switch jumps
      lastTime = time;

      for (const peep of peeps) {
        peep.elapsedMs += dt * peep.timeScale;
        const totalMs = WALK_BASE_MS / peep.timeScale;
        if (peep.elapsedMs >= totalMs) placePeep(peep, rng, width, height, false); // recycle
      }

      renderFrame();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      sizeCanvas();
      peeps = buildCrowd(width, height);
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
      peeps = buildCrowd(width, height);
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
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "transparent",
        // White interior fills of the OpenPeeps art multiply away into the cream
        // section behind; the black ink line-art survives. Ink-on-cream.
        mixBlendMode: "multiply",
        color: INK,
      }}
    />
  );
}
