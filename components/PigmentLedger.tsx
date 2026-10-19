"use client";

// Editorial "experience ledger" — replaces EditorialTimeline for the career
// section. Faithful to the 21st reference "Pigment Experience Ledger"
// (reuno/kedhareswer, id 38037): each employer is a huge serif wordmark with
// its years; a row opens IN PLACE on hover/click to reveal role, location,
// description and skill tags; a watercolour wash of pigment blooms behind the
// row where the pointer enters. No external deps — the bloom is vanilla Canvas
// (no GSAP/framer), watercolour = the site's ink at low alpha on the cream
// ground (AD-1 monochrome: --cream / --ink / --ink-soft / --ink-hairline only).
//
// Tenure drives the stroke: longer employment paints a longer, wider bloom;
// older roles bloom drier and paler (lower peak alpha). All content is
// props-driven (shaped to app/content.ts `trajetoria.items`), never hardcoded.
//
// Progressive enhancement is the reduced-motion / no-JS story in one switch:
// the server/first paint renders every row OPEN and legible with no canvas;
// only when motion is allowed does the client turn the rows into the
// interactive, collapsible ledger and start the pointer-driven bloom.

import { useEffect, useMemo, useRef, useState } from "react";
import type { trajetoria } from "../app/content";
import styles from "./PigmentLedger.module.css";

/**
 * One ledger entry. Structurally matches `trajetoria.items[number]` from
 * app/content.ts and extends it with two OPTIONAL fields the reference shows
 * (location, skill tags) but the current content source does not yet carry —
 * they render only when a caller supplies them, never as invented defaults.
 */
export type LedgerEntry = (typeof trajetoria)["items"][number] & {
  location?: string;
  skills?: string[];
};

const INK_FALLBACK = "#1b1813";
const MAX_BLOOMS = 24; // bound the live-bloom set; oldest is dropped past this
const BLOOM_LIFE_MS = 1500;

type BloomMeta = { tenure: number; recency: number };

type Bloom = {
  x: number;
  y: number;
  age: number;
  life: number;
  radius: number;
  stretch: number; // horizontal stretch — longer tenure paints a longer stroke
  peak: number; // peak alpha — older roles stay paler
};

/** Parse a "2001"-style year; `atual`/`current`/blank falls back to `nowYear`. */
function yearOf(value: string, nowYear: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : nowYear;
}

/**
 * Derive per-entry pigment parameters from the dates alone (pure): `tenure` in
 * years and `recency` in 0..1 (1 = the most recent span). These shape each
 * bloom's length and paleness — see `makeBloom`.
 */
function deriveMeta(items: LedgerEntry[], nowYear: number): BloomMeta[] {
  const ends = items.map((item) =>
    item.current ? nowYear : yearOf(item.endDate, nowYear),
  );
  const newest = Math.max(...ends, nowYear);
  const oldest = Math.min(...items.map((item) => yearOf(item.startDate, nowYear)), newest);
  const span = Math.max(1, newest - oldest);

  return items.map((item, i) => ({
    tenure: Math.max(1, ends[i] - yearOf(item.startDate, nowYear)),
    recency: (ends[i] - oldest) / span,
  }));
}

/** Build a bloom at (x, y) with length from tenure and paleness from recency. */
function makeBloom(x: number, y: number, meta: BloomMeta): Bloom {
  const radius = Math.min(60 + meta.tenure * 9, 150);
  return {
    x,
    y,
    age: 0,
    life: BLOOM_LIFE_MS,
    radius,
    stretch: 1 + Math.min(meta.tenure * 0.22, 2.4), // longer tenure → longer stroke
    peak: 0.05 + meta.recency * 0.1, // newer → wetter/darker; older → drier/paler
  };
}

/** Read the ink colour from CSS custom properties so the canvas honours the theme. */
function readInk(el: Element): string {
  if (typeof window === "undefined" || !window.getComputedStyle) return INK_FALLBACK;
  const value = window.getComputedStyle(el).getPropertyValue("--ink").trim();
  return value || INK_FALLBACK;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - Math.min(t, 1), 3);
}

/** Paint one watercolour bloom: a soft radial ink wash, stretched horizontally. */
function drawBloom(ctx: CanvasRenderingContext2D, bloom: Bloom, ink: string): void {
  const progress = bloom.age / bloom.life;
  const grow = easeOut(progress * 1.6);
  const fade = progress < 0.45 ? 1 : 1 - (progress - 0.45) / 0.55;
  const radius = bloom.radius * (0.45 + 0.55 * grow);

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, ink);
  gradient.addColorStop(0.55, ink);
  gradient.addColorStop(1, "transparent");

  ctx.save();
  ctx.globalAlpha = Math.max(0, bloom.peak * fade);
  ctx.fillStyle = gradient;
  ctx.translate(bloom.x, bloom.y);
  ctx.scale(1 + (bloom.stretch - 1) * grow, 1);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Props-driven experience ledger. `items` are passed already ordered by the
 * caller (content.ts guarantees the source order). The entry with
 * `current === true` carries a distinguishing marker (`data-current="true"`
 * and an "atual" badge) that no other entry has — CK-2: a visual difference,
 * not merely a data difference.
 */
