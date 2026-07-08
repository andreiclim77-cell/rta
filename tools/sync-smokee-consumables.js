#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const START_MARKER = '/* AUTO-SMOKEE-CONSUMABLES-START */';
const END_MARKER = '/* AUTO-SMOKEE-CONSUMABLES-END */';
const CATEGORY_PER_PAGE = 100;
const CATEGORY_PAGE_LIMIT = 6;
const FETCH_TIMEOUT_MS = 65000;
const NEWS_START_DATE = '2026-07-06';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const write = args.includes('--write') || (!dryRun && !args.includes('--check'));

const GROUPS = [
  {
    id: 'wires',
    terms: ['Ni80', 'SS316L', 'NiFe30', 'Kanthal', 'clapton', 'MTL coil', 'rola wire'],
    categoryIds: [198, 293]
  },
  {
    id: 'cotton',
    terms: ['bumbac', 'cotton'],
    categoryIds: [293, 77]
  },
  {
    id: 'tools',
    terms: ['tool kit', 'coiling tool', 'ceramic tweezer', 'unelte', 'scule'],
    categoryIds: [77, 293]
  },
  {
    id: 'components',
    terms: [
      'air pin RTA', 'pini airflow RTA', 'pinuri airflow RTA', 'sticla atomizor RTA',
      'glass RTA', 'tank kit RTA', 'nano kit RTA', 'kit nano RTA', 'top refill RTA',
      'chamber RTA', 'camera RTA', 'clopot RTA', 'chimney RTA', 'bell cap RTA',
      'ring RTA', 'RTA ring', 'beauty ring RTA', 'decorative ring RTA',
      'protectie 510 RTA', 'protective discs 510', 'pvc protective discs',
      'discuri protectie 510', 'discuri de protectie atomizor',
      'spare RTA', 'replacement RTA', 'extensie RTA', 'extension RTA', 'deck RTA',
      'BKS Blade RTA', 'By-Ka V11 RTA', 'Labs RTA', 'Minister RTA', 'Prime Minister RTA',
      'Diplomat RTA', 'Arcana RTA', 'Muted RTA', 'Muted RTA Ring', 'Chariot 23 RTA',
      'Baya RTA', 'Vico RTA', 'Chephren RTA'
    ],
    categoryIds: [77]
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

function unjsString(value) {
  return String(value || '').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

function cleanUrl(url) {
  return String(url || '').replace(/[?#].*$/, '').replace(/\/?$/, '/');
}

function isSmokeeNewProduct(product) {
  return Array.isArray(product.categories) && product.categories.some(category => {
    const text = norm(`${category.name || ''} ${category.slug || ''}`);
    return /\bnoutati\b/.test(text);
  });
}

function todayInRomania() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date()).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function dateKey(value) {
  const match = String(value || '').match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
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
  ['Arcana Mods Chariot 23 RTA', /\bchariot\b/],
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
  if (/\b(510 pvc|protective discs?|pvc protective|discuri|protectie|schutzscheiben)\b/.test(text)) return 'protectie 510';
  if (/\b(insulator|izolator|accessory pack|pure kit|open mtl kit)\b/.test(text)) return 'kit accesorii atomizor';
  if (/\b(ring|beauty ring|decorative ring)\b/.test(text)) return 'ring / estetica atomizor';
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
  if (/\b(510 pvc|protective discs?|pvc protective|discuri|protectie|schutzscheiben)\b/.test(text)) return 'Accesorii setup 510';
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
  const categories = Array.isArray(product.categories) ? product.categories.map(category => category.name || category.slug || '').join(' ') : '';
  const tags = Array.isArray(product.tags) ? product.tags.map(tag => tag.name || tag.slug || '').join(' ') : '';
  const sourceText = decodeEntities([
    title,
    product.short_description || '',
    product.description || '',
    categories,
    tags,
    product.permalink || product.url || ''
  ].join(' '));
  const item = {
    productId: product.id || null,
    title,
    url: cleanUrl(product.permalink || product.url || ''),
    image,
    tag: inferTag(title, group),
    stock: product.is_in_stock === true ? true : (product.is_in_stock === false ? false : null),
    newOnSmokee: isSmokeeNewProduct(product),
    productDate: dateKey(product.date || product.date_created || product.date_gmt),
    sourceText
  };
  if (group === 'components') item.model = inferComponentModel(title);
  return item;
}

function isRtaComponent(item) {
  const visible = norm([item.title, item.url, item.tag, item.model].join(' '));
  const text = norm([item.title, item.url, item.tag, item.model, item.sourceText].join(' '));
  if (!/smokee\.ro\/product\//.test(item.url)) return false;
  if (/\b(sticla gradata|dualfill|bottle|recipient|aroma|longfill|shortfill|lichid|nic shot|nic-shot|bumbac|cotton|tool kit|scule|unelte|coil|coils|rezistent|rezistenta|pod|cartus|cartridge|clearomizor|mod full kit|kit voopoo|dispozitiv|incarcator|acumulator|battery|baterie|capac usb|husa|sleeve)\b/.test(visible)) return false;
  const hasVisiblePart = /\b(air pin|air-pin|pini airflow|pinuri|pin airflow|airflow pin|insert|sticla|glass|tank kit|short tank|glass tank|nano kit|kit nano|top refill|top-fill|top fill|repair kit|insulator|izolator|accessory pack|pure kit|open mtl kit|chamber|camera|clopot|chimney|bell cap|bell|ring|beauty ring|decorative ring|protective discs?|pvc protective|510 pvc|discuri|protectie|schutzscheiben|deck|post|surub|screw|o[-\s]?ring|oring|garnitur|spare|replacement|extensie|extension|extender)\b/.test(visible);
  if (/\batomizor\b/.test(visible) && !hasVisiblePart) return false;
  const hasRtaModel = /\b(rta|atomizor|atomizoare|by[-\s]?ka|bks|blade|ntsu|netsu|chephren|minister|diplomat|labs|arcana|muted|chariot|baya|vico|trinity|revorie|bi2hop|amazier|blaze|berserker|dead rabbit|md01|kayfun|dvarw|taifun|gtr|415|bishop|fev|flash[-\s]?e[-\s]?vapor|510)\b/.test(text);
  const hasPart = hasVisiblePart;
  return hasPart && hasRtaModel;
}

function isConsumable(item, group) {
  const identity = norm([item.title, item.url].join(' '));
  const text = norm([item.title, item.url, item.tag].join(' '));
  if (!/smokee\.ro\/product\//.test(item.url)) return false;
  if (group === 'components') return isRtaComponent(item);
  if (/atomizor|drip tip|cartus|cartridge|pod|mod full kit|converter box|horizontech talons/.test(identity)) return false;
  if (group === 'cotton') return /bumbac|cotton|coton/.test(identity) && !/\b(cotton candy|aroma|longfill|shortfill|lichid|juice|bombo|hyper boost)\b/.test(identity);
  if (group === 'tools') return /tool kit|scule|unelte|coil tool|coiling tool|coiling kit|tweezer|penseta|foarfeca|cleste|ohmmeter|ohm meter|ohmmetru/.test(identity) && !/full kit/.test(identity);
  if (group === 'wires') {
    if (/\b(rdl|boro|dl)\b/.test(identity) && !/\bmtl\b/.test(identity)) return false;
    return /rezistent|resistance|coil|coils|rola|wire|kanthal|ka1|k1|ss316|nife|ni80|clapton|fused|staple|alien/.test(identity);
  }
  return false;
}

function uniqueItems(items, group) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (!item.title || !item.url || seen.has(item.url)) continue;
    seen.add(item.url);
    if (isConsumable(item, group)) {
      delete item.sourceText;
      out.push(item);
    }
  }
  return out.slice(0, group === 'components' ? 40 : 18);
}

async function enrichPublishedDates(items) {
  const ids = Array.from(new Set(items
    .filter(item => item.newOnSmokee && item.productId && !item.productDate)
    .map(item => item.productId)));
  if (!ids.length) return items;

  const dates = new Map();
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = `https://smokee.ro/wp-json/wp/v2/product?include=${batch.join(',')}&per_page=${batch.length}&_fields=id,date,date_gmt`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; RTA-MTL-Smokee-Consumables-Sync/1.0)',
        'accept': 'application/json'
      }
    }).finally(() => clearTimeout(timer)).catch(() => null);
    if (!response || !response.ok) continue;
    const products = await response.json().catch(() => []);
    if (!Array.isArray(products)) continue;
    for (const product of products) {
      const key = dateKey(product.date || product.date_gmt);
      if (product && product.id && key) dates.set(product.id, key);
    }
  }

  for (const item of items) {
    if (item.productId && dates.has(item.productId)) item.productDate = dates.get(item.productId);
  }
  return items;
}

