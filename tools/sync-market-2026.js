#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'market-retailers-2026.json');
const MARKET_PATH = path.join(ROOT, 'data', 'market-2026.json');
const HISTORY_DIR = path.join(ROOT, 'data', 'market-history-2026');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function bucharestDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const obj = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${obj.year}-${obj.month}-${obj.day}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function decodeEntities(input) {
  return String(input || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function cleanText(input) {
  return decodeEntities(String(input || ''))
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanProductTitle(input) {
  let title = cleanText(input)
    .replace(/^[»›>\-–—\s]+/, '')
    .replace(/^(?:Reduceri|Sale|Oferta|Promo(?:ție)?)!?:?\s*/i, '')
    .replace(/^(?:Mărește|Mareste|Reduce)\s+cantitatea\s+pentru\s+/i, '')
    .replace(/\s+(?:Prețul|Pretul)\s+(?:inițial|initial|curent)\b[\s\S]*$/i, '')
    .replace(/\s+(?:Stoc\s+epuizat|Indisponibil|Out\s+of\s+stock|Sold\s+out)\b[\s\S]*$/i, '')
    .replace(/\s+\d{1,5}(?:[ .]\d{3})*(?:[,.]\d{2})?\s*(?:lei|ron)\b[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return title;
}

function absoluteUrl(base, href) {
  try {
    const url = new URL(href, base);
    if (!/^https?:$/.test(url.protocol)) return '';
    url.hash = '';
    return url.toString();
  } catch (_) {
    return '';
  }
}

function canonicalUrl(url) {
  try {
    const u = new URL(url);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach(k => u.searchParams.delete(k));
    u.hash = '';
    return u.toString();
  } catch (_) {
    return String(url || '');
  }
}

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function inferBrand(title) {
  const known = [
    'Ambition Mods','Arcana Mods','BP Mods','Centenary Mods','Cthulhu','Dicodes','Damn Vape','Dovpo','Early Bird',
    'Ennequadro Mods','Geekvape','Hellvape','Innokin','KHW Mods','Lost Vape','Sirius Mods','SvoeMesto','SvoëMesto','Taifun',
    'Thunder Cloud','ThunderHead Creations','Vandy Vape','VandyVape','Vape Systems','Vapefly','Vaporesso','Voopoo','VooPoo',
    'Wotofo','Yachtvape','YiHi','YIHI','StattQualm','The Vaping Gentlemen Club'
  ];
  const match = known.find(brand => new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(title));
  return match || '';
}

function isLikelyMenuLabel(title) {
  const t = normalizeKey(title);
  if (!t) return true;
  if (/^(?:rta|rda|rdta|rba|atomizoare?|accesorii|consumabile|moduri|sarme?|wire|bumbac|cotton|rezistente|coiluri|truse|ustensile|unelte)(?:\s+\d+)?$/.test(t)) return true;
  if (/^(?:vezi toate|toate produsele|produse|categorii|magazin|shop|home|acasa)$/.test(t)) return true;
  return false;
}

function isCategoryLikeUrl(url) {
  try {
    const u = new URL(url);
    const pathName = u.pathname.toLowerCase();
    return /\/(?:categorie|category|product-category|tag|brand|atomizoare|accesorii|consumabile|bumbac|sarme|rezistente|truse|ustensile)\/?(?:$|page\/\d+\/?$)/.test(pathName) || /\/page\/\d+\/?$/.test(pathName);
  } catch (_) {
    return false;
  }
}

function isProductLikeUrl(url) {
  try {
    const u = new URL(url);
    const p = u.pathname.toLowerCase();
    if (/\/(?:produs|product)\//.test(p)) return true;
    if (/\.html?$/.test(p) && !isCategoryLikeUrl(url)) return true;
    return false;
  } catch (_) {
    return false;
  }
}

function isRtaSpecificUrl(url) {
  try {
    const p = new URL(url).pathname.toLowerCase().replace(/\/+$/, '');
    if (/rta-rdta|rda-rta|rta-rda/.test(p)) return false;
    return /(?:^|\/)rta(?:\/|$)/.test(p) || /atomizoare?-rta(?:\/|$)/.test(p);
  } catch (_) {
    return false;
  }
}

function classify(title, hint) {
  const t = normalizeKey(title);
  if (!t || t.length < 4 || isLikelyMenuLabel(title)) return '';

  const hasRta = /\brta\b/.test(t);
  const hasRda = /\brda\b/.test(t);
  const hasRdta = /\brdta\b/.test(t);
  const platform = /dvarw|kayfun|taifun|diplomat|muted|asylum|bishop|pioneer|purity|millennium|gtr|chariot|prime minister|by ka|spica|squape/.test(t);
  const part = /\b(?:bell|bell cap|chimney|chamber|camera|clopot|air ?pin|airflow pin|insert|reducer|reductie|top ?cap|bottom ?cap|tank|geam|glass|pyrex|psu|pei|ultem|drip ?tip|mustiuc|o ?ring|oring|spare|insulator|izolator|screw|surub|deck|jfc|juice control|510 pin)\b/.test(t);
  if (part && (hasRta || platform)) return 'componente RTA';

  if (hasRta && !hasRda && !hasRdta) return 'RTA';
  if (hasRta && (hasRda || hasRdta)) return 'RTA/RDA mixed';
  if (!hasRta && (hasRda || hasRdta)) return 'RDA/RDTA';
  if (/\b(?:bridge|rba)\b/.test(t)) return 'RBA/bridge';

  if (/\b(?:bf60|fl80)\b/.test(t) && /dicodes/.test(t)) return 'chipset/board';
  if (/\b(?:board|pcb|chipset|dna60|dna60c|dna75|dna75c|dna100c|evolv)\b/.test(t) && !/atomizor|rta|rda|rdta/.test(t)) return 'chipset/board';

  const isMod = /\b(?:mod|box mod|sbs|side by side|squonk)\b/.test(t) && !/atomizor|atomizer|rta|rda|rdta|bridge|rba/.test(t);
  if (isMod) return 'mod';

  const cottonFlavorNoise = /\b(?:cotton candy|candy ice|ice|aroma|lichid|liquid|e liquid|eliquid|flavour|flavor)\b/.test(t);
  const wickStrong = /\b(?:bumbac|rayon|vata|wick|wicking|cotton bacon|cotton gods|organic cotton|native wicks|fiber n cotton|muji cotton)\b/.test(t);
  const plainCotton = /\bcotton\b/.test(t) && /\b(?:organic|bacon|wick|wicking|rta|rda|rdta|coil|atomizor|atomizer)\b/.test(t);
  if ((wickStrong || plainCotton) && !cottonFlavorNoise) return 'bumbac/wick';

  const wireExplicit = /\b(?:sarma|wire|kanthal|ka1|nichrome|ni80|ss316l?|nife30|nife52|nife|ni200)\b/.test(t);
  const wireConstruction = /\b(?:clapton|fused clapton|alien|twisted)\b/.test(t);
  const wireGeometry = /\b(?:awg|ga|gauge|0 [1-9]\d? mm|\d{2}ga|\d{2}awg|metri|metres|meter|meters)\b/.test(t);
  const titaniumWire = /\b(?:titanium|titan)\b/.test(t) && /\b(?:wire|sarma|coil|awg|ga|gauge|mm)\b/.test(t) && !/\b(?:gray|grey|gri|color|culoare)\b/.test(t);
  const prebuiltContext = /\b(?:prebuilt|pre built|handmade|coil|coils|rezistenta|rezistente)\b/.test(t);
  const stockCoilNoise = /\b(?:pod|cartus|cartridge|nautilus|gtl|z coil|pnp|tpp|rpm|mesh coil head|coil head)\b/.test(t);
  if ((wireExplicit || wireConstruction || titaniumWire) && (wireGeometry || wireConstruction || /\b(?:sarma|wire)\b/.test(t))) {
    if (prebuiltContext && !stockCoilNoise) return 'coil prebuilt';
    return 'sarma';
  }
  if (prebuiltContext && wireConstruction && !stockCoilNoise) return 'coil prebuilt';

  if (/\b(?:acumulator|battery|baterie)\b/.test(t) && /\b(?:18350|18650|20700|21700|26650|li ion|mah)\b/.test(t)) return 'acumulator';
  if (/\b(?:incarcator|charger|charging)\b/.test(t) && /\b(?:battery|baterie|acumulator|18350|18650|21700|slot)\b/.test(t)) return 'incarcator';
  if (/\b(?:ohm ?meter|ohm ?reader|build ?tab|coil ?jig|coiling|penseta|tweezers|ceramic|cleste|cutter|foarfeca|scissors|tool ?kit|trusa build|ustensile build)\b/.test(t)) return 'unelte build';

  const tobacco = /\b(?:tutun|tobacco|net|virginia|burley|kentucky|latakia|oriental|turkish|perique|cigar|cigarro|cavendish|balkan|english blend|american blend)\b/.test(t);
  const liquidForm = /\b(?:lichid|liquid|e liquid|eliquid|aroma|longfill|shortfill|concentrat|extract|shot)\b/.test(t);
  if (tobacco && liquidForm) return 'lichid tutunos/NET/DIY';

  if (/\b(?:beauty ring|heat sink|atomizer stand|suport atomizor|adaptor 510|adapter 510|drip tip|mustiuc)\b/.test(t)) return 'accesoriu RTA/mod';

  if (hint === 'RTA' && /atomizor|atomizer|tank/.test(t) && !/nautilus|sub ohm|clearomiz|pod|cartus|cartridge/.test(t)) return 'RTA-candidat';
  return '';
}

function parsePrice(text) {
  const candidates = String(text || '').match(/(?:^|\s)(\d{1,5}(?:[ .]\d{3})*(?:[,.]\d{2})?)\s*(?:lei|ron)\b/ig) || [];
  if (!candidates.length) return null;
  const raw = candidates[candidates.length - 1]
    .replace(/[^0-9,. ]/g, '')
    .replace(/\s/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function parseStock(text) {
  const t = normalizeKey(text);
  if (/stoc epuizat|indisponibil|out of stock|sold out/.test(t)) return 'out_of_stock';
  if (/\bin stoc\b|adauga in cos|add to cart|cumpara/.test(t)) return 'in_stock';
  return 'unknown';
}

function productFromJsonLd(node, baseUrl, hint) {
  if (!node || typeof node !== 'object') return [];
  const list = [];
  const type = Array.isArray(node['@type']) ? node['@type'].join(' ') : String(node['@type'] || '');
  if (/Product/i.test(type) && node.name) {
    const title = cleanProductTitle(node.name);
    const category = classify(title, hint);
    if (category && category !== 'RTA-candidat') {
      const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers || {};
      const price = Number(offers.price || offers.lowPrice || node.price || NaN);
      const availability = String(offers.availability || '');
      list.push({
        title,
        url: canonicalUrl(absoluteUrl(baseUrl, node.url || offers.url || baseUrl)),
        priceRon: Number.isFinite(price) ? price : null,
        stock: /OutOfStock|SoldOut/i.test(availability) ? 'out_of_stock' : /InStock|PreOrder|LimitedAvailability/i.test(availability) ? 'in_stock' : 'unknown',
        brand: cleanText(node.brand && (node.brand.name || node.brand) || '') || inferBrand(title),
        category,
        sourceMode: 'json-ld'
      });
    }
  }
  Object.values(node).forEach(value => {
    if (Array.isArray(value)) value.forEach(item => list.push(...productFromJsonLd(item, baseUrl, hint)));
    else if (value && typeof value === 'object') list.push(...productFromJsonLd(value, baseUrl, hint));
  });
  return list;
}

function parseJsonLd(html, baseUrl, hint) {
  const products = [];
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    try {
      const raw = decodeEntities(match[1]).trim();
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (Array.isArray(data)) data.forEach(item => products.push(...productFromJsonLd(item, baseUrl, hint)));
      else products.push(...productFromJsonLd(data, baseUrl, hint));
    } catch (_) {}
  }
  return products;
}

function parseAnchors(html, baseUrl, hint) {
  const products = [];
  const re = /<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html))) {
    const attrs = `${match[1] || ''} ${match[3] || ''}`;
    let rawTitle = cleanText(match[4]);
    if (rawTitle.length < 4) {
      const attrTitle = attrs.match(/(?:aria-label|title)=["']([^"']+)["']/i);
      if (attrTitle) rawTitle = cleanText(attrTitle[1]);
    }
    if (rawTitle.length < 4 || rawTitle.length > 260) continue;

    const url = canonicalUrl(absoluteUrl(baseUrl, match[2]));
    if (!url) continue;
    const start = Math.max(0, match.index - 120);
    const end = Math.min(html.length, re.lastIndex + 420);
    const context = cleanText(html.slice(start, end));
    const priceRon = parsePrice(rawTitle) ?? parsePrice(context);
    const title = cleanProductTitle(rawTitle);
    if (title.length < 4 || title.length > 180 || isLikelyMenuLabel(title)) continue;
    if (isCategoryLikeUrl(url) && priceRon == null) continue;
    if (!isProductLikeUrl(url) && priceRon == null) continue;

    const category = classify(title, hint);
    if (!category || category === 'RTA-candidat') continue;
    products.push({
      title,
      url,
      priceRon,
      stock: parseStock(context),
      brand: inferBrand(title),
      category,
      sourceMode: 'html-anchor'
    });
  }
  return products;
}

function listedCount(html, hint, pageUrl) {
  if (hint !== 'RTA') return null;
  const text = cleanText(html);
  const explicit = text.match(/\bRTA\s*\((\d+)\)/i);
  if (explicit) return { count: Number(explicit[1]), confidence: 'explicit-rta-count' };
  if (!isRtaSpecificUrl(pageUrl)) return null;
  const totalPatterns = [
    /(?:afi[sș]ez|afiseaza|showing)\s*\d+\s*[-–]\s*\d+\s*(?:din|of)\s*(\d+)\s*(?:de\s*)?(?:rezultate|produse|results)?/i,
    /\b(\d+)\s+(?:articole|produse|products)\b/i
  ];
  for (const pattern of totalPatterns) {
    const found = text.match(pattern);
    if (found) return { count: Number(found[1]), confidence: 'rta-specific-category-total' };
  }
  return null;
}

function paginationLinks(html, baseUrl) {
  const urls = new Set();
  const re = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = re.exec(html))) {
    const href = decodeEntities(match[1]);
    if (!/(?:\/page\/\d+\/?|[?&](?:page|paged|p)=\d+)/i.test(href)) continue;
    const url = canonicalUrl(absoluteUrl(baseUrl, href));
    if (url) urls.add(url);
  }
  return [...urls];
}

function dedupeProducts(items) {
  const map = new Map();
  for (const item of items) {
    const key = `${normalizeKey(item.title)}|${canonicalUrl(item.url)}`;
    if (!key || key === '|') continue;
    const previous = map.get(key);
    if (!previous) {
      map.set(key, item);
      continue;
    }
    map.set(key, {
      ...previous,
      priceRon: previous.priceRon == null ? item.priceRon : previous.priceRon,
      stock: previous.stock === 'unknown' ? item.stock : previous.stock,
      brand: previous.brand || item.brand,
      category: previous.category === 'RTA-candidat' ? item.category : previous.category,
      sourceMode: previous.sourceMode === 'json-ld' ? previous.sourceMode : item.sourceMode
    });
  }
  return [...map.values()];
}

function dedupeCategorySnapshots(items) {
  const priority = { 'explicit-rta-count': 3, 'rta-specific-category-total': 2, 'direct-category-count': 1 };
  const map = new Map();
  for (const item of items) {
    if (!item || !item.retailerId || !item.category || !item.observedAt) continue;
    const key = `${item.retailerId}|${item.category}|${item.observedAt}`;
    const previous = map.get(key);
    const score = priority[item.confidence] || 0;
    const previousScore = previous ? (priority[previous.confidence] || 0) : -1;
    if (!previous || score > previousScore || (score === previousScore && String(item.source || '').length < String(previous.source || '').length)) {
      map.set(key, item);
    }
  }
  return [...map.values()].sort((a, b) => `${a.retailerId}|${a.category}`.localeCompare(`${b.retailerId}|${b.category}`, 'ro'));
}

async function fetchText(url, registry) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 16000);
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': registry.collectorPolicy.userAgent,
        'accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'accept-language': 'ro-RO,ro;q=0.9,en;q=0.7'
      },
      redirect: 'follow',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { url: response.url || url, text: await response.text() };
  } finally {
    clearTimeout(timer);
  }
}

