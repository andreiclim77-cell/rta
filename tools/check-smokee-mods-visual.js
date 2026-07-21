#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dependencyNodeModules = 'C:\\Users\\acasa\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
process.env.NODE_PATH = [process.env.NODE_PATH, dependencyNodeModules, path.join(dependencyNodeModules, '.pnpm', 'node_modules')].filter(Boolean).join(path.delimiter);
require('module').Module._initPaths();

const { chromium } = require('playwright');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const baseUrl = process.env.RTA_BASE_URL || 'http://127.0.0.1:8794';

async function enter(page, route) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
  const accept = page.locator('#ageAccept');
  if (await accept.isVisible().catch(() => false)) await accept.click();
  await page.waitForFunction(() => !document.body.classList.contains('app-preparing'), { timeout: 20000 });
}

async function auditViewport(browser, viewport) {
  const page = await browser.newPage({ viewport });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await enter(page, '/#mods');
  await page.waitForSelector('#mods.active .mod-card');
  await page.locator('#mods .mod-more summary').all().then(summaries => Promise.all(summaries.map(summary => summary.click())));
  const reviewImages = page.locator('#mods .youtube-source img');
  await reviewImages.evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  for (let i = 0; i < await reviewImages.count(); i += 1) {
    await reviewImages.nth(i).scrollIntoViewIfNeeded();
  }
  await page.waitForFunction(() => [...document.querySelectorAll('#mods .youtube-source img')].filter(image => image.complete && image.naturalWidth > 0).length >= 4, null, { timeout: 8000 });
  const mods = await page.evaluate(() => ({
    cards: document.querySelectorAll('#mods .mod-card').length,
    titles: [...document.querySelectorAll('#mods .mod-card h3')].map(node => node.textContent.trim()),
    productLinks: document.querySelectorAll('#mods a[href^="https://smokee.ro/product/"]').length,
    loadedProductImages: [...document.querySelectorAll('#mods .mod-media img')].filter(image => image.complete && image.naturalWidth > 0).length,
    reviewPreviews: document.querySelectorAll('#mods .youtube-source').length,
    loadedReviewImages: [...document.querySelectorAll('#mods .youtube-source img')].filter(image => image.complete && image.naturalWidth > 0).length,
    moreLink: document.querySelector('.mods-more-link')?.getAttribute('href') || '',
    navButtons: document.querySelectorAll('.navlinks .navbtn').length,
    modsButton: Boolean(document.querySelector('.navlinks [data-tab="mods"]')),
    documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    navRight: Math.max(...[...document.querySelectorAll('.navlinks .navbtn')].map(node => node.getBoundingClientRect().right)),
    viewportWidth: document.documentElement.clientWidth
  }));
  if (mods.cards !== 5) throw new Error(`${viewport.width}px: expected 5 mod cards, got ${mods.cards}`);
  if (new Set(mods.titles).size !== 5) throw new Error(`${viewport.width}px: duplicate mod family visible`);
  if (mods.productLinks < 5 || mods.loadedProductImages !== 5) throw new Error(`${viewport.width}px: product links/images incomplete`);
  if (mods.reviewPreviews < 4 || mods.loadedReviewImages < 4) throw new Error(`${viewport.width}px: YouTube review previews incomplete`);
  if (!/smokee\.ro\/product-category\/mod-uri\//.test(mods.moreLink)) throw new Error(`${viewport.width}px: Smokee category link is wrong`);
  if (!mods.modsButton || mods.navButtons !== 12) throw new Error(`${viewport.width}px: navigation is incomplete`);
  if (mods.documentOverflow > 2) throw new Error(`${viewport.width}px: page overflows horizontally by ${mods.documentOverflow}px`);
  if (viewport.width > 900 && mods.navRight > mods.viewportWidth + 2) throw new Error(`${viewport.width}px: desktop navigation is clipped`);

  await page.goto(`${baseUrl}/#registry`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.body.classList.contains('app-preparing'), { timeout: 20000 });
  await page.waitForSelector('#registry.active #registryModZone');
  const registry = await page.evaluate(() => ({
    jump: Boolean(document.querySelector('[data-registry-jump="registryModZone"]')),
    cards: document.querySelectorAll('#registryModList .registry-card').length,
    youtube: document.querySelectorAll('#registryModList .youtube-source').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  if (!registry.jump || registry.cards < 1 || registry.overflow > 2) throw new Error(`${viewport.width}px: mods news registry failed`);

  await page.goto(`${baseUrl}/#atomizers`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.body.classList.contains('app-preparing'), { timeout: 20000 });
  await page.waitForSelector('#atomizers.active .atom-card');
  await page.evaluate(() => {
    const index = atomizers.findIndex(atomizer => getSources(atomizer).some(source => youtubeId(sourceUrl(source))));
    if (index < 0) throw new Error('No atomizer with a direct YouTube source');
    openAtomDetail(index);
  });
  await page.waitForSelector('#atomDetail.active .source-line.youtube-source');
  const detailAtomReview = page.locator('#atomDetail .source-line.youtube-source img').first();
  await detailAtomReview.scrollIntoViewIfNeeded();
  const atomReviews = await page.evaluate(() => ({
    previews: document.querySelectorAll('#atomDetail .source-line.youtube-source').length,
    loaded: [...document.querySelectorAll('#atomDetail .source-line.youtube-source img')].filter(image => image.complete && image.naturalWidth > 0).length
  }));
  if (atomReviews.previews < 1 || atomReviews.loaded < 1) throw new Error(`${viewport.width}px: atomizer YouTube previews are missing`);
  if (pageErrors.length) throw new Error(`${viewport.width}px page errors: ${pageErrors.join(' | ')}`);
  await page.close();
  return { viewport, mods, registry, atomReviews };
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: fs.existsSync(chromePath) ? chromePath : undefined });
  try {
    const results = [];
    results.push(await auditViewport(browser, { width: 1440, height: 1000 }));
    results.push(await auditViewport(browser, { width: 390, height: 844 }));
    console.log(`Smokee mods visual passed: ${results.map(result => `${result.viewport.width}px / ${result.mods.cards} cards / ${result.mods.reviewPreviews} reviews`).join('; ')}.`);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
