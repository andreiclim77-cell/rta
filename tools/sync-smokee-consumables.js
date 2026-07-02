#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const START_MARKER = '/* AUTO-SMOKEE-CONSUMABLES-START */';
const END_MARKER = '/* AUTO-SMOKEE-CONSUMABLES-END */';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const write = args.includes('--write') || (!dryRun && !args.includes('--check'));

const GROUPS = [
  {
    id: 'wires',
    terms: ['Ni80', 'SS316L', 'NiFe30', 'Kanthal', 'clapton', 'MTL coil', 'rola wire']
  },
  {
    id: 'cotton',
    terms: ['bumbac', 'cotton']
  },
  {
    id: 'tools',
    terms: ['tool kit', 'coiling tool', 'ceramic tweezer', 'unelte', 'scule']
  }
];

function decodeEntities(value) {
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&ndash;|&mdash;|&#8211;|&#8212;/g, '-')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function norm(value) {
  return decodeEntities(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function jsString(value) {
  return `'${String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ')}'`;
}

function cleanUrl(url) {
  return String(url || '').replace(/[?#].*$/, '').replace(/\/?$/, '/');
}

function inferTag(title, group) {
  const text = norm(title);
  if (group === 'cotton') return /2\.5|2,5/.test(text) ? 'bumbac 2.5 mm' : 'bumbac';
  if (group === 'tools') return 'unelte RTA';
  if (/nife/.test(text)) return 'NiFe30 TC';
  if (/ss316l|inox/.test(text)) return /clapton|fused/.test(text) ? 'SS316L Clapton' : 'SS316L';
  if (/ni80|n80/.test(text)) return /alien/.test(text) ? 'Ni80 Alien' : (/clapton|fused/.test(text) ? 'Ni80 Clapton' : 'Ni80');
  if (/kanthal|ka1|k1/.test(text)) return 'Kanthal';
  if (/clapton|fused/.test(text)) return 'Clapton MTL';
  return 'sarma RTA';
}

function normalizeProduct(product, group) {
  const title = decodeEntities(product.name || product.title || '');
  const images = Array.isArray(product.images) ? product.images : [];
  const image = images.length ? (images[0].thumbnail || images[0].src || '') : '';
  return {
    title,
    url: cleanUrl(product.permalink || product.url || ''),
    image,
    tag: inferTag(title, group),
    stock: product.is_in_stock === true ? true : (product.is_in_stock === false ? false : null)
  };
}

function isConsumable(item, group) {
  const text = norm([item.title, item.url, item.tag].join(' '));
  if (!/smokee\.ro\/product\//.test(item.url)) return false;
  if (/atomizor|drip tip|cartus|cartridge|pod|mod full kit|converter box|horizontech talons/.test(text)) return false;
  if (group === 'cotton') return /bumbac|cotton|coton/.test(text);
  if (group === 'tools') return /tool kit|scule|unelte|coil tool|coiling|tweezer|penseta|foarfeca|cleste|ohm/.test(text) && !/full kit/.test(text);
  if (group === 'wires') {
    if (/\b(rdl|boro|dl)\b/.test(text) && !/\bmtl\b/.test(text)) return false;
    return /rezistent|resistance|coil|coils|rola|wire|kanthal|ka1|k1|ss316|nife|ni80|clapton|fused|staple|alien/.test(text);
  }
  return false;
}

function uniqueItems(items, group) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (!item.title || !item.url || seen.has(item.url)) continue;
    seen.add(item.url);
    if (isConsumable(item, group)) out.push(item);
  }
  return out.slice(0, 18);
}

async function fetchStoreProducts(term) {
  const url = `https://smokee.ro/wp-json/wc/store/v1/products?search=${encodeURIComponent(term)}&per_page=20`;
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; RTA-MTL-Smokee-Consumables-Sync/1.0)',
      'accept': 'application/json'
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function fetchGroup(group) {
  const chunks = await Promise.all(group.terms.map(term => fetchStoreProducts(term).catch(() => [])));
  return uniqueItems(chunks.flat().map(product => normalizeProduct(product, group.id)), group.id);
}

function itemBlock(item) {
  const stock = item.stock === true ? 'true' : (item.stock === false ? 'false' : 'null');
  return `{title:${jsString(item.title)},url:${jsString(item.url)},image:${jsString(item.image)},tag:${jsString(item.tag)},stock:${stock}}`;
}

function dataBlock(data) {
  const lines = [];
  for (const group of GROUPS) {
    lines.push(`  ${group.id}: [`);
    lines.push(data[group.id].map(item => `    ${itemBlock(item)}`).join(',\n'));
    lines.push('  ],');
  }
  lines.push(`  generated:${jsString(new Date().toISOString().slice(0, 10))}`);
  return lines.join('\n');
}

function replaceBlock(html, block) {
  const start = html.indexOf(START_MARKER);
  const end = html.indexOf(END_MARKER);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('Auto Smokee consumables markers were not found in index.html');
  }
  const before = html.slice(0, start + START_MARKER.length);
  const after = html.slice(end);
  return `${before}\n${block}\n  ${after}`;
}

async function main() {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const data = {};
  for (const group of GROUPS) {
    data[group.id] = await fetchGroup(group);
  }
  const total = GROUPS.reduce((sum, group) => sum + data[group.id].length, 0);
  if (!total) {
    console.log('Smokee consumables sync: no products found.');
    return;
  }

  const updated = replaceBlock(html, dataBlock(data));
  console.log(`Smokee consumables sync: ${total} products prepared.`);
  for (const group of GROUPS) {
    console.log(`- ${group.id}: ${data[group.id].length}`);
  }

  if (dryRun || !write) return;
  fs.writeFileSync(INDEX_PATH, updated, 'utf8');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
