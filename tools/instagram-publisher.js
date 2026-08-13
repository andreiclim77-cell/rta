#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  loadCatalog,
  slugify
} = require('./catalog-data');
const {
  atomizerImageCandidates,
  brandedProductImageBuffer,
  canonicalAtomizerFamilyKey,
  canonicalAtomizerSlug,
  dateInRomania,
  modCatalogCandidates,
  modFamilyKey,
  uniqueAtomizers
} = require('./facebook-publisher');

const ROOT = path.resolve(__dirname, '..');
const CAMPAIGN_STATE_PATH = path.join(ROOT, 'data', 'facebook-campaign-state.json');
const FACEBOOK_STATE_PATH = path.join(ROOT, 'data', 'facebook-publish-state.json');
const FACEBOOK_PHOTO_STATE_PATH = path.join(ROOT, 'data', 'facebook-hourly-photo-state.json');
const INSTAGRAM_STATE_PATH = path.join(ROOT, 'data', 'instagram-publish-state.json');
const SOCIAL_REELS_STATE_PATH = path.join(ROOT, 'data', 'social-reels-state.json');
const MODS_PATH = path.join(ROOT, 'data', 'smokee-mods.json');
const ASSET_DIR = path.join(ROOT, 'assets', 'instagram');
const SITE = 'https://ghid-rta.ro';
const DEFAULT_GRAPH_VERSION = 'v25.0';
const DEFAULT_DAILY_LIMIT = 4;
const DEFAULT_MAX_POSTS = 1;
const MIRROR_FORMAT_VERSION = 'instagram-exact-product-photo-v1';
const MANUAL_SOURCE = 'facebook-page-api-manual';
const MANUAL_POSTS_PER_PAGE = 100;
const MAX_MANUAL_PAGES = 100;

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const verifyConnectionOnly = args.includes('--verify-connection');
const prepareOnly = args.includes('--prepare');
const publishPreparedOnly = args.includes('--publish-prepared');
const pendingCountOnly = args.includes('--pending-count');
const maxPosts = Math.max(1, Number(valueAfter('--max-posts') || DEFAULT_MAX_POSTS));
const dailyLimit = Math.max(1, Number(valueAfter('--daily-limit') || DEFAULT_DAILY_LIMIT));
const pageId = String(process.env.FACEBOOK_PAGE_ID || '').trim();
const accessToken = String(process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '').trim();
const graphVersion = String(process.env.FACEBOOK_GRAPH_VERSION || DEFAULT_GRAPH_VERSION).trim();

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : '';
}

function nowIso() {
  return new Date().toISOString();
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function writeJsonAtomic(filePath, value) {
  const temporary = `${filePath}.${process.pid}.tmp`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, filePath);
}

function emptyInstagramState() {
  return {
    schemaVersion: 1,
    startedAt: '',
    updatedAt: '',
    pageId: '',
    instagramUserId: '',
    username: '',
    dailyLimit: DEFAULT_DAILY_LIMIT,
    backfill: {
      total: 0,
      completed: 0,
      remaining: 0,
      updatedAt: ''
    },
    queue: [],
    manualFacebookRecords: {},
    mirroredFacebookPosts: {},
    mirroredFamilies: {},
    history: []
  };
}

