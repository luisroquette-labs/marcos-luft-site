// Table-driven unit tests for app/content.ts — covers the success criteria
// of sub-task 02a-content-data: servicos count+CTA distinctness, trajetoria
// count+order+current-flag, prova 5-term membership, formacao status, and
// faq minimum count.

import { test } from "node:test";
import assert from "node:assert/strict";
import { servicos, trajetoria, prova, formacao, faq, nav } from "../../app/content.ts";

test("servicos has exactly 4 offers, each with a non-empty title/cta/href", () => {
  assert.equal(servicos.items.length, 4);

  for (const item of servicos.items) {
    assert.ok(item.title.length > 0, `title missing for ${JSON.stringify(item)}`);
    assert.ok(item.cta.length > 0, `cta missing for ${item.title}`);
    assert.ok(item.href.length > 0, `href missing for ${item.title}`);
  }
});

test("servicos CTAs are distinct — never a shared generic label across offers", () => {
  const ctaLabels = servicos.items.map((item) => item.cta);
  const uniqueLabels = new Set(ctaLabels);

  assert.equal(uniqueLabels.size, ctaLabels.length, `duplicate CTA labels found: ${ctaLabels.join(", ")}`);
});

test("trajetoria has exactly 3 entries", () => {
  assert.equal(trajetoria.items.length, 3);
});

test("trajetoria entries are sorted ascending by startDate", () => {
  const startYears = trajetoria.items.map((item) => Number.parseInt(item.startDate, 10));
  const sortedYears = [...startYears].sort((a, b) => a - b);

  assert.deepEqual(startYears, sortedYears, `trajetoria not chronological: ${startYears.join(", ")}`);
});

test("trajetoria marks exactly one entry as current — the Câmara entry", () => {
  const currentEntries = trajetoria.items.filter((item) => item.current === true);

  assert.equal(currentEntries.length, 1);
  assert.match(currentEntries[0].employer, /Câmara de Vereadores/);
});

test("prova names all 5 required credibility terms", () => {
  const haystack = [
    prova.framing,
    ...prova.items.map((item) => `${item.program} ${item.network}`),
  ].join(" ");

  const requiredTerms = [
    "Jornal Nacional",
    "Globo Repórter",
    "Jornal do Almoço",
    "RBS Notícias",
    /Rede Globo|RBS TV/,
  ];

  for (const term of requiredTerms) {
    const found = typeof term === "string" ? haystack.includes(term) : term.test(haystack);
    assert.ok(found, `missing required credibility term: ${term}`);
  }
});

test('formacao marks Jornalismo as "em andamento", never "concluído"', () => {
  const jornalismo = formacao.items.find((item) => item.course === "Jornalismo");

  assert.ok(jornalismo, "Jornalismo entry not found in formacao.items");
  assert.equal(jornalismo.status, "em andamento");
  assert.notEqual(jornalismo.status, "concluído");
});

test("faq has at least 3 real questions", () => {
  assert.ok(faq.items.length >= 3, `faq has only ${faq.items.length} items`);

  for (const item of faq.items) {
    assert.ok(item.q.length > 0, "faq item missing a question");
    assert.ok(item.a.length > 0, `faq item missing an answer for: ${item.q}`);
  }
});

// REGRESSÃO: header nav items were bare "#trajetoria"-style anchors, which
// only resolve on the home page — a "/" prefix is what makes them resolve
// from any route (SiteHeader renders them as <a href={`${BASE}${href}`}>).
test('every in-page nav anchor is rooted at "/#..." — never a bare "#..." fragment', () => {
  const anchorItems = nav.filter((item) => item.href.includes("#"));

  assert.ok(anchorItems.length > 0, "expected at least one anchor nav item to exist");
  for (const item of anchorItems) {
    assert.match(
      item.href,
      /^\/#/,
      `anchor nav item "${item.label}" (${item.href}) must start with "/#" to resolve from any route`,
    );
  }
});

test("every non-anchor nav item is a real route starting with /", () => {
  const routeItems = nav.filter((item) => !item.href.includes("#"));

  assert.ok(routeItems.length > 0, "expected at least one route nav item to exist");
  for (const item of routeItems) {
    assert.match(item.href, /^\//, `route nav item "${item.label}" (${item.href}) must start with "/"`);
  }
});
