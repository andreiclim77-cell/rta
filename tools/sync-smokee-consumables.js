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
  },
  {
    id: 'components',
    terms: [
      'air pin RTA', 'pini airflow RTA', 'pinuri airflow RTA', 'sticla atomizor RTA',
      'glass RTA', 'tank kit RTA', 'nano kit RTA', 'kit nano RTA', 'top refill RTA',
      'chamber RTA', 'camera RTA', 'clopot RTA', 'chimney RTA', 'bell cap RTA',
      'spare RTA', 'replacement RTA', 'extensie RTA', 'extension RTA', 'deck RTA',
      'BKS Blade RTA', 'By-Ka V11 RTA', 'Labs RTA', 'Minister RTA', 'Prime Minister RTA',
      'Diplomat RTA', 'Arcana RTA', 'Muted RTA', 'Baya RTA', 'Vico RTA', 'Chephren RTA'
    ]
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

const COMPONENT_MODELS = [
  ['BKS Blade RTA', /\b(bks|blade)\b/],
  ['NTSU / Netsu MTL RTA', /\b(ntsu|netsu)\b/],
  ['Chephren RTA', /\bchephren\b/],
  ['Prime Minister MTL RTA', /\bprime\s+minister\b/],
  ['Minister MTL RTA', /(?<!prime\s)\bminister\b/],
  ['Diplomat MTL RTA', /\bdiplomat\b/],
  ['By-Ka V.11 RTA', /\bby[-\s]?ka\b|\bv\.?\s*11\b|\bv11\b/],
  ['BP Mods Labs RTA', /\blabs\b|\bbp\s+mods\b/],
  ['Arcana Mods Muted RTA', /\bmuted\b/],
  ['Arcana 22 RTA', /\barcana\s*22\b/],
  ['Ambition Mods Trinity RTA', /\btrinity\b/],
  ['Ambition Mods Revorie RTA', /\brevorie\b/],
  ['Ambition Mods Bi2hop RTA', /\bbi2hop\b/],
  ['Ambition Mods Amazier RTA', /\bamazier\b/],
  ['Ennequadro Mods Vico RTA', /\bvico\b/],
  ['Ennequadro Mods Baya RTA', /\bbaya\b/],
  ['Blaze MTL RTA', /\bblaze\b/],
  ['Berserker Mini V3 MTL RTA', /\bberserker\b/],
  ['Dead Rabbit MTL RTA 2', /\bdead\s+rabbit\b/],
  ['GD Mods MD01 RTA', /\bmd01\b|\bgd\s+mods\b/],
  ['Kayfun RTA', /\bkayfun\b/],
  ['Dvarw MTL RTA', /\bdvarw\b/],
  ['Taifun RTA', /\btaifun\b|\bgtr\b/],
  ['415 RTA', /\b415\b/],
  ['Bishop RTA', /\bbishop\b/],
  ['Flash-e-Vapor RTA', /\bflash[-\s]?e[-\s]?vapor\b|\bfev\b/]
];

function inferComponentKind(title) {
  const text = norm(title);
  if (/\b(air pin|air-pin|pini airflow|pinuri|pin airflow|airflow pin|insert)\b/.test(text)) return 'pini / inserturi airflow';
  if (/\b(sticla|glass|tank|rezervor)\b/.test(text) && !/\bgradata\b/.test(text)) return 'sticla / tank';
  if (/\b(chamber|camera|clopot|chimney|bell cap|bell)\b/.test(text)) return 'camera / clopot';
  if (/\b(top refill|top-fill|top fill|refill)\b/.test(text)) return 'top refill';
  if (/\b(nano kit|kit nano|short tank)\b/.test(text)) return 'kit nano / short';
  if (/\b(extensie|extension|extender)\b/.test(text)) return 'extensie';
  if (/\b(deck|post|surub|screw|o[-\s]?ring|oring|garnitur|repair|spare|replacement)\b/.test(text)) return 'piese schimb';
  return 'componenta RTA';
}

function inferComponentModel(title) {
  const text = norm(title);
  const found = COMPONENT_MODELS.find(([, re]) => re.test(text));
  if (found) return found[0];
  const match = text.match(/\b(?:pentru|for|dedicat(?:a|e)?\s+pentru)\s+(.+?)(?:\s+-|\s+\||$)/);
  if (match && match[1]) {
    return decodeEntities(match[1])
      .replace(/\b(atomizor|rta|mtl|dl|rdl|set|kit|glass|tank|sticla|pini|pinuri|airflow|replacement|spare)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase()) || 'Componente RTA diverse';
  }
  return 'Componente RTA diverse';
}

function inferTag(title, group) {
  const text = norm(title);
  if (group === 'cotton') return /2\.5|2,5/.test(text) ? 'bumbac 2.5 mm' : 'bumbac';
  if (group === 'tools') return 'unelte RTA';
  if (group === 'components') return inferComponentKind(title);
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
  const item = {
    title,
    url: cleanUrl(product.permalink || product.url || ''),
    image,
    tag: inferTag(title, group),
    stock: product.is_in_stock === true ? true : (product.is_in_stock === false ? false : null)
  };
  if (group === 'components') item.model = inferComponentModel(title);
  return item;
}

function isRtaComponent(item) {
  const text = norm([item.title, item.url, item.tag, item.model].join(' '));
  if (!/smokee\.ro\/product\//.test(item.url)) return false;
  if (/\b(sticla gradata|dualfill|bottle|recipient|aroma|longfill|shortfill|lichid|nic shot|nic-shot|bumbac|cotton|tool kit|scule|unelte|coil|coils|rezistent|rezistenta|pod|cartus|cartridge|clearomizor|mod full kit|kit voopoo|dispozitiv)\b/.test(text)) return false;
  const hasPart = /\b(air pin|air-pin|pini airflow|pinuri|pin airflow|airflow pin|insert|sticla|glass|tank kit|short tank|glass tank|nano kit|kit nano|top refill|top-fill|top fill|repair kit|chamber|camera|clopot|chimney|bell cap|bell|deck|post|surub|screw|o[-\s]?ring|oring|garnitur|spare|replacement|extensie|extension|extender)\b/.test(text);
  const hasRtaModel = /\b(rta|atomizor|by[-\s]?ka|bks|blade|ntsu|netsu|chephren|minister|diplomat|labs|arcana|muted|baya|vico|trinity|revorie|bi2hop|amazier|blaze|berserker|dead rabbit|md01|kayfun|dvarw|taifun|gtr|415|bishop|fev|flash[-\s]?e[-\s]?vapor)\b/.test(text);
  return hasPart && hasRtaModel;
}

function isConsumable(item, group) {
  const text = norm([item.title, item.url, item.tag].join(' '));
  if (!/smokee\.ro\/product\//.test(item.url)) return false;
  if (group === 'components') return isRtaComponent(item);
  if (/atomizor|drip tip|cartus|cartridge|pod|mod full kit|converter box|horizontech talons/.test(text)) return false;
  if (group === 'cotton') return /bumbac|cotton|coton/.test(text) && !/\b(cotton candy|aroma|longfill|shortfill|lichid|juice|bombo|hyper boost)\b/.test(text);
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
  return out.slice(0, group === 'components' ? 40 : 18);
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
  const model = item.model ? `,model:${jsString(item.model)}` : '';
  return `{title:${jsString(item.title)},url:${jsString(item.url)},image:${jsString(item.image)},tag:${jsString(item.tag)},stock:${stock}${model}}`;
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