function pruneGeneratedReelEchoes(state) {
  const echoIds = Object.entries(state.mirroredFacebookPosts || {})
    .filter(([, record]) => record
      && record.productType === 'manual'
      && record.source === 'instagram-existing-media-detected'
      && /instagram\.com\/reel\//i.test(String(record.permalink || '')))
    .map(([sourcePostId]) => sourcePostId);
  for (const sourcePostId of echoIds) {
    const record = state.mirroredFacebookPosts[sourcePostId];
    if (record && state.mirroredFamilies[record.identity]
      && state.mirroredFamilies[record.identity].sourcePostId === sourcePostId) {
      delete state.mirroredFamilies[record.identity];
    }
    delete state.mirroredFacebookPosts[sourcePostId];
    delete state.manualFacebookRecords[sourcePostId];
  }
  if (echoIds.length) {
    const echoes = new Set(echoIds);
    state.queue = state.queue.filter(item => !echoes.has(item.sourcePostId));
    state.history = state.history.filter(item => !echoes.has(item.sourcePostId));
  }
  return echoIds.length;
}

function normalizeInstagramState(value) {
  const state = value && typeof value === 'object' ? value : emptyInstagramState();
  state.schemaVersion = 1;
  state.startedAt = String(state.startedAt || '');
  state.updatedAt = String(state.updatedAt || '');
  state.pageId = String(state.pageId || '');
  state.instagramUserId = String(state.instagramUserId || '');
  state.username = String(state.username || '');
  state.dailyLimit = Math.max(1, Number(state.dailyLimit || DEFAULT_DAILY_LIMIT));
  state.backfill = state.backfill && typeof state.backfill === 'object'
    ? state.backfill
    : { total: 0, completed: 0, remaining: 0, updatedAt: '' };
  state.queue = Array.isArray(state.queue) ? state.queue : [];
  state.manualFacebookRecords = state.manualFacebookRecords && typeof state.manualFacebookRecords === 'object'
    ? state.manualFacebookRecords
    : {};
  state.mirroredFacebookPosts = state.mirroredFacebookPosts && typeof state.mirroredFacebookPosts === 'object'
    ? state.mirroredFacebookPosts
    : {};
  state.mirroredFamilies = state.mirroredFamilies && typeof state.mirroredFamilies === 'object'
    ? state.mirroredFamilies
    : {};
  state.history = Array.isArray(state.history) ? state.history : [];
  pruneGeneratedReelEchoes(state);
  return state;
}

function syncBackfillSummary(state, records, timestamp = nowIso()) {
  const remaining = records.filter(record => {
    const identity = recordIdentity(record);
    return !state.mirroredFacebookPosts[record.sourcePostId] && !state.mirroredFamilies[identity];
  }).length;
  state.backfill = {
    total: records.length,
    completed: records.length - remaining,
    remaining,
    updatedAt: timestamp
  };
  state.updatedAt = timestamp;
  return state.backfill;
}

function recordProductType(entry) {
  const type = String(entry && (entry.productType || entry.type) || '').toLowerCase();
  if (type === 'manual') return 'manual';
  if (type === 'editorial') return 'editorial';
  if (type === 'mod' || String(entry && entry.key || '').startsWith('mod:')) return 'mod';
  return 'atomizer';
}

function recordFamilyKey(entry) {
  const type = recordProductType(entry);
  if (type === 'manual') return slugify(entry && (entry.sourcePostId || entry.postId || entry.familyKey || entry.key));
  if (type === 'editorial') return slugify(entry && (entry.familyKey || entry.key || entry.name));
  if (type === 'mod') {
    return modFamilyKey({ familyKey: entry && entry.familyKey, title: entry && entry.name }) || slugify(entry && entry.name);
  }
  return canonicalAtomizerFamilyKey(entry && (entry.familyKey || entry.name || entry.slug))
    || canonicalAtomizerSlug(entry && (entry.name || entry.slug));
}

function recordIdentity(entry) {
  return `${recordProductType(entry)}:${recordFamilyKey(entry)}`;
}

function canonicalManualMediaUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    const nested = parsed.searchParams.get('url');
    if (nested && nested !== raw) return canonicalManualMediaUrl(nested);
    const pathName = decodeURIComponent(parsed.pathname).replace(/\/+$/, '').toLowerCase();
    const fileName = pathName.split('/').filter(Boolean).pop() || pathName;
    return fileName || `${parsed.hostname.toLowerCase()}${pathName}`;
  } catch (error) {
    return raw.split(/[?#]/, 1)[0].replace(/\/+$/, '').toLowerCase();
  }
}

function manualContentFingerprint(entry) {
  if (recordProductType(entry) !== 'manual') return '';
  const images = Array.from(new Set([].concat(entry && entry.images || [], entry && entry.image || '')
    .map(canonicalManualMediaUrl)
    .filter(Boolean)))
    .sort();
  if (!images.length) return '';
  return crypto.createHash('sha256').update(images.join('\n')).digest('hex');
}

function preferredManualRecord(first, second) {
  const score = record => {
    const message = String(record && record.message || '').trim();
    const genericName = /^Postare Facebook\b/i.test(String(record && record.name || ''));
    return (message ? 2 : 0) + (genericName ? 0 : 1);
  };
  const firstScore = score(first);
  const secondScore = score(second);
  if (firstScore !== secondScore) return firstScore > secondScore ? first : second;
  const firstTime = String(first && first.sourcePublishedAt || first && first.publishedAt || '');
  const secondTime = String(second && second.sourcePublishedAt || second && second.publishedAt || '');
  if (firstTime !== secondTime) return firstTime < secondTime ? first : second;
  return String(first && first.sourcePostId || '').localeCompare(String(second && second.sourcePostId || '')) <= 0
    ? first
    : second;
}

function dedupeManualFacebookRecords(records) {
  const output = [];
  const positionByFingerprint = new Map();
  for (const record of [].concat(records || [])) {
    if (recordProductType(record) !== 'manual') {
      output.push(record);
      continue;
    }
    const fingerprint = manualContentFingerprint(record);
    if (!fingerprint) {
      output.push(record);
      continue;
    }
    if (!positionByFingerprint.has(fingerprint)) {
      positionByFingerprint.set(fingerprint, output.length);
      output.push(record);
      continue;
    }
    const index = positionByFingerprint.get(fingerprint);
    output[index] = preferredManualRecord(output[index], record);
  }
  return output;
}

function normalizeFacebookRecord(entry, source) {
  const postId = String(entry && entry.postId || '').trim();
  const name = String(entry && entry.name || '').trim();
  const familyKey = recordFamilyKey(entry);
  if (!postId || !name || !familyKey) return null;
  return {
    source,
    sourcePostId: postId,
    sourcePublishedAt: String(entry.publishedAt || entry.originalPublishedAt || ''),
    productType: recordProductType(entry),
    familyKey,
    slug: String(entry.slug || '').trim(),
    key: String(entry.key || '').trim(),
    name,
    image: String(entry.image || '').trim(),
    images: [].concat(entry.images || []).map(value => String(value || '').trim()).filter(Boolean),
    message: String(entry.message || '')
  };
}

function collectFacebookRecords(campaignState, facebookState, photoState, manualRecords = []) {
  const records = [];
  [].concat(campaignState && campaignState.history || []).forEach(entry => {
    const normalized = normalizeFacebookRecord(entry, 'facebook-campaign-state');
    if (normalized) records.push(normalized);
  });
  [].concat(facebookState && facebookState.history || []).forEach(entry => {
    const normalized = normalizeFacebookRecord(entry, 'facebook-publish-state');
    if (normalized) records.push(normalized);
  });
  [].concat(photoState && photoState.history || []).forEach((entry, index) => {
    const normalized = normalizeFacebookRecord({
      ...entry,
      type: 'editorial',
      familyKey: entry && entry.key,
      slug: entry && entry.key,
      name: `Cadru RTA MTL ${String(index + 1).padStart(2, '0')}`
    }, 'facebook-hourly-photo-state');
    if (normalized) records.push(normalized);
  });
  [].concat(manualRecords || []).forEach(entry => {
    const normalized = normalizeFacebookRecord(entry, MANUAL_SOURCE);
    if (normalized) records.push(normalized);
  });
  const contentDeduplicated = dedupeManualFacebookRecords(records);
  contentDeduplicated.sort((a, b) => String(b.sourcePublishedAt).localeCompare(String(a.sourcePublishedAt)) || a.name.localeCompare(b.name));

  const newestByIdentity = new Map();
  for (const record of contentDeduplicated) {
    const identity = recordIdentity(record);
    if (!newestByIdentity.has(identity)) newestByIdentity.set(identity, record);
  }
  return Array.from(newestByIdentity.values());
}

function exactAtomizerForRecord(record, catalog) {
  const atoms = uniqueAtomizers(catalog);
  const keySlug = String(record.key || '').split(':')[1] || '';
  const targetSlugs = new Set([
    record.slug,
    keySlug,
    canonicalAtomizerSlug(record.name)
  ].filter(Boolean).map(canonicalAtomizerSlug));
  const exact = atoms.filter(atom => targetSlugs.has(canonicalAtomizerSlug(atom.name)));
  if (exact.length === 1) return exact[0];

  const targetFamily = record.familyKey || canonicalAtomizerFamilyKey(record.name);
  const familyMatches = atoms.filter(atom => canonicalAtomizerFamilyKey(atom.name) === targetFamily);
  return familyMatches.length === 1 ? familyMatches[0] : null;
}

function exactModForRecord(record, modsFeed) {
  const mods = modCatalogCandidates(modsFeed);
  const targetFamily = record.familyKey || modFamilyKey({ title: record.name });
  const familyMatches = mods.filter(mod => modFamilyKey(mod) === targetFamily);
  if (familyMatches.length === 1) return familyMatches[0];
  const targetSlug = slugify(record.name);
  const titleMatches = mods.filter(mod => slugify(mod.title) === targetSlug);
  return titleMatches.length === 1 ? titleMatches[0] : null;
}

function resolveEventForRecord(record, catalog, modsFeed) {
  if (record.productType === 'manual') {
    return {
      type: 'manual',
      productType: 'manual',
      familyKey: record.familyKey,
      slug: record.familyKey,
      name: record.name,
      message: record.message,
      images: record.images,
      preserveOriginal: true
    };
  }
  if (record.productType === 'editorial') {
    return {
      type: 'editorial',
      productType: 'editorial',
      familyKey: record.familyKey,
      slug: record.slug || record.familyKey,
      name: record.name,
      image: record.image,
      productImage: record.image,
      preserveBranding: true,
      requiresFacebookAttachment: !/^https:\/\//i.test(record.image)
    };
  }
  if (record.productType === 'mod') {
    const mod = exactModForRecord(record, modsFeed);
    const image = String(mod && mod.image || '').trim();
    return {
      type: 'mod',
      productType: 'mod',
      familyKey: mod ? modFamilyKey(mod) : record.familyKey,
      slug: slugify(mod ? modFamilyKey(mod) : record.familyKey),
      name: String(mod && mod.title || record.name).trim(),
      image,
      productImage: image,
      requiresFacebookAttachment: !/^https:\/\//i.test(image)
    };
  }

  const atom = exactAtomizerForRecord(record, catalog);
  const image = atom ? atomizerImageCandidates(atom)[0] || '' : '';
  return {
    type: 'atomizer',
    productType: 'atomizer',
    familyKey: atom ? canonicalAtomizerFamilyKey(atom.name) : record.familyKey,
    slug: atom ? canonicalAtomizerSlug(atom.name) : canonicalAtomizerSlug(record.name),
    name: atom ? atom.name : record.name,
    image,
    productImage: image,
    requiresFacebookAttachment: !/^https:\/\//i.test(image)
  };
}

function instagramCaption(event) {
  if (event.productType === 'manual') {
    return String(event.message || '').slice(0, 2200);
  }
  const subjectLine = event.productType === 'editorial'
    ? 'Un cadru dedicat configuratiilor RTA MTL si documentatiei tehnice pentru adulti.'
    : event.productType === 'mod'
      ? 'Stabilitatea alimentarii, atomizorul si buildul trebuie evaluate impreuna.'
      : 'Camera de evaporare, alimentarea, geometria airflowului si buildul trebuie evaluate impreuna.';
  return [
    `${SITE}/`,
    'FISA DOCUMENTATA IN GHID',
    event.name,
    '',
    subjectLine,
    '',
    'Redarea coerenta a gustului depinde de potrivirea profilului lichidului, arhitecturii atomizorului si caracteristicilor buildului.',
    '',
    'Pentru modul de utilizare, configurare si detalii, consultati ghidul.',
    '',
    'Documentatie tehnica destinata adultilor 18+.',
    '',
    '#GhidRTA #RTAMTL #RTA #MTL #BuildRTA'
  ].join('\n');
}

function instagramAltText(event) {
  return `Fotografie documentara a produsului ${event.name}, prezentat in ghid-rta.ro.`.slice(0, 1000);
}

function publishedTodayCount(state, timestamp = nowIso()) {
  const targetDate = dateInRomania(timestamp);
  return state.history.filter(entry => dateInRomania(entry.publishedAt) === targetDate).length;
}

function planInstagramMirrors(campaignState, facebookState, instagramState, catalog, modsFeed, options = {}) {
  const limit = Math.max(0, Number(options.maxPosts || DEFAULT_MAX_POSTS));
  const allowed = Math.max(0, Number(options.dailyLimit || instagramState.dailyLimit || DEFAULT_DAILY_LIMIT)
    - publishedTodayCount(instagramState, options.now || nowIso()));
  if (!limit || !allowed) return { candidates: [], skipped: [] };

  const queuedFamilies = new Set(instagramState.queue.map(item => item.identity));
  const records = collectFacebookRecords(campaignState, facebookState, options.photoState, options.manualRecords);
  const candidates = [];
  const skipped = [];
  for (const record of records) {
    const identity = recordIdentity(record);
    if (instagramState.mirroredFacebookPosts[record.sourcePostId]) continue;
    if (record.productType !== 'manual' && instagramState.mirroredFamilies[identity]) continue;
    if (queuedFamilies.has(identity)) continue;
    try {
      const event = resolveEventForRecord(record, catalog, modsFeed);
      candidates.push({ record, event, identity });
      if (candidates.length >= Math.min(limit, allowed)) break;
    } catch (error) {
      skipped.push({ sourcePostId: record.sourcePostId, name: record.name, reason: error.message });
    }
  }
  return { candidates, skipped };
}

function assetFileName(candidate, index = 0, total = 1) {
  const digest = crypto.createHash('sha256').update(candidate.record.sourcePostId).digest('hex').slice(0, 10);
  const suffix = total > 1 ? `-${index + 1}` : '';
  return `${candidate.event.productType}-${candidate.event.slug}-${digest}${suffix}.jpg`;
}

async function remoteImageBuffer(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`Fotografia Facebook nu poate fi citita: HTTP ${response.status}.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 5000) throw new Error('Fotografia Facebook este incompleta.');
  return bytes;
}

async function prepareCandidate(candidate, state, timestamp = nowIso()) {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (error) {
    throw new Error('Pregatirea fotografiei Instagram necesita dependenta Sharp instalata.');
  }
  fs.mkdirSync(ASSET_DIR, { recursive: true });
  if (candidate.event.productType === 'manual') {
    const sourceImages = candidate.event.images.length
      ? candidate.event.images
      : await facebookPostImageUrls(candidate.record.sourcePostId);
    const selectedImages = sourceImages.slice(0, 10);
    if (!selectedImages.length) throw new Error(`Postarea Facebook ${candidate.record.sourcePostId} nu contine fotografii.`);
    const fileNames = [];
    for (let index = 0; index < selectedImages.length; index += 1) {
      const fileName = assetFileName(candidate, index, selectedImages.length);
      const bytes = await remoteImageBuffer(selectedImages[index]);
      await sharp(bytes, { failOn: 'error' })
        .rotate()
        .resize(1080, 1350, {
          fit: 'contain',
          background: { r: 242, g: 244, b: 243, alpha: 1 }
        })
        .flatten({ background: '#f2f4f3' })
        .jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true })
        .toFile(path.join(ASSET_DIR, fileName));
      fileNames.push(fileName);
    }
    const imageUrls = fileNames.map(fileName => `${SITE}/assets/instagram/${encodeURIComponent(fileName)}`);
    const item = {
      sourcePostId: candidate.record.sourcePostId,
      sourcePublishedAt: candidate.record.sourcePublishedAt,
      sourceState: candidate.record.source,
      identity: candidate.identity,
      productType: candidate.event.productType,
      familyKey: candidate.event.familyKey,
      slug: candidate.event.slug,
      name: candidate.event.name,
      sourceImages: selectedImages,
      assetPaths: fileNames.map(fileName => `assets/instagram/${fileName}`),
      imageUrls,
      imageUrl: imageUrls[0],
      caption: instagramCaption(candidate.event),
      altText: instagramAltText(candidate.event),
      formatVersion: MIRROR_FORMAT_VERSION,
      preparedAt: timestamp
    };
    state.queue.push(item);
    state.updatedAt = timestamp;
    state.dailyLimit = dailyLimit;
    if (!state.startedAt) state.startedAt = timestamp;
    return item;
  }

  const fileName = assetFileName(candidate);
  const absolutePath = path.join(ASSET_DIR, fileName);
  if (candidate.event.requiresFacebookAttachment) {
    candidate.event.image = await facebookPostPrimaryImage(candidate.record.sourcePostId);
    candidate.event.productImage = candidate.event.image;
  }
  if (candidate.event.preserveBranding) {
    const relativePath = decodeURIComponent(new URL(candidate.event.image).pathname).replace(/^\/+/, '');
    const sourcePath = path.join(ROOT, relativePath);
    await sharp(sourcePath, { failOn: 'error' })
      .rotate()
      .resize(1200, 1200, {
        fit: 'contain',
        background: { r: 242, g: 244, b: 243, alpha: 1 }
      })
      .flatten({ background: '#f2f4f3' })
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(absolutePath);
  } else {
    const png = await brandedProductImageBuffer(candidate.event);
    await sharp(png)
      .flatten({ background: '#f2f4f3' })
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(absolutePath);
  }

  const item = {
    sourcePostId: candidate.record.sourcePostId,
    sourcePublishedAt: candidate.record.sourcePublishedAt,
    sourceState: candidate.record.source,
    identity: candidate.identity,
    productType: candidate.event.productType,
    familyKey: candidate.event.familyKey,
    slug: candidate.event.slug,
    name: candidate.event.name,
    sourceImage: candidate.event.image,
    assetPath: `assets/instagram/${fileName}`,
    imageUrl: `${SITE}/assets/instagram/${encodeURIComponent(fileName)}`,
    caption: instagramCaption(candidate.event),
    altText: instagramAltText(candidate.event),
    formatVersion: MIRROR_FORMAT_VERSION,
    preparedAt: timestamp
  };
  state.queue.push(item);
  state.updatedAt = timestamp;
  state.dailyLimit = dailyLimit;
  if (!state.startedAt) state.startedAt = timestamp;
  return item;
}

function validateInstagramState(state) {
  const errors = [];
  const queuedPosts = new Set();
  const queuedFamilies = new Set();
  for (const item of state.queue) {
    if (!item.sourcePostId || !item.identity || !item.name || !item.imageUrl) errors.push('Coada Instagram contine o intrare incompleta.');
    const imageUrls = Array.isArray(item.imageUrls) && item.imageUrls.length ? item.imageUrls : [item.imageUrl];
    if (imageUrls.some(url => !/\.jpg$/i.test(url))) errors.push(`Imaginea Instagram pentru ${item.name || 'produs'} nu este JPEG.`);
    if (queuedPosts.has(item.sourcePostId)) errors.push(`Postarea Facebook ${item.sourcePostId} este dublata in coada Instagram.`);
    if (queuedFamilies.has(item.identity)) errors.push(`Modelul ${item.identity} este dublat in coada Instagram.`);
    queuedPosts.add(item.sourcePostId);
    queuedFamilies.add(item.identity);
  }
  return Array.from(new Set(errors));
}

async function graphRequest(endpoint, options = {}) {
  const url = new URL(`https://graph.facebook.com/${graphVersion}/${String(endpoint).replace(/^\//, '')}`);
  if (options.query) Object.entries(options.query).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
    },
    body: options.body ? new URLSearchParams(options.body) : undefined,
    signal: AbortSignal.timeout(options.timeout || 45000)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    const graphError = data.error || {};
    const code = graphError.code ? ` cod ${graphError.code}` : '';
    const subcode = graphError.error_subcode ? `/${graphError.error_subcode}` : '';
    throw new Error(`Meta Graph API${code}${subcode}: ${graphError.message || `HTTP ${response.status}`}`);
  }
  return data;
}

