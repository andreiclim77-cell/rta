#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { loadCatalog, publicAtomName, slugify } = require('./catalog-data');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const JSON_OUTPUT = path.join(DATA_DIR, 'youtube-reviews.json');
const JS_OUTPUT = path.join(DATA_DIR, 'youtube-reviews.js');
const FETCH_TIMEOUT_MS = 12000;
const PUBLIC_CONCURRENCY = 1;
const API_CONCURRENCY = 3;
const MIN_VIDEO_SECONDS = 75;
const MAX_PER_KIND = 2;
const PUBLIC_TARGET_BATCH = 16;
const DISCOVERY_QUERIES = [
  'MTL RTA review',
  'MTL RTA build',
  'atomizzatore MTL RTA recensione',
  'MTL RTA rigenerazione'
];

const args = process.argv.slice(2);
const write = args.includes('--write');
const checkOnly = args.includes('--check');
const force = args.includes('--force');
const limit = Math.max(0, Number(valueAfter('--limit') || 0));
const apiKey = process.env.YOUTUBE_API_KEY || '';

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

function readFeed() {
  try {
    return JSON.parse(fs.readFileSync(JSON_OUTPUT, 'utf8'));
  } catch (error) {
    return { schemaVersion: 1, models: {} };
  }
}

function normalize(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\+/g, ' plus ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/\bv\s+(\d)/g, 'v$1')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\bv\s+(\d)/g, 'v$1')
    .replace(/\s+/g, ' ')
    .trim();
}

const TOKEN_STOP = new Set([
  'rta', 'mtl', 'atomizor', 'atomizer', 'atomizzatore', 'review', 'recenzie',
  'recensione', 'build', 'rebuild', 'wick', 'wicking', 'coil', 'setup', 'tutorial',
  'by', 'mods', 'mod', 'vape', 'systems', 'system', 'tech', 'official', 'the'
]);
const NUMBER_WORDS = new Set(['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']);
const BRAND_TOKENS = new Set([
  'ambition', 'arcana', 'atmizoo', 'auguse', 'augvape', 'aspire', 'bd', 'bp', 'centenary',
  'cthulhu', 'ennequadro', 'fakirs', 'gd', 'gus', 'hellvape', 'hussar', 'innokin', 'khonsu',
  'khw', 'monarchy', 'pipeline', 'smokerstore', 'svoemesto', 'taifun', 'kayfun', 'vandy',
  'vapefly', 'vapor', 'wotofo', 'yg'
]);
const VARIANT_MODIFIERS = new Set([
  'prime', 'cubed', 'pro', 'mini', 'nano', 'plus', 'finale', 'final', 'lite', 'micro', 'max', 'xl'
]);

function identityTokens(value) {
  let tokens = normalize(value).split(' ').filter(Boolean).filter(token => !TOKEN_STOP.has(token));
  const hasLongNumber = tokens.some(token => /^\d{3,}$/.test(token));
  if (hasLongNumber) tokens = tokens.filter(token => !NUMBER_WORDS.has(token));
  tokens.forEach(token => {
    const version = token.match(/^v(\d+(?:\d+)?)$/);
    if (version && !tokens.includes(version[1])) tokens.push(version[1]);
  });
  return Array.from(new Set(tokens));
}

function versionTokens(value) {
  const text = String(value || '').toLowerCase().replace(/,/g, '.');
  const out = [];
  let match;
  const versionPattern = /\bv\s*\.?\s*(\d+(?:\.\d+)?)\b|\b(?:version|versiune)\s*(\d+(?:\.\d+)?)\b|\b(20\d{2})\b/g;
  while ((match = versionPattern.exec(text))) out.push(match[3] || `v${match[1] || match[2]}`);
  const slashVersion = text.match(/\/\s*(\d+(?:\.\d+)?)\s*$/);
  if (slashVersion) out.push(`v${slashVersion[1]}`);
  return Array.from(new Set(out));
}

function identityGroups(modelName) {
  const raw = String(modelName || '');
  const full = identityTokens(raw);
  const groups = [full];
  if (raw.includes('/')) {
    const parts = raw.split('/').map(part => part.trim()).filter(Boolean);
    const left = identityTokens(parts[0]);
    if (left.length) groups.push(left);
    parts.slice(1).forEach(part => {
      const right = identityTokens(part);
      if (!right.length || right.every(token => /^\d+$/.test(token))) return;
      const anchors = left.filter(token => !/^\d+$/.test(token)).slice(0, 2);
      groups.push(Array.from(new Set(anchors.concat(right))));
      if (right.length === 1 && right[0].length >= 3) groups.push(right);
    });
  }
  return groups.filter(group => group.length).filter((group, index, all) => {
    const key = group.join('|');
    return all.findIndex(candidate => candidate.join('|') === key) === index;
  });
}

