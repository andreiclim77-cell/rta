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
const source = process.argv[2];
const output = process.argv[3];

if (!source || !output) {
  throw new Error('Usage: node tools/create-facebook-compatible-image.js <source-url> <output-path>');
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body{margin:0;padding:0}img{display:block;max-width:none}</style><img alt="" src="${source.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">`);
  const image = page.locator('img');
  await image.waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForFunction(() => {
    const node = document.querySelector('img');
    return node && node.complete && node.naturalWidth > 0 && node.naturalHeight > 0;
  }, { timeout: 30000 });
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  await image.screenshot({ path: path.resolve(output), type: 'png' });
  const dimensions = await image.evaluate(node => ({ width: node.naturalWidth, height: node.naturalHeight }));
  console.log(`Facebook-compatible PNG: ${output} (${dimensions.width}x${dimensions.height}).`);
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