export default function PigmentLedger({ items }: { items: LedgerEntry[] }) {
  const nowYear = new Date().getFullYear();
  const metas = useMemo(() => deriveMeta(items, nowYear), [items, nowYear]);

  // false until the client confirms motion is allowed — so the server render
  // and the reduced-motion render are the legible, all-open, canvas-free state.
  const [interactive, setInteractive] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<((x: number, y: number, meta: BloomMeta) => void) | null>(null);

  // Detect prefers-reduced-motion. Motion allowed → become interactive.
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) {
      setInteractive(true);
      return;
    }
    const apply = () => setInteractive(!mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  // Once interactive, open the current role by default (reference opens one row).
  useEffect(() => {
    if (!interactive) return;
    setOpenId(
      (prev) => prev ?? (items.find((i) => i.current)?.employer ?? items[0]?.employer ?? null),
    );
  }, [interactive, items]);

  // Canvas bloom. Gated on `interactive`, so under reduced motion / no-JS the
  // pointer canvas never starts. The rAF loop is lazy: it runs only while
  // blooms are alive and stops itself when the last one fades.
  useEffect(() => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ink = readInk(canvas);
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
    sizeCanvas();

    const blooms: Bloom[] = [];
    let raf = 0;
    let last = 0;
    let running = false;

    const step = (time: number) => {
      const dt = last ? Math.min(time - last, 100) : 16;
      last = time;
      ctx.clearRect(0, 0, width, height);

      for (let i = blooms.length - 1; i >= 0; i--) {
        const bloom = blooms[i];
        bloom.age += dt;
        if (bloom.age >= bloom.life) {
          blooms.splice(i, 1);
          continue;
        }
        drawBloom(ctx, bloom, ink);
      }

      if (blooms.length > 0) {
        raf = requestAnimationFrame(step);
      } else {
        running = false;
        last = 0;
      }
    };

    bloomRef.current = (x, y, meta) => {
      blooms.push(makeBloom(x, y, meta));
      if (blooms.length > MAX_BLOOMS) blooms.shift();
      if (!running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(step);
      }
    };

    const onResize = () => sizeCanvas();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      bloomRef.current = null;
    };
  }, [interactive]);

  const isOpen = (id: string) => !interactive || openId === id;

  /** Bloom behind a row at the pointer (or the row's centre when no coords). */
  const bloomFor = (index: number, clientX?: number, clientY?: number) => {
    const paint = bloomRef.current;
    if (!paint) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const x = (clientX ?? (rect ? rect.left + rect.width / 2 : 0)) - (rect?.left ?? 0);
    const y = (clientY ?? (rect ? rect.top + rect.height / 2 : 0)) - (rect?.top ?? 0);
    paint(x, y, metas[index]);
  };

  return (
    <div className={styles.ledger}>
      <canvas ref={canvasRef} className={styles.canvas} data-ledger-canvas aria-hidden="true" />

      <ol className={styles.list}>
        {items.map((item, index) => {
          const panelId = `ledger-panel-${index}`;
          const open = isOpen(item.employer);

          return (
            <li
              key={item.employer}
              className={styles.row}
              data-ledger-row
              data-current={item.current ? "true" : "false"}
              data-open={open ? "true" : "false"}
            >
              <button
                type="button"
                className={styles.head}
                data-ledger-toggle
                aria-expanded={open}
                aria-controls={panelId}
                onClick={(e) => {
                  if (interactive) setOpenId((prev) => (prev === item.employer ? null : item.employer));
                  bloomFor(index, e.clientX, e.clientY);
                }}
                onPointerEnter={(e) => {
                  if (interactive) setOpenId(item.employer);
                  bloomFor(index, e.clientX, e.clientY);
                }}
              >
                <span className={styles.employer} data-ledger-employer>
                  {item.employer}
                </span>
                <span className={styles.years} data-ledger-years>
                  {item.startDate}–{item.endDate}
                  {item.current ? (
                    <span className={styles.badge} data-ledger-badge>
                      atual
                    </span>
                  ) : null}
                </span>
              </button>

              <div className={styles.panel} id={panelId} hidden={!open}>
                <p className={styles.role} data-ledger-role>
                  {item.role}
                </p>
                {item.location ? (
                  <p className={styles.location} data-ledger-location>
                    {item.location}
                  </p>
                ) : null}
                <p className={styles.body} data-ledger-body>
                  {item.body}
                </p>
                {item.skills && item.skills.length > 0 ? (
                  <ul className={styles.skills} data-ledger-skills>
                    {item.skills.map((skill) => (
                      <li key={skill} className={styles.skill} data-ledger-skill>
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