function singleModelCores(modelName) {
  const parts = String(modelName || '').split('/').map(part => part.trim()).filter(Boolean);
  const cores = [];
  parts.forEach(part => {
    const versions = new Set(versionTokens(part).flatMap(version => [version, version.replace(/^v/, '').split('.')[0]]));
    const tokens = identityTokens(part).filter(token => !BRAND_TOKENS.has(token) && !versions.has(token));
    if (tokens.length === 1 && !/^\d+$/.test(tokens[0])) cores.push(tokens[0]);
  });
  if (!cores.length) {
    const versions = new Set(versionTokens(modelName).flatMap(version => [version, version.replace(/^v/, '').split('.')[0]]));
    const tokens = identityTokens(modelName).filter(token => !BRAND_TOKENS.has(token) && !versions.has(token));
    if (tokens.length === 1 && !/^\d+$/.test(tokens[0])) cores.push(tokens[0]);
  }
  return Array.from(new Set(cores));
}

function safeSingleCoreOccurrence(modelName, videoTitle) {
  const cores = singleModelCores(modelName);
  if (!cores.length) return true;
  const tokens = normalize(videoTitle).split(' ').filter(Boolean);
  const expectedVersions = new Set(versionTokens(modelName).flatMap(version => [version, version.replace(/^v/, '').split('.')[0]]));
  const presentCores = cores.filter(core => tokens.includes(core));
  if (!presentCores.length) return true;
  function badNeighbor(token, adjacentUnit) {
    if (!token || expectedVersions.has(token)) return false;
    if (/^v\d/.test(token)) return true;
    if (/^[2-9]$/.test(token) && !/^(?:mm|ml)$/.test(adjacentUnit || '')) return true;
    return VARIANT_MODIFIERS.has(token);
  }
  return presentCores.some(core => tokens.some((token, index) => {
    if (token !== core) return false;
    const before = tokens[index - 1] || '';
    const after = tokens[index + 1] || '';
    const beforeUnit = tokens[index - 2] || '';
    const afterUnit = tokens[index + 2] || '';
    return !badNeighbor(before, beforeUnit) && !badNeighbor(after, afterUnit);
  }));
}

function exactModelMatch(modelName, videoTitle) {
  if (/\b(?:rda|rdta)\b/i.test(videoTitle) && !/\b(?:rda|rdta)\b/i.test(modelName)) return false;
  const titleTokens = new Set(identityTokens(videoTitle).concat(normalize(videoTitle).split(' ')));
  const groups = identityGroups(modelName);
  if (!groups.some(group => group.every(token => titleTokens.has(token)))) return false;

  const expectedVersions = versionTokens(modelName);
  const titleVersions = versionTokens(videoTitle);
  if (expectedVersions.length && !expectedVersions.every(version => titleVersions.includes(version))) return false;
  if (expectedVersions.length && titleVersions.some(version => !expectedVersions.includes(version))) return false;
  if (!expectedVersions.length && titleVersions.length) return false;

  if (expectedVersions.length) {
    const versionNumbers = new Set(expectedVersions.map(version => version.replace(/^v/, '').split('.')[0]));
    const core = identityTokens(modelName).filter(token => !/^v\d/.test(token) && !versionNumbers.has(token));
    if (core.length === 1) {
      const title = normalize(videoTitle);
      const corePattern = core[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const generic = '(?:\\s+(?:rta|mtl|atomizer|atomizor|mods?|review|build|by)){0,4}\\s+';
      const joined = expectedVersions.some(version => {
        const versionPattern = version.replace(/^v/, 'v').replace(/\./g, '\\s*');
        return new RegExp(`\\b${corePattern}${generic}${versionPattern}\\b|\\b${versionPattern}${generic}${corePattern}\\b`).test(title);
      });
      if (!joined) return false;
    }
  }
  if (!safeSingleCoreOccurrence(modelName, videoTitle)) return false;
  return true;
}

function runsText(value) {
  if (!value) return '';
  if (typeof value.simpleText === 'string') return value.simpleText;
  if (Array.isArray(value.runs)) return value.runs.map(run => run && run.text || '').join('');
  return '';
}

function durationSeconds(value) {
  const parts = String(value || '').split(':').map(Number);
  if (!parts.length || parts.some(part => !Number.isFinite(part))) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function parseViewCount(value) {
  const text = String(value || '').toLowerCase().replace(/\u00a0/g, ' ').trim();
  const match = text.match(/([\d.,]+)\s*([kmb])?/i);
  if (!match) return 0;
  const suffix = String(match[2] || '').toLowerCase();
  let amount;
  if (suffix) {
    amount = Number(match[1].replace(/,/g, '.'));
  } else {
    amount = Number(match[1].replace(/[^\d]/g, ''));
  }
  if (!Number.isFinite(amount)) return 0;
  const multiplier = suffix === 'k' ? 1000 : suffix === 'm' ? 1000000 : suffix === 'b' ? 1000000000 : 1;
  return Math.max(0, Math.round(amount * multiplier));
}

function assignedJson(html, marker) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = html.indexOf('{', markerIndex + marker.length);
  if (start < 0) return null;
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < html.length; index += 1) {
    const char = html[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return JSON.parse(html.slice(start, index + 1));
    }
  }
  return null;
}

