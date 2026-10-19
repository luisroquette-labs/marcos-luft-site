"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Smooth-scroll com inércia (estilo das landing pages premium / Hotmart Launchpad).
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.5, // ~metade da distância por wheel -> rolagem ~2x mais lenta
      touchMultiplier: 0.9,
    });

    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Lenis tracks its own "virtual" scroll position and re-applies it every
    // rAF tick. A native in-page anchor click (href="#contato") moves the
    // real scrollTop without telling Lenis, so the very next tick snaps the
    // page back to where Lenis still thinks it is. Routing same-page hash
    // clicks through lenis.scrollTo() keeps Lenis's state and the real
    // scroll position in sync, so the jump actually sticks.
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest('a[href^="#"]');
      const href = anchor?.getAttribute("href");
      const target = href ? document.querySelector(href) : null;
      if (!target) return;
      event.preventDefault();

      // Pass an absolute pixel number, not the selector string: Lenis's own
      // selector handling combines the element's live rect with its
      // internal scroll tracker, which is stale whenever something else
      // moved the real scroll without Lenis's knowledge (the same class of
      // desync as above — e.g. a scroll-into-view that happens right before
      // this click). window.scrollY is always live, so computing the
      // target ourselves can't inherit that staleness.
      const absoluteTarget = target.getBoundingClientRect().top + window.scrollY;
      lenis.scrollTo(absoluteTarget);
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
