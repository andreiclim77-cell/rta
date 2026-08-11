#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCatalog, slugify } = require('./catalog-data');
const {
  collectFacebookRecords,
  instagramCaption,
  resolveEventForRecord
} = require('./instagram-publisher');
const { dateInRomania } = require('./facebook-publisher');

const ROOT = path.resolve(__dirname, '..');
const CAMPAIGN_STATE_PATH = path.join(ROOT, 'data', 'facebook-campaign-state.json');
const FACEBOOK_STATE_PATH = path.join(ROOT, 'data', 'facebook-publish-state.json');
const FACEBOOK_PHOTO_STATE_PATH = path.join(ROOT, 'data', 'facebook-hourly-photo-state.json');
const INSTAGRAM_STATE_PATH = path.join(ROOT, 'data', 'instagram-publish-state.json');
const REELS_STATE_PATH = path.join(ROOT, 'data', 'social-reels-state.json');
const MODS_PATH = path.join(ROOT, 'data', 'smokee-mods.json');
const ASSET_DIR = path.join(ROOT, 'assets', 'social-reels');
const SITE = 'https://ghid-rta.ro';
const DEFAULT_GRAPH_VERSION = 'v25.0';
const DEFAULT_DAILY_LIMIT = 4;
const DEFAULT_MAX_POSTS = 1;
const FORMAT_VERSION = 'social-reel-vertical-v1';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const verifyOnly = args.includes('--verify-connection');
const prepareOnly = args.includes('--prepare');
const publishOnly = args.includes('--publish-prepared');
const maxPosts = Math.max(1, Number(valueAfter('--max-posts') || DEFAULT_MAX_POSTS));
const dailyLimit = Math.max(1, Number(valueAfter('--daily-limit') || DEFAULT_DAILY_LIMIT));
const pageId = String(process.env.FACEBOOK_PAGE_ID || '').trim();
const accessToken = String(process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '').trim();
const graphVersion = String(process.env.FACEBOOK_GRAPH_VERSION || DEFAULT_GRAPH_VERSION).trim();
const ffmpegBinary = String(process.env.FFMPEG_PATH || 'ffmpeg').trim();

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

function emptyReelsState() {
  return {
    schemaVersion: 1,
    startedAt: '',
    updatedAt: '',
    dailyLimit: DEFAULT_DAILY_LIMIT,
    queue: [],
    sourceStarts: {},
    facebookReels: {},
    instagramReels: {},
    history: []
  };
}

function normalizeReelsState(value) {
  const state = value && typeof value === 'object' ? value : emptyReelsState();
  state.schemaVersion = 1;
  state.startedAt = String(state.startedAt || '');
  state.updatedAt = String(state.updatedAt || '');
  state.dailyLimit = Math.max(1, Number(state.dailyLimit || DEFAULT_DAILY_LIMIT));
  state.queue = Array.isArray(state.queue) ? state.queue : [];
  state.sourceStarts = state.sourceStarts && typeof state.sourceStarts === 'object' ? state.sourceStarts : {};
  state.facebookReels = state.facebookReels && typeof state.facebookReels === 'object' ? state.facebookReels : {};
  state.instagramReels = state.instagramReels && typeof state.instagramReels === 'object' ? state.instagramReels : {};
  state.history = Array.isArray(state.history) ? state.history : [];
  return state;
}

function completedOnBothPlatforms(state, sourcePostId) {
  return Boolean(state.facebookReels[sourcePostId] && state.instagramReels[sourcePostId]);
}

function sourcesStartedToday(state, timestamp = nowIso()) {
  const date = dateInRomania(timestamp);
  return Object.values(state.sourceStarts).filter(value => dateInRomania(value) === date).length;
}

function planReels(records, state, options = {}) {
  const limit = Math.max(0, Number(options.maxPosts || DEFAULT_MAX_POSTS));
  const remainingToday = Math.max(0, Number(options.dailyLimit || state.dailyLimit || DEFAULT_DAILY_LIMIT)
    - sourcesStartedToday(state, options.now || nowIso()));
  const queued = new Set(state.queue.map(item => item.sourcePostId));
  const candidates = [];
  for (const record of records) {
    if (completedOnBothPlatforms(state, record.sourcePostId) || queued.has(record.sourcePostId)) continue;
    candidates.push(record);
    if (candidates.length >= Math.min(limit, remainingToday)) break;
  }
  return candidates;
}

