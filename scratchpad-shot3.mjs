import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = 'https://luisroquette-labs.github.io/marcos-luft-site';
const OUT = '/private/tmp/claude-501/-Users-luisroquette/1600578f-1d54-4ca7-84fa-29a0ad64447f/scratchpad/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function scrollThrough(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 300) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

// Desktop close-ups
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await scrollThrough(page);

  // hero only (first viewport)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/crop-hero.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // header close up
  await page.screenshot({ path: `${OUT}/crop-header.png`, clip: { x: 0, y: 0, width: 1440, height: 90 } });

  // services cards section - find bounding box
  const svc = page.locator('.section').filter({ hasText: 'Quatro frentes' }).first();
  await svc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box1 = await svc.boundingBox();
  if (box1) await page.screenshot({ path: `${OUT}/crop-services.png`, clip: box1 });

  // trajectory / PigmentLedger
  const traj = page.locator('.section').filter({ hasText: 'três capítulos' }).first();
  await traj.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box2 = await traj.boundingBox();
  if (box2) await page.screenshot({ path: `${OUT}/crop-trajectory.png`, clip: box2 });

  // FAQ
  const faq = page.locator('.section').filter({ hasText: 'Perguntas frequentes' }).first();
  await faq.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box3 = await faq.boundingBox();
  if (box3) await page.screenshot({ path: `${OUT}/crop-faq.png`, clip: box3 });

  // closing CTA with marquee
  const cta = page.locator('.section').filter({ hasText: 'Vamos conversar sobre' }).first();
  await cta.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box4 = await cta.boundingBox();
  if (box4) await page.screenshot({ path: `${OUT}/crop-closing-cta.png`, clip: box4 });

  // footer
  const footer = page.locator('footer').first();
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box5 = await footer.boundingBox();
  if (box5) await page.screenshot({ path: `${OUT}/crop-footer.png`, clip: box5 });

  // formação académica (thin section)
  const form = page.locator('.section').filter({ hasText: 'Formação acadêmica' }).first();
  await form.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box6 = await form.boundingBox();
  if (box6) await page.screenshot({ path: `${OUT}/crop-formacao.png`, clip: box6 });

  await context.close();
}

// Mobile close-ups: header + hero + PigmentLedger timeline + FAQ
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await scrollThrough(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/crop-mobile-hero.png` });

  const traj = page.locator('.section').filter({ hasText: 'três capítulos' }).first();
  await traj.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box = await traj.boundingBox();
  if (box) await page.screenshot({ path: `${OUT}/crop-mobile-trajectory.png`, clip: box });

  const svc = page.locator('.section').filter({ hasText: 'Quatro frentes' }).first();
  await svc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const boxs = await svc.boundingBox();
  if (boxs) await page.screenshot({ path: `${OUT}/crop-mobile-services.png`, clip: boxs });

  await context.close();
}

await browser.close();
console.log('done');
