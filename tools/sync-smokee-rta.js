#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const CATEGORY_URL = 'https://smokee.ro/product-category/atomizoare/';
const STORE_PRODUCTS_URL = 'https://smokee.ro/wp-json/wc/store/v1/products';
const WP_PRODUCTS_URL = 'https://smokee.ro/wp-json/wp/v2/product';
const ATOMIZER_CATEGORY_ID = 76;
const STORE_PER_PAGE = 100;
const STORE_PAGE_LIMIT = 8;
const STORE_SEARCH_TERMS = ['RTA', 'atomizor RTA', 'MTL RTA'];
const FETCH_TIMEOUT_MS = 9000;
const NEWS_START_DATE = '2026-07-06';
const START_MARKER = '/* AUTO-SMOKEE-RTA-START */';
const END_MARKER = '/* AUTO-SMOKEE-RTA-END */';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const write = args.includes('--write') || (!dryRun && !args.includes('--check'));
const fromFile = valueAfter('--from-file');
const maxPages = Number(valueAfter('--max-pages') || 8);

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : '';
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
    .replace(/&gt;/g, '>');
}

function stripTags(html) {
  return decodeEntities(String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function productFocusText(html) {
  const source = String(html || '');
  const parts = [];
  for (const match of source.matchAll(/<meta[^>]+(?:name|property)=["'](?:description|og:title|og:description)["'][^>]+content=["']([^"']+)["']/gi)) {
    parts.push(match[1]);
  }
  for (const match of source.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:title|og:description)["']/gi)) {
    parts.push(match[1]);
  }
  const h1 = source.match(/<h1[^>]*class=["'][^"']*\bproduct_title\b[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) parts.push(stripTags(h1[1]));
  const shortDescription = source.match(/<div[^>]*class=["'][^"']*\bwoocommerce-product-details__short-description\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (shortDescription) parts.push(stripTags(shortDescription[1]));
  const longDescription = source.match(/<div[^>]*id=["']tab-description["'][^>]*>([\s\S]*?)(?:<section|<div[^>]+class=["'][^"']*related|<h2[^>]*>Produse similare|<\/main>)/i);
  if (longDescription) parts.push(stripTags(longDescription[1]));
  const schemaDescription = source.match(/"description"\s*:\s*"([^"]+)"/i);
  if (schemaDescription) parts.push(schemaDescription[1].replace(/\\u([0-9a-f]{4})/gi, (_, n) => String.fromCharCode(parseInt(n, 16))));
  return stripTags(parts.join(' '));
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
  return String(url || '').replace(/[?#].*$/, '').replace(/\/$/, '/');
}

function absoluteUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return 'https:' + url;
  return new URL(url, CATEGORY_URL).href;
}

function canonicalName(value) {
  let text = decodeEntities(value)
    .replace(/\bAtomizor\b/gi, '')
    .replace(/\bby\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  text = text.replace(/\s+-\s+(black|matte black|full black|stainless steel|ss|dlc|gunmetal|silver|polished finish|standard set|bundle|nano)$/i, '');
  text = text
    .replace(/\b(black|matte|full|stainless|steel|polished|finish|silver|gunmetal|dlc|ss316l|ss316|ss)\b/gi, ' ')
    .replace(/\b\d+(?:[.,]\d+)?\s*(ml|mm)\b/gi, ' ')
    .replace(/\b(standard set|bundle|set)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return norm(text);
}

function displayName(title) {
  let name = decodeEntities(title)
    .replace(/\s+/g, ' ')
    .replace(/\s+-\s+(Black|Matte Black|Full Black|Stainless Steel|SS|DLC|Gunmetal|Silver|Polished Finish)$/i, '')
    .trim();
  if (!/^Atomizor\b/i.test(name) && /\brta\b/i.test(name)) return name;
  return name.replace(/^Atomizor\s+/i, '').trim();
}

function isAccessoryText(value) {
  return /\b(air pin|air-pin|set de pini|pinuri|pini airflow|glass|sticla|tank|tank kit|short tank|glass tank|kit nano|nano kit|top refill|repair kit|evaporation chamber|chamber|insert|curl peek|rezistente|rezistenta|coil|coils|bumbac|cotton|mesh|drip tip|cap|bell cap|chimney|clopot|kit pentru|open mtl kit|tight mtl kit|accesoriu|dedicat pentru|spare|replacement|extensie|extender|ring|beauty ring|decorative ring|accessory pack|spare pack)\b/.test(norm(value));
}

function isRtaCandidate(product) {
  const hay = norm([product.title, product.url, product.cardClass, product.cardText].join(' '));
  const identity = norm([product.title, product.url, product.cardClass].join(' '));
  if (!/\brta\b/.test(hay)) return false;
  if (!/(product_cat-atomizoare|\batomizoare\b)/.test(identity)) return false;
  if (/\b(product_cat-accesorii|product_cat-rezistente|product_cat-diy)\b/.test(hay)) return false;
  if (isAccessoryText(identity)) return false;
  if (/\b(pod|cartus|cartridge|clearomizor|clearomizer|subohm|sub-ohm|rda|rdta|kit[-\s]|full kit)\b/.test(identity)) return false;
  return true;
}

function isConfirmedRta(product, pageHtml) {
  const pageText = productFocusText(pageHtml);
  const hay = norm([product.title, product.url, product.cardClass, product.cardText, pageText].join(' '));
  const identity = norm([product.title, product.url, product.cardClass].join(' '));
  if (!/\brta\b/.test(hay)) return false;
  if (isAccessoryText(identity)) return false;
  if (/\b(pod|cartus|cartridge|clearomizor|clearomizer|subohm|sub-ohm|rda|rdta|kit[-\s]|full kit)\b/.test(identity)) return false;
  if (!/\bmtl\b|mouth[\s-]*to[\s-]*lung/.test(hay)) return false;
  if (/\b(dl|direct lung|subohm|sub-ohm|cloud chasing|26\s*mm|nightmare|hellbeast|dead rabbit 3|dead rabbit 4)\b/.test(hay) && !/\bmtl\b/.test(hay)) return false;
  return true;
}

function isKnownVariant(product, state) {
  const text = norm(product.title + ' ' + product.url);
  const known = state.nameText || '';
  if (/\bmuted\b.*\brta\b/.test(text) && known.includes('muted+')) return true;
  if (/\bbi2hop\b/.test(text) && known.includes('bi2hop')) return true;
  if (/\bby[-\s]?ka\b.*\bv\.?\s*11\b/.test(text) && known.includes('by-ka v.11')) return true;
  if (/\bvico\b/.test(text) && known.includes('vico')) return true;
  if (/\bbaya\b/.test(text) && known.includes('baya')) return true;
  if (/\bmd[-\s]?01\b/.test(text) && known.includes('md01')) return true;
  if (/\bdead rabbit\b.*\bmtl\b/.test(text) && known.includes('dead rabbit mtl')) return true;
  return false;
}

function extractImage(block) {
  const imgTags = [...String(block || '').matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
  for (const tag of imgTags) {
    const srcset = attr(tag, 'data-srcset') || attr(tag, 'srcset');
    const src = attr(tag, 'data-src') || attr(tag, 'src');
    const candidate = src || (srcset ? srcset.split(',')[0].trim().split(/\s+/)[0] : '');
    if (!candidate) continue;
    if (/placeholder|blank|data:image|svg/i.test(candidate)) continue;
    return absoluteUrl(decodeEntities(candidate));
  }
  return '';
}

function attr(tag, name) {
  const re = new RegExp(name + '=["\']([^"\']+)["\']', 'i');
  const match = String(tag || '').match(re);
  return match ? match[1] : '';
}

function parseCategoryProducts(html) {
  const products = [];
  const titleRe = /<h3[^>]*class=["'][^"']*\bwd-entities-title\b[^"']*["'][^>]*>\s*<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = titleRe.exec(html))) {
    const start = html.lastIndexOf('<div class="wd-product', match.index);
    const next = html.indexOf('<div class="wd-product', match.index + 1);
    const block = html.slice(start >= 0 ? start : Math.max(0, match.index - 1800), next > match.index ? next : Math.min(html.length, match.index + 3600));
    const classMatch = block.match(/<div class=["']([^"']*\bproduct-grid-item\b[^"']*)["']/i);
    const title = stripTags(match[2]);
    const url = cleanUrl(decodeEntities(match[1]));
    products.push({
      title,
      url,
      image: extractImage(block),
      cardClass: classMatch ? classMatch[1] : '',
      cardText: stripTags(block)
    });
  }
  return products;
}

function storeProductText(product) {
  const categories = Array.isArray(product.categories) ? product.categories.map(c => `${c.name || ''} ${c.slug || ''}`).join(' ') : '';
  const tags = Array.isArray(product.tags) ? product.tags.map(t => `${t.name || ''} ${t.slug || ''}`).join(' ') : '';
  return stripTags([product.short_description, product.description, categories, tags].filter(Boolean).join(' '));
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

function normalizeStoreProduct(product) {
  const categories = Array.isArray(product.categories) ? product.categories.map(c => `product_cat-${c.slug || ''} ${c.name || ''}`).join(' ') : '';
  return {
    productId: product.id || null,
    title: stripTags(product.name || product.title || ''),
    url: cleanUrl(product.permalink || product.url || ''),
    image: storeProductImage(product),
    cardClass: categories,
    cardText: storeProductText(product),
    newOnSmokee: isSmokeeNewProduct(product),
    productDate: dateKey(product.date || product.date_created || product.date_gmt)
  };
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const res = await fetch(url, {
    signal: controller.signal,
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; RTA-MTL-Smokee-Sync/1.0)',
      'accept': 'text/html,application/xhtml+xml'
    }
  }).finally(() => clearTimeout(timer));
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

async function fetchStoreProducts(params) {
  const url = new URL(STORE_PRODUCTS_URL);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const res = await fetch(url.href, {
    signal: controller.signal,
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; RTA-MTL-Smokee-Sync/1.0)',
      'accept': 'application/json'
    }
  }).finally(() => clearTimeout(timer));
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url.href}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function loadStoreProducts() {
  const chunks = [];
  for (let page = 1; page <= STORE_PAGE_LIMIT; page += 1) {
    const products = await fetchStoreProducts({
      category: String(ATOMIZER_CATEGORY_ID),
      page: String(page),
      per_page: String(STORE_PER_PAGE)
    }).catch(() => []);
    if (!products.length) break;
    chunks.push(products);
    if (products.length < STORE_PER_PAGE) break;
  }
  const searchChunks = await Promise.all(STORE_SEARCH_TERMS.map(term => fetchStoreProducts({
    search: term,
    per_page: '100'
  }).catch(() => [])));
  return chunks.concat(searchChunks).flat().map(normalizeStoreProduct).filter(product => product.title && product.url);
}

async function enrichPublishedDates(products) {
  const ids = Array.from(new Set(products
    .filter(product => product.productId && !product.productDate)
    .map(product => product.productId)));
  if (!ids.length) return products;

  const dates = new Map();
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = new URL(WP_PRODUCTS_URL);
    url.searchParams.set('include', batch.join(','));
    url.searchParams.set('per_page', String(batch.length));
    url.searchParams.set('_fields', 'id,date,date_gmt');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(url.href, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; RTA-MTL-Smokee-Sync/1.0)',
        'accept': 'application/json'
      }
    }).finally(() => clearTimeout(timer)).catch(() => null);
    if (!response || !response.ok) continue;
    const payload = await response.json().catch(() => []);
    if (!Array.isArray(payload)) continue;
    for (const product of payload) {
      const key = dateKey(product.date || product.date_gmt);
      if (product && product.id && key) dates.set(product.id, key);
    }
  }

  for (const product of products) {
    if (product.productId && dates.has(product.productId)) product.productDate = dates.get(product.productId);
  }
  return products;
}

async function loadCategoryPages() {
  if (fromFile) return [fs.readFileSync(path.resolve(fromFile), 'utf8')];
  const pages = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const url = page === 1 ? CATEGORY_URL : `${CATEGORY_URL}page/${page}/`;
    try {
      const html = await fetchText(url);
      const products = parseCategoryProducts(html);
      if (!products.length) break;
      pages.push(html);
      if (!html.includes(`${CATEGORY_URL}page/${page + 1}/`) && !/rel=["']next["']/i.test(html)) break;
    } catch (error) {
      if (page === 1) {
        console.warn(`Smokee sync: category page unavailable, continuing with Store API fallback: ${error.message}`);
        break;
      }
      break;
    }
  }
  return pages;
}

function existingState(html) {
  const urls = new Set([...html.matchAll(/https:\/\/smokee\.ro\/product\/[^'"\s<)]+/g)].map(m => cleanUrl(decodeEntities(m[0]))));
  const names = new Set();
  const nameList = [];
  const nameRe = /(?:\bname\s*:\s*'([^']+)'|"\bname"\s*:\s*"([^"]+)")/g;
  let match;
  while ((match = nameRe.exec(html))) {
    const name = match[1] || match[2];
    names.add(canonicalName(name));
    nameList.push(name);
  }
  return { urls, names, nameText: norm(nameList.join(' ')) };
}

function inferPairing(product, pageText) {
  const text = norm([product.title, product.cardText, pageText].join(' '));
  const airflow = inferAirflow(product, pageText);
  const chamber = inferChamber(product, pageText);
  const open = /\b(rdl|dl|direct lung|open draw|open airflow|23 mm|24 mm)\b/.test(text) && !/\bmtl\b/.test(text);
  const modular = /\b(pin|pini|airflow pin|air pin|insert|camera|camere|chamber|bell|clopot|jfc|juice control|modular|triple air|afc)\b/.test(text);
  const body = /\b(kentucky|latakia|dark|cigar|trabuc|burley|fum|smoky|dead rabbit|blaze|baya|muted|blade)\b/.test(text);
  const smooth = /\b(pipe|cavendish|diplomat|minister|prime minister|taifun|kayfun|netsu|smooth|rounded|baya)\b/.test(text);
  const clarity = /\b(virginia|oriental|turkish|perique|bright|vico|amazier|trinity|berserker|arcana|precizie|precision)\b/.test(text);

  if (open) {
    return withArchitecture({
      score: 7.35,
      confidence: 'Smokee / RTA cu potrivire limitata MTL strans',
      classes: 'Tutun aromatizat, dark sweet, cacao, cafea si cigar dulce; potrivire limitata pentru NET MTL fin.',
      dna: 'RTA listat de Smokee, cu tiraj posibil mai deschis; profilul se verifica prin airflow, camera si pozitia coilului.',
      builds: 'openRtaBuilds()',
      status: 'Smokee RTA / potrivire limitata MTL',
      mtlFit: 'limited',
      value: 'limited'
    }, airflow, chamber);
  }
  if (modular) {
    return withArchitecture({
      score: 8.2,
      confidence: 'Smokee / RTA in verificare',
      classes: 'Virginia, Burley, Oriental, NET complex si lichide care cer reglaj fin al camerei sau airflow-ului.',
      dna: 'RTA listat de Smokee, cu potential de reglaj prin airflow, camera sau deck; potrivirea se calibreaza dupa lichid si build.',
      builds: body ? 'bodyBuilds()' : 'clarityBuilds()',
      status: 'Smokee RTA / in verificare'
    }, airflow, chamber);
  }
  if (body) {
    return withArchitecture({
      score: 8.05,
      confidence: 'Smokee / RTA in verificare',
      classes: 'Burley, Kentucky, Latakia light, cigar light, dark blend si NET cu corp moderat.',
      dna: 'RTA listat de Smokee; profil de corp, hit si textura, de calibrat dupa camera si airflow.',
      builds: 'bodyBuilds()',
      status: 'Smokee RTA / in verificare'
    }, airflow, chamber);
  }
  if (smooth) {
    return withArchitecture({
      score: 8.05,
      confidence: 'Smokee / RTA in verificare',
      classes: 'NET daily, Virginia-Burley, pipe natural, Cavendish si tutunuri rotunde sau echilibrate.',
      dna: 'RTA listat de Smokee; profil orientat spre rotunjime, confort si echilibru aromatic.',
      builds: 'smoothBuilds()',
      status: 'Smokee RTA / in verificare'
    }, airflow, chamber);
  }
  return withArchitecture({
    score: clarity ? 8.05 : 7.95,
    confidence: 'Smokee / RTA in verificare',
    classes: 'Virginia, Oriental, tutun simplu sec, NET luminos si blenduri echilibrate.',
    dna: 'RTA listat de Smokee; profil initial orientat spre claritate si control, de verificat prin camera, deck si airflow.',
    builds: 'clarityBuilds()',
    status: 'Smokee RTA / in verificare'
  }, airflow, chamber);
}

function inferAirflow(product, pageText) {
  const text = norm([product.title, product.cardText, pageText].join(' '));
  if (/side[-\s]?air.*bottom[-\s]?air|bottom[-\s]?air.*side[-\s]?air|side\s*\+\s*bottom|bottom\s*\+\s*side|triple[-\s]?air|hibrid|hybrid|combinat|side[-\s]?air kit|45\s*grade/.test(text)) {
    return {
      dna: 'Airflow detectat din pagina Smokee: configuratie laterala/combinata sau multi-air; incadrare initiala side + bottom/multi.',
      claim: 'airflow lateral/combinat sau multi-air mentionat in pagina produsului'
    };
  }
  if (/side[-\s]?air|airflow lateral|aer lateral|lateral|din parti|around coil|3d airflow|multi[-\s]?side/.test(text)) {
    return {
      dna: 'Airflow detectat din pagina Smokee: aer lateral spre coil; incadrare initiala side-air.',
      claim: 'airflow lateral mentionat in pagina produsului'
    };
  }
  if (/top[-\s]?air|top airflow|top-down|top side|top air/.test(text)) {
    return {
      dna: 'Airflow detectat din pagina Smokee: aer de sus coborat spre coil; incadrare initiala top-down.',
      claim: 'top airflow mentionat in pagina produsului'
    };
  }
  if (/bottom[-\s]?air|flux de aer inferior|airflow inferior|aer inferior|sub[-\s]?coil|sub coil|sub rezistenta|airpin|air pin|insert sub/.test(text)) {
    return {
      dna: 'Airflow detectat din pagina Smokee: aer inferior/sub-coil; incadrare initiala bottom sub-coil.',
      claim: 'airflow inferior/sub-coil mentionat in pagina produsului'
    };
  }
  const range = text.match(/\b(?:0[.,]\d|1[.,]\d)\s*-\s*(?:0[.,]\d|1[.,]\d)\s*mm\b/);
  if (/airflow reglabil|flux de aer personalizabil|afc|pini airflow|pinuri|pini de aer/.test(text)) {
    return {
      dna: `Airflow mentionat pe pagina Smokee: reglabil${range ? ` ${range[0]}` : ''}; arhitectura interna se confirma vizual inainte de incadrarea side/bottom.`,
      claim: `airflow reglabil${range ? ` ${range[0]}` : ''} mentionat in pagina produsului`
    };
  }
  return null;
}

function inferChamber(product, pageText) {
  const text = norm([product.title, product.cardText, pageText].join(' '));
  if (/peek chimney/.test(text)) {
    return {
      dna: 'Camera detectata din pagina Smokee: PEEK chimney mentionat; forma exacta se confirma vizual.',
      claim: 'PEEK chimney mentionat in pagina produsului'
    };
  }
  if (/stainless chimney|taller chamber|camera inox|camera mai inalta/.test(text)) {
    return {
      dna: 'Camera detectata din pagina Smokee: chimney/camera inox sau camera mai inalta mentionata.',
      claim: 'chimney/camera inox sau camera mai inalta mentionata in pagina produsului'
    };
  }
  if (/freehand bell|rhodesian bell|duke bell/.test(text)) {
    const bell = /freehand bell/.test(text) ? 'Freehand bell' : (/rhodesian bell/.test(text) ? 'Rhodesian bell' : 'Duke bell');
    return {
      dna: `Camera detectata din pagina Smokee: ${bell} mentionat; alegerea se confirma pe setul folosit.`,
      claim: `${bell} mentionat in pagina produsului`
    };
  }
  if (/patru camere|4 camere|four chambers/.test(text)) {
    return {
      dna: 'Camera detectata din pagina Smokee: patru camere de vaporizare mentionate.',
      claim: 'patru camere de vaporizare mentionate in pagina produsului'
    };
  }
  if (/camere interschimbabile|interchangeable chambers?|clopote modulare|camere modulare|modular chambers?|bell caps?/.test(text)) {
    return {
      dna: 'Camera detectata din pagina Smokee: camera sau clopot modular mentionat; configuratia exacta se confirma pe set.',
      claim: 'camera/clopot modular mentionat in pagina produsului'
    };
  }
  if (/camera de vaporizare avansata|camera avansata|advanced chamber/.test(text)) {
    return {
      dna: 'Camera detectata din pagina Smokee: camera de vaporizare avansata mentionata.',
      claim: 'camera de vaporizare avansata mentionata in pagina produsului'
    };
  }
  if (/fluid deck/.test(text)) {
    return {
      dna: 'Pagina Smokee mentioneaza Fluid Deck Technology; forma camerei ramane de confirmat vizual.',
      claim: 'Fluid Deck Technology mentionata; forma camerei de confirmat vizual'
    };
  }
  if (/deck optimizat/.test(text)) {
    return {
      dna: 'Pagina Smokee mentioneaza deck optimizat; forma camerei ramane de confirmat vizual.',
      claim: 'deck optimizat mentionat; forma camerei de confirmat vizual'
    };
  }
  return null;
}

function withArchitecture(pairing, airflow, chamber) {
  if (airflow) {
    pairing.dna = `${pairing.dna} ${airflow.dna}`;
    pairing.airflowClaim = airflow.claim;
  } else {
    pairing.airflowClaim = 'profilul se verifica dupa camera, deck, airflow si alimentare';
  }
  if (chamber) {
    pairing.dna = `${pairing.dna} ${chamber.dna}`;
    pairing.chamberClaim = chamber.claim;
  }
  return pairing;
}

function extractOgImage(html) {
  const match = String(html || '').match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || String(html || '').match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return match ? absoluteUrl(decodeEntities(match[1])) : '';
}

function publishedDateFromHtml(html) {
  const source = String(html || '');
  const matches = [
    source.match(/"datePublished"\s*:\s*"([^"]+)"/i),
    source.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i),
    source.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:published_time["']/i)
  ];
  for (const match of matches) {
    const key = dateKey(match && match[1]);
    if (key) return key;
  }
  return '';
}

function productNewsDate(product, pageHtml) {
  const key = dateKey(product.productDate || publishedDateFromHtml(pageHtml));
  return key && key >= NEWS_START_DATE ? key : '';
}

function entryFor(product, pageHtml) {
  const pageText = productFocusText(pageHtml);
  const name = displayName(product.title);
  const pairing = inferPairing(product, pageText);
  const image = extractOgImage(pageHtml) || product.image;
  const addedAt = productNewsDate(product, pageHtml);
  const claimParts = [pairing.airflowClaim];
  if (pairing.chamberClaim) claimParts.push(pairing.chamberClaim);
  const claim = `Smokee: ${name}, RTA listat in categoria Atomizoare; ${claimParts.join('; ')}.`;
  const lines = [
    '  {',
    `    rank:'smokee-auto',`,
    `    name:${jsString(name)},`,
    `    score:${pairing.score},`,
    `    confidence:${jsString(pairing.confidence)},`,
    addedAt ? `    addedAt:${jsString(addedAt)},` : '',
    `    classes:${jsString(pairing.classes)},`,
    `    dna:${jsString(pairing.dna)},`,
    `    market:'Smokee RTA original.',`,
    image ? `    image:${jsString(image)},` : '',
    `    builds:${pairing.builds},`,
    `    sources:[smokeeSource(${jsString(name)},${jsString(product.url)},${jsString(claim)})],`,
    `    youtube:searchVideos(${jsString(name)}),`,
    `    catalogStatus:${jsString(pairing.status)}${pairing.mtlFit ? ',' : ''}`,
    pairing.mtlFit ? `    mtlFit:${jsString(pairing.mtlFit)}` : '',
    '  }'
  ].filter(Boolean);
  return lines.join('\n');
}

function insertEntries(html, entries) {
  const start = html.indexOf(START_MARKER);
  const end = html.indexOf(END_MARKER);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('Auto Smokee markers were not found in index.html');
  }
  const before = html.slice(0, start + START_MARKER.length);
  const current = html.slice(start + START_MARKER.length, end).trim();
  const after = html.slice(end);
  const currentClean = current.replace(/,\s*$/, '').trim();
  const appended = entries.join(',\n');
  const body = currentClean ? `${currentClean},\n${appended}` : appended;
  return `${before}\n${body}\n  ${after}`;
}

async function main() {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const state = existingState(html);
  const pages = await loadCategoryPages();
  const htmlProducts = pages.flatMap(parseCategoryProducts);
  const storeProducts = fromFile ? [] : await enrichPublishedDates(await loadStoreProducts());
  const products = htmlProducts.concat(storeProducts);
  if (!products.length) {
    console.warn('Smokee sync: source returned no RTA products; keeping the existing catalog.');
    return;
  }
  const byUrl = new Map();
  for (const product of products) {
    product.url = cleanUrl(product.url);
    const existing = byUrl.get(product.url);
    byUrl.set(product.url, existing ? { ...existing, ...product, newOnSmokee: existing.newOnSmokee || product.newOnSmokee } : product);
  }

  const potentialProducts = [];
  for (const product of byUrl.values()) {
    if (!isRtaCandidate(product)) continue;
    if (state.urls.has(product.url)) continue;
    const canonical = canonicalName(displayName(product.title));
    if (state.names.has(canonical)) continue;
    if (isKnownVariant(product, state)) continue;
    potentialProducts.push(product);
  }

  if (!potentialProducts.length) {
    console.log(`Smokee sync: ${products.length} products scanned, no new RTA entries.`);
    return;
  }

  const entries = [];
  const newProducts = [];
  for (const product of potentialProducts) {
    let pageHtml = '';
    try {
      pageHtml = fromFile ? '' : await fetchText(product.url);
    } catch (error) {
      console.warn(`Smokee sync: product page unavailable for ${product.url}: ${error.message}`);
    }
    if (!isConfirmedRta(product, pageHtml)) continue;
    newProducts.push(product);
    entries.push(entryFor(product, pageHtml));
  }

  if (!newProducts.length) {
    console.log(`Smokee sync: ${products.length} products scanned, no new RTA entries.`);
    return;
  }

  const updated = insertEntries(html, entries);
  console.log(`Smokee sync: ${newProducts.length} new RTA entr${newProducts.length === 1 ? 'y' : 'ies'} prepared.`);
  newProducts.forEach(product => console.log(`- ${displayName(product.title)} | ${product.url}`));

  if (dryRun || !write) return;
  fs.writeFileSync(INDEX_PATH, updated, 'utf8');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