function isFinishedDicodes(category, title) {
  const text = normalizeKey(title);
  return /dicodes/.test(text) && category === 'mod' && !/\b(?:bf60|fl80|board|placa|chipset|pcb)\b/.test(text);
}

async function collectRetailer(retailer, registry, date) {
  if (retailer.mode !== 'public-html') {
    return { retailerId: retailer.id, pagesFetched: 0, observations: [], categorySnapshots: [], errors: [], skipped: retailer.mode };
  }
  const observations = [];
  const categorySnapshots = [];
  const errors = [];
  let pagesFetched = 0;
  const visited = new Set();

  for (const seed of retailer.seeds || []) {
    const queue = [seed.url];
    const maxPages = Math.max(1, Math.min(Number(seed.maxPages || registry.collectorPolicy.maxPagesPerSeed || 1), 4));
    let seedPages = 0;
    while (queue.length && seedPages < maxPages) {
      const current = queue.shift();
      const canonical = canonicalUrl(current);
      if (visited.has(canonical)) continue;
      visited.add(canonical);
      try {
        const fetched = await fetchText(current, registry);
        pagesFetched += 1;
        seedPages += 1;
        const products = dedupeProducts([
          ...parseJsonLd(fetched.text, fetched.url, seed.categoryHint),
          ...parseAnchors(fetched.text, fetched.url, seed.categoryHint)
        ]);
        for (const product of products) {
          if (isFinishedDicodes(product.category, product.title)) continue;
          observations.push({
            retailerId: retailer.id,
            category: product.category,
            brand: product.brand || '',
            product: product.title,
            priceRon: product.priceRon,
            stock: product.stock,
            observedAt: date,
            source: product.url || fetched.url,
            sourceMode: product.sourceMode
          });
        }
        const count = listedCount(fetched.text, seed.categoryHint, fetched.url);
        if (count && Number.isFinite(count.count)) {
          categorySnapshots.push({
            retailerId: retailer.id,
            category: seed.categoryHint,
            listed: count.count,
            observedAt: date,
            source: fetched.url,
            confidence: count.confidence
          });
        }
        if (seedPages === 1) {
          paginationLinks(fetched.text, fetched.url).slice(0, maxPages - 1).forEach(url => queue.push(url));
        }
      } catch (error) {
        errors.push({ url: current, error: String(error && error.message || error).slice(0, 180) });
      }
      await sleep(Math.ceil(1000 / Math.max(0.1, Number(registry.collectorPolicy.requestsPerSecondMax || 1))));
    }
  }

  const uniqueObs = dedupeProducts(observations.map(o => ({
    title: o.product, url: o.source, priceRon: o.priceRon, stock: o.stock, brand: o.brand, category: o.category,
    sourceMode: o.sourceMode, retailerId: o.retailerId, observedAt: o.observedAt
  }))).map(o => ({
    retailerId: retailer.id,
    category: o.category,
    brand: o.brand || '',
    product: o.title,
    priceRon: o.priceRon,
    stock: o.stock,
    observedAt: date,
    source: o.url,
    sourceMode: o.sourceMode
  }));

  return { retailerId: retailer.id, pagesFetched, observations: uniqueObs, categorySnapshots: dedupeCategorySnapshots(categorySnapshots), errors };
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

function retailerPublicShape(retailer, result) {
  return {
    id: retailer.id,
    name: retailer.name,
    url: retailer.url,
    country: retailer.country || 'RO',
    status: retailer.status || 'monitored',
    coverage: retailer.coverage || [],
    note: retailer.mode === 'existing-feed'
      ? 'Date integrate prin feedul deja existent al ghidului; collectorul public extern nu dubleaza feedul.'
      : result && result.errors && result.errors.length
        ? `Collector activ; ${result.errors.length} pagini au necesitat retry/verificare la ultima rulare.`
        : 'Collector public 2026 activ.'
  };
}

function retainedFallbackRows(market, results, date) {
  const failedRetailers = new Set(results
    .filter(result => !result.skipped && Number(result.pagesFetched || 0) === 0 && (result.errors || []).length > 0)
    .map(result => result.retailerId));
  if (!failedRetailers.size) return [];
  return (market.observations || []).filter(row => row.observedAt === date && failedRetailers.has(row.retailerId));
}

async function main() {
  const registry = readJson(REGISTRY_PATH);
  const market = readJson(MARKET_PATH);
  const date = bucharestDate();
  if (!/^2026-/.test(date)) {
    console.log(`Market collector is locked to 2026; current Bucharest date is ${date}.`);
    return;
  }
  if (Number(registry.scopeYear) !== 2026 || Number(market.scopeYear) !== 2026) {
    throw new Error('Market registry/data scope must remain 2026.');
  }

  const results = [];
  for (const retailer of registry.retailers || []) {
    console.log(`Collecting ${retailer.name}...`);
    results.push(await collectRetailer(retailer, registry, date));
  }

  const collected = results.flatMap(r => r.observations || []);
  const fallback = retainedFallbackRows(market, results, date);
  const observations = dedupeProducts([...collected, ...fallback].map(o => ({
    title: o.product,
    url: o.source,
    priceRon: o.priceRon,
    stock: o.stock,
    brand: o.brand,
    category: o.category,
    sourceMode: o.sourceMode,
    retailerId: o.retailerId,
    observedAt: o.observedAt
  }))).map(o => ({
    retailerId: o.retailerId,
    category: o.category,
    brand: o.brand || '',
    product: o.title,
    priceRon: o.priceRon,
    stock: o.stock,
    observedAt: date,
    source: o.url,
    sourceMode: o.sourceMode
  })).filter(o => /^2026-/.test(String(o.observedAt || '')))
    .sort((a, b) => `${a.retailerId}|${a.category}|${a.product}`.localeCompare(`${b.retailerId}|${b.category}|${b.product}`, 'ro'));

  const snapshots = dedupeCategorySnapshots(results.flatMap(r => r.categorySnapshots || []));
  const trend = {
    date,
    observations: observations.length,
    retailersWithObservations: new Set(observations.map(o => o.retailerId)).size,
    categories: summaryByCategory(observations)
  };
  const trendSnapshots = (market.trendSnapshots || []).filter(item => item.date !== date && /^2026-/.test(String(item.date || '')));
  trendSnapshots.push(trend);
  trendSnapshots.sort((a, b) => a.date.localeCompare(b.date));

  market.updatedAt = new Date().toISOString();
  market.retailers = (registry.retailers || []).map(retailer => retailerPublicShape(retailer, results.find(r => r.retailerId === retailer.id)));
  market.observations = observations;
  market.categorySnapshots = snapshots;
  market.trendSnapshots = trendSnapshots;
  market.collectorStatus = {
    date,
    generatedAt: new Date().toISOString(),
    retailersConfigured: (registry.retailers || []).length,
    externalRetailersAttempted: results.filter(r => !r.skipped).length,
    pagesFetched: results.reduce((sum, r) => sum + Number(r.pagesFetched || 0), 0),
    observations: observations.length,
    errors: results.reduce((sum, r) => sum + (r.errors || []).length, 0),
    byRetailer: results.map(r => ({
      retailerId: r.retailerId,
      pagesFetched: r.pagesFetched,
      observations: (r.observations || []).length,
      errors: r.errors || [],
      skipped: r.skipped || null
    }))
  };

  const history = {
    schemaVersion: 1,
    scopeYear: 2026,
    date,
    generatedAt: market.collectorStatus.generatedAt,
    observations,
    categorySnapshots: snapshots,
    summary: trend,
    collectorStatus: market.collectorStatus
  };

  if (CHECK) {
    console.log(JSON.stringify(market.collectorStatus, null, 2));
    if (!observations.length) throw new Error('Collector returned zero RTA-ecosystem observations.');
    return;
  }

  if (WRITE) {
    writeJson(MARKET_PATH, market);
    writeJson(path.join(HISTORY_DIR, `${date}.json`), history);
    console.log(`Wrote ${observations.length} observations from ${market.collectorStatus.retailersConfigured} configured retailers.`);
  } else {
    console.log(JSON.stringify({ status: market.collectorStatus, trend }, null, 2));
  }
}

main().catch(error => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
