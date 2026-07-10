#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');

const dependencyNodeModules = 'C:\\Users\\acasa\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
process.env.NODE_PATH = [process.env.NODE_PATH, dependencyNodeModules, path.join(dependencyNodeModules, '.pnpm', 'node_modules')].filter(Boolean).join(path.delimiter);
require('module').Module._initPaths();

const { chromium } = require('playwright');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.RTA_BASE_URL || 'http://127.0.0.1:8794';
const OUTPUT = path.join(os.tmpdir(), 'ghid-rta-qa');
const viewports = [
  { name: 'phone-320', width: 320, height: 720 },
  { name: 'phone-375', width: 375, height: 812 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1366', width: 1366, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 }
];

async function enter(page, route) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
  const accept = page.locator('#ageAccept');
  let gate = null;
  if (await accept.isVisible().catch(() => false)) {
    gate = await page.evaluate(() => {
      const card = document.querySelector('.age-card');
      const actions = document.querySelector('.age-actions');
      const cardRect = card && card.getBoundingClientRect();
      const actionsRect = actions && actions.getBoundingClientRect();
      return {
        docWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        cardLeft: Math.round(cardRect?.left || 0),
        cardRight: Math.round(cardRect?.right || 0),
        actionsBottom: Math.round(actionsRect?.bottom || 0),
        viewportHeight: innerHeight
      };
    });
    await accept.click();
  }
  await page.waitForFunction(() => !document.body.classList.contains('app-preparing'), { timeout: 20000 });
  await page.waitForFunction(() => typeof window.comparatorValidation === 'function', { timeout: 8000 });
  await page.evaluate(() => document.fonts.ready);
  return gate;
}