function validateReelsState(state) {
  const errors = [];
  const seen = new Set();
  for (const item of state.queue) {
    if (!item.sourcePostId || !item.name || !item.videoUrl || !item.videoPath) {
      errors.push('Coada Reel contine o intrare incompleta.');
    }
    if (!/\.mp4$/i.test(String(item.videoUrl || ''))) errors.push(`Reel-ul ${item.name || ''} nu este MP4.`);
    if (seen.has(item.sourcePostId)) errors.push(`Postarea ${item.sourcePostId} este dublata in coada Reel.`);
    seen.add(item.sourcePostId);
  }
  return Array.from(new Set(errors));
}

function xmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function displayTitle(value) {
  const cleaned = String(value || '').replace(/https?:\/\/\S+/gi, '').replace(/\s+/g, ' ').trim();
  return (cleaned || 'RTA MTL').slice(0, 66);
}

function overlaySvg(title) {
  return Buffer.from(`
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#07110f" stop-opacity="0.96"/>
          <stop offset="0.55" stop-color="#10231e" stop-opacity="0.92"/>
          <stop offset="1" stop-color="#172014" stop-opacity="0.92"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#000" flood-opacity="0.8"/>
        </filter>
      </defs>
      <rect x="0" y="0" width="1080" height="178" fill="url(#top)"/>
      <rect x="0" y="174" width="1080" height="4" fill="#38d47b"/>
      <text x="54" y="78" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#f5a623" filter="url(#shadow)">ghid-rta.ro</text>
      <text x="54" y="135" font-family="Arial, sans-serif" font-size="27" font-weight="700" fill="#edf7f1">GHID RTA MTL  |  18+</text>
      <rect x="34" y="1665" width="1012" height="205" rx="8" fill="#07110f" fill-opacity="0.92" stroke="#38d47b" stroke-width="3"/>
      <text x="540" y="1744" text-anchor="middle" font-family="Arial, sans-serif" font-size="35" font-weight="700" fill="#ffffff" filter="url(#shadow)">${xmlEscape(displayTitle(title))}</text>
      <text x="540" y="1810" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#f5a623">Documentatie tehnica pentru adulti</text>
    </svg>
  `);
}

async function remoteImageBuffer(url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Imaginea sursa nu poate fi citita: HTTP ${response.status}.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 5000) throw new Error('Imaginea sursa este incompleta.');
  return bytes;
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
    [].concat(item.subattachments && item.subattachments.data || []).forEach(visit);
  };
  visit(attachment);
  return urls;
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
    signal: AbortSignal.timeout(options.timeout || 60000)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    const error = data.error || {};
    throw new Error(`Meta Graph API${error.code ? ` cod ${error.code}` : ''}: ${error.message || `HTTP ${response.status}`}`);
  }
  return data;
}

