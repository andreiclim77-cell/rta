#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MARKET_PATH = path.join(ROOT, 'data', 'market-2026.json');
const HISTORY_DIR = path.join(ROOT, 'data', 'market-history-2026');
const STORE_API = 'https://smokee.ro/wp-json/wc/store/v1/products';
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
const PER_PAGE = 100;
const MAX_CATEGORY_PAGES = 6;
const MAX_ATTEMPTS = 4;

const CATEGORY_GROUPS = [
  { id: 'atomizers', categoryId: 76, hint: 'atomizer' },
  { id: 'mods', categoryId: 75, hint: 'mod' },
  { id: 'tobacco', categoryId: 270, hint: 'tobacco' },
  { id: 'consumables-wire', categoryId: 198, hint: 'mixed' },
  { id: 'consumables-diy', categoryId: 293, hint: 'mixed' },
  { id: 'accessories', categoryId: 77, hint: 'mixed' }
];

const SEARCH_TERMS = [
  'RTA', 'MTL RTA', 'Kanthal', 'Ni80', 'SS316L', 'NiFe30', 'NiFe52', 'Clapton',
  'bumbac', 'cotton', 'tool kit', 'coil jig', 'ohm meter', 'air pin RTA', 'chamber RTA',
  'glass RTA', 'tank kit RTA', '18650', '21700', 'incarcator', 'BF60', 'FL80', 'Dicodes board'
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function bucharestDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const obj = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${obj.year}-${obj.month}-${obj.day}`;
}

function cleanText(input) {
  return String(input || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function norm(value) {
  return cleanText(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function inferBrand(title) {
  const known = [
    'Ambition Mods','Arcana Mods','BP Mods','Centenary Mods','Cthulhu','Dicodes','Damn Vape','Dovpo',
    'Early Bird','Ennequadro Mods','Geekvape','Hellvape','Innokin','KHW Mods','Lost Vape','SvoeMesto',
    'SvoëMesto','Taifun','Vandy Vape','VandyVape','Vape Systems','Vapefly','Vaporesso','Voopoo','VooPoo',
    'Wotofo','Yachtvape','YiHi','YIHI','La Tabaccheria','The Vaping Gentlemen Club','Smokemania'
  ];
  return known.find(brand => new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(title)) || '';
}

function classify(title, hint) {
  const t = norm(title);
  if (!t || t.length < 4) return '';

  const hasRta = /\brta\b/.test(t);
  const hasRda = /\brda\b/.test(t);
  const hasRdta = /\brdta\b/.test(t);
  const platform = /dvarw|kayfun|taifun|diplomat|muted|asylum|bishop|pioneer|purity|millennium|gtr|chariot|prime minister|by ka|spica|squape|baya|vico|chephren/.test(t);
  const part = /\b(?:bell|chimney|chamber|camera|clopot|air pin|airflow pin|insert|reducer|reductie|top cap|bottom cap|geam|glass|pyrex|psu|pei|ultem|drip tip|mustiuc|o ring|oring|spare|insulator|izolator|screw|surub|deck|jfc|juice control|510 pin|tank kit|nano kit|extension|extensie)\b/.test(t);
  if (part && platform && !hasRta) return 'componente RTA';
  if (part && hasRta && !/\b(?:atomizor|atomizer)\b/.test(t)) return 'componente RTA';

  if (hasRta && !hasRda && !hasRdta) return 'RTA';
  if (hasRta && (hasRda || hasRdta)) return 'RTA/RDA mixed';
  if (!hasRta && (hasRda || hasRdta)) return 'RDA/RDTA';
  if (/\b(?:bridge|rba)\b/.test(t)) return 'RBA/bridge';

  if (/\b(?:bf60|fl80)\b/.test(t) && /dicodes/.test(t)) return 'chipset/board';
  if (/\b(?:board|pcb|chipset|dna60|dna60c|dna75|dna75c|dna100c|evolv)\b/.test(t) && !/\b(?:kit|atomizor|atomizer|rta|rda|rdta)\b/.test(t)) return 'chipset/board';
  if (/\b(?:mod|box mod|sbs|side by side|squonk)\b/.test(t) && !/\b(?:atomizor|atomizer|rta|rda|rdta|bridge|rba|kit)\b/.test(t)) return 'mod';

  const cottonNoise = /\b(?:cotton candy|candy ice|liquid|lichid|aroma|flavour|flavor)\b/.test(t);
  const wick = /\b(?:bumbac|rayon|vata|wick|wicking|cotton bacon|cotton gods|organic cotton|native wicks|fiber n cotton|muji cotton)\b/.test(t);
  if (wick && !cottonNoise) return 'bumbac/wick';

  const wireExplicit = /\b(?:sarma|wire|kanthal|ka1|nichrome|ni80|ss316l?|nife30|nife52|nife|ni200)\b/.test(t);
  const wireConstruction = /\b(?:clapton|fused clapton|alien|twisted)\b/.test(t);
  const wireGeometry = /\b(?:awg|ga|gauge|\d{2}ga|\d{2}awg|0 \d+ mm|metri|meter|meters|metres)\b/.test(t);
  const stockCoilNoise = /\b(?:pod|cartus|cartridge|nautilus|gtl|z coil|pnp|tpp|rpm|coil head|mesh head)\b/.test(t);
  const prebuilt = /\b(?:prebuilt|pre built|handmade|coil|coils|rezistenta|rezistente)\b/.test(t);
  if ((wireExplicit || wireConstruction) && (wireGeometry || wireConstruction || /\b(?:sarma|wire)\b/.test(t))) {
    if (prebuilt && !stockCoilNoise) return 'coil prebuilt';
    return 'sarma';
  }

  if (/\b(?:acumulator|battery|baterie)\b/.test(t) && /\b(?:18350|18650|20700|21700|26650|mah|li ion)\b/.test(t)) return 'acumulator';
  if (/\b(?:incarcator|charger|charging)\b/.test(t) && /\b(?:acumulator|battery|baterie|18350|18650|21700|slot)\b/.test(t)) return 'incarcator';
  if (/\b(?:ohm meter|ohm reader|build tab|coil jig|coiling|penseta|tweezers|ceramic|cleste|cutter|foarfeca|scissors|tool kit|trusa build|ustensile build)\b/.test(t)) return 'unelte build';

  const tobacco = /\b(?:tutun|tobacco|net|virginia|burley|kentucky|latakia|oriental|turkish|perique|cigar|cigarro|cavendish|balkan|english blend|american blend)\b/.test(t);
  const liquidForm = /\b(?:lichid|liquid|e liquid|eliquid|aroma|longfill|shortfill|concentrat|extract|shot)\b/.test(t);
  if ((tobacco && liquidForm) || hint === 'tobacco') return 'lichid tutunos/NET/DIY';

  if (/\b(?:beauty ring|heat sink|atomizer stand|suport atomizor|adaptor 510|adapter 510|drip tip|mustiuc)\b/.test(t)) return 'accesoriu RTA/mod';

  if (hint === 'mod' && /\b(?:dna|yihi|sx|watt|18650|21700)\b/.test(t) && !/\bkit\b/.test(t)) return 'mod';
  if (hint === 'atomizer' && hasRta) return 'RTA';
  return '';
}

function money(product) {
  const prices = product && product.prices || {};
  const raw = Number(prices.price);
  if (!Number.isFinite(raw)) return null;
  const minor = Number.isFinite(Number(prices.currency_minor_unit)) ? Number(prices.currency_minor_unit) : 2;
  return Number((raw / Math.pow(10, minor)).toFixed(2));
}

function stock(product) {
  if (product && product.is_in_stock === true) return 'in_stock';
  if (product && product.is_in_stock === false) return 'out_of_stock';
  const status = norm(product && (product.stock_status || product.stock_availability && product.stock_availability.text));
  if (/out of stock|stoc epuizat|indisponibil/.test(status)) return 'out_of_stock';
  if (/in stock|in stoc/.test(status)) return 'in_stock';
  return 'unknown';
}

function itemUrl(product) {
  return String(product && (product.permalink || product.url) || '').replace(/#.*$/, '');
}

function itemTitle(product) {
  return cleanText(product && (product.name || product.title) || '');
}

function isFinishedDicodes(category, title) {
  const t = norm(title);
  return /dicodes/.test(t) && category === 'mod' && !/\b(?:bf60|fl80|board|placa|chipset|pcb)\b/.test(t);
}

async function fetchJson(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Ghid-RTA-Market-Observatory/4.0 (+https://ghid-rta.ro/)',
          'accept': 'application/json',
          'accept-language': 'ro-RO,ro;q=0.9,en;q=0.7',
          'cache-control': 'no-cache'
        },
        signal: controller.signal,
        redirect: 'follow'
      });
      if (response.ok) {
        return {
          data: await response.json(),
          totalPages: Number(response.headers.get('x-wp-totalpages') || 0),
          total: Number(response.headers.get('x-wp-total') || 0)
        };
      }
      const retryable = response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500 || response.status === 403;
      const retryAfter = Number(response.headers.get('retry-after') || 0);
      lastError = new Error(`HTTP ${response.status}`);
      if (!retryable || attempt === MAX_ATTEMPTS) throw lastError;
      await sleep(retryAfter > 0 ? retryAfter * 1000 : 1200 * attempt * attempt);
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) throw error;
      await sleep(1200 * attempt * attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError || new Error('Unknown Smokee API error');
}

async function categoryProducts(group) {
  const products = [];
  let total = 0;
  let pagesFetched = 0;
  for (let page = 1; page <= MAX_CATEGORY_PAGES; page += 1) {
    const url = `${STORE_API}?category=${encodeURIComponent(group.categoryId)}&per_page=${PER_PAGE}&page=${page}`;
    const result = await fetchJson(url);
    pagesFetched += 1;
    if (page === 1) total = result.total || 0;
    const rows = Array.isArray(result.data) ? result.data : [];
    products.push(...rows.map(product => ({ product, hint: group.hint, sourceGroup: group.id })));
    const totalPages = result.totalPages || 0;
    if (!rows.length || rows.length < PER_PAGE || (totalPages && page >= totalPages)) break;
    await sleep(250);
  }
  return { products, total, pagesFetched };
}

async function searchProducts(term) {
  const url = `${STORE_API}?search=${encodeURIComponent(term)}&per_page=100&page=1`;
  const result = await fetchJson(url);
  return { products: (Array.isArray(result.data) ? result.data : []).map(product => ({ product, hint: 'mixed', sourceGroup: `search:${term}` })), pagesFetched: 1 };
}

function dedupe(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = `${norm(row.product)}|${row.source}`;
    if (!key || key === '|') continue;
    const current = map.get(key);
    if (!current) map.set(key, row);
    else map.set(key, {
      ...current,
      priceRon: current.priceRon == null ? row.priceRon : current.priceRon,
      stock: current.stock === 'unknown' ? row.stock : current.stock,
      brand: current.brand || row.brand
    });
  }
  return [...map.values()];
}

function summaryByCategory(observations) {
  const groups = {};
  observations.forEach(o => {
    const key = o.category || 'necunoscut';
    if (!groups[key]) groups[key] = { listed: 0, inStock: 0, outOfStock: 0, unknownStock: 0, retailers: new Set() };
    groups[key].listed += 1;
    groups[key].retailers.add(o.retailerId);
    if (o.stock === 'in_stock') groups[key].inStock += 1;
    else if (o.stock === 'out_of_stock') groups[key].outOfStock += 1;
    else groups[key].unknownStock += 1;
  });
  return Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, {
    listed: value.listed,
    inStock: value.inStock,
    outOfStock: value.outOfStock,
    unknownStock: value.unknownStock,
    retailers: value.retailers.size
  }]));
}

function loadHeadMarket() {
  try {
    const raw = execFileSync('git', ['show', 'HEAD:data/market-2026.json'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function sameDaySmokeeFallback(date) {
  const headMarket = loadHeadMarket();
  if (!headMarket) return { observations: [], categorySnapshots: [], generatedAt: null };
  const observations = (headMarket.observations || []).filter(row => row.retailerId === 'smokee' && row.observedAt === date);
  const categorySnapshots = (headMarket.categorySnapshots || []).filter(row => row.retailerId === 'smokee' && row.observedAt === date);
  return { observations, categorySnapshots, generatedAt: headMarket.updatedAt || null };
}

async function main() {
  const market = readJson(MARKET_PATH);
  const date = bucharestDate();
  if (Number(market.scopeYear) !== 2026 || !/^2026-/.test(date)) {
    console.log(`Smokee Market collector is locked to 2026; current Bucharest date is ${date}.`);
    return;
  }

  const fetched = [];
  const snapshots = [];
  const errors = [];
  let pagesFetched = 0;

  for (const group of CATEGORY_GROUPS) {
    try {
      const result = await categoryProducts(group);
      pagesFetched += result.pagesFetched;
      fetched.push(...result.products);
      snapshots.push({
        retailerId: 'smokee',
        category: `source:${group.id}`,
        listed: result.total || result.products.length,
        observedAt: date,
        source: `${STORE_API}?category=${group.categoryId}`,
        confidence: 'woo-store-api-total'
      });
    } catch (error) {
      errors.push({ source: `category:${group.id}`, error: String(error && error.message || error).slice(0, 180) });
    }
    await sleep(350);
  }

  for (const term of SEARCH_TERMS) {
    try {
      const result = await searchProducts(term);
      pagesFetched += result.pagesFetched;
      fetched.push(...result.products);
    } catch (error) {
      errors.push({ source: `search:${term}`, error: String(error && error.message || error).slice(0, 180) });
    }
    await sleep(350);
  }

  const rows = [];
  for (const wrapper of fetched) {
    const title = itemTitle(wrapper.product);
    if (!title) continue;
    const category = classify(title, wrapper.hint);
    if (!category) continue;
    if (isFinishedDicodes(category, title)) continue;
    const url = itemUrl(wrapper.product);
    if (!url) continue;
    rows.push({
      retailerId: 'smokee',
      category,
      brand: cleanText(wrapper.product && wrapper.product.brands && wrapper.product.brands[0] && wrapper.product.brands[0].name || '') || inferBrand(title),
      product: title,
      priceRon: money(wrapper.product),
      stock: stock(wrapper.product),
      observedAt: date,
      source: url,
      sourceMode: 'smokee-store-api'
    });
  }

  const liveObservations = dedupe(rows).sort((a, b) => `${a.category}|${a.product}`.localeCompare(`${b.category}|${b.product}`, 'ro'));
  const fallback = liveObservations.length ? { observations: [], categorySnapshots: [], generatedAt: null } : sameDaySmokeeFallback(date);
  const fallbackUsed = !liveObservations.length && fallback.observations.length > 0;
  const observations = liveObservations.length ? liveObservations : fallback.observations.map(row => ({ ...row, sourceMode: row.sourceMode || 'smokee-store-api' }));
  const effectiveSnapshots = liveObservations.length ? snapshots : fallback.categorySnapshots;
  const collectionComplete = liveObservations.length > 0 && errors.length === 0;

  market.observations = [
    ...(market.observations || []).filter(row => row.retailerId !== 'smokee' && /^2026-/.test(String(row.observedAt || ''))),
    ...observations
  ].sort((a, b) => `${a.retailerId}|${a.category}|${a.product}`.localeCompare(`${b.retailerId}|${b.category}|${b.product}`, 'ro'));

  market.categorySnapshots = [
    ...(market.categorySnapshots || []).filter(row => row.retailerId !== 'smokee' && /^2026-/.test(String(row.observedAt || ''))),
    ...effectiveSnapshots
  ];

  const status = market.collectorStatus || {};
  status.date = date;
  status.generatedAt = new Date().toISOString();
  status.pagesFetched = Number(status.pagesFetched || 0) + pagesFetched;
  status.observations = market.observations.length;
  status.errors = Number(status.errors || 0) + errors.length;
  status.byRetailer = (status.byRetailer || []).filter(row => row.retailerId !== 'smokee');
  status.byRetailer.push({
    retailerId: 'smokee',
    pagesFetched,
    observations: observations.length,
    liveObservations: liveObservations.length,
    errors,
    skipped: null,
    sourceMode: liveObservations.length ? 'smokee-store-api' : (fallbackUsed ? 'smokee-store-api-same-day-cache' : 'smokee-store-api-unavailable'),
    collectionComplete,
    fallbackUsed,
    fallbackGeneratedAt: fallbackUsed ? fallback.generatedAt : null
  });
  market.collectorStatus = status;
  market.updatedAt = status.generatedAt;

  const trend = {
    date,
    observations: market.observations.length,
    retailersWithObservations: new Set(market.observations.map(o => o.retailerId)).size,
    categories: summaryByCategory(market.observations)
  };
  market.trendSnapshots = (market.trendSnapshots || []).filter(item => item.date !== date && /^2026-/.test(String(item.date || '')));
  market.trendSnapshots.push(trend);
  market.trendSnapshots.sort((a, b) => a.date.localeCompare(b.date));

  const historyPath = path.join(HISTORY_DIR, `${date}.json`);
  const history = fs.existsSync(historyPath) ? readJson(historyPath) : { schemaVersion: 1, scopeYear: 2026, date };
  history.generatedAt = status.generatedAt;
  history.observations = market.observations;
  history.categorySnapshots = market.categorySnapshots;
  history.summary = trend;
  history.collectorStatus = status;

  const resultSummary = {
    pagesFetched,
    observations: observations.length,
    liveObservations: liveObservations.length,
    errors: errors.length,
    collectionComplete,
    fallbackUsed
  };

  if (CHECK) {
    console.log(JSON.stringify(resultSummary, null, 2));
    return;
  }

  if (WRITE) {
    writeJson(MARKET_PATH, market);
    writeJson(historyPath, history);
    if (liveObservations.length) {
      console.log(`Merged ${liveObservations.length} live Smokee observations into Market 2026 (${pagesFetched} API requests, ${errors.length} errors).`);
    } else if (fallbackUsed) {
      console.warn(`Smokee API unavailable in this run; preserved ${observations.length} verified same-day observations. National completeness remains false.`);
    } else {
      console.warn(`Smokee API unavailable and no same-day fallback exists. Published market remains partial; national completeness remains false.`);
    }
  } else {
    console.log(JSON.stringify({ observations, ...resultSummary }, null, 2));
  }
}

main().catch(error => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
