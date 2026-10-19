"use client";

import { useState } from "react";
import styles from "./GhostAccordion.module.css";

/** One FAQ entry — matches `app/content.ts`'s `faq.items` shape exactly. */
type FaqItem = { q: string; a: string };

/**
 * Borderless, numbered FAQ accordion — "Ghost Accordion" style (21st #29230).
 * Replaces the hairline-boxed `Accordion`. Each row is a native `<button>`
 * (aria-expanded, keyboard-operable for free) toggling a +/× glyph; only the
 * open item renders its answer paragraph.
 */
export default function GhostAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.list}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const answerId = `ghost-accordion-answer-${i}`;

        return (
          <div key={item.q}>
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <span className={styles.number} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={styles.question}>{item.q}</span>
              <span className={styles.toggle} aria-hidden="true">
                {isOpen ? "×" : "+"}
              </span>
            </button>
            {isOpen && (
              <p id={answerId} className={styles.answer}>
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