(async () => {
  fs.mkdirSync(OUTPUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: fs.existsSync(chromePath) ? chromePath : undefined });
  const failures = [];
  const reports = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    const gate = await enter(page, '/');
    await page.waitForSelector('.journey-hub');
    const home = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      const emptyActions = [...document.querySelectorAll('button,a[href]')].filter(node => {
        const name = (node.getAttribute('aria-label') || node.innerText || node.querySelector('img')?.alt || node.getAttribute('title') || '').trim();
        return !name;
      }).map(node => node.outerHTML.slice(0, 120));
      const nav = document.querySelector('.navlinks');
      const navButtons = [...document.querySelectorAll('.navlinks .navbtn')];
      const navTops = navButtons.map(button => button.getBoundingClientRect().top);
      const topSpread = navTops.length ? Math.max(...navTops) - Math.min(...navTops) : 0;
      const guideGrid = document.querySelector('.guide-hub-grid');
      const supplierRail = document.querySelector('.supplier-showcase .supplier-rail');
      const supplierHeights = [...document.querySelectorAll('.supplier-showcase .supplier-card')].map(card => Math.round(card.getBoundingClientRect().height));
      const promptRect = document.querySelector('.mystic-orbit-prompt')?.getBoundingClientRect();
      const eRect = document.querySelector('.mystic-orbit-e')?.getBoundingClientRect();
      const heroTitle = document.querySelector('.shop-hero h1');
      const heroRange = document.createRange();
      if (heroTitle) heroRange.selectNodeContents(heroTitle);
      const heroTitleLines = heroTitle ? new Set([...heroRange.getClientRects()].map(rect => Math.round(rect.top))).size : 0;
      return {
        docWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        journeyCards: document.querySelectorAll('.journey-card').length,
        journeyWidth: Math.round(document.querySelector('.journey-hub')?.getBoundingClientRect().width || 0),
        catalogHealth: document.querySelector('#catalogHealth')?.textContent.trim() || '',
        navButtons: navButtons.length,
        navRows: topSpread <= 3 ? 1 : 2,
        navTopSpread: Math.round(topSpread * 10) / 10,
        navScrollWidth: nav?.scrollWidth || 0,
        navClientWidth: nav?.clientWidth || 0,
        guideColumns: guideGrid ? getComputedStyle(guideGrid).gridTemplateColumns.split(' ').filter(Boolean).length : 0,
        supplierScrollable: Boolean(supplierRail && supplierRail.scrollWidth > supplierRail.clientWidth + 4),
        supplierHeightSpread: supplierHeights.length ? Math.max(...supplierHeights) - Math.min(...supplierHeights) : 0,
        mysticGap: promptRect && eRect ? Math.round(eRect.left - promptRect.right) : 0,
        heroTitleLines,
        categoryIcons: document.querySelectorAll('.category-link .cat-icon').length,
        categoryIconAltValid: [...document.querySelectorAll('.category-link .cat-icon')].every(icon => icon.hasAttribute('alt') && icon.alt === ''),
        footerGroups: document.querySelectorAll('.footer-map .footer-group').length,
        footerLinks: document.querySelectorAll('.footer-map a[href]').length,
        manropeReady: document.fonts.check('16px "Manrope Local"'),
        cormorantReady: document.fonts.check('20px "Cormorant Garamond Local"'),
        duplicateIds: Array.from(new Set(duplicateIds)),
        emptyActions,
        missingAlt: [...document.images].filter(image => !image.hasAttribute('alt')).length
      };
    });

    if (gate && (gate.docWidth > gate.viewportWidth + 4 || gate.cardLeft < -4 || gate.cardRight > gate.viewportWidth + 4 || gate.actionsBottom > gate.viewportHeight + 4)) failures.push(`${viewport.name}: 18+ gate is clipped`);
    if (home.docWidth > home.viewportWidth + 4) failures.push(`${viewport.name}: home has horizontal page overflow ${home.docWidth}/${home.viewportWidth}`);
    if (home.journeyCards !== 4) failures.push(`${viewport.name}: expected four Home journeys, got ${home.journeyCards}`);
    if (!home.catalogHealth) failures.push(`${viewport.name}: catalog health indicator is empty`);
    if (home.duplicateIds.length) failures.push(`${viewport.name}: duplicate IDs ${home.duplicateIds.join(', ')}`);
    if (home.emptyActions.length) failures.push(`${viewport.name}: unnamed actions ${home.emptyActions.join(' | ')}`);
    if (home.missingAlt) failures.push(`${viewport.name}: ${home.missingAlt} images have no alt text`);
    if (home.categoryIcons !== 12 || !home.categoryIconAltValid) failures.push(`${viewport.name}: category icon system is incomplete or inaccessible`);
    if (home.footerGroups !== 3 || home.footerLinks < 20) failures.push(`${viewport.name}: grouped footer is incomplete`);
    if (!home.manropeReady || !home.cormorantReady) failures.push(`${viewport.name}: local premium fonts are not available`);
    if (viewport.width >= 1200 && (home.navRows !== 1 || home.navScrollWidth > home.navClientWidth + 4)) failures.push(`${viewport.name}: desktop navigation does not fit on one row`);
    if (viewport.width >= 1200 && home.guideColumns !== 3) failures.push(`${viewport.name}: useful guides are not balanced in three columns`);
    if (viewport.width >= 1200 && home.heroTitleLines !== 1) failures.push(`${viewport.name}: Home title wraps on desktop`);
    if (home.supplierHeightSpread > 2) failures.push(`${viewport.name}: supplier cards do not have a stable height`);
    if (viewport.width <= 640 && !home.supplierScrollable) failures.push(`${viewport.name}: supplier showcase does not expose horizontal exploration`);
    if (home.mysticGap < 6) failures.push(`${viewport.name}: celestial E overlaps its label`);

    if (viewport.name === 'phone-390' || viewport.name === 'desktop-1366') {
      await page.screenshot({ path: path.join(OUTPUT, `${viewport.name}-home.png`), fullPage: true });
    }

    await page.evaluate(() => goTab('atomizers'));
    await page.waitForSelector('.atom-card .atom-media img');
    const atomImageFit = await page.locator('.atom-card .atom-media img').first().evaluate(image => getComputedStyle(image).objectFit);
    if (atomImageFit !== 'contain') failures.push(`${viewport.name}: atomizer images are still cropped`);
    const atomizerDna = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('#atomizerList>.atom-card')];
      const panels = cards.map(card => card.querySelector('.aroma-dna'));
      return {
        cards: cards.length,
        panels: panels.filter(Boolean).length,
        validMetrics: panels.filter(Boolean).every(panel => {
          const metrics = [...panel.querySelectorAll('.aroma-dna-metric')];
          return metrics.length === 5 && metrics.every(metric => {
            const segments = metric.querySelectorAll('.aroma-dna-segment').length;
            const active = metric.querySelectorAll('.aroma-dna-segment.is-active').length;
            return segments === 5 && active >= 1 && active <= 5 && Boolean(metric.getAttribute('aria-label'));
          });
        }),
        docWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth
      };
    });
    if (!atomizerDna.cards || atomizerDna.panels !== atomizerDna.cards || !atomizerDna.validMetrics) failures.push(`${viewport.name}: atomizer aromatic DNA is incomplete`);
    if (atomizerDna.docWidth > atomizerDna.viewportWidth + 4) failures.push(`${viewport.name}: aromatic DNA causes atomizer page overflow`);
    const atomizerDetailDna = await page.evaluate(() => {
      renderAtomizerPage(atomizers[0]);
      const pageDna = document.querySelector('#atomPageContent .aroma-dna');
      openAtomDetail(0);
      const modalDna = document.querySelector('#detailBody .aroma-dna');
      const result = {
        pageMetrics: pageDna?.querySelectorAll('.aroma-dna-metric').length || 0,
        modalMetrics: modalDna?.querySelectorAll('.aroma-dna-metric').length || 0
      };
      closeAtomDetail();
      return result;
    });
    if (atomizerDetailDna.pageMetrics !== 5 || atomizerDetailDna.modalMetrics !== 5) failures.push(`${viewport.name}: atomizer profile or detail aromatic DNA is incomplete`);

    await page.evaluate(() => goTab('recommender'));
    await page.waitForSelector('#recommendation .triangulation-signature');
    const recommendationSignature = await page.evaluate(() => {
      const signature = document.querySelector('#recommendation .triangulation-signature');
      const values = [...signature.querySelectorAll('.triangulation-values b')].map(node => node.textContent.trim());
      const cards = [...document.querySelectorAll('#recommendation>.luxe-result')];
      const firstModel = cards[0]?.querySelector('.result-headline h3')?.textContent.trim() || '';
      const firstDna = cards[0]?.querySelector('.aroma-dna');
      return {
        title: signature.querySelector('h4')?.textContent.trim() || '',
        nodes: signature.querySelectorAll('.triangulation-node').length,
        values,
        firstModel,
        cards: cards.length,
        dnaPanels: cards.filter(card => card.querySelector('.aroma-dna')).length,
        firstDnaMetrics: firstDna?.querySelectorAll('.aroma-dna-metric').length || 0,
        docWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth
      };
    });
    if (recommendationSignature.nodes !== 3 || recommendationSignature.values.length !== 3 || recommendationSignature.values.some(value => !value)) failures.push(`${viewport.name}: triangulation signature is incomplete`);
    if (recommendationSignature.values[1] !== recommendationSignature.firstModel) failures.push(`${viewport.name}: triangulation signature does not follow the leading recommendation`);
    if (recommendationSignature.cards !== 5 || recommendationSignature.dnaPanels !== 5 || recommendationSignature.firstDnaMetrics !== 5) failures.push(`${viewport.name}: recommendation aromatic DNA is incomplete`);
    if (recommendationSignature.docWidth > recommendationSignature.viewportWidth + 4) failures.push(`${viewport.name}: triangulation signature causes horizontal overflow`);
    const adaptiveSignature = await page.evaluate(() => {
      const read = () => [...document.querySelectorAll('#recommendation .triangulation-values b')].map(node => node.textContent.trim()).join('|');
      const before = read();
      document.querySelector('[data-problem="tooDry"]')?.click();
      const after = read();
      document.querySelector('[data-problem="balance"]')?.click();
      return { before, after };
    });
    if (!adaptiveSignature.before || adaptiveSignature.before === adaptiveSignature.after) failures.push(`${viewport.name}: triangulation signature does not react to intent changes`);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reducedMotion = await page.evaluate(() => ({
      line: getComputedStyle(document.querySelector('.triangulation-lines path')).animationName,
      node: getComputedStyle(document.querySelector('.triangulation-node')).animationName,
      segment: getComputedStyle(document.querySelector('.aroma-dna-segment.is-active')).animationName
    }));
    if (Object.values(reducedMotion).some(name => name !== 'none')) failures.push(`${viewport.name}: reduced-motion preference is not respected`);
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    if (viewport.name === 'phone-390' || viewport.name === 'desktop-1366') {
      await page.screenshot({ path: path.join(OUTPUT, `${viewport.name}-triangulation.png`), fullPage: true });
    }

    await page.evaluate(() => goTab('comparator'));
    await page.waitForSelector('#compareResults .compare-table');
    const comparator = await page.evaluate(() => {
      const section = document.querySelector('#comparator');
      const selects = [...section.querySelectorAll('select')];
      const unlabeled = selects.filter(select => !select.labels?.length && !select.getAttribute('aria-label')).length;
      const text = section.innerText;
      return {
        summary: document.querySelector('#compareSummary')?.textContent.trim() || '',
        modelColumns: document.querySelectorAll('#compareResults .compare-row:first-child .compare-cell.model').length,
        docWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        unlabeled,
        leakedCapacity: /\b\d+(?:[.,]\d+)?\s*ml\b/i.test(text),
        leakedColor: /\b(?:matte|full|silk)\s+(?:black|blue|red|green|silver|gold)\b/i.test(text)
      };
    });
    if (!/^\d+\s*\/\s*\d+/.test(comparator.summary)) failures.push(`${viewport.name}: comparator validation summary is missing`);
    if (comparator.modelColumns !== 2) failures.push(`${viewport.name}: comparator default does not show two models`);
    if (comparator.docWidth > comparator.viewportWidth + 4) failures.push(`${viewport.name}: comparator causes page overflow`);
    if (comparator.unlabeled) failures.push(`${viewport.name}: comparator has ${comparator.unlabeled} unlabeled selects`);
    if (comparator.leakedCapacity || comparator.leakedColor) failures.push(`${viewport.name}: comparator leaks tank capacity or commercial color`);
    if (pageErrors.length) failures.push(`${viewport.name}: browser errors ${pageErrors.join(' | ')}`);

    if (viewport.name === 'phone-390' || viewport.name === 'desktop-1366') {
      await page.screenshot({ path: path.join(OUTPUT, `${viewport.name}-comparator.png`), fullPage: true });
    }
    reports.push({ viewport: viewport.name, home, comparator });
    await context.close();
  }

  for (const viewport of [{ name: 'en-phone', width: 390, height: 844 }, { name: 'en-desktop', width: 1366, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await enter(page, '/en/');
    const english = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      active: document.querySelector('[data-lang].active')?.textContent.trim() || '',
      nav: [...document.querySelectorAll('.navlinks .navbtn')].map(node => node.textContent.trim()),
      journeys: [...document.querySelectorAll('.journey-card')].map(node => node.textContent.trim()),
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      docWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    }));
    if (english.lang !== 'en' || english.active !== 'EN') failures.push(`${viewport.name}: EN language state is not active`);
    if (!/MTL RTA Guide/i.test(english.title)) failures.push(`${viewport.name}: EN title is incorrect`);
    if (english.canonical !== 'https://ghid-rta.ro/en/') failures.push(`${viewport.name}: EN canonical is incorrect`);
    if (english.nav.some(label => /Recomandare|Atomizoare|Lichide|Sarme|Noutati/i.test(label))) failures.push(`${viewport.name}: Romanian label remains in the primary navigation`);
    if (english.journeys.some(label => /Vreau|lichid|sarma|produse disponibile/i.test(label))) failures.push(`${viewport.name}: Romanian label remains in the Home journeys`);
    if (english.docWidth > english.viewportWidth + 4) failures.push(`${viewport.name}: EN page overflows horizontally`);
    await context.close();
  }

  const pwaContext = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
  const pwaPage = await pwaContext.newPage();
  await enter(pwaPage, '/');
  await pwaPage.evaluate(() => navigator.serviceWorker.ready);
  const controlled = await pwaPage.waitForFunction(() => Boolean(navigator.serviceWorker.controller), { timeout: 5000 }).then(() => true).catch(() => false);
  if (!controlled) {
    await pwaPage.reload({ waitUntil: 'domcontentloaded' });
    const accept = pwaPage.locator('#ageAccept');
    if (await accept.isVisible().catch(() => false)) await accept.click();
    await pwaPage.waitForFunction(() => Boolean(navigator.serviceWorker.controller), { timeout: 8000 });
  }
  const cachedPaths = await pwaPage.evaluate(async () => {
    const keys = await caches.keys();
    const requests = (await Promise.all(keys.map(key => caches.open(key).then(cache => cache.keys())))).flat();
    return requests.map(request => new URL(request.url).pathname);
  });
  if (cachedPaths.some(pathname => pathname === '/' || pathname === '/index.html' || pathname === '/sync-status.json' || pathname.startsWith('/en/'))) failures.push(`PWA cached live catalog paths: ${cachedPaths.join(', ')}`);
  await pwaContext.setOffline(true);
  let offlineText = '';
  try {
    await pwaPage.goto(`${BASE_URL}/offline-check-${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    offlineText = await pwaPage.locator('body').innerText();
  } catch (error) {
    offlineText = await pwaPage.locator('body').innerText().catch(() => '');
  }
  if (!/Acces offline|Offline access|Ghidurile stabile|Stable guides/i.test(offlineText)) failures.push('PWA offline fallback was not served');
  await pwaContext.close();

  await browser.close();
  console.log(JSON.stringify({ screenshots: OUTPUT, reports: reports.map(report => ({ viewport: report.viewport, navRows: report.home.navRows, comparable: report.comparator.summary })) }, null, 2));
  if (failures.length) {
    console.error(failures.map(item => `- ${item}`).join('\n'));
    process.exit(1);
  }
  console.log('Responsive, accessibility, EN and PWA checks passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
