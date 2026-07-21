#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseYouTubeSearch } = require('./sync-youtube-reviews');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const DATA_PATH = path.join(ROOT, 'data', 'smokee-mods.json');
const START_MARKER = '/* AUTO-SMOKEE-MODS-START */';
const END_MARKER = '/* AUTO-SMOKEE-MODS-END */';
const CATEGORY_ID = 75;
const CATEGORY_URL = 'https://smokee.ro/product-category/mod-uri/';
const IMAGE_PROXY_ORIGIN = 'https://ghid-rta-smokee-sync-backup.ghid-rta-smokee.workers.dev';
const MAX_VISIBLE = 5;
const NEWS_WINDOW_DAYS = 7;
const FETCH_TIMEOUT_MS = 12000;
const apiKey = process.env.YOUTUBE_API_KEY || '';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('--check');
const write = args.includes('--write') || !dryRun;

const CP1252_BYTES = new Map([
  ['€', 0x80], ['‚', 0x82], ['ƒ', 0x83], ['„', 0x84], ['…', 0x85], ['†', 0x86], ['‡', 0x87],
  ['ˆ', 0x88], ['‰', 0x89], ['Š', 0x8a], ['‹', 0x8b], ['Œ', 0x8c], ['Ž', 0x8e],
  ['‘', 0x91], ['’', 0x92], ['“', 0x93], ['”', 0x94], ['•', 0x95], ['–', 0x96], ['—', 0x97],
  ['˜', 0x98], ['™', 0x99], ['š', 0x9a], ['›', 0x9b], ['œ', 0x9c], ['ž', 0x9e], ['Ÿ', 0x9f]
]);

function repairMojibake(value) {
  const input = String(value || '');
  if (!/[ÃÂÄÈ][\u0080-\uFFFF]/.test(input)) return input;
  const bytes = [];
  for (const char of input) {
    const code = char.codePointAt(0);
    if (code <= 0xff) bytes.push(code);
    else if (CP1252_BYTES.has(char)) bytes.push(CP1252_BYTES.get(char));
    else return input;
  }
  const repaired = Buffer.from(bytes).toString('utf8');
  return repaired.includes('\ufffd') ? input : repaired;
}

function decodeEntities(value) {
  const decoded = String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&ndash;|&mdash;|&#8211;|&#8212;/gi, '-')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  return repairMojibake(decoded);
}

