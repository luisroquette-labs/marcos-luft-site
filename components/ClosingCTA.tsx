import styles from "./ClosingCTA.module.css";

/**
 * Closing contact section (21st "Worth Keeping CTA" reference, cta69):
 * a full-bleed band with a giant ink marquee scrolling behind a centered
 * heading, supporting note, and a pill "seal" CTA. Pure CSS keyframe
 * marquee — no animation library, no JS loop.
 *
 * Fully props-driven and content-agnostic: the real contact channel
 * (WhatsApp/Instagram href + label) is supplied by the caller from
 * `app/content.ts`'s `person`, never hardcoded here (AD-2 — no invented
 * contact). `id="contato"` is fixed so existing `href="#contato"` CTAs
 * elsewhere on the page keep resolving to this section.
 */
export type ClosingCTAProps = {
  /** Big centered headline, e.g. "Vamos conversar sobre a comunicação…". */
  heading: string;
  /** Supporting line under the heading. */
  note: string;
  /** Label for the seal CTA, e.g. person.whatsappLabel. */
  ctaLabel: string;
  /** External contact URL for the seal CTA, e.g. person.whatsapp. */
  ctaHref: string;
  /** Phrase repeated in the background marquee, e.g. the person's name. */
  marqueePhrase: string;
};

// How many times `marqueePhrase` repeats within ONE scrolling copy. The
// track renders two identical copies back to back and animates by exactly
// -50%, so the loop is seamless regardless of phrase length or viewport width.
const MARQUEE_REPEATS_PER_COPY = 6;

export default function ClosingCTA({ heading, note, ctaLabel, ctaHref, marqueePhrase }: ClosingCTAProps) {
  const copy = Array.from({ length: MARQUEE_REPEATS_PER_COPY }, () => marqueePhrase).join(" · ");

  return (
    <section id="contato" className={styles.section}>
      {/* Decorative background text, not page content — hidden from assistive tech. */}
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          <span className={styles.marqueeCopy}>{copy} · </span>
          <span className={styles.marqueeCopy}>{copy} · </span>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.note}>{note}</p>
        <a className={styles.seal} href={ctaHref} target="_blank" rel="noopener noreferrer">
          {ctaLabel}
          <span className={styles.sealIcon} aria-hidden="true">
            ↗
          </span>
        </a>
      </div>
    </section>
  );
}