function parseYouTubeSearch(html) {
  let data = null;
  for (const marker of ['var ytInitialData =', 'ytInitialData =', 'window["ytInitialData"] =']) {
    try {
      data = assignedJson(html, marker);
      if (data) break;
    } catch (error) {
      data = null;
    }
  }
  if (!data) throw new Error('YouTube search data was not found');

  const videos = [];
  const stack = [data];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.videoRenderer && node.videoRenderer.videoId) {
      const video = node.videoRenderer;
      videos.push({
        videoId: video.videoId,
        title: runsText(video.title),
        channel: runsText(video.ownerText || video.shortBylineText),
        publishedText: runsText(video.publishedTimeText),
        viewCount: parseViewCount(runsText(video.viewCountText || video.shortViewCountText)),
        durationSeconds: durationSeconds(runsText(video.lengthText)),
        live: Boolean(video.upcomingEventData || video.badges && video.badges.some(badge => /live/i.test(runsText(badge.metadataBadgeRenderer && badge.metadataBadgeRenderer.label))))
      });
    }
    Object.values(node).forEach(value => {
      if (value && typeof value === 'object') stack.push(value);
    });
  }
  const seen = new Set();
  return videos.filter(video => video.title && !seen.has(video.videoId) && seen.add(video.videoId));
}

function videoKind(title) {
  return /\b(build|rebuild|wick|wicking|coil|rigenerazione|rigenerare|montaggio|setup|tutorial|raw build)\b/i.test(title) ? 'build' : 'review';
}

function isClone(title) {
  return /\b(clone|clona|replica|sxk|yftk|ulton|kindbright|coppervape|5avape|vapeasy)\b/i.test(title);
}

function selectVideos(modelName, videos, previous) {
  const today = todayInRomania();
  const previousById = new Map((previous || []).map(video => [video.videoId, video]));
  const selected = videos.filter(video => {
    if (!exactModelMatch(modelName, video.title)) return false;
    if (video.live) return false;
    return !video.durationSeconds || video.durationSeconds >= MIN_VIDEO_SECONDS;
  }).map(video => {
    const old = previousById.get(video.videoId) || {};
    return {
      videoId: video.videoId,
      title: video.title,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      kind: videoKind(video.title),
      scope: isClone(video.title) ? 'clone' : 'original',
      channel: video.channel || old.channel || '',
      publishedText: video.publishedText || old.publishedText || '',
      viewCount: Math.max(0, Number(video.viewCount || old.viewCount || 0)),
      firstSeenAt: old.firstSeenAt || today,
      lastSeenAt: today
    };
  });

  const byId = new Map();
  (previous || []).filter(old => exactModelMatch(modelName, old.title)).forEach(video => byId.set(video.videoId, video));
  selected.forEach(video => byId.set(video.videoId, Object.assign({}, byId.get(video.videoId) || {}, video)));
  const combined = Array.from(byId.values());
  const output = [];
  ['review', 'build'].forEach(kind => {
    const candidates = combined.filter(video => video.kind === kind);
    const originals = candidates.filter(video => video.scope !== 'clone');
    const pool = originals.length ? originals : candidates;
    pool.sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0) || String(a.firstSeenAt || '').localeCompare(String(b.firstSeenAt || '')) || a.videoId.localeCompare(b.videoId));
    pool.slice(0, MAX_PER_KIND).forEach(video => output.push(video));
  });
  return output;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function searchWithApi(modelName) {
  const query = `${modelName} RTA review build`;
  const params = new URLSearchParams({
    part: 'snippet', type: 'video', maxResults: '20', order: 'viewCount', q: query, key: apiKey
  });
  const response = await fetchWithTimeout(`https://www.googleapis.com/youtube/v3/search?${params}`);
  const data = await response.json();
  const searchItems = (data.items || []).filter(item => item.id && item.id.videoId);
  const ids = searchItems.map(item => item.id.videoId);
  let statistics = new Map();
  if (ids.length) {
    const detailsParams = new URLSearchParams({
      part: 'statistics',
      id: ids.join(','),
      key: apiKey
    });
    const detailsResponse = await fetchWithTimeout(`https://www.googleapis.com/youtube/v3/videos?${detailsParams}`);
    const details = await detailsResponse.json();
    statistics = new Map((details.items || []).map(item => [item.id, Math.max(0, Number(item.statistics && item.statistics.viewCount || 0))]));
  }
  return searchItems.map(item => ({
    videoId: item.id && item.id.videoId || '',
    title: item.snippet && item.snippet.title || '',
    channel: item.snippet && item.snippet.channelTitle || '',
    publishedText: item.snippet && item.snippet.publishedAt || '',
    viewCount: statistics.get(item.id.videoId) || 0,
    durationSeconds: 0,
    live: item.snippet && item.snippet.liveBroadcastContent && item.snippet.liveBroadcastContent !== 'none'
  })).filter(video => video.videoId);
}

