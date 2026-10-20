"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import Snap from "lenis/snap";

/** True when the visitor asked for reduced motion — then Lenis never mounts
 *  (instant native jumps are the accessible behaviour) and, consequently,
 *  neither does the snap. */
function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Live height of the sticky header. Read from the DOM (never hardcoded) so
 *  the snap/anchor offset tracks whatever the header actually renders at —
 *  including its taller, wrapped state on mobile. */
function headerHeight(): number {
  const header = document.querySelector<HTMLElement>(".site-header");
  return header?.offsetHeight ?? 68;
}

/** Absolute document top (px) of an element, independent of current scroll. */
function absoluteTop(element: Element): number {
  return element.getBoundingClientRect().top + window.scrollY;
}

/**
 * Smooth-scroll (Lenis) + magnetic section snapping (lenis/snap).
 *
 * Mounted once in the root layout and kept mounted across route changes, so
 * the Lenis instance and its rAF loop survive navigation. Two concerns, two
 * effects:
 *
 *  1. Lenis itself + same-page anchor handling — created once ([] deps).
 *  2. The snap — rebuilt on every route change ([pathname] deps), because the
 *     set of snappable sections differs per page, and their absolute tops
 *     shift on resize / once web fonts swap in.
 *
 * prefers-reduced-motion: Lenis is never created (effect 1 bails), so the
 * snap effect finds no Lenis instance and never instantiates either — the
 * page scrolls natively with no inertia and no magnetic pull.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.5, // ~metade da distância por wheel -> rolagem ~2x mais lenta
      touchMultiplier: 0.9,
    });

    lenisRef.current = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Same-document hash links must drive Lenis, never the browser's native
    // hash jump: Lenis tracks its own virtual scroll and re-applies it every
    // tick, so a native jump desyncs and snaps back. This catches both bare
    // "#id" links and the header's "/base/#id" anchors — but only when the
    // link's path is the one we're already on (url.pathname === current). On a
    // different route those must fall through to a real navigation. Resolving
    // against anchor.href means the GitHub Pages basePath is already applied,
    // so no manual BASE handling is needed here. Header-height offset keeps the
    // target's top just below the sticky header instead of under it.
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      const samePage = url.origin === window.location.origin && url.pathname === window.location.pathname;
      if (!url.hash || !samePage) return;

      const target = document.querySelector(url.hash);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(absoluteTop(target) - headerHeight());
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return; // reduced motion: Lenis never mounted -> no snap

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-snap]"));
    if (sections.length === 0) return; // content/flow page (e.g. /blog) -> no snap

    // lenis/snap's addElement(align:'start') snaps the element's top to scroll
    // 0, which ignores the sticky header entirely (and, because the header
    // sits in-flow above the hero, would even overshoot the hero). We need an
    // explicit header-height offset, so we register absolute snap values via
    // snap.add() — the only API that takes an arbitrary offset — and recompute
    // them ourselves on resize / font-swap (what addElement's ResizeObserver
    // would otherwise cover). The footer is added as the final snap target so
    // mandatory snapping can't trap it below the last section.
    const snap = new Snap(lenis, { type: "mandatory", duration: 0.7 });
    const footer = document.querySelector<HTMLElement>(".site-footer");
    const targets = footer ? [...sections, footer] : sections;

    let removers: Array<() => void> = [];
    const build = () => {
      removers.forEach((remove) => remove());
      const headerH = headerHeight();
      removers = targets.map((element) => snap.add(Math.max(0, Math.round(absoluteTop(element) - headerH))));
    };
    build();

    // Fonts swap in after first paint and reflow every section's top.
    document.fonts?.ready.then(build).catch(() => {});

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(build);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(resizeRaf);
      removers.forEach((remove) => remove());
      snap.destroy();
    };
  }, [pathname]);

  return null;
}