function stripHtml(value) {
  return decodeEntities(String(value || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '));
}

function norm(value) {
  return decodeEntities(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])([0-9])/g, '$1 $2')
    .replace(/([0-9])([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dateKey(value) {
  const match = String(value || '').match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function todayInRomania() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date()).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function daysSince(value, today) {
  const then = Date.parse(`${dateKey(value)}T00:00:00Z`);
  const now = Date.parse(`${today}T00:00:00Z`);
  if (!Number.isFinite(then) || !Number.isFinite(now)) return Infinity;
  return Math.floor((now - then) / 86400000);
}

function cleanUrl(value) {
  return String(value || '').replace(/[?#].*$/, '').replace(/\/?$/, '/');
}

function absoluteUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (String(value).startsWith('//')) return `https:${value}`;
  return new URL(value, 'https://smokee.ro/').href;
}

function imageUrl(product) {
  for (const image of Array.isArray(product.images) ? product.images : []) {
    for (const candidate of [image.src, image.thumbnail, image.full, image.large, image.medium]) {
      const value = absoluteUrl(candidate);
      if (value && !/placeholder|blank|data:image|\.svg(?:\?|$)/i.test(value)) {
        try {
          const parsed = new URL(value);
          if (/^(?:www\.)?smokee\.ro$/i.test(parsed.hostname) && parsed.pathname.startsWith('/wp-content/uploads/')) {
            return `${IMAGE_PROXY_ORIGIN}/media/smokee${parsed.pathname}${parsed.search}`;
          }
        } catch (error) {}
        return value;
      }
    }
  }
  return '';
}

const COLOR_SUFFIX = /\s+-\s+(?:black|full black|black silver|silver|carbon black|matte black|dark grey|anthrazit|green black|blue black|red|blue|green|grey|gray|gunmetal|gold|purple|pink|white|orange|brown)(?:\s+edition)?\s*$/i;

function familyName(value) {
  let name = decodeEntities(value).replace(/\s+/g, ' ').trim();
  while (COLOR_SUFFIX.test(name)) name = name.replace(COLOR_SUFFIX, '').trim();
  name = name.replace(/^mod\s+(?=(?:arcana|lost|voopoo|vaporesso|geekvape|aspire|ambition|dicodes|pipeline|dovpo|sxmini|yihi)\b)/i, '');
  return name;
}

function familyKey(value) {
  return norm(familyName(value))
    .replace(/\b(?:limited|edition|version)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function productImage(product) {
  return imageUrl(product);
}

function isStandaloneMod(product) {
  const title = norm(product.name || '');
  const categoryMatch = (product.categories || []).some(category => Number(category.id) === CATEGORY_ID || category.slug === 'mod-uri');
  if (!categoryMatch || !/smokee\.ro\/product\//i.test(product.permalink || '')) return false;
  if (/\b(?:kit|pod|aio kit|starter|disposable|unica folosinta|atomizor|clearomizor|cartus|cartridge|acumulator|battery|husa|sleeve|charger|incarcator)\b/.test(title)) return false;
  return /\b(?:mod|box|sbs|side by side|tube|mosfet|dicodes|pipeline|dna)\b/.test(title);
}

function productDescription(product) {
  let text = stripHtml(product.short_description || product.description || '');
  text = text
    .replace(/\bDisponibil(?:a)?\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}\.?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) text = 'Mod standalone cu filet 510, listat in categoria Mod-uri Smokee si potrivit pentru configuratii cu atomizor RTA.';
  if (text.length > 320) {
    const clipped = text.slice(0, 317);
    text = `${clipped.replace(/\s+\S*$/, '')}...`;
  }
  return text;
}

function productPrice(product) {
  const prices = product.prices || {};
  const raw = Number(prices.price);
  const minor = Number.isFinite(Number(prices.currency_minor_unit)) ? Number(prices.currency_minor_unit) : 2;
  if (!Number.isFinite(raw)) return '';
  const amount = raw / Math.pow(10, minor);
  const currency = decodeEntities(prices.currency_symbol || prices.currency_code || 'lei');
  return `${amount.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; Ghid-RTA-Smokee-Mods-Sync/1.0)',
        accept: 'application/json'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36',
        'accept-language': 'en-US,en;q=0.8'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function loadProducts() {
  const url = `https://smokee.ro/wp-json/wc/store/v1/products?category=${CATEGORY_ID}&per_page=100&orderby=date&order=desc`;
  const products = await fetchJson(url);
  if (!Array.isArray(products)) return [];
  const dates = new Map();
  const ids = products.map(product => product.id).filter(Boolean);
  for (let start = 0; start < ids.length; start += 50) {
    const batch = ids.slice(start, start + 50);
    const dateUrl = `https://smokee.ro/wp-json/wp/v2/product?include=${batch.join(',')}&per_page=${batch.length}&_fields=id,date,date_gmt`;
    const rows = await fetchJson(dateUrl).catch(() => []);
    (Array.isArray(rows) ? rows : []).forEach(row => dates.set(row.id, dateKey(row.date || row.date_gmt)));
  }
  return products.map((product, sourceOrder) => ({
    ...product,
    sourceOrder,
    publishedAt: dates.get(product.id) || dateKey(product.date || product.date_created || product.date_gmt)
  }));
}

function isoDurationSeconds(value) {
  const match = String(value || '').match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

const REVIEW_STOP = new Set([
  'mod', 'mods', 'box', 'vape', 'vaping', 'review', 'reviews', 'recenzie', 'test', 'by', 'the',
  'ambition', 'lost', 'voopoo', 'vaporesso', 'geekvape', 'aspire', 'systems', 'system',
  'pipeline', 'device', 'edition', 'tube', 'w', 'mm'
]);

function reviewTokens(value) {
  return Array.from(new Set(norm(value).split(' ').filter(token => token && !REVIEW_STOP.has(token))));
}

function reviewMatches(model, title) {
  const target = reviewTokens(model);
  const actual = new Set(norm(title).split(' '));
  if (!target.length) return false;
  for (const modifier of ['pro', 'mini', 'nano', 'plus']) {
    if (target.includes(modifier) && !actual.has(modifier)) return false;
  }
  const identityNumbers = target.filter(token => /^\d{2,3}$/.test(token) && !['185', '186', '217'].includes(token));
  if (identityNumbers.length && !identityNumbers.every(token => actual.has(token))) return false;
  const anchors = target.filter(token => token.length >= 4 && !/^\d+$/.test(token));
  if (anchors.length && !anchors.some(token => actual.has(token))) return false;
  const hits = target.filter(token => actual.has(token)).length;
  return hits >= Math.min(2, target.length);
}

async function youtubeApiReview(model) {
  const search = new URLSearchParams({
    part: 'snippet', type: 'video', maxResults: '25', order: 'viewCount', q: `${model} vape mod review`, key: apiKey
  });
  const found = await fetchJson(`https://www.googleapis.com/youtube/v3/search?${search}`);
  const rows = (found.items || []).filter(item => item.id && item.id.videoId && reviewMatches(model, item.snippet && item.snippet.title || ''));
  if (!rows.length) return null;
  const ids = rows.map(item => item.id.videoId);
  const details = new URLSearchParams({ part: 'statistics,contentDetails', id: ids.join(','), key: apiKey });
  const detailRows = await fetchJson(`https://www.googleapis.com/youtube/v3/videos?${details}`);
  const byId = new Map((detailRows.items || []).map(item => [item.id, item]));
  return rows.map(item => {
    const detail = byId.get(item.id.videoId) || {};
    return {
      videoId: item.id.videoId,
      title: decodeEntities(item.snippet && item.snippet.title || ''),
      channel: decodeEntities(item.snippet && item.snippet.channelTitle || ''),
      viewCount: Math.max(0, Number(detail.statistics && detail.statistics.viewCount || 0)),
      durationSeconds: isoDurationSeconds(detail.contentDetails && detail.contentDetails.duration)
    };
  }).filter(video => video.durationSeconds >= 75 && !/\b(?:shorts?|live stream|livestream)\b/i.test(video.title))
    .sort((a, b) => b.viewCount - a.viewCount)[0] || null;
}

async function youtubePublicReview(model) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${model} vape mod review`)}&hl=en&gl=US`;
  const videos = parseYouTubeSearch(await fetchText(url));
  return videos.filter(video => reviewMatches(model, video.title) && !video.live && (!video.durationSeconds || video.durationSeconds >= 75))
    .sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0))[0] || null;
}

async function bestReview(model, previous) {
  const today = todayInRomania();
  if (previous && previous.videoId && previous.checkedAt === today && reviewMatches(model, previous.title)) return previous;
  try {
    const video = apiKey ? await youtubeApiReview(model) : await youtubePublicReview(model);
    if (!video) return previous || null;
    return {
      videoId: video.videoId,
      title: video.title,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      thumbnail: `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`,
      channel: video.channel || '',
      viewCount: Math.max(0, Number(video.viewCount || 0)),
      checkedAt: today,
      sourceMode: apiKey ? 'youtube-data-api' : 'youtube-public-search'
    };
  } catch (error) {
    console.warn(`Smokee mods: review lookup failed for ${model}: ${error.message}`);
    return previous || null;
  }
}

function readPrevious() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch (error) {
    return { schemaVersion: 1, items: [], recentItems: [] };
  }
}

function normalizeProduct(product) {
  return {
    productId: product.id || null,
    familyKey: familyKey(product.name),
    title: familyName(product.name),
    url: cleanUrl(product.permalink),
    image: productImage(product),
    description: productDescription(product),
    price: productPrice(product),
    stock: product.is_in_stock === true ? true : (product.is_in_stock === false ? false : null),
    publishedAt: dateKey(product.publishedAt),
    sourceOrder: product.sourceOrder
  };
}

function dedupeFamilies(products) {
  const byFamily = new Map();
  products.filter(isStandaloneMod).map(normalizeProduct).forEach(item => {
    const existing = byFamily.get(item.familyKey);
    if (!existing || String(item.publishedAt).localeCompare(String(existing.publishedAt)) > 0 ||
      (item.publishedAt === existing.publishedAt && item.sourceOrder < existing.sourceOrder)) {
      byFamily.set(item.familyKey, item);
    }
  });
  return Array.from(byFamily.values()).sort((a, b) =>
    String(b.publishedAt).localeCompare(String(a.publishedAt)) || a.sourceOrder - b.sourceOrder || a.title.localeCompare(b.title));
}

async function buildFeed(products, previous) {
  const today = todayInRomania();
  const families = dedupeFamilies(products);
  const priorByFamily = new Map([].concat(previous.items || [], previous.recentItems || []).map(item => [item.familyKey, item]));
  const visible = families.slice(0, MAX_VISIBLE);
  const recent = families.filter(item => {
    const age = daysSince(item.publishedAt, today);
    return age >= 0 && age < NEWS_WINDOW_DAYS;
  });
  const reviewTargets = new Map();
  visible.concat(recent).forEach(item => reviewTargets.set(item.familyKey, item));
  for (const item of reviewTargets.values()) {
    const old = priorByFamily.get(item.familyKey);
    item.review = await bestReview(item.title, old && old.review);
    delete item.sourceOrder;
    await new Promise(resolve => setTimeout(resolve, apiKey ? 90 : 450));
  }
  const byKey = new Map(Array.from(reviewTargets.values()).map(item => [item.familyKey, item]));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generated: today,
    categoryUrl: CATEGORY_URL,
    source: 'Smokee Mod-uri',
    items: visible.map(item => byKey.get(item.familyKey)),
    recentItems: recent.map(item => byKey.get(item.familyKey))
  };
}

function replaceIndexBlock(html, feed) {
  const start = html.indexOf(START_MARKER);
  const end = html.indexOf(END_MARKER);
  if (start < 0 || end < 0 || end <= start) throw new Error('AUTO-SMOKEE-MODS markers are missing from index.html');
  const before = html.slice(0, start + START_MARKER.length);
  const after = html.slice(end);
  const json = JSON.stringify(feed).replace(/</g, '\\u003c');
  return `${before}\n${json}\n${after}`;
}

function validateFeed(feed) {
  const errors = [];
  if (!feed || feed.schemaVersion !== 1) errors.push('invalid schemaVersion');
  if (!Array.isArray(feed.items) || feed.items.length !== MAX_VISIBLE) errors.push(`expected exactly ${MAX_VISIBLE} visible mod families`);
  const keys = new Set();
  (feed.items || []).forEach(item => {
    if (!item.title || !item.url || !item.image || !item.description) errors.push(`incomplete item: ${item.title || item.url || 'unknown'}`);
    if (!/^https:\/\/smokee\.ro\/product\//.test(item.url || '')) errors.push(`invalid product URL: ${item.url}`);
    if (keys.has(item.familyKey)) errors.push(`duplicate family: ${item.title}`);
    keys.add(item.familyKey);
    if (item.review && !/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/.test(item.review.url || '')) errors.push(`invalid review URL: ${item.title}`);
  });
  return errors;
}

async function main() {
  const previous = readPrevious();
  let products;
  try {
    products = await loadProducts();
  } catch (error) {
    if (previous.items && previous.items.length === MAX_VISIBLE) {
      console.warn(`Smokee mods unavailable; keeping last valid catalog: ${error.message}`);
      return;
    }
    throw error;
  }
  const feed = await buildFeed(products, previous);
  const errors = validateFeed(feed);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Smokee mods: ${products.length} products scanned, ${feed.items.length} latest unique models, ${feed.recentItems.length} new in the last ${NEWS_WINDOW_DAYS} days.`);
  feed.items.forEach(item => console.log(`- ${item.title} | ${item.publishedAt || 'date unavailable'} | ${item.review ? `${item.review.viewCount} YouTube views` : 'review pending'}`));
  if (!write || dryRun) return;
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(feed, null, 2)}\n`, 'utf8');
  fs.writeFileSync(INDEX_PATH, replaceIndexBlock(html, feed), 'utf8');
}

module.exports = { dedupeFamilies, familyKey, familyName, reviewMatches, validateFeed };

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
