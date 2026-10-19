// Component test for EditorialPostCard (replaces BlogCard): a props-driven,
// text-only post preview — must render THIS post's own slug/title/excerpt,
// never a hardcoded/shared value, mirroring OfferCard's own-data test.
//
// No hooks/effects, so a static SSR render (no jsdom `window` bootstrap) is
// enough — same pattern as offer-card.test.tsx / editorial-timeline.test.tsx.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const { renderToStaticMarkup } = await import("react-dom/server");
const React = await import("react");
const { default: EditorialPostCard } = await import("../../components/EditorialPostCard.tsx");
const { posts } = await import("../../app/posts.ts");

type PostType = (typeof posts)[number];

function renderCard(post: PostType): Document {
  const html = renderToStaticMarkup(React.createElement(EditorialPostCard, { post }));
  return new JSDOM(`<!doctype html><body>${html}</body>`).window.document;
}

test("EditorialPostCard links to the post's own slug and renders its own title/excerpt — never a shared/hardcoded value", () => {
  const [first, second] = posts;
  const doc1 = renderCard(first);
  const doc2 = renderCard(second);

  const link1 = doc1.querySelector("a");
  const link2 = doc2.querySelector("a");
  assert.ok(link1, "expected the card to render as a link");
  assert.equal(link1!.getAttribute("href"), `/blog/${first.slug}`);
  assert.equal(link2!.getAttribute("href"), `/blog/${second.slug}`);

  assert.match(doc1.querySelector("h3")?.textContent ?? "", new RegExp(escapeRegExp(first.title)));
  assert.match(doc1.body.textContent ?? "", new RegExp(escapeRegExp(first.excerpt)));

  // Two different posts must not render identical href+title combos.
  const combo1 = `${link1!.getAttribute("href")}::${doc1.querySelector("h3")?.textContent}`;
  const combo2 = `${link2!.getAttribute("href")}::${doc2.querySelector("h3")?.textContent}`;
  assert.notEqual(combo1, combo2);
});

test("EditorialPostCard renders no cover image — text-only editorial preview", () => {
  const doc = renderCard(posts[0]);
  assert.equal(doc.querySelector("img"), null, "expected no <img> in the text-only card");
});

test("EditorialPostCard formats the post date as a localized pt-BR string", () => {
  const doc = renderCard(posts[0]);
  const expected = new Date(posts[0].date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  assert.ok(doc.body.textContent?.includes(expected), `expected formatted date "${expected}" in the card`);
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
