#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dependencyNodeModules = 'C:\\Users\\acasa\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
process.env.NODE_PATH = [
  process.env.NODE_PATH,
  dependencyNodeModules,
  path.join(dependencyNodeModules, '.pnpm', 'node_modules')
].filter(Boolean).join(path.delimiter);
require('module').Module._initPaths();

const { chromium } = require('playwright');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.RTA_BASE_URL || 'http://127.0.0.1:8794';

async function enterApp(page, route = '/') {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
  const accept = page.locator('#ageAccept');
  if (await accept.isVisible().catch(() => false)) await accept.click();
  await page.waitForFunction(() => !document.body.classList.contains('app-preparing'), { timeout: 20000 });
  await page.waitForFunction(() => typeof window.comparatorValidation === 'function', { timeout: 8000 });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await enterApp(page);

  const result = await page.evaluate(() => {
    function daysAgo(days) {
      const value = newsDateValue(todayKey()) - days * 86400000;
      return new Date(value).toISOString().slice(0, 10);
    }

    function profileBy(pattern) {
      return profiles.find(profile => pattern.test(profileDisplayName(profile))) || profiles[0];
    }

    function recommendationSnapshot(profile, intent) {
      const tags = profileTags(profile).slice(0, 4);
      const context = liquidContext(profile, intent, tags);
      const preferred = profileTop(profile);
      const rows = atomizers.slice().map(atom => recommendationItem(atom, context, preferred)).sort(compareRecommendation).slice(0, 5);
      return {
        profile: profileDisplayName(profile),
        rows: rows.map(row => {
          const tripod = tripodBuild(profile, intent, row.a);
          const wires = wireChoices(profile, intent, row.a);
          return {
            name: publicAtomName(row.a),
            fit: row.fit,
            score: row.score,
            practice: row.practice.score,
            practiceWeight: row.practice.weight,
            wireCount: wires.length,
            wireNames: wires.map(wire => wire.name),
            tripod: tripod.label
          };
        })
      };
    }

    const snapshots = [
      recommendationSnapshot(profileBy(/Virginia/i), 'balance'),
      recommendationSnapshot(profileBy(/Latakia|Kentucky/i), 'body'),
      recommendationSnapshot(profileBy(/RY4|Cavendish/i), 'tooDry')
    ];

    setupEnsureFallbackState();
    const setupCountsNow = setupCounts();
    const setupItems = setupSuggestedItems();
    const search = ['ss', 'ni', 'fe'].map(query => ({
      query,
      wires: searchBuckets(query).wires.map(item => item.title).slice(0, 5),
      firstAcrossAll: Object.values(searchBuckets(query)).flat().sort((a, b) => (b.score || 0) - (a.score || 0))[0]?.title || ''
    }));

    const airflow = ['Kayfun Lite Plus 2021 / KLP', 'Muted+', 'Ennequadro VICO RTA'].map(name => {
      const atom = atomizers.find(item => getName(item) === name);
      const info = atom ? airflowInfo(atom) : null;
      return { name, found: Boolean(atom), label: info && info.label, side: Boolean(info && info.side) };
    });

    const resources = performance.getEntriesByType('resource').map(item => item.name);
    return {
      counts: { atomizers: atomizers.length, profiles: profiles.length },
      browserLiveSync: SMOKEE_BROWSER_LIVE_SYNC,
      snapshots,
      search,
      airflow,
      diagnostic: {
        burned: diagnosticBestMatch('gust ars')?.id || '',
        tc: diagnosticBestMatch('TC taie puterea si pulseaza')?.id || ''
      },
      newsWindow: [0, 6, 7, 8].map(days => ({ days, active: isNewsDate(daysAgo(days)) })),
      registryDates: registryEntries().concat(registryLiquidEntries(liquidCatalogState), consumableRegistryEntries(consumableState, 'wires'), consumableRegistryEntries(consumableState, 'accessories')).map(entry => entry.date),
      setupCounts: setupCountsNow,
      setupKinds: Array.from(new Set(setupItems.map(item => item.kind))),
      setupProducts: setupItems.map(item => ({ title: item.title, kind: item.kind, url: item.url })),
      externalSmokeeRequests: resources.filter(url => /^https:\/\/(?:www\.)?smokee\.ro\//i.test(url))
    };
  });

  const failures = [];
  const check = (condition, message) => { if (!condition) failures.push(message); };
  check(result.counts.atomizers >= 80, `atomizer catalog unexpectedly small: ${result.counts.atomizers}`);
  check(result.counts.profiles >= 170, `profile taxonomy unexpectedly small: ${result.counts.profiles}`);
  check(result.browserLiveSync === false, 'browser-side Smokee polling is enabled');
  check(result.snapshots.every(snapshot => snapshot.rows.length === 5), 'recommendation engine did not return five models');
  check(result.snapshots.every(snapshot => new Set(snapshot.rows.map(row => row.name)).size === 5), 'recommendation engine returned duplicate models');
  check(result.snapshots.every(snapshot => snapshot.rows.every(row => Number.isFinite(row.fit) && Number.isFinite(row.score))), 'recommendation score is not finite');
  check(result.snapshots.every(snapshot => snapshot.rows.every(row => row.practice <= Math.ceil(Math.max(0, row.fit) * 0.30))), 'public-practice bonus exceeds the 30% ceiling');
  check(result.snapshots.every(snapshot => snapshot.rows.every(row => row.wireCount === 3 && row.tripod)), 'triangulation no longer provides three wires and a build');
  check(new Set(result.snapshots.flatMap(snapshot => snapshot.rows.map(row => row.name))).size >= 7, 'different liquid profiles produce insufficient recommendation diversity');
  check(/SS316/i.test(result.search.find(item => item.query === 'ss').wires.join(' ')), 'search `ss` does not prioritize SS wire results');
  check(/Ni80|NiFe/i.test(result.search.find(item => item.query === 'ni').wires.join(' ')), 'search `ni` does not prioritize nickel-alloy wire results');
  check(/NiFe/i.test(result.search.find(item => item.query === 'fe').wires.join(' ')), 'search `fe` does not resolve to NiFe');
  check(result.airflow[0].found && !result.airflow[0].side && /bottom/i.test(result.airflow[0].label), 'Kayfun Lite Plus airflow is not bottom-only');
  check(result.airflow[1].found && result.airflow[1].side, 'Muted+ is missing side airflow');
  check(result.airflow[2].found && result.airflow[2].side, 'VICO is missing side airflow');
  check(result.diagnostic.burned === 'P01', `burnt-taste diagnosis changed: ${result.diagnostic.burned}`);
  check(Boolean(result.diagnostic.tc), 'TC diagnosis returned no result');
  check(result.newsWindow[0].active && result.newsWindow[1].active && !result.newsWindow[2].active && !result.newsWindow[3].active, 'Noutati is not a rolling seven-day window');
  check(result.registryDates.every(date => date && isFinite(Date.parse(date))), 'Noutati contains an invalid publication date');
  check(result.setupCounts.rta >= 20 && result.setupCounts.liquids >= 100 && result.setupCounts.wires >= 5 && result.setupCounts.cotton >= 1, `Wizard fallback catalog is incomplete: ${JSON.stringify(result.setupCounts)}`);
  check(['rta', 'liquids', 'wires', 'cotton'].every(kind => result.setupKinds.includes(kind)), `Wizard suggestions are missing a product group: ${result.setupKinds.join(', ')}`);
  check(result.setupProducts.every(item => /^https:\/\/(?:www\.)?smokee\.ro\/product\//i.test(item.url)), 'Wizard contains a non-Smokee product URL');
  check(result.setupProducts.filter(item => item.kind === 'rta').every(item => !/\bpod\b|\brda\b|rdta/i.test(item.title)), 'Wizard RTA suggestions include a non-RTA product');
  check(result.externalSmokeeRequests.length === 0, `page load contacted Smokee directly: ${result.externalSmokeeRequests.join(', ')}`);
  check(pageErrors.length === 0, `browser errors: ${pageErrors.join(' | ')}`);

  console.log(JSON.stringify({
    counts: result.counts,
    recommendations: result.snapshots.map(snapshot => ({ profile: snapshot.profile, models: snapshot.rows.map(row => row.name) })),
    setupCounts: result.setupCounts,
    newsWindow: result.newsWindow
  }, null, 2));

  await browser.close();
  if (failures.length) {
    console.error(failures.map(item => `- ${item}`).join('\n'));
    process.exit(1);
  }
  console.log('Core regression checks passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
