#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const START_MARKER = '/* AUTO-SMOKEE-LIQUIDS-START */';
const END_MARKER = '/* AUTO-SMOKEE-LIQUIDS-END */';
const TOBACCO_CATEGORY_ID = 270;
const CATEGORY_PAGE_LIMIT = 20;
const CATEGORY_PER_PAGE = 100;
const FETCH_TIMEOUT_MS = 9000;
const NEWS_START_DATE = '2026-07-06';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const write = args.includes('--write') || (!dryRun && !args.includes('--check'));

const GROUPS = [
  {
    id: 'net',
    terms: [
      'NET', 'La Tabaccheria', 'Holy Vape Tobacco', 'Montreal Original', 'Centenary Mods',
      'Organic 4Pod', 'Extra Dry', 'Azhad', 'Vapor Cave', 'Angolo della Guancia',
      'Distillati', 'estratto', 'organic tobacco', 'Virginia', 'Kentucky', 'Latakia',
      'Burley', 'Perique'
    ]
  },
  {
    id: 'tutun',
    terms: [
      'tobacco', 'tabac', 'tutun', 'RY4', 'sweet tobacco', 'vanilla tobacco',
      'caramel tobacco', 'honey tobacco', 'coffee tobacco', 'cacao tobacco',
      'chocolate tobacco', 'cream tobacco', 'dessert tobacco', 'pipe tobacco',
      'tabaco', 'tabaco dulce', 'tutun vanilie', 'tutun caramel', 'tutun miere',
      'tutun cafea', 'tutun cacao', 'tutun crema', 'tobacco custard',
      'toffee tobacco', 'butterscotch tobacco', 'aromatizat tutun',
      'Virginia', 'Burley', 'Kentucky', 'Latakia',
      'Cigar', 'Cubano', 'Cavendish', 'Oriental', 'Classic Tobacco', 'Pipe tobacco',
      'Manabush', 'TNT Vape', 'Scandal Flavors', 'VnV Liquids', 'Ripe Vapes Tobacco',
      'Bombo Tobacco', 'Vampire Vape Tobacco'
    ]
  }
];

function decodeEntities(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
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
    .replace(/&gt;/g, ' ')
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

function absoluteUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (String(url).startsWith('//')) return 'https:' + url;
  return new URL(url, 'https://smokee.ro/').href;
}

function usableProductImage(url) {
  const value = String(url || '').trim();
  if (!value || /placeholder|blank|data:image|\.svg(?:\?|$)/i.test(value)) return '';
  return absoluteUrl(value);
}

