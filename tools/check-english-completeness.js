#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dependencyNodeModules = 'C:\\Users\\acasa\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
process.env.NODE_PATH = [process.env.NODE_PATH, dependencyNodeModules, path.join(dependencyNodeModules, '.pnpm', 'node_modules')].filter(Boolean).join(path.delimiter);
require('module').Module._initPaths();

const { chromium } = require('playwright');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.RTA_BASE_URL || 'http://127.0.0.1:8794';
const routes = ['home', 'recommender', 'diagnostic', 'setupList', 'atomizers', 'profiles', 'liquids', 'wires', 'consumables', 'registry', 'tcGuide', 'liquidGuide', 'legislativ', 'sources', 'comparator'];

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: fs.existsSync(chromePath) ? chromePath : undefined });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(`${BASE_URL}/en/`, { waitUntil: 'domcontentloaded' });
  const accept = page.locator('#ageAccept');
  if (await accept.isVisible().catch(() => false)) await accept.click();
  await page.waitForFunction(() => !document.body.classList.contains('app-preparing'), { timeout: 20000 });
  await page.waitForFunction(() => typeof window.comparatorValidation === 'function', { timeout: 8000 });

  const report = {};
  for (const route of routes) {
    await page.evaluate(routeId => goTab(routeId), route);
    await page.waitForTimeout(180);
    report[route] = await page.evaluate(routeId => {
      const section = document.querySelector(`#${routeId}`);
      if (!section) return ['missing section'];
      const marker = /[ăâîșțĂÂÎȘȚ]|\b(?:alege|alegi|apasa|apasă|atomizoare|bumbac|cauta|caută|clasa|cumpara|cumpără|deschide|disponibil(?:a|e)?|ghiduri|lichid(?:e|ul)?|modele|noutati|noutăți|potrivire|produse|recomandare|sarma|sarme|sârmă|sârme|selecteaza|selectează|surse|toate|unelte|verifica|verifică|vezi)\b/i;
      return section.innerText.split(/\n+/).map(line => line.trim()).filter(line => line && marker.test(line)).slice(0, 30);
    }, route);
  }

  await browser.close();
  const failures = Object.entries(report).filter(([, lines]) => lines.length);
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) {
    console.error(`English completeness: untranslated text remains in ${failures.map(([route]) => route).join(', ')}.`);
    process.exit(1);
  }
  console.log('English completeness checks passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
