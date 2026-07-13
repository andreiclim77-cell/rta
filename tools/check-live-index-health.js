#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'data', 'indexing-health.json');
const write = process.argv.includes('--write');
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = Array.from(sitemap.matchAll(/<loc>(https:\/\/ghid-rta\.ro\/[^<]*)<\/loc>/g), match => match[1]);

async function inspect(url) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'ghid-rta-index-health/1.0', accept: 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(15000)
    });
    const type = response.headers.get('content-type') || '';
    const html = /text\/html|application\/xhtml/i.test(type) ? await response.text() : '';
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i);
    return {
      url,
      status: response.status,
      reachable: response.ok,
      canonical: canonical ? canonical[1] : '',
      canonicalValid: Boolean(canonical && canonical[1] === url)
    };
  } catch (error) {
    return { url, status: 0, reachable: false, canonical: '', canonicalValid: false, error: String(error.message || error) };
  }
}

async function mapConcurrent(values, limit, worker) {
  const results = new Array(values.length);
  let cursor = 0;
  async function run() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, run));
  return results;
}

(async () => {
  const rows = await mapConcurrent(urls, 8, inspect);
  const failures = rows.filter(row => !row.reachable || !row.canonicalValid);
  const report = {
    schemaVersion: 1,
    checkedAt: new Date().toISOString(),
    scope: 'public reachability and canonical readiness; Google indexing is reported separately by Search Console',
    total: rows.length,
    reachable: rows.filter(row => row.reachable).length,
    canonicalValid: rows.filter(row => row.canonicalValid).length,
    failures,
    rows
  };
  if (write) fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Index health: ${report.reachable}/${report.total} reachable, ${report.canonicalValid}/${report.total} canonicals valid.`);
  if (failures.length) process.exit(1);
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