async function searchPublicQuery(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en&gl=US`;
  const response = await fetchWithTimeout(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.8'
    }
  });
  return parseYouTubeSearch(await response.text());
}

async function searchPublicPage(modelName) {
  return searchPublicQuery(`${modelName} RTA review build`);
}

async function searchModel(modelName) {
  const videos = apiKey ? await searchWithApi(modelName) : await searchPublicPage(modelName);
  return { videos, mode: apiKey ? 'youtube-data-api' : 'youtube-public-search' };
}

function validateFeed(feed) {
  const errors = [];
  if (!feed || feed.schemaVersion !== 1) errors.push('invalid schemaVersion');
  if (!feed || !feed.models || typeof feed.models !== 'object') errors.push('models map is missing');
  Object.values(feed && feed.models || {}).forEach(entry => {
    if (!entry.name) errors.push('model entry without name');
    (entry.videos || []).forEach(video => {
      if (!/^[A-Za-z0-9_-]{11}$/.test(video.videoId || '')) errors.push(`${entry.name}: invalid video id`);
      if (video.url !== `https://www.youtube.com/watch?v=${video.videoId}`) errors.push(`${entry.name}: invalid direct URL`);
      if (!['review', 'build'].includes(video.kind)) errors.push(`${entry.name}: invalid video kind`);
      if (video.viewCount != null && (!Number.isFinite(Number(video.viewCount)) || Number(video.viewCount) < 0)) errors.push(`${entry.name}: invalid view count`);
      if (!exactModelMatch(entry.name, video.title)) errors.push(`${entry.name}: title does not identify the exact model: ${video.title}`);
    });
  });
  return errors;
}

function writeAtomic(file, content) {
  const temp = `${file}.tmp`;
  fs.writeFileSync(temp, content, 'utf8');
  fs.renameSync(temp, file);
}

function saveFeed(feed) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const json = `${JSON.stringify(feed, null, 2)}\n`;
  const scriptJson = JSON.stringify(feed).replace(/</g, '\\u003c');
  writeAtomic(JSON_OUTPUT, json);
  writeAtomic(JS_OUTPUT, `window.RTA_YOUTUBE_REVIEW_FEED=${scriptJson};\n`);
}

