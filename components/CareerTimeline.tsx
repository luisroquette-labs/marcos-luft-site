"use client";

// Horizontal career timeline — replaces PigmentLedger for the trajectory
// section. Faithful to the 21st reference `@hyperiux/timeline`: a horizontal
// baseline with a dot per milestone, cards alternating above/below the line,
// the year set in large serif type. Framework-free (no GSAP) — the
// scroll-in reveal reuses `Reveal` (IntersectionObserver + CSS), which
// already resolves to its final, legible state under
// `prefers-reduced-motion` (see app/globals.css `.reveal`). Ink-on-cream
// only: every colour below resolves through `--cream`/`--ink`/`--ink-soft`/
// `--ink-hairline`.
//
// Desktop/tablet: every `.node` shares the same fixed height (see
// CareerTimeline.module.css), split in half by the baseline — so each
// dot lands exactly on the line regardless of how much text its card
// holds, with no JS measurement. The 3 milestones sit side by side in one
// row. Mobile (<560px, the breakpoint already used in app/globals.css)
// collapses to a compact vertical list.

import type { trajetoria } from "../app/content";
import Reveal from "./Reveal";
import styles from "./CareerTimeline.module.css";

/**
 * One timeline entry. Structurally matches `trajetoria.items[number]` from
 * app/content.ts, plus the same two OPTIONAL fields PigmentLedger accepted
 * (location, skill tags) — present only when a caller supplies them.
 */
export type LedgerEntry = (typeof trajetoria)["items"][number] & {
  location?: string;
  skills?: string[];
};

/** Above/below alternation, purely from position — index 0 starts "above". */
function sideOf(index: number): "above" | "below" {
  return index % 2 === 0 ? "above" : "below";
}

/**
 * Props-driven horizontal timeline. `items` are passed already ordered by
 * the caller (content.ts guarantees source order). The entry with
 * `current === true` carries a distinguishing marker (`data-timeline-current`
 * and an "atual" badge) that no other entry has — CK-2: a visual
 * difference, not merely a data difference.
 */
export default function CareerTimeline({ items }: { items: LedgerEntry[] }) {
  return (
    <ol className={styles.track} data-timeline-track>
      <span className={styles.baseline} aria-hidden="true" />

      {items.map((item, index) => {
        const side = sideOf(index);

        return (
          <li
            key={item.employer}
            className={styles.node}
            data-timeline-node
            data-position={side}
            data-timeline-current={item.current ? "true" : "false"}
          >
            <span className={styles.stem} aria-hidden="true" />
            <span className={styles.dot} aria-hidden="true" />

            <Reveal
              as="div"
              className={styles.card}
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <article data-timeline-card>
                <span className={styles.year} data-timeline-years>
                  {item.startDate}–{item.endDate}
                  {item.current ? (
                    <span className={styles.badge} data-timeline-badge>
                      atual
                    </span>
                  ) : null}
                </span>
                <h3 className={styles.employer} data-timeline-employer>
                  {item.employer}
                </h3>
                <p className={styles.role} data-timeline-role>
                  {item.role}
                </p>
                {item.location ? <p className={styles.location}>{item.location}</p> : null}
                <p className={styles.body} data-timeline-body>
                  {item.body}
                </p>
                {item.skills && item.skills.length > 0 ? (
                  <ul className={styles.skills}>
                    {item.skills.map((skill) => (
                      <li key={skill} className={styles.skill}>
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