function storeProductImage(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  for (const image of images) {
    const sizes = image && image.sizes ? image.sizes : {};
    const candidates = [
      image && image.src,
      image && image.thumbnail,
      image && image.full,
      image && image.large,
      image && image.medium,
      sizes.full && sizes.full.src,
      sizes.large && sizes.large.src,
      sizes.medium && sizes.medium.src,
      sizes.thumbnail && sizes.thumbnail.src
    ];
    for (const candidate of candidates) {
      const value = usableProductImage(candidate);
      if (value) return value;
    }
  }
  return '';
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

function sourceText(product) {
  const tags = Array.isArray(product.tags) ? product.tags.map(t => t.name || '').join(' ') : '';
  return decodeEntities([
    product.name, product.title, product.short_description, product.description, tags, product.permalink
  ].filter(Boolean).join(' '));
}

function metaText(product) {
  const categories = Array.isArray(product.categories) ? product.categories.map(c => c.name || '').join(' ') : '';
  const tags = Array.isArray(product.tags) ? product.tags.map(t => t.name || '').join(' ') : '';
  return decodeEntities([
    product.name, product.title, categories, tags, product.permalink
  ].filter(Boolean).join(' '));
}

function isNetText(text) {
  return /\b(net|organic|organico|organice|estratto|estratti|extract|extracts|microfiltrat|microfiltrati|distillati|distillato|tabaccheria|azhad|vapor cave|angolo della guancia|black note)\b/.test(text);
}

function hasTobaccoProfile(text) {
  return /\b(tutun|tutunuri|tobacco|tabac|tabaco|tabaccoso|ry4|virginia|brightleaf|burley|kentucky|latakia|cigar|trabuc|cubano|havana|san andres|cavendish|oriental|turkish|izmir|basma|samsun|dokha|perique|pipe|american blend|english blend|english night|balkan|mixture|fire cured|fire-cured|dark fired|dark-fired|dry leaf|smooth tobacco|strong tobacco|sweet tobacco|vanilla tobacco|caramel tobacco|honey tobacco|coffee tobacco|cacao tobacco|chocolate tobacco|cream tobacco|dessert tobacco|brown classic|classic usa|classic ry4|classic kml|classic mlb|westblend|eastblend|mlb classic|kml)\b/.test(text);
}

function isComplexTobacco(text) {
  return /\b(blend|mixture|english|balkan|ry4|cavendish|pipe|cigar|trabuc|cubano|havana|san andres|vanilla|vanilie|caramel|toffee|butterscotch|cappuccino|coffee|cafea|latte|apple|mar|peanut|arahide|nuci|nut|honey|miere|rom|rum|bourbon|whisky|cream|crema|cremos|cremoso|custard|cacao|chocolate|ciocolata|sweet|dulce|fresh|menthol|mint|melasa|fructe uscate|condiment|spice|arabian|oriental|dokha|aromatizat)\b/.test(text);
}

function inferTag(text, group) {
  const t = norm(text);
  const prefix = group === 'net' ? 'NET' : 'TUTUN';
  const sweet = /\b(ry4|dulce|sweet|vanilla|vanilie|caramel|toffee|butterscotch|honey|miere|cappuccino|coffee|cafea|latte|cream|crema|cremos|cremoso|cacao|chocolate|ciocolata|custard|dessert|vct)\b/.test(t);
  const subtype = sweet ? 'dulce' : (isComplexTobacco(t) ? 'complex' : 'simplu');
  if (/latakia/.test(t)) return `${prefix} ${subtype} Latakia`;
  if (/kentucky|dark[-\s]?fired|fire cured|fire-cured/.test(t)) return `${prefix} ${subtype} Kentucky`;
  if (/virginia|bright|flue/.test(t)) return `${prefix} ${subtype} Virginia`;
  if (/burley|white burley/.test(t)) return `${prefix} ${subtype} Burley`;
  if (/oriental|turkish|izmir|basma|samsun/.test(t)) return `${prefix} ${subtype} Oriental`;
  if (/perique|vaper/.test(t)) return `${prefix} ${subtype} Perique`;
  if (/cigar|trabuc|cubano|maduro|havana/.test(t)) return `${prefix} ${subtype} Cigar`;
  if (/cavendish|pipe/.test(t)) return `${prefix} ${subtype} Pipe`;
  if (/ry4/.test(t)) return `${prefix} ${subtype} RY4`;
  if (/english|balkan|blend|mixture/.test(t)) return `${prefix} ${subtype} blend`;
  return `${prefix} ${subtype}`;
}

function normalizeProduct(product, group) {
  const title = decodeEntities(product.name || product.title || '');
  const text = sourceText(product);
  const tagText = `${title} ${product.permalink || product.url || ''}`;
  const image = storeProductImage(product);
  return {
    productId: product.id || null,
    title,
    url: cleanUrl(product.permalink || product.url || ''),
    image,
    tag: inferTag(tagText, group),
    stock: product.is_in_stock === true ? true : (product.is_in_stock === false ? false : null),
    newOnSmokee: isSmokeeNewProduct(product),
    productDate: dateKey(product.date || product.date_created || product.date_gmt),
    sourceText: text,
    metaText: metaText(product)
  };
}

function isLiquid(item, group) {
  const text = norm([item.title, item.url, item.sourceText].join(' '));
  const visible = norm([item.title, item.url, item.tag].join(' '));
  const classification = norm([item.title, item.url, item.metaText].join(' '));
  if (!/smokee\.ro\/product\//.test(item.url)) return false;
  if (/\b(atomizor|rta|kit|cartus|cartridge|clearomizor|bumbac|cotton|coil|coils|rezistent|rezistenta|wire|sarma|unelte|tool|baterie|acumulator|drip tip|sticla gradata|flacon gol|box mod|mod full kit|tigara electronica|dispozitiv)\b/.test(visible)) return false;
  if (/\b(nic shot|nic-shot|nicotina|nicotine shot|baza|base|vg simplu|pg simplu|glicerina|propylene glycol|vegetable glycerin)\b/.test(visible)) return false;
  const hasLiquidSignal = /\b(lichid|liquid|e[-\s]?liquid|eliquid|longfill|shortfill|aroma|arome|concentrat|flavour|flavor|tobacco|tutun|tabac|tabaco|net|tabaccheria|azhad|vapor cave|distillati|estratto|organic)\b/.test(text);
  if (!hasLiquidSignal) return false;
  if (group === 'net') return isNetText(classification) && hasTobaccoProfile(text);
  return !isNetText(classification) && hasTobaccoProfile(text);
}

function uniqueItems(items, group) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (!item.title || !item.url || seen.has(item.url)) continue;
    seen.add(item.url);
    if (isLiquid(item, group)) {
      delete item.sourceText;
      delete item.metaText;
      out.push(item);
    }
  }
  return out;
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
        'user-agent': 'Mozilla/5.0 (compatible; RTA-MTL-Smokee-Liquids-Sync/1.0)',
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
  const url = `https://smokee.ro/wp-json/wc/store/v1/products?search=${encodeURIComponent(term)}&per_page=25`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; RTA-MTL-Smokee-Liquids-Sync/1.0)',
      'accept': 'application/json'
    }
  }).finally(() => clearTimeout(timer));
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function fetchCategoryProducts(page) {
  const url = `https://smokee.ro/wp-json/wc/store/v1/products?category=${TOBACCO_CATEGORY_ID}&page=${page}&per_page=${CATEGORY_PER_PAGE}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; RTA-MTL-Smokee-Liquids-Sync/1.0)',
      'accept': 'application/json'
    }
  }).finally(() => clearTimeout(timer));
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function fetchAllCategoryProducts() {
  const pages = [];
  for (let page = 1; page <= CATEGORY_PAGE_LIMIT; page += 1) {
    const products = await fetchCategoryProducts(page).catch(() => []);
    if (!Array.isArray(products) || !products.length) break;
    pages.push(products);
    if (products.length < CATEGORY_PER_PAGE) break;
  }
  return pages.flat();
}

async function fetchGroup(group) {
  const searchCalls = group.terms.map(term => fetchStoreProducts(term).catch(() => []));
  const chunks = await Promise.all([fetchAllCategoryProducts()].concat(searchCalls));
  return enrichPublishedDates(uniqueItems(chunks.flat().map(product => normalizeProduct(product, group.id)), group.id));
}

function itemBlock(item) {
  const stock = item.stock === true ? 'true' : (item.stock === false ? 'false' : 'null');
  const addedAt = item.addedAt ? `,addedAt:${jsString(item.addedAt)}` : '';
  return `{title:${jsString(item.title)},url:${jsString(item.url)},image:${jsString(item.image)},tag:${jsString(item.tag)},stock:${stock}${addedAt}}`;
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
    throw new Error('Auto Smokee liquids markers were not found in index.html');
  }
  const before = html.slice(0, start + START_MARKER.length);
  const after = html.slice(end);
  return `${before}\n${block}\n  ${after}`;
}

function existingLiquidInfo(html, groupId) {
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
    const parsed = {
      title: title ? unjsString(title[1]) : '',
      url,
      image: image ? unjsString(image[1]) : '',
      tag: tag ? unjsString(tag[1]) : '',
      stock: stock ? (stock[1] === 'true' ? true : (stock[1] === 'false' ? false : null)) : null
    };
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
    const existing = existingLiquidInfo(html, group.id);
    const fetched = await fetchGroup(group);
    if (!fetched.length && existing.items.length) {
      console.log(`Smokee liquids sync: kept ${existing.items.length} existing ${group.id} products because live fetch returned no usable items.`);
      data[group.id] = existing.items;
    } else {
      const dated = stampAddedDates(fetched, existing, today);
      data[group.id] = mergeWithExisting(dated, existing.items).slice(0, 140);
    }
  }
  const total = GROUPS.reduce((sum, group) => sum + data[group.id].length, 0);
  if (!total) {
    console.log('Smokee liquids sync: no products found.');
    return;
  }

  const updated = replaceBlock(html, dataBlock(data));
  console.log(`Smokee liquids sync: ${total} products prepared.`);
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
