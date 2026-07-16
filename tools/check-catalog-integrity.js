#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  allSources,
  atomizerValidation,
  loadCatalog,
  publicAtomName,
  slugify,
  sourceUrl
} = require('./catalog-data');
const {
  hasSweetTobaccoProfile,
  hasTobaccoProfile,
  inferTag
} = require('./sync-smokee-liquids');

const ROOT = path.resolve(__dirname, '..');
const catalog = loadCatalog(ROOT);
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function listCount(value) {
  return Object.values(value || {}).filter(Array.isArray).reduce((sum, list) => sum + list.length, 0);
}

function allItems(value) {
  return Object.entries(value || {}).filter(([, list]) => Array.isArray(list)).flatMap(([group, list]) => list.map(item => ({ group, item })));
}

function validProductUrl(value) {
  return /^https:\/\/(?:www\.)?smokee\.ro\/product\//i.test(String(value || ''));
}

check(catalog.atomizers.length >= 80, `catalog too small: ${catalog.atomizers.length} atomizers`);
check(catalog.profiles.length >= 170, `profile taxonomy too small: ${catalog.profiles.length}`);
check(listCount(catalog.liquids) >= 350, `liquid catalog too small: ${listCount(catalog.liquids)}`);
check(listCount(catalog.consumables) >= 50, `consumables catalog too small: ${listCount(catalog.consumables)}`);

const sweetTobaccoLiquids = allItems(catalog.liquids).filter(({ item }) => /\bdulce\b/i.test(String(item && item.tag || '')));
check((catalog.liquids.tutun || []).length >= 250, `TUTUN catalog is incomplete: ${(catalog.liquids.tutun || []).length}`);
check(sweetTobaccoLiquids.length >= 100, `sweet tobacco classification is incomplete: ${sweetTobaccoLiquids.length}`);
check(hasTobaccoProfile('Tutun Virginia cu caramel si vanilie'), 'tobacco profile fixture was rejected');
check(hasTobaccoProfile('Ripe Vapes VCT Sweet Almond'), 'VCT tobacco profile fixture was rejected');
check(!hasTobaccoProfile('Vanilla custard cu bourbon Kentucky'), 'dessert-only fixture was accepted as tobacco');
check(hasSweetTobaccoProfile('Tutun Burley cu miere si crema'), 'sweet tobacco fixture was rejected');
check(!hasSweetTobaccoProfile('Tutun Burley sec si lemnos'), 'dry tobacco fixture was classified as sweet');
check(/^TUTUN dulce\b/.test(inferTag('Tutun Virginia cu mar si caramel', 'tutun')), 'sweet tobacco tag fixture is incorrect');