function attachmentImageUrls(attachment) {
  const urls = [];
  const add = value => {
    const url = String(value || '').trim();
    if (/^https:\/\//i.test(url) && !urls.includes(url)) urls.push(url);
  };
  const visit = item => {
    if (!item || typeof item !== 'object') return;
    add(item.media && item.media.image && item.media.image.src);
    add(item.media && item.media.source);
    add(item.url);
    [].concat(item.subattachments && item.subattachments.data || []).forEach(visit);
  };
  visit(attachment);
  return urls;
}

function attachmentPhotoUrls(attachment) {
  const urls = [];
  const add = value => {
    const url = String(value || '').trim();
    if (/^https:\/\//i.test(url) && !urls.includes(url)) urls.push(url);
  };
  const visit = item => {
    if (!item || typeof item !== 'object') return;
    const mediaType = String(item.media_type || '').toLowerCase();
    const targetUrl = String(item.target && item.target.url || item.url || '');
    if (/video|reel/.test(mediaType) || /\/(?:reel|videos?)\//i.test(targetUrl)) return;
    add(item.media && item.media.image && item.media.image.src);
    [].concat(item.subattachments && item.subattachments.data || []).forEach(visit);
  };
  visit(attachment);
  return urls;
}

function facebookPostObjectId(value) {
  return String(value || '').trim().split('_').filter(Boolean).pop() || '';
}

function generatedFacebookReelPostIds(reelsState) {
  const ids = new Set();
  const add = value => {
    const id = facebookPostObjectId(value);
    if (id) ids.add(id);
  };
  Object.values(reelsState && reelsState.facebookReels || {}).forEach(record => add(record && record.id));
  [].concat(reelsState && reelsState.history || []).forEach(record => add(record && record.facebook && record.facebook.id));
  return ids;
}

function isGeneratedFacebookReelPost(postId, generatedIds) {
  return Boolean(generatedIds && generatedIds.has(facebookPostObjectId(postId)));
}

function postContainsVideo(post) {
  if (!post || typeof post !== 'object') return false;
  if (/video|reel/i.test(String(post.status_type || ''))) return true;
  if (/\/(?:reel|videos?)\//i.test(String(post.permalink_url || ''))) return true;
  const inspect = item => {
    if (!item || typeof item !== 'object') return false;
    const mediaType = String(item.media_type || item.type || '').toLowerCase();
    const targetUrl = String(item.target && item.target.url || item.url || '');
    if (/video|reel/.test(mediaType) || /\/(?:reel|videos?)\//i.test(targetUrl)) return true;
    return [].concat(item.subattachments && item.subattachments.data || []).some(inspect);
  };
  return [].concat(post.attachments && post.attachments.data || []).some(inspect);
}

function purgeGeneratedFacebookReelRecords(state, generatedIds) {
  const sourcePostIds = Object.keys(state && state.manualFacebookRecords || {})
    .filter(sourcePostId => isGeneratedFacebookReelPost(sourcePostId, generatedIds));
  return purgeManualFacebookRecordIds(state, sourcePostIds);
}

function purgeManualFacebookRecordIds(state, sourcePostIds) {
  const removed = new Set();
  for (const sourcePostId of [].concat(sourcePostIds || []).map(value => String(value || '')).filter(Boolean)) {
    if (!state.manualFacebookRecords[sourcePostId]) continue;
    delete state.manualFacebookRecords[sourcePostId];
    removed.add(sourcePostId);
  }
  if (removed.size && Array.isArray(state.queue)) {
    state.queue = state.queue.filter(item => !removed.has(String(item && item.sourcePostId || '')));
  }
  return removed.size;
}

async function facebookPostPrimaryImage(postId) {
  const candidates = await facebookPostImageUrls(postId);
  return candidates[0];
}

async function facebookPostImageUrls(postId) {
  if (!accessToken) throw new Error(`Fotografia istorica pentru ${postId} necesita tokenul Meta.`);
  const post = await graphRequest(postId, {
    query: { fields: 'attachments{media,target,url,subattachments{media,target,url}}' }
  });
  const candidates = [].concat(post.attachments && post.attachments.data || []).flatMap(attachmentPhotoUrls);
  if (!candidates.length) throw new Error(`Postarea Facebook ${postId} nu mai expune o fotografie publica prin API.`);
  return candidates.slice(0, 10);
}

function manualPostName(post) {
  const firstLine = String(post && post.message || '').split(/\r?\n/).map(value => value.trim()).find(Boolean);
  if (firstLine) return firstLine.slice(0, 90);
  const date = String(post && post.created_time || '').slice(0, 10);
  return `Postare Facebook ${date || String(post && post.id || '').slice(-8)}`;
}

function manualFacebookRecord(post, generatedIds = new Set()) {
  const images = [].concat(post && post.attachments && post.attachments.data || []).flatMap(attachmentPhotoUrls);
  const postId = String(post && post.id || '').trim();
  if (!postId || !images.length || postContainsVideo(post) || isGeneratedFacebookReelPost(postId, generatedIds)) return null;
  return {
    postId,
    sourcePostId: postId,
    publishedAt: String(post.created_time || ''),
    type: 'manual',
    productType: 'manual',
    familyKey: `manual-${postId}`,
    key: `manual:${postId}`,
    slug: `manual-${postId}`,
    name: manualPostName(post),
    message: String(post.message || ''),
    images: images.slice(0, 10),
    source: MANUAL_SOURCE
  };
}

async function discoverManualFacebookRecords(knownPostIds, generatedIds = new Set()) {
  if (!pageId || !accessToken) return { records: [], excludedPostIds: [] };
  const records = [];
  const excludedPostIds = new Set();
  let after = '';
  for (let page = 0; page < MAX_MANUAL_PAGES; page += 1) {
    const query = {
      fields: 'id,message,created_time,is_published,permalink_url,status_type,attachments{media_type,type,media,target,url,subattachments{media_type,type,media,target,url}}',
      limit: String(MANUAL_POSTS_PER_PAGE)
    };
    if (after) query.after = after;
    const response = await graphRequest(`${pageId}/posts`, { query });
    const posts = [].concat(response.data || []);
    for (const post of posts) {
      const postId = String(post && post.id || '').trim();
      if (!postId || post.is_published === false) continue;
      if (postContainsVideo(post) || isGeneratedFacebookReelPost(postId, generatedIds)) {
        excludedPostIds.add(postId);
        continue;
      }
      if (knownPostIds.has(postId)) continue;
      const record = manualFacebookRecord(post, generatedIds);
      if (record) records.push(record);
    }
    const nextAfter = String(response.paging && response.paging.cursors && response.paging.cursors.after || '');
    if (!posts.length || !nextAfter || nextAfter === after) break;
    after = nextAfter;
  }
  return {
    records: Array.from(new Map(records.map(record => [record.sourcePostId, record])).values()),
    excludedPostIds: Array.from(excludedPostIds)
  };
}

function mergeManualFacebookRecords(state, records) {
  for (const record of records) state.manualFacebookRecords[record.sourcePostId] = record;
  const newest = Object.values(state.manualFacebookRecords)
    .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')))
    .slice(0, MANUAL_POSTS_PER_PAGE * MAX_MANUAL_PAGES);
  state.manualFacebookRecords = Object.fromEntries(newest.map(record => [record.sourcePostId, record]));
  return newest;
}

async function verifyInstagramConnection() {
  if (!pageId || !accessToken) {
    throw new Error('FACEBOOK_PAGE_ID si FACEBOOK_PAGE_ACCESS_TOKEN sunt necesare pentru conexiunea Instagram.');
  }
  const page = await graphRequest(pageId, {
    query: { fields: 'id,name,instagram_business_account{id,username}' }
  });
  const accountId = String(page.instagram_business_account && page.instagram_business_account.id || '').trim();
  if (!accountId) {
    throw new Error('Pagina Facebook nu expune un cont Instagram Business sau Creator conectat tokenului curent.');
  }
  const account = await graphRequest(accountId, {
    query: { fields: 'id,username,media_count,followers_count' }
  });
  const publishingLimit = await graphRequest(`${accountId}/content_publishing_limit`, {
    query: { fields: 'config,quota_usage' }
  });
  return {
    pageId: String(page.id || pageId),
    pageName: String(page.name || ''),
    id: accountId,
    username: String(account.username || page.instagram_business_account.username || ''),
    mediaCount: Number(account.media_count || 0),
    followersCount: Number(account.followers_count || 0),
    publishingLimit: publishingLimit.data && publishingLimit.data[0] || null
  };
}

async function waitForPublicJpeg(url) {
  let lastError;
  for (let attempt = 0; attempt < 36; attempt += 1) {
    try {
      const response = await fetch(`${url}?v=${Date.now()}`, {
        redirect: 'follow',
        cache: 'no-store',
        signal: AbortSignal.timeout(15000)
      });
      const type = String(response.headers.get('content-type') || '');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!/^image\/jpeg/i.test(type)) throw new Error(`tip media ${type || 'necunoscut'}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 10000) throw new Error(`imagine incompleta (${bytes.length} bytes)`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 35) await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error(`Imaginea Instagram nu a devenit publica: ${lastError && lastError.message || 'eroare necunoscuta'}`);
}

function captionMatchesQueueItem(caption, item) {
  if (item.productType === 'manual') return String(caption || '').trim() === String(item.caption || '').trim();
  const normalized = String(caption || '').toLowerCase();
  return normalized.includes('ghid-rta.ro') && normalized.includes(String(item.name || '').toLowerCase());
}

async function recentInstagramMedia(accountId) {
  const response = await graphRequest(`${accountId}/media`, {
    query: { fields: 'id,caption,permalink,timestamp,media_type', limit: '100' }
  });
  return Array.isArray(response.data) ? response.data : [];
}

async function waitForContainer(containerId) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const status = await graphRequest(containerId, { query: { fields: 'status_code,status' } });
    const code = String(status.status_code || '').toUpperCase();
    if (code === 'FINISHED' || code === 'PUBLISHED') return code;
    if (code === 'ERROR' || code === 'EXPIRED') throw new Error(`Containerul Instagram ${containerId} are status ${code}.`);
    if (attempt < 5) await new Promise(resolve => setTimeout(resolve, 60000));
  }
  throw new Error(`Containerul Instagram ${containerId} nu a devenit pregatit in 5 minute.`);
}

function applyInstagramPublished(state, item, media, account, timestamp = nowIso(), source = 'instagram-content-publishing-api') {
  const record = {
    sourcePostId: item.sourcePostId,
    sourcePublishedAt: item.sourcePublishedAt,
    identity: item.identity,
    productType: item.productType,
    familyKey: item.familyKey,
    slug: item.slug,
    name: item.name,
    imageUrl: item.imageUrl,
    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [item.imageUrl],
    instagramMediaId: String(media.id || ''),
    permalink: String(media.permalink || ''),
    publishedAt: String(media.timestamp || timestamp),
    source,
    formatVersion: item.formatVersion || MIRROR_FORMAT_VERSION
  };
  state.queue = state.queue.filter(entry => entry.sourcePostId !== item.sourcePostId);
  state.mirroredFacebookPosts[item.sourcePostId] = record;
  state.mirroredFamilies[item.identity] = record;
  state.history.unshift(record);
  state.history = state.history.slice(0, 500);
  state.updatedAt = timestamp;
  state.pageId = account.pageId || state.pageId;
  state.instagramUserId = account.id || state.instagramUserId;
  state.username = account.username || state.username;
  state.dailyLimit = dailyLimit;
  if (!state.startedAt) state.startedAt = timestamp;
  return record;
}

async function publishPrepared(state) {
  if (!state.queue.length) {
    console.log('Instagram mirror: nu exista nicio fotografie pregatita.');
    return [];
  }
  const account = await verifyInstagramConnection();
  const recent = await recentInstagramMedia(account.id);
  const published = [];
  const allowed = Math.max(0, dailyLimit - publishedTodayCount(state));
  for (const item of state.queue.slice(0, Math.min(maxPosts, allowed))) {
    const imageUrls = Array.isArray(item.imageUrls) && item.imageUrls.length ? item.imageUrls : [item.imageUrl];
    for (const imageUrl of imageUrls) await waitForPublicJpeg(imageUrl);
    const existing = recent.find(media => captionMatchesQueueItem(media.caption, item));
    if (existing) {
      const record = applyInstagramPublished(state, item, existing, account, nowIso(), 'instagram-existing-media-detected');
      published.push(record);
      writeJsonAtomic(INSTAGRAM_STATE_PATH, state);
      console.log(`Instagram mirror already existed: ${item.name} (${existing.id}).`);
      continue;
    }

    let container;
    if (imageUrls.length > 1) {
      const children = [];
      for (const imageUrl of imageUrls) {
        const child = await graphRequest(`${account.id}/media`, {
          method: 'POST',
          body: {
            image_url: imageUrl,
            is_carousel_item: 'true',
            alt_text: item.altText
          }
        });
        await waitForContainer(child.id);
        children.push(child.id);
      }
      container = await graphRequest(`${account.id}/media`, {
        method: 'POST',
        body: {
          media_type: 'CAROUSEL',
          children: children.join(','),
          caption: item.caption
        }
      });
    } else {
      container = await graphRequest(`${account.id}/media`, {
        method: 'POST',
        body: {
          image_url: imageUrls[0],
          caption: item.caption,
          alt_text: item.altText
        }
      });
    }
    await waitForContainer(container.id);
    const result = await graphRequest(`${account.id}/media_publish`, {
      method: 'POST',
      body: { creation_id: container.id }
    });
    const media = await graphRequest(result.id, {
      query: { fields: 'id,caption,permalink,timestamp,media_type' }
    });
    const record = applyInstagramPublished(state, item, media, account);
    published.push(record);
    writeJsonAtomic(INSTAGRAM_STATE_PATH, state);
    console.log(`Instagram published ${item.productType}: ${item.name} (${media.id}).`);
  }
  return published;
}

async function main() {
  const catalog = loadCatalog(ROOT);
  const campaignState = readJson(CAMPAIGN_STATE_PATH, { history: [] });
  const facebookState = readJson(FACEBOOK_STATE_PATH, { history: [] });
  const photoState = readJson(FACEBOOK_PHOTO_STATE_PATH, { history: [] });
  const modsFeed = readJson(MODS_PATH, { items: [] });
  const state = normalizeInstagramState(readJson(INSTAGRAM_STATE_PATH, emptyInstagramState()));
  const reelsState = readJson(SOCIAL_REELS_STATE_PATH, { facebookReels: {}, history: [] });
  const generatedReelPostIds = generatedFacebookReelPostIds(reelsState);
  purgeGeneratedFacebookReelRecords(state, generatedReelPostIds);
  const localFacebookRecords = collectFacebookRecords(campaignState, facebookState, photoState);
  if (prepareOnly || pendingCountOnly) {
    const knownPostIds = new Set([
      ...localFacebookRecords.map(record => record.sourcePostId),
      ...Object.keys(state.mirroredFacebookPosts),
      ...Object.keys(state.manualFacebookRecords)
    ]);
    const discovery = await discoverManualFacebookRecords(knownPostIds, generatedReelPostIds);
    const discovered = discovery.records;
    const purgedVideoRecords = purgeManualFacebookRecordIds(state, discovery.excludedPostIds);
    if (purgedVideoRecords) {
      console.log(`Instagram mirror: ${purgedVideoRecords} inregistrari video vechi eliminate din coada foto.`);
    }
    if (discovered.length) {
      mergeManualFacebookRecords(state, discovered);
      console.log(`Instagram mirror: ${discovered.length} postari Facebook manuale noi detectate.`);
    }
  }
  const manualRecords = Object.values(state.manualFacebookRecords)
    .filter(record => !isGeneratedFacebookReelPost(record && record.sourcePostId, generatedReelPostIds));
  const facebookRecords = collectFacebookRecords(campaignState, facebookState, photoState, manualRecords);
  const errors = validateInstagramState(state);
  if (errors.length) throw new Error(errors.join('\n'));

  if (verifyConnectionOnly) {
    const account = await verifyInstagramConnection();
    console.log(`Instagram connected: @${account.username || account.id}, Page ${account.pageName || account.pageId}.`);
    return;
  }

  const plan = planInstagramMirrors(campaignState, facebookState, state, catalog, modsFeed, {
    maxPosts,
    dailyLimit,
    photoState,
    manualRecords
  });
  if (pendingCountOnly) {
    process.stdout.write(String(plan.candidates.length + state.queue.length));
    return;
  }
  if (checkOnly) {
    console.log(`Instagram mirror state valid; ${plan.candidates.length} candidate(s), ${state.queue.length} prepared, ${plan.skipped.length} skipped safely.`);
    return;
  }
  if (prepareOnly) {
    syncBackfillSummary(state, facebookRecords);
    if (state.queue.length) {
      console.log(`Instagram mirror: ${state.queue.length} fotografie pregatita asteapta publicarea.`);
      writeJsonAtomic(INSTAGRAM_STATE_PATH, state);
      return;
    }
    if (!plan.candidates.length) {
      console.log('Instagram mirror: nu exista postari Facebook eligibile si neverificate.');
      writeJsonAtomic(INSTAGRAM_STATE_PATH, state);
      return;
    }
    for (const candidate of plan.candidates.slice(0, maxPosts)) {
      const item = await prepareCandidate(candidate, state);
      console.log(`Instagram prepared ${item.productType}: ${item.name} (${item.assetPath}).`);
    }
    writeJsonAtomic(INSTAGRAM_STATE_PATH, state);
    return;
  }
  if (publishPreparedOnly) {
    await publishPrepared(state);
    syncBackfillSummary(state, facebookRecords);
    writeJsonAtomic(INSTAGRAM_STATE_PATH, state);
    return;
  }

  console.log(JSON.stringify({
    prepared: state.queue.map(item => ({ name: item.name, imageUrl: item.imageUrl })),
    candidates: plan.candidates.map(item => ({ name: item.event.name, productType: item.event.productType, sourcePostId: item.record.sourcePostId })),
    skipped: plan.skipped
  }, null, 2));
}

module.exports = {
  applyInstagramPublished,
  captionMatchesQueueItem,
  collectFacebookRecords,
  dedupeManualFacebookRecords,
  emptyInstagramState,
  generatedFacebookReelPostIds,
  instagramAltText,
  instagramCaption,
  isGeneratedFacebookReelPost,
  manualFacebookRecord,
  manualContentFingerprint,
  mergeManualFacebookRecords,
  normalizeInstagramState,
  planInstagramMirrors,
  postContainsVideo,
  purgeGeneratedFacebookReelRecords,
  purgeManualFacebookRecordIds,
  publishedTodayCount,
  recordIdentity,
  recordProductType,
  resolveEventForRecord,
  syncBackfillSummary,
  validateInstagramState
};

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