async function main() {
  const previous = readFeed();
  if (checkOnly) {
    const errors = validateFeed(previous);
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(`YouTube review data valid: ${Object.keys(previous.models || {}).length} model entries.`);
    return;
  }

  const today = todayInRomania();
  const catalog = loadCatalog(ROOT);
  const seen = new Set();
  const catalogModels = catalog.atomizers.map(atom => ({ name: publicAtomName(atom.name), addedAt: atom.addedAt || '' })).filter(entry => {
    const name = entry.name;
    const key = normalize(name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));
  const allNames = catalogModels.map(entry => entry.name);

  if (!force && !limit && previous.complete && String(previous.generatedAt || '').slice(0, 10) === today && previous.totalModels === allNames.length) {
    console.log(`YouTube reviews already checked today for ${allNames.length} models.`);
    return;
  }

  const models = Object.assign({}, previous.models || {});
  const failures = [];
  let discoveryVideos = [];
  let discoveryChecked = 0;
  let discoveryFailures = 0;

  if (!apiKey) {
    for (const query of DISCOVERY_QUERIES) {
      try {
        const videos = await searchPublicQuery(query);
        discoveryVideos = discoveryVideos.concat(videos);
        discoveryChecked += 1;
      } catch (error) {
        discoveryFailures += 1;
        failures.push(`Discovery ${query}: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 550));
    }
    const discoverySeen = new Set();
    discoveryVideos = discoveryVideos.filter(video => !discoverySeen.has(video.videoId) && discoverySeen.add(video.videoId));
    if (discoveryChecked) {
      allNames.forEach(modelName => {
        const slug = slugify(modelName);
        const old = models[slug] || { name: modelName, videos: [] };
        const exact = discoveryVideos.filter(video => exactModelMatch(modelName, video.title));
        models[slug] = Object.assign({}, old, {
          name: modelName,
          discoveryCheckedAt: today,
          discoveryMatches: exact.length,
          videos: selectVideos(modelName, exact, old.videos || [])
        });
      });
    }
  }

  const recentCutoff = new Date(`${today}T00:00:00Z`).getTime() - 7 * 86400000;
  const targetModels = catalogModels.slice().sort((a, b) => {
    const aRecent = Date.parse(a.addedAt || '') >= recentCutoff ? 0 : 1;
    const bRecent = Date.parse(b.addedAt || '') >= recentCutoff ? 0 : 1;
    if (aRecent !== bRecent) return aRecent - bRecent;
    const aChecked = models[slugify(a.name)] && models[slugify(a.name)].checkedAt || '';
    const bChecked = models[slugify(b.name)] && models[slugify(b.name)].checkedAt || '';
    return aChecked.localeCompare(bChecked) || a.name.localeCompare(b.name);
  });
  let names = apiKey ? allNames : targetModels.slice(0, PUBLIC_TARGET_BATCH).map(entry => entry.name);
  if (limit) names = names.slice(0, limit);

  let cursor = 0;
  let checked = 0;
  let sourceMode = apiKey ? 'youtube-data-api' : 'youtube-public-search';

  async function worker() {
    while (cursor < names.length) {
      const modelName = names[cursor++];
      const slug = slugify(modelName);
      const old = models[slug] || { name: modelName, videos: [] };
      try {
        const result = await searchModel(modelName);
        sourceMode = result.mode;
        const videos = selectVideos(modelName, result.videos, old.videos || []);
        models[slug] = Object.assign({}, old, {
          name: modelName,
          checkedAt: today,
          exactMatches: result.videos.filter(video => exactModelMatch(modelName, video.title)).length,
          videos
        });
        checked += 1;
      } catch (error) {
        failures.push(`${modelName}: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, apiKey ? 80 : 650));
    }
  }

  const concurrency = Math.min(names.length || 1, apiKey ? API_CONCURRENCY : PUBLIC_CONCURRENCY);
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  if (!checked && !discoveryChecked && Object.keys(previous.models || {}).length) {
    console.warn('YouTube was temporarily unavailable; the last valid review list was preserved.');
    return;
  }

  const totalModels = allNames.length;
  const directVideos = Object.values(models).reduce((sum, entry) => sum + (entry.videos || []).length, 0);
  const complete = !limit && (apiKey
    ? checked >= Math.ceil(names.length * 0.85)
    : discoveryChecked === DISCOVERY_QUERIES.length && checked === names.length);
  const feed = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceMode,
    totalModels,
    checkedModels: checked,
    discoveryQueries: discoveryChecked,
    discoveryVideos: discoveryVideos.length,
    directVideos,
    complete,
    models
  };
  const errors = validateFeed(feed);
  if (errors.length) throw new Error(errors.join('\n'));

  if (write) saveFeed(feed);
  console.log(`YouTube reviews: ${discoveryChecked}/${DISCOVERY_QUERIES.length} discovery searches, ${checked}/${names.length} targeted models, ${directVideos} current direct links, ${discoveryFailures + Math.max(0, failures.length - discoveryFailures)} temporary failures.${write ? ' Files updated.' : ''}`);
  if (failures.length) console.warn(failures.slice(0, 12).join('\n'));
}

module.exports = {
  exactModelMatch,
  identityTokens,
  parseViewCount,
  parseYouTubeSearch,
  selectVideos,
  validateFeed,
  versionTokens
};

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