const atomSlugs = new Map();
catalog.atomizers.forEach(atom => {
  const name = publicAtomName(atom.name);
  const slug = slugify(name);
  check(Boolean(name), 'atomizer without a public name');
  check(Boolean(slug), `atomizer without a slug: ${atom.name}`);
  check(!/\b(?:pod|rdta|rda)\b/i.test(name), `non-RTA product in atomizer catalog: ${name}`);
  check(!/\b\d+(?:[.,]\d+)?\s*ml\b/i.test(name), `tank capacity leaked into public name: ${name}`);
  check(!/\b(?:matte|full|silk)\s+(?:black|blue|red|green|silver|gold)\b/i.test(name), `commercial color leaked into public name: ${name}`);
  if (atomSlugs.has(slug)) failures.push(`duplicate atomizer slug: ${slug} (${atomSlugs.get(slug)} / ${name})`);
  atomSlugs.set(slug, name);

  const validation = atomizerValidation(atom);
  if (validation.comparable) {
    check(Array.isArray(atom.builds) && atom.builds.length > 0, `comparable atomizer has no build: ${name}`);
    check(allSources(atom).some(source => /^https?:\/\//i.test(sourceUrl(source))), `comparable atomizer has no source: ${name}`);
  }
});

const productUrls = new Map();
allItems(catalog.liquids).concat(allItems(catalog.consumables)).forEach(({ group, item }) => {
  const title = String(item && item.title || '').trim();
  const url = String(item && item.url || '').replace(/[?#].*$/, '').replace(/\/?$/, '/');
  check(Boolean(title), `${group}: catalog product without title`);
  check(validProductUrl(url), `${group}: invalid Smokee product URL for ${title || '(untitled)'}`);
  if (url && productUrls.has(url) && productUrls.get(url) !== `${group}:${title}`) {
    failures.push(`product URL duplicated across catalog groups: ${url}`);
  }
  if (url) productUrls.set(url, `${group}:${title}`);
  if (item && item.addedAt) check(/^\d{4}-\d{2}-\d{2}/.test(item.addedAt), `${group}: invalid addedAt for ${title}`);
});

const source = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'smokee-rta-sync.yml'), 'utf8');
const facebookPublisher = fs.readFileSync(path.join(ROOT, 'tools', 'facebook-publisher.js'), 'utf8');
const consumableSync = fs.readFileSync(path.join(ROOT, 'tools', 'sync-smokee-consumables.js'), 'utf8');
const liquidSync = fs.readFileSync(path.join(ROOT, 'tools', 'sync-smokee-liquids.js'), 'utf8');
check(/var NEWS_WINDOW_DAYS=7;/.test(source), 'Noutati rolling window is no longer seven days');
check(/var SMOKEE_BROWSER_LIVE_SYNC=false;/.test(source), 'browser-side Smokee polling must stay disabled');
check(/var LIQUID_CATALOG_CACHE_KEY='smokeeLiquidsDailyV3';/.test(source), 'liquid cache version was not refreshed');
check(/Math\.round\(Math\.max\(0,fit\)\*0\.30\*weight\)/.test(source), '30% public-practice recommendation weighting changed');
check(/\.sort\(compareRecommendation\)\.slice\(0,5\)/.test(source), 'recommendation engine no longer returns five ranked matches');
check(/var wires=wireChoices\(prof,selectedProblem,a\)/.test(source), 'three-wire recommendation path is missing');
check(/var NEWS_WINDOW_DAYS=7;[\s\S]*days>=0&&days<NEWS_WINDOW_DAYS/.test(source), 'rolling seven-day Noutati calculation changed');
check(/cron: ['"]0,20 3 \* \* \*['"]/.test(workflow), 'EEST 06:00/06:20 schedule is missing');
check(/cron: ['"]0,20 4 \* \* \*['"]/.test(workflow), 'EET 06:00/06:20 schedule is missing');
check(/facebook-publisher\.js --pending-count/.test(workflow), 'Facebook update detection is missing from the catalog workflow');
check(/facebook-publisher\.js --publish --max-posts 2/.test(workflow), 'Facebook publisher is missing from the catalog workflow');
check(/FACEBOOK_PAGE_ACCESS_TOKEN: \$\{\{ secrets\.FACEBOOK_PAGE_ACCESS_TOKEN \}\}/.test(workflow), 'Facebook Page token is not read from GitHub Secrets');
check(!/FACEBOOK_PAGE_ACCESS_TOKEN\s*=\s*['"][^'"]+['"]/.test(facebookPublisher), 'Facebook Page token must not be stored in source code');
check(/Europe\/Bucharest/.test(workflow), 'Bucharest timezone gate is missing');
check(!/https:\/\/(?:www\.)?smokee\.ro\/wp-content\/uploads\//i.test(source), 'direct Smokee image URLs bypass the Cloudflare cache');
check(/const FETCH_CONCURRENCY = 3;/.test(consumableSync), 'consumables sync request limit changed');
check(/const chunks = await fetchInBatches\(tasks\);/.test(consumableSync), 'consumables sync no longer uses controlled request batches');
check(/const products = await fetchAllCategoryProducts\(\);/.test(liquidSync), 'liquid category is no longer fetched in one shared pass');
check(/sourceComplete \? dated : mergeWithExisting\(dated, existing\.items\)/.test(liquidSync), 'partial liquid sync no longer preserves the last-known-good catalog');
check(!/slice\(0,\s*140\)/.test(liquidSync), 'legacy 140-liquid cap returned');

const componentItems = catalog.consumables.components || [];
check(componentItems.some(item => /arcana mods.*510 pvc protective discs/i.test(String(item && item.title || ''))), 'Arcana 510 protective discs are missing from components');

const validationPath = path.join(ROOT, 'data', 'atomizer-validation.json');
check(fs.existsSync(validationPath), 'atomizer validation registry is missing');
if (fs.existsSync(validationPath)) {
  const validation = JSON.parse(fs.readFileSync(validationPath, 'utf8'));
  const expectedComparable = catalog.atomizers.map(atomizerValidation).filter(item => item.comparable).length;
  check(validation.total === catalog.atomizers.length, 'validation registry total does not match catalog');
  check(validation.comparable === expectedComparable, 'validation registry comparable count does not match catalog');
}

const syncStatus = JSON.parse(fs.readFileSync(path.join(ROOT, 'sync-status.json'), 'utf8'));
check(syncStatus.newsWindowDays === 7, 'sync status no longer declares the seven-day news window');
check(syncStatus.browserPolling === false, 'sync status no longer declares browser polling disabled');
check(syncStatus.fallbackPolicy === 'last-known-good', 'last-known-good sync policy is missing');
check(Array.isArray(syncStatus.schedule) && syncStatus.schedule.join(',') === '06:00,06:20', 'sync status schedule changed');
check(!Number.isNaN(Date.parse(syncStatus.lastSuccessfulRun)), 'sync status has an invalid last successful run');

if (failures.length) {
  console.error(failures.map(item => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log(`Catalog integrity: ${catalog.atomizers.length} RTA, ${catalog.profiles.length} profiles, ${listCount(catalog.liquids)} liquids, ${listCount(catalog.consumables)} consumables.`);