async function facebookSourceImages(record, instagramState, event) {
  const candidates = [];
  const add = value => {
    const url = String(value || '').trim();
    if (/^https:\/\//i.test(url) && !candidates.includes(url)) candidates.push(url);
  };
  try {
    const post = await graphRequest(record.sourcePostId, {
      query: { fields: 'attachments{media,target,url,subattachments{media,target,url}}' }
    });
    [].concat(post.attachments && post.attachments.data || []).flatMap(attachmentImageUrls).forEach(add);
  } catch (error) {
    console.warn(`Reel: atasamentele Facebook pentru ${record.sourcePostId} nu sunt disponibile: ${error.message}`);
  }
  const mirrored = instagramState.mirroredFacebookPosts && instagramState.mirroredFacebookPosts[record.sourcePostId];
  [].concat(mirrored && mirrored.imageUrls || []).forEach(add);
  [].concat(record.images || []).forEach(add);
  add(record.image);
  add(event && event.image);
  return candidates.slice(0, 6);
}

async function renderFrame(sourceUrl, outputPath, title) {
  const sharp = require('sharp');
  const bytes = await remoteImageBuffer(sourceUrl);
  const background = await sharp(bytes, { failOn: 'error' })
    .rotate()
    .resize(1080, 1920, { fit: 'cover' })
    .blur(28)
    .modulate({ brightness: 0.36, saturation: 0.8 })
    .jpeg({ quality: 86 })
    .toBuffer();
  const foreground = await sharp(bytes, { failOn: 'error' })
    .rotate()
    .resize(1000, 1450, { fit: 'contain', background: { r: 7, g: 17, b: 15, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp(background)
    .composite([
      { input: foreground, gravity: 'center' },
      { input: overlaySvg(title), top: 0, left: 0 }
    ])
    .jpeg({ quality: 91, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toFile(outputPath);
}

function runFfmpeg(framePaths, outputPath, temporaryDirectory) {
  const duration = framePaths.length === 1 ? 6 : 2.7;
  const ffmpegArgs = ['-y'];
  framePaths.forEach(framePath => ffmpegArgs.push('-loop', '1', '-t', String(duration), '-i', framePath));
  ffmpegArgs.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000');
  if (framePaths.length === 1) {
    ffmpegArgs.push('-vf', 'fps=30,scale=in_range=full:out_range=tv,format=yuv420p', '-map', '0:v:0', '-map', '1:a:0');
  } else {
    const filters = framePaths.map((unused, index) =>
      `[${index}:v]fps=30,scale=in_range=full:out_range=tv,format=yuv420p,trim=duration=${duration},setpts=PTS-STARTPTS[v${index}]`
    );
    filters.push(`${framePaths.map((unused, index) => `[v${index}]`).join('')}concat=n=${framePaths.length}:v=1:a=0[outv]`);
    ffmpegArgs.push('-filter_complex', filters.join(';'), '-map', '[outv]', '-map', `${framePaths.length}:a:0`);
  }
  ffmpegArgs.push(
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-profile:v', 'high', '-level', '4.1',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-ar', '48000',
    '-shortest', '-movflags', '+faststart', outputPath
  );
  const result = spawnSync(ffmpegBinary, ffmpegArgs, { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw new Error(`FFmpeg nu a putut genera Reel-ul: ${result.stderr || result.stdout}`);
  const size = fs.statSync(outputPath).size;
  if (size < 20000) throw new Error(`Reel-ul generat este incomplet (${size} bytes).`);
}

function reelFileName(record) {
  const digest = crypto.createHash('sha256').update(record.sourcePostId).digest('hex').slice(0, 12);
  return `${slugify(record.name || record.sourcePostId).slice(0, 52) || 'rta'}-${digest}.mp4`;
}

async function prepareReel(record, event, instagramState, state, timestamp = nowIso()) {
  const sourceImages = await facebookSourceImages(record, instagramState, event);
  if (!sourceImages.length) throw new Error(`Postarea ${record.sourcePostId} nu are nicio imagine verificabila.`);
  fs.mkdirSync(ASSET_DIR, { recursive: true });
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'ghid-rta-reel-'));
  const fileName = reelFileName(record);
  const outputPath = path.join(ASSET_DIR, fileName);
  try {
    const framePaths = [];
    for (let index = 0; index < sourceImages.length; index += 1) {
      const framePath = path.join(temporaryDirectory, `frame-${String(index + 1).padStart(2, '0')}.jpg`);
      await renderFrame(sourceImages[index], framePath, event.name || record.name);
      framePaths.push(framePath);
    }
    runFfmpeg(framePaths, outputPath, temporaryDirectory);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
  const item = {
    sourcePostId: record.sourcePostId,
    sourcePublishedAt: record.sourcePublishedAt,
    productType: event.productType,
    name: event.name || record.name,
    caption: instagramCaption(event),
    title: displayTitle(event.name || record.name),
    sourceImages,
    videoPath: `assets/social-reels/${fileName}`,
    videoUrl: `${SITE}/assets/social-reels/${encodeURIComponent(fileName)}`,
    preparedAt: timestamp,
    formatVersion: FORMAT_VERSION
  };
  state.queue.push(item);
  state.sourceStarts[record.sourcePostId] = timestamp;
  state.updatedAt = timestamp;
  state.dailyLimit = dailyLimit;
  if (!state.startedAt) state.startedAt = timestamp;
  return item;
}

async function waitForPublicVideo(url) {
  let lastError;
  for (let attempt = 0; attempt < 45; attempt += 1) {
    try {
      const response = await fetch(`${url}?v=${Date.now()}`, {
        headers: { Range: 'bytes=0-131071' },
        redirect: 'follow', cache: 'no-store', signal: AbortSignal.timeout(20000)
      });
      const type = String(response.headers.get('content-type') || '');
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!response.ok && response.status !== 206) throw new Error(`HTTP ${response.status}`);
      if (!/video\/mp4/i.test(type)) throw new Error(`tip ${type || 'necunoscut'}`);
      if (bytes.length < 50000) throw new Error(`fisier incomplet (${bytes.length} bytes)`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 44) await new Promise(resolve => setTimeout(resolve, 8000));
    }
  }
  throw new Error(`Reel-ul nu a devenit public pe ghid-rta.ro: ${lastError && lastError.message || 'eroare necunoscuta'}`);
}

async function verifyConnections() {
  if (!pageId || !accessToken) throw new Error('FACEBOOK_PAGE_ID si FACEBOOK_PAGE_ACCESS_TOKEN sunt necesare.');
  const page = await graphRequest(pageId, { query: { fields: 'id,name,instagram_business_account{id,username}' } });
  const accountId = String(page.instagram_business_account && page.instagram_business_account.id || '');
  if (!accountId) throw new Error('Pagina nu are un cont Instagram profesional conectat.');
  const account = await graphRequest(accountId, { query: { fields: 'id,username,media_count' } });
  return { page, account };
}

async function uploadFacebookReel(item) {
  const started = await graphRequest(`${pageId}/video_reels`, { method: 'POST', body: { upload_phase: 'start' } });
  const uploadResponse = await fetch(started.upload_url, {
    method: 'POST',
    headers: { Authorization: `OAuth ${accessToken}`, file_url: item.videoUrl },
    signal: AbortSignal.timeout(120000)
  });
  const uploadData = await uploadResponse.json().catch(() => ({}));
  if (!uploadResponse.ok || uploadData.success !== true) {
    throw new Error(`Facebook Reel upload esuat: ${uploadData.error && uploadData.error.message || `HTTP ${uploadResponse.status}`}`);
  }
  await graphRequest(`${pageId}/video_reels`, {
    method: 'POST',
    body: {
      video_id: String(started.video_id), upload_phase: 'finish', video_state: 'PUBLISHED',
      description: item.caption, title: item.title
    },
    timeout: 120000
  });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const video = await graphRequest(started.video_id, { query: { fields: 'id,status,permalink_url,title,description' } });
    const status = video.status || {};
    const publishing = String(status.publishing_phase && status.publishing_phase.status || '').toLowerCase();
    const videoStatus = String(status.video_status || '').toLowerCase();
    if (publishing === 'complete' || videoStatus === 'ready' || videoStatus === 'published') return video;
    if (publishing === 'error' || videoStatus === 'error') throw new Error(`Facebook Reel ${started.video_id} a intrat in eroare.`);
    if (attempt < 29) await new Promise(resolve => setTimeout(resolve, 10000));
  }
  throw new Error(`Facebook Reel ${started.video_id} nu a confirmat publicarea in 5 minute.`);
}

async function uploadInstagramReel(item, accountId) {
  const container = await graphRequest(`${accountId}/media`, {
    method: 'POST',
    body: { media_type: 'REELS', video_url: item.videoUrl, caption: item.caption, share_to_feed: 'true' },
    timeout: 120000
  });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const status = await graphRequest(container.id, { query: { fields: 'status_code,status' } });
    const code = String(status.status_code || '').toUpperCase();
    if (code === 'FINISHED') break;
    if (code === 'ERROR' || code === 'EXPIRED') throw new Error(`Containerul Instagram Reel are status ${code}: ${status.status || ''}`);
    if (attempt === 29) throw new Error(`Containerul Instagram Reel ${container.id} nu este pregatit dupa 5 minute.`);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  const result = await graphRequest(`${accountId}/media_publish`, {
    method: 'POST', body: { creation_id: String(container.id) }, timeout: 120000
  });
  const media = await graphRequest(result.id, {
    query: { fields: 'id,caption,permalink,timestamp,media_type,media_product_type' }
  });
  if (String(media.media_product_type || '').toUpperCase() !== 'REELS') {
    throw new Error(`Instagram a publicat ${media.id}, dar nu l-a confirmat ca Reel.`);
  }
  return media;
}

function finishQueueItemIfComplete(state, item, timestamp = nowIso()) {
  if (!completedOnBothPlatforms(state, item.sourcePostId)) return false;
  state.queue = state.queue.filter(entry => entry.sourcePostId !== item.sourcePostId);
  const record = {
    sourcePostId: item.sourcePostId,
    name: item.name,
    facebook: state.facebookReels[item.sourcePostId],
    instagram: state.instagramReels[item.sourcePostId],
    completedAt: timestamp,
    formatVersion: item.formatVersion
  };
  state.history.unshift(record);
  state.history = state.history.slice(0, 1000);
  state.updatedAt = timestamp;
  return true;
}

async function publishPrepared(state) {
  if (!state.queue.length) {
    console.log('Social Reels: coada este goala.');
    return [];
  }
  const { account } = await verifyConnections();
  const published = [];
  for (const item of state.queue.slice(0, maxPosts)) {
    await waitForPublicVideo(item.videoUrl);
    if (!state.facebookReels[item.sourcePostId]) {
      const video = await uploadFacebookReel(item);
      state.facebookReels[item.sourcePostId] = {
        id: String(video.id || ''), permalink: String(video.permalink_url || ''),
        publishedAt: nowIso(), verifiedStatus: 'PUBLISHED'
      };
      writeJsonAtomic(REELS_STATE_PATH, state);
      console.log(`Facebook Reel publicat: ${item.name} (${video.id}).`);
    }
    if (!state.instagramReels[item.sourcePostId]) {
      const media = await uploadInstagramReel(item, account.id);
      state.instagramReels[item.sourcePostId] = {
        id: String(media.id || ''), permalink: String(media.permalink || ''),
        publishedAt: String(media.timestamp || nowIso()), mediaProductType: String(media.media_product_type || '')
      };
      writeJsonAtomic(REELS_STATE_PATH, state);
      console.log(`Instagram Reel publicat: ${item.name} (${media.id}).`);
    }
    finishQueueItemIfComplete(state, item);
    writeJsonAtomic(REELS_STATE_PATH, state);
    published.push(item.sourcePostId);
  }
  return published;
}

async function main() {
  const catalog = loadCatalog(ROOT);
  const campaignState = readJson(CAMPAIGN_STATE_PATH, { history: [] });
  const facebookState = readJson(FACEBOOK_STATE_PATH, { history: [] });
  const photoState = readJson(FACEBOOK_PHOTO_STATE_PATH, { history: [] });
  const instagramState = readJson(INSTAGRAM_STATE_PATH, { manualFacebookRecords: {}, mirroredFacebookPosts: {} });
  const modsFeed = readJson(MODS_PATH, { items: [] });
  const state = normalizeReelsState(readJson(REELS_STATE_PATH, emptyReelsState()));
  const manualRecords = Object.values(instagramState.manualFacebookRecords || {});
  const records = collectFacebookRecords(campaignState, facebookState, photoState, manualRecords);
  const errors = validateReelsState(state);
  if (errors.length) throw new Error(errors.join('\n'));

  if (verifyOnly) {
    const { page, account } = await verifyConnections();
    console.log(`Social Reels conectat: Facebook ${page.name} si Instagram @${account.username}.`);
    return;
  }

  const candidates = planReels(records, state, { maxPosts, dailyLimit });
  if (checkOnly) {
    console.log(`Social Reels valid: ${records.length} surse, ${candidates.length} candidate, ${state.queue.length} pregatite.`);
    return;
  }
  if (prepareOnly) {
    if (state.queue.length) {
      console.log(`Social Reels: ${state.queue.length} Reel pregatit asteapta publicarea.`);
      return;
    }
    if (!candidates.length) {
      console.log('Social Reels: limita zilei este completa sau nu exista surse noi.');
      return;
    }
    for (const record of candidates) {
      const event = resolveEventForRecord(record, catalog, modsFeed);
      const item = await prepareReel(record, event, instagramState, state);
      console.log(`Social Reel pregatit: ${item.name} (${item.videoPath}).`);
    }
    writeJsonAtomic(REELS_STATE_PATH, state);
    return;
  }
  if (publishOnly) {
    await publishPrepared(state);
    writeJsonAtomic(REELS_STATE_PATH, state);
    return;
  }
  console.log(JSON.stringify({ queue: state.queue, candidates: candidates.map(record => record.sourcePostId) }, null, 2));
}

module.exports = {
  completedOnBothPlatforms,
  displayTitle,
  emptyReelsState,
  finishQueueItemIfComplete,
  normalizeReelsState,
  planReels,
  renderFrame,
  runFfmpeg,
  sourcesStartedToday,
  validateReelsState
};

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
