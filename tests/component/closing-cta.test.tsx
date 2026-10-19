// Component test for ClosingCTA — the closing #contato section (21st "Worth
// Keeping CTA" reference, cta69). Verifies the section keeps id="contato" so
// existing href="#contato" CTAs elsewhere on the page still resolve, that the
// CTA wires the caller-supplied label/href (never an invented contact — see
// AD-2), and that the background marquee repeats the supplied phrase while
// staying hidden from assistive tech (it is decorative, not content).
//
// ClosingCTA has no hooks/effects (the marquee is a pure CSS keyframe
// animation), so a static SSR render is enough — same pattern as
// offer-card.test.tsx, no jsdom `window` bootstrap needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const { renderToStaticMarkup } = await import("react-dom/server");
const React = await import("react");
const { default: ClosingCTA } = await import("../../components/ClosingCTA.tsx");
const { person } = await import("../../app/content.ts");

// Real props, not invented ones: the CTA label/href come straight from
// app/content.ts's `person`, exactly as the composed page would pass them.
const props = {
  heading: "Vamos conversar sobre a comunicação da sua instituição",
  note: person.thesis,
  ctaLabel: person.whatsappLabel,
  ctaHref: person.whatsapp,
  marqueePhrase: person.name,
};

function render(overrides: Partial<typeof props> = {}): Document {
  const html = renderToStaticMarkup(React.createElement(ClosingCTA, { ...props, ...overrides }));
  return new JSDOM(`<!doctype html><body>${html}</body></html>`).window.document;
}

test("ClosingCTA keeps id=\"contato\" so existing href=\"#contato\" CTAs still resolve", () => {
  const doc = render();
  const section = doc.querySelector("section#contato");
  assert.ok(section, "expected a <section id=\"contato\"> element");
});

test("ClosingCTA renders the caller-supplied heading and note", () => {
  const doc = render();
  assert.match(doc.body.textContent ?? "", new RegExp(escapeRegExp(props.heading)));
  assert.match(doc.body.textContent ?? "", new RegExp(escapeRegExp(props.note)));
});

test("ClosingCTA wires the seal CTA to the caller-supplied label/href — never an invented contact", () => {
  const doc = render();
  const seal = doc.querySelector("a");
  assert.ok(seal, "expected a CTA link to render");
  assert.equal(seal!.getAttribute("href"), person.whatsapp);
  assert.ok(seal!.textContent?.includes(person.whatsappLabel));
  // External contact channel — must open in a new tab without leaking a
  // window.opener reference back to this page.
  assert.equal(seal!.getAttribute("target"), "_blank");
  assert.equal(seal!.getAttribute("rel"), "noopener noreferrer");
});

test("ClosingCTA echoes the caller's own ctaLabel/ctaHref, not a hardcoded contact", () => {
  const doc = render({ ctaLabel: "Fale no Instagram", ctaHref: "https://instagram.com/example" });
  const seal = doc.querySelector("a");
  assert.equal(seal!.getAttribute("href"), "https://instagram.com/example");
  assert.ok(seal!.textContent?.includes("Fale no Instagram"));
});

test("ClosingCTA repeats the supplied marquee phrase in a decorative, assistive-tech-hidden background track", () => {
  const doc = render();
  const marquee = doc.querySelector('[aria-hidden="true"]');
  assert.ok(marquee, "expected an aria-hidden marquee container");

  const occurrences = marquee!.textContent?.split(props.marqueePhrase).length ?? 1;
  assert.ok(occurrences - 1 >= 2, `expected "${props.marqueePhrase}" to repeat at least twice in the marquee`);
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