async function fetchStoreProducts(term) {
  const url = `https://smokee.ro/wp-json/wc/store/v1/products?search=${encodeURIComponent(term)}&per_page=20`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; RTA-MTL-Smokee-Consumables-Sync/1.0)',
      'accept': 'application/json'
    }
  }).finally(() => clearTimeout(timer));
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function fetchCategoryProducts(categoryId, page) {
  const url = `https://smokee.ro/wp-json/wc/store/v1/products?category=${encodeURIComponent(categoryId)}&page=${page}&per_page=${CATEGORY_PER_PAGE}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; RTA-MTL-Smokee-Consumables-Sync/1.0)',
      'accept': 'application/json'
    }
  }).finally(() => clearTimeout(timer));
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function fetchAllCategoryProducts(categoryId) {
  const pages = [];
  for (let page = 1; page <= CATEGORY_PAGE_LIMIT; page += 1) {
    const products = await fetchCategoryProducts(categoryId, page).catch(() => []);
    if (!Array.isArray(products) || !products.length) break;
    pages.push(products);
    if (products.length < CATEGORY_PER_PAGE) break;
  }
  return pages.flat();
}

async function fetchGroup(group) {
  const searchCalls = group.terms.map(term => fetchStoreProducts(term).catch(() => []));
  const categoryCalls = (group.categoryIds || []).map(categoryId => fetchAllCategoryProducts(categoryId).catch(() => []));
  const chunks = await Promise.all(searchCalls.concat(categoryCalls));
  return enrichPublishedDates(uniqueItems(chunks.flat().map(product => normalizeProduct(product, group.id)), group.id));
}

function itemBlock(item) {
  const stock = item.stock === true ? 'true' : (item.stock === false ? 'false' : 'null');
  const model = item.model ? `,model:${jsString(item.model)}` : '';
  const addedAt = item.addedAt ? `,addedAt:${jsString(item.addedAt)}` : '';
  return `{title:${jsString(item.title)},url:${jsString(item.url)},image:${jsString(item.image)},tag:${jsString(item.tag)},stock:${stock}${model}${addedAt}}`;
}

function dataBlock(data) {
  const lines = [];
  for (const group of GROUPS) {
    lines.push(`  ${group.id}: [`);
    lines.push(data[group.id].map(item => `    ${itemBlock(item)}`).join(',\n'));
    lines.push('  ],');
  }
  lines.push(`  generated:${jsString(todayInRomania())}`);
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

function existingConsumableInfo(html, groupId) {
  const start = html.indexOf(START_MARKER);
  const end = html.indexOf(END_MARKER);
  const info = { seen: new Set(), addedAt: new Map(), items: [], initialized: false };
  if (start < 0 || end < 0 || end <= start) return info;

  const block = html.slice(start, end);
  let scanBlock = block;
  if (groupId) {
    const groupMatch = block.match(new RegExp(`\\n\\s*${groupId}:\\s*\\[([\\s\\S]*?)\\n\\s*\\]`, 'm'));
    scanBlock = groupMatch ? groupMatch[1] : '';
  }
  const re = /\{[^{}]*url:'((?:\\'|[^'])*)'[^{}]*\}/g;
  let match;
  while ((match = re.exec(scanBlock))) {
    const item = match[0];
    const url = cleanUrl(unjsString(match[1]));
    if (!url) continue;
    info.seen.add(url);
    const date = item.match(/addedAt:'(\d{4}-\d{2}-\d{2})'/);
    if (date) info.addedAt.set(url, date[1]);
    const title = item.match(/title:'((?:\\'|[^'])*)'/);
    const image = item.match(/image:'((?:\\'|[^'])*)'/);
    const tag = item.match(/tag:'((?:\\'|[^'])*)'/);
    const stock = item.match(/stock:(true|false|null)/);
    const model = item.match(/model:'((?:\\'|[^'])*)'/);
    const parsed = {
      title: title ? unjsString(title[1]) : '',
      url,
      image: image ? unjsString(image[1]) : '',
      tag: tag ? unjsString(tag[1]) : '',
      stock: stock ? (stock[1] === 'true' ? true : (stock[1] === 'false' ? false : null)) : null
    };
    if (model) parsed.model = unjsString(model[1]);
    if (date) parsed.addedAt = date[1];
    if (parsed.title) info.items.push(parsed);
  }
  info.initialized = info.seen.size > 0;
  return info;
}

function stampAddedDates(items, existing, today) {
  return items.map(item => {
    const url = cleanUrl(item.url);
    if (item.newOnSmokee && item.productDate) {
      return item.productDate >= NEWS_START_DATE ? { ...item, addedAt: item.productDate } : item;
    }
    if (existing.addedAt.has(url)) return { ...item, addedAt: existing.addedAt.get(url) };
    if (existing.seen.has(url)) return item;
    if (item.newOnSmokee && !item.productDate) return { ...item, addedAt: today };
    return item;
  });
}

function mergeWithExisting(fetched, existingItems) {
  const seen = new Set();
  const merged = [];
  for (const item of fetched.concat(existingItems || [])) {
    const url = cleanUrl(item.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    merged.push(item);
  }
  return merged;
}

async function main() {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const today = todayInRomania();
  const data = {};
  for (const group of GROUPS) {
    const existing = existingConsumableInfo(html, group.id);
    const fetched = await fetchGroup(group);
    if (!fetched.length && existing.items.length) {
      console.log(`Smokee consumables sync: kept ${existing.items.length} existing ${group.id} products because live fetch returned no usable items.`);
      data[group.id] = existing.items;
    } else {
      const dated = stampAddedDates(fetched, existing, today);
      data[group.id] = mergeWithExisting(dated, existing.items).slice(0, group.id === 'components' ? 60 : 30);
    }
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
