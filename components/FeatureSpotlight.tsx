"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import styles from "./FeatureSpotlight.module.css";
import type { servicos } from "../app/content";

/** One item of `servicos.items` — see app/content.ts for the full shape. */
type ServiceItem = (typeof servicos)["items"][number];

/**
 * Premium services grid (21st "Feature-08 Spotlight" reimplemented
 * framework-free): hairline-railed cards with corner crosshair marks and a
 * pointer-tracked ink spotlight, replacing OfferCard's flat list.
 *
 * Props-driven on the same `servicos.items` shape so app/content.ts stays
 * the single source of truth — this component invents no copy. Each card
 * keeps its own href/cta; never a shared placeholder link (CK-1, same rule
 * OfferCard.tsx already enforces).
 */
export default function FeatureSpotlight({ items }: { items: ServiceItem[] }) {
  const spotlightEnabled = useSpotlightEnabled();

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <SpotlightCard key={item.title} item={item} spotlightEnabled={spotlightEnabled} />
      ))}
    </div>
  );
}

/**
 * The pointer-follow spotlight is a decorative hover affordance, not
 * information — `prefers-reduced-motion` turns it off at the JS level (no
 * position updates) as well as in CSS (`.spotlight { display: none }`),
 * so neither layer depends on the other to do the right thing.
 */
function useSpotlightEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => setEnabled(!mql.matches);
    applyPreference();
    mql.addEventListener("change", applyPreference);
    return () => mql.removeEventListener("change", applyPreference);
  }, []);

  return enabled;
}

function SpotlightCard({
  item,
  spotlightEnabled,
}: {
  item: ServiceItem;
  spotlightEnabled: boolean;
}) {
  const cardRef = useRef<HTMLElement>(null);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (!spotlightEnabled) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <article ref={cardRef} className={styles.card} onMouseMove={handleMouseMove}>
      <span className={`${styles.corner} ${styles.cornerTl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTr}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBr}`} aria-hidden="true" />
      <div className={styles.spotlight} aria-hidden="true" />
      <h3 className={styles.title}>{item.title}</h3>
      <p className={styles.description}>{item.benefit}</p>
      <a className={styles.cta} href={item.href}>
        {item.cta} →
      </a>
    </article>
  );
}
