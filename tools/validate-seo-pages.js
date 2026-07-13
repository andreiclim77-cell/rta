#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const legacyPages = [
  'index.html',
  'ghid-rta-mtl.html',
  'start.html',
  'ce-atomizor-rta-mtl-aleg.html',
  'recomandari-rta-mtl.html',
  'atomizoare-rta-mtl.html',
  'lichide-net-tutun.html',
  'net-rta-mtl.html',
  'tutun-rta-mtl.html',
  'sarme-rta-builduri.html',
  'builduri-mtl-sarme-rta.html',
  'airflow-camera-rta-mtl.html',
  'control-temperatura-mtl.html',
  'nife30-control-temperatura-mtl.html',
  'ss316l-mtl-rta.html',
  'clapton-mtl-rta.html',
  'kanthal-ni80-mtl-rta.html',
  'net-complex-rta-mtl.html',
  'ry4-tutun-dulce-rta-mtl.html',
  'bottom-side-airflow-rta-mtl.html',
  'diagnostic-gust-rta-mtl.html',
  'calculator-lichide-vape.html',
  'consumabile-rta-smokee.html',
  'wizard-smokee.html',
  'rta-mtl-smokee.html',
  'legislativ-vape.html',
  'smokee-link-kit.html',
  'audienta.html'
];

function htmlFilesUnder(folder) {
  const start = path.join(ROOT, folder);
  if (!fs.existsSync(start)) return [];
  const output = [];
  function walk(current) {
    fs.readdirSync(current, { withFileTypes: true }).forEach(entry => {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile() && entry.name.endsWith('.html')) output.push(path.relative(ROOT, target).replace(/\\/g, '/'));
    });
  }
  walk(start);
  return output;
}

const pages = Array.from(new Set(legacyPages.concat(['en/index.html'], htmlFilesUnder('atomizoare'), htmlFilesUnder('lichide')))).sort();
const requiredSeoTokens = ['<title>', 'meta name="description"', 'rel="canonical"'];
const canonicalOwners = new Map();
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

for (const file of pages) {
  const absolute = path.join(ROOT, file);
  check(fs.existsSync(absolute), `${file}: file is missing`);
  if (!fs.existsSync(absolute)) continue;
  const html = fs.readFileSync(absolute, 'utf8');
  requiredSeoTokens.forEach(token => check(html.includes(token), `${file}: missing ${token}`));
  check(/<meta\s+charset=["']?utf-8/i.test(html), `${file}: missing UTF-8 charset`);
  check(!/[ÃÄÈÂ�]|â€|ï¿½/.test(html), `${file}: possible mojibake detected`);
  check(!/meta\s+name=["']robots["'][^>]+noindex/i.test(html), `${file}: accidentally marked noindex`);

  if (file !== 'index.html' && file !== 'en/index.html') {
    check(html.includes('assets/seo-pages.css'), `${file}: missing shared SEO CSS`);
  }

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i);
  if (canonicalMatch) {
    const canonical = canonicalMatch[1];
    check(/^https:\/\/ghid-rta\.ro\//.test(canonical), `${file}: canonical is outside ghid-rta.ro`);
    if (canonicalOwners.has(canonical)) failures.push(`${file}: duplicate canonical also used by ${canonicalOwners.get(canonical)}`);
    canonicalOwners.set(canonical, file);
  }

  const scripts = html.split('<script type="application/ld+json">').slice(1).map(part => part.split('</script>')[0]);
  scripts.forEach((script, index) => {
    try {
      const data = JSON.parse(script);
      if (file === 'en/index.html') check(!script.includes('"ro-RO"'), `${file}: JSON-LD ${index + 1} still declares Romanian`);
      check(Boolean(data), `${file}: JSON-LD ${index + 1} is empty`);
    } catch (error) {
      failures.push(`${file}: JSON-LD ${index + 1} invalid: ${error.message}`);
    }
  });

  if (file.startsWith('atomizoare/') && file !== 'atomizoare/index.html') {
    const text = visibleText(html);
    check(text.length >= 550, `${file}: atomizer page is too thin`);
    check(!/\b\d+(?:[.,]\d+)?\s*ml\b/i.test(text), `${file}: tank capacity appears in visible copy`);
    check(!/\b(?:matte|full|silk)\s+(?:black|blue|red|green|silver|gold)\b/i.test(text), `${file}: commercial color appears in visible copy`);
  }

  for (const match of html.matchAll(/href=["'](\/atomizoare\/[^"'#?]+\/)["']/g)) {
    const target = path.join(ROOT, match[1].replace(/^\//, ''), 'index.html');
    check(fs.existsSync(target), `${file}: broken atomizer page link ${match[1]}`);
  }
}

const rootHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const enHtml = fs.readFileSync(path.join(ROOT, 'en', 'index.html'), 'utf8');
check(rootHtml.includes('hreflang="en" href="https://ghid-rta.ro/en/"'), 'root page is missing EN hreflang');
check(enHtml.includes('hreflang="ro-RO" href="https://ghid-rta.ro/"'), 'EN page is missing RO hreflang');
check(enHtml.includes('<link rel="canonical" href="https://ghid-rta.ro/en/"'), 'EN page canonical is incorrect');
check(enHtml.includes('<meta name="twitter:url" content="https://ghid-rta.ro/en/"'), 'EN Twitter URL is incorrect');

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
check(sitemapUrls.length === new Set(sitemapUrls).size, 'sitemap.xml contains duplicate URLs');
for (const canonical of canonicalOwners.keys()) check(sitemapUrls.includes(canonical), `sitemap.xml: missing ${canonical}`);

if (failures.length) {
  console.error(failures.map(item => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log(`SEO validation: ${pages.length} pages, ${canonicalOwners.size} unique canonicals, ${sitemapUrls.length} sitemap URLs.`);
