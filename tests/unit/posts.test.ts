// Table-driven unit tests for app/posts.ts — covers the success criteria of
// sub-task 02b-blog-posts: exactly 3 posts with the 3 expected slugs, every
// post has a non-empty title/date, and every body exceeds the minimum
// real-content length (not a stub) — see CK-5/CK-10.

import { test } from "node:test";
import assert from "node:assert/strict";
import { posts, getPost, type Block } from "../../app/posts.ts";

const MIN_WORDS = 600;
const MIN_CHARS = 3500;

const EXPECTED_SLUGS = [
  "pauta-tv-aberta",
  "comunicacao-institucional-nao-e-marketing",
  "cobertura-sob-deadline",
];

function bodyToPlainText(body: Block[]): string {
  return body
    .flatMap((block) => (block.t === "ul" ? block.v : [block.v]))
    .join(" ");
}

test("posts.ts exports exactly 3 posts", () => {
  assert.equal(posts.length, 3);
});

test("posts array contains at least 2 posts (CK-5 minimum)", () => {
  assert.ok(posts.length >= 2, `expected >=2 posts, got ${posts.length}`);
});

test("the 3 expected slugs from profile §7 are all present", () => {
  const actualSlugs = posts.map((p) => p.slug);

  for (const slug of EXPECTED_SLUGS) {
    assert.ok(actualSlugs.includes(slug), `missing expected slug: ${slug}`);
  }
  assert.equal(actualSlugs.length, EXPECTED_SLUGS.length);
});

for (const slug of EXPECTED_SLUGS) {
  test(`post "${slug}" has non-empty slug/title/date and a body well past stub length`, () => {
    const post = getPost(slug);
    assert.ok(post, `getPost("${slug}") returned undefined`);
    if (!post) return;

    assert.ok(post.slug.length > 0, "slug is empty");
    assert.ok(post.title.length > 0, "title is empty");
    assert.ok(post.date.length > 0, "date is empty");
    assert.match(post.date, /^\d{4}-\d{2}-\d{2}$/, `date "${post.date}" is not YYYY-MM-DD`);
    assert.ok(post.date.startsWith("2026"), `expected a 2026 publish date, got "${post.date}"`);

    const plainText = bodyToPlainText(post.body);
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;

    assert.ok(
      plainText.length >= MIN_CHARS,
      `post "${slug}" body is ${plainText.length} chars, expected >= ${MIN_CHARS} (not a stub)`,
    );
    assert.ok(
      wordCount >= MIN_WORDS,
      `post "${slug}" body is ${wordCount} words, expected >= ${MIN_WORDS} (not a stub)`,
    );

    // Real articles have structure, not a single flat paragraph.
    const h2Count = post.body.filter((block) => block.t === "h2").length;
    assert.ok(h2Count >= 3, `post "${slug}" has only ${h2Count} h2 sections, expected >= 3`);
  });
}

test("every post's body contains no invented client name, award, or specific metric/audience number", () => {
  // Heuristic guard (CK-11): the approved profile never names a private
  // client or a quantified audience/award; flag any accidental drift.
  const forbiddenPatterns = [
    /prêmio/i,
    /\d+[.,]?\d*\s*(mil|milhões|espectadores|seguidores|ouvintes|telespectadores)/i,
  ];

  for (const post of posts) {
    const plainText = `${post.title} ${post.excerpt} ${bodyToPlainText(post.body)}`;
    for (const pattern of forbiddenPatterns) {
      assert.ok(
        !pattern.test(plainText),
        `post "${post.slug}" matched forbidden pattern ${pattern} — possible fabricated claim`,
      );
    }
  }
});
