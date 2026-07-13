#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  allSources,
  loadCatalog,
  publicAtomName,
  slugify,
  sourceUrl
} = require('./catalog-data');

const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'data', 'facebook-publish-state.json');
const CAMPAIGN_STATE_PATH = path.join(ROOT, 'data', 'facebook-campaign-state.json');
const REVIEW_PATH = path.join(ROOT, 'data', 'youtube-reviews.json');
const SITE = 'https://ghid-rta.ro';
const RECOMMENDATIONS_URL = `${SITE}/recomandari-rta-mtl.html`;
const DEFAULT_GRAPH_VERSION = 'v25.0';
const DEFAULT_MAX_POSTS = 4;

const args = process.argv.slice(2);
const initialize = args.includes('--initialize');
const checkOnly = args.includes('--check');
const publish = args.includes('--publish');
const pendingCountOnly = args.includes('--pending-count');
const verifyCredentialsOnly = args.includes('--verify-credentials');
const diagnoseCredentialsOnly = args.includes('--diagnose-credentials');
const verifyPublishCapabilityOnly = args.includes('--verify-publish-capability');
const publishEditorial = args.includes('--publish-editorial');
const editorialPendingCountOnly = args.includes('--editorial-pending-count');
const editorialUnpostedCountOnly = args.includes('--editorial-unposted-count');
const checkEditorialOnly = args.includes('--check-editorial');
const maxPosts = Math.max(1, Number(valueAfter('--max-posts') || DEFAULT_MAX_POSTS));
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

function dateInRomania(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function todayInRomania() {
  return dateInRomania(new Date());
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, file);
}

function cleanText(value, maxLength = 240) {
  const text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1).replace(/\s+\S*$/, '');
  return `${clipped || text.slice(0, maxLength - 1)}…`;
}

function atomizerUrl(atom) {
  const slug = slugify(publicAtomName(atom.name));
  const localPage = path.join(ROOT, 'atomizoare', slug, 'index.html');
  return fs.existsSync(localPage) ? `${SITE}/atomizoare/${slug}/` : `${SITE}/atomizoare/`;
}

function youtubeVideoId(value) {
  const raw = String(value || '').trim();
  if (!/^https?:\/\//i.test(raw)) return '';
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let id = '';
    if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || '';
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
      if (/^\/(?:embed|shorts)\//i.test(url.pathname)) id = url.pathname.split('/').filter(Boolean)[1] || '';
    }
    return /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : '';
  } catch (error) {
    return '';
  }
}

function atomizerImageCandidates(atom, videos = []) {
  const image = String(atom && atom.image || '').trim();
  const candidates = /^https:\/\//i.test(image) ? [image] : [];
  const videoIds = [].concat(videos || [])
    .map(video => youtubeVideoId(video && (video.url || video.videoId)))
    .concat(allSources(atom || {}).map(source => youtubeVideoId(sourceUrl(source))))
    .filter(Boolean);
  videoIds.forEach(videoId => candidates.push(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`));
  return Array.from(new Set(candidates));
}

function atomizerImage(atom, videos = []) {
  return atomizerImageCandidates(atom, videos)[0] || '';
}

function recommendationSignature(atom) {
  const builds = (atom.builds || []).slice(0, 3).map(build => ({
    wire: cleanText(build.wire, 100),
    build: cleanText(build.build, 180)
  }));
  const payload = JSON.stringify({
    classes: cleanText(atom.classes, 500),
    dna: cleanText(atom.dna, 700),
    builds
  });
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 24);
}

function uniqueAtomizers(catalog) {
  const bySlug = new Map();
  (catalog.atomizers || []).forEach(atom => {
    const name = publicAtomName(atom.name);
    const slug = slugify(name);
    if (!slug || bySlug.has(slug)) return;
    bySlug.set(slug, Object.assign({}, atom, { name }));
  });
  return Array.from(bySlug.values()).sort((a, b) => {
    return String(a.addedAt || '').localeCompare(String(b.addedAt || '')) || a.name.localeCompare(b.name);
  });
}

function reviewEntries(feed) {
  const entries = [];
  Object.entries(feed && feed.models || {}).forEach(([slug, model]) => {
    (model.videos || []).forEach(video => {
      if (!video || !video.videoId || !video.url) return;
      entries.push({
        slug,
        model: model.name || slug,
        videoId: video.videoId,
        title: video.title || '',
        url: video.url,
        kind: video.kind === 'build' ? 'build' : 'review',
        scope: video.scope === 'clone' ? 'clone' : 'original',
        firstSeenAt: video.firstSeenAt || ''
      });
    });
  });
  return entries.sort((a, b) => a.model.localeCompare(b.model) || a.videoId.localeCompare(b.videoId));
}

function emptyState() {
  return {
    schemaVersion: 1,
    baselineAt: '',
    updatedAt: '',
    pageId: '',
    seenAtomizers: {},
    recommendationSignatures: {},
    seenVideos: {},
    history: []
  };
}

function baselineState(catalog, feed, timestamp = nowIso()) {
  const state = emptyState();
  state.baselineAt = timestamp;
  state.updatedAt = timestamp;
  uniqueAtomizers(catalog).forEach(atom => {
    const slug = slugify(atom.name);
    state.seenAtomizers[slug] = { seenAt: timestamp, source: 'baseline' };
    state.recommendationSignatures[slug] = recommendationSignature(atom);
  });
  reviewEntries(feed).forEach(video => {
    state.seenVideos[video.videoId] = { seenAt: timestamp, model: video.model, source: 'baseline' };
  });
  return state;
}

function emptyCampaignState() {
  return {
    schemaVersion: 1,
    startedAt: nowIso(),
    updatedAt: '',
    pace: 'four-posts-per-day',
    pageId: '',
    postedAtomizers: {},
    history: []
  };
}

function normalizeCampaignState(value) {
  const state = value && typeof value === 'object' ? value : emptyCampaignState();
  state.schemaVersion = 1;
  state.startedAt = state.startedAt || nowIso();
  state.updatedAt = state.updatedAt || '';
  state.pace = 'four-posts-per-day';
  state.pageId = state.pageId || '';
  state.postedAtomizers = state.postedAtomizers && typeof state.postedAtomizers === 'object'
    ? state.postedAtomizers
    : {};
  state.history = Array.isArray(state.history) ? state.history : [];
  return state;
}

function validateState(state) {
  const errors = [];
  if (!state || state.schemaVersion !== 1) errors.push('invalid schemaVersion');
  ['seenAtomizers', 'recommendationSignatures', 'seenVideos'].forEach(key => {
    if (!state || !state[key] || typeof state[key] !== 'object' || Array.isArray(state[key])) errors.push(`${key} is missing`);
  });
  if (!state || !Array.isArray(state.history)) errors.push('history is missing');
  return errors;
}

function topBuild(atom) {
  const build = (atom.builds || [])[0] || {};
  const wire = cleanText(build.wire, 80);
  const detail = cleanText(build.build, 180);
  if (!wire && !detail) return '';
  return `${wire || 'Build de pornire'}${detail ? ` — ${detail}` : ''}`;
}

function videosForAtom(feedVideos, slug) {
  return feedVideos.filter(video => video.slug === slug);
}

function directVideoLines(videos) {
  const chosen = [];
  const review = videos.find(video => video.kind === 'review');
  const build = videos.find(video => video.kind === 'build');
  if (review) chosen.push(review);
  if (build && (!review || build.videoId !== review.videoId)) chosen.push(build);
  return chosen.slice(0, 2).map(video => {
    const label = video.kind === 'build' ? 'Build video' : 'Recenzie video';
    const clone = video.scope === 'clone' ? ' (exemplu pe clonă, specificat distinct)' : '';
    return `${label}${clone}: ${video.url}`;
  });
}

function atomizerMessage(atom, videos) {
  const profile = cleanText(atom.classes || atom.dna, 260);
  const build = topBuild(atom);
  const lines = [
    `Nou în Ghid RTA MTL: ${atom.name}`,
    '',
    'Modelul a fost introdus în biblioteca RTA și în recomandările în care profilul lichidului, arhitectura atomizorului și buildul sunt compatibile.'
  ];
  if (profile) lines.push('', `Potrivire inițială: ${profile}`);
  if (build) lines.push(`Build de pornire: ${build}`);
  const videoLines = directVideoLines(videos);
  if (videoLines.length) lines.push('', ...videoLines);
  lines.push(
    '',
    `Fișă, surse și potriviri: ${atomizerUrl(atom)}`,
    `Recomandări: ${RECOMMENDATIONS_URL}`,
    '',
    'Conținut informativ destinat exclusiv adulților 18+.',
    '#RTAMTL #AtomizoareRTA #BuildRTA #Smokee'
  );
  return lines.join('\n');
}

function editorialAtomizerMessage(atom, videos) {
  const profile = cleanText(atom.classes || atom.dna, 280);
  const build = topBuild(atom);
  const lines = [
    `Fișă RTA MTL: ${atom.name}`,
    '',
    'Profilul aromatic, arhitectura atomizorului și buildul de pornire sunt prezentate împreună pentru o evaluare coerentă.'
  ];
  if (profile) lines.push('', `Potrivire aromatică: ${profile}`);
  if (build) lines.push(`Build de pornire: ${build}`);
  const videoLines = directVideoLines(videos);
  if (videoLines.length) lines.push('', ...videoLines);
  lines.push(
    '',
    `Fișă, surse și potriviri: ${atomizerUrl(atom)}`,
    `Ghid interactiv: ${SITE}/`,
    '',
    'Conținut informativ destinat exclusiv adulților 18+.',
    '#RTAMTL #AtomizoareRTA #BuildRTA #Smokee'
  );
  return lines.join('\n');
}

function recommendationMessage(atom) {
  const profile = cleanText(atom.classes || atom.dna, 280);
  const build = topBuild(atom);
  const lines = [
    `Recomandare actualizată: ${atom.name}`,
    '',
    'Potrivirea a fost recalibrată după profilul lichidului, arhitectura atomizorului și comportamentul buildului.'
  ];
  if (profile) lines.push('', `Profil: ${profile}`);
  if (build) lines.push(`Build de pornire: ${build}`);
  lines.push(
    '',
    `Fișă și surse: ${atomizerUrl(atom)}`,
    `Motorul de recomandare: ${RECOMMENDATIONS_URL}`,
    '',
    'Conținut informativ destinat exclusiv adulților 18+.',
    '#RTAMTL #RecomandariRTA #BuildRTA #Smokee'
  );
  return lines.join('\n');
}

function reviewMessage(atom, videos) {
  const lines = [
    `Review nou verificat: ${atom.name}`,
    '',
    'Legăturile de mai jos identifică direct modelul. Materialele realizate pe clone sunt marcate distinct.'
  ];
  videos.slice(0, 2).forEach(video => {
    const label = video.kind === 'build' ? 'Build' : 'Recenzie';
    const clone = video.scope === 'clone' ? ' pe clonă; nu este recenzie a originalului' : '';
    lines.push('', `${label}${clone}: ${video.title}`, video.url);
  });
  lines.push(
    '',
    `Fișa atomizorului: ${atomizerUrl(atom)}`,
    '',
    'Conținut informativ destinat exclusiv adulților 18+.',
    '#RTAMTL #ReviewRTA #BuildRTA #Smokee'
  );
  return lines.join('\n');
}

function planUpdates(catalog, feed, state, options = {}) {
  const limit = Math.max(1, Number(options.maxPosts || DEFAULT_MAX_POSTS));
  const atoms = uniqueAtomizers(catalog);
  const atomsBySlug = new Map(atoms.map(atom => [slugify(atom.name), atom]));
  const videos = reviewEntries(feed);
  const events = [];
  const newSlugs = new Set();

  atoms.forEach(atom => {
    const slug = slugify(atom.name);
    if (state.seenAtomizers[slug]) return;
    newSlugs.add(slug);
    const atomVideos = videosForAtom(videos, slug);
    events.push({
      type: 'atomizer',
      key: `atomizer:${slug}`,
      slug,
      name: atom.name,
      link: atomizerUrl(atom),
      image: atomizerImage(atom, atomVideos),
      imageCandidates: atomizerImageCandidates(atom, atomVideos),
      message: atomizerMessage(atom, atomVideos),
      signature: recommendationSignature(atom),
      videoIds: atomVideos.map(video => video.videoId)
    });
  });

  atoms.forEach(atom => {
    const slug = slugify(atom.name);
    if (newSlugs.has(slug) || !state.seenAtomizers[slug]) return;
    const signature = recommendationSignature(atom);
    if (state.recommendationSignatures[slug] === signature) return;
    const atomVideos = videosForAtom(videos, slug);
    events.push({
      type: 'recommendation',
      key: `recommendation:${slug}:${signature}`,
      slug,
      name: atom.name,
      link: atomizerUrl(atom),
      image: atomizerImage(atom, atomVideos),
      imageCandidates: atomizerImageCandidates(atom, atomVideos),
      message: recommendationMessage(atom),
      signature,
      videoIds: []
    });
  });

  const unseenBySlug = new Map();
  videos.forEach(video => {
    if (newSlugs.has(video.slug) || state.seenVideos[video.videoId]) return;
    if (!atomsBySlug.has(video.slug)) return;
    if (!unseenBySlug.has(video.slug)) unseenBySlug.set(video.slug, []);
    unseenBySlug.get(video.slug).push(video);
  });
  Array.from(unseenBySlug.entries()).sort(([a], [b]) => a.localeCompare(b)).forEach(([slug, modelVideos]) => {
    const atom = atomsBySlug.get(slug);
    const chosen = modelVideos.slice(0, 2);
    events.push({
      type: 'review',
      key: `review:${slug}:${chosen.map(video => video.videoId).join(',')}`,
      slug,
      name: atom.name,
      link: chosen[0].url,
      image: atomizerImage(atom, chosen),
      imageCandidates: atomizerImageCandidates(atom, chosen),
      message: reviewMessage(atom, chosen),
      signature: recommendationSignature(atom),
      videoIds: chosen.map(video => video.videoId)
    });
  });

  const priority = { atomizer: 0, recommendation: 1, review: 2 };
  return events.sort((a, b) => priority[a.type] - priority[b.type] || a.name.localeCompare(b.name)).slice(0, limit);
}

function applyPublishedEvent(state, event, postId, timestamp = nowIso()) {
  if (event.type === 'atomizer') {
    state.seenAtomizers[event.slug] = { seenAt: timestamp, source: 'facebook-post', postId };
  }
  if (event.signature) state.recommendationSignatures[event.slug] = event.signature;
  (event.videoIds || []).forEach(videoId => {
    state.seenVideos[videoId] = { seenAt: timestamp, model: event.name, source: 'facebook-post', postId };
  });
  state.updatedAt = timestamp;
  state.pageId = pageId || state.pageId || '';
  state.history.unshift({ key: event.key, type: event.type, name: event.name, postId, publishedAt: timestamp });
  state.history = state.history.slice(0, 200);
}

function planEditorialPosts(catalog, feed, campaignState, options = {}) {
  const state = normalizeCampaignState(campaignState);
  const targetDate = String(options.today || todayInRomania());
  const publishedToday = Object.values(state.postedAtomizers)
    .filter(item => dateInRomania(item && item.publishedAt) === targetDate)
    .length;
  const dailyRemaining = Math.max(0, 4 - publishedToday);
  const limit = Math.min(Math.max(1, Number(options.maxPosts || 1)), dailyRemaining);
  if (limit === 0) return [];
  const videos = reviewEntries(feed);
  return uniqueAtomizers(catalog)
    .filter(atom => !state.postedAtomizers[slugify(atom.name)])
    .map(atom => {
      const slug = slugify(atom.name);
      const atomVideos = videosForAtom(videos, slug);
      return {
        type: 'editorial',
        key: `editorial:${slug}`,
        slug,
        name: atom.name,
        link: atomizerUrl(atom),
        image: atomizerImage(atom, atomVideos),
        imageCandidates: atomizerImageCandidates(atom, atomVideos),
        message: editorialAtomizerMessage(atom, atomVideos),
        videoIds: atomVideos.map(video => video.videoId),
        videoCount: atomVideos.length
      };
    })
    .filter(event => Boolean(event.image))
    .sort((a, b) => b.videoCount - a.videoCount || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function applyEditorialPublished(stateValue, event, postId, timestamp = nowIso()) {
  const state = normalizeCampaignState(stateValue);
  state.updatedAt = timestamp;
  state.pageId = pageId || state.pageId || '';
  state.postedAtomizers[event.slug] = {
    name: event.name,
    publishedAt: timestamp,
    image: event.image,
    source: 'facebook-api',
    postId
  };
  state.history.unshift({
    slug: event.slug,
    name: event.name,
    publishedAt: timestamp,
    postId
  });
  state.history = state.history.slice(0, 200);
  return state;
}

function retryableStatus(status) {
  return status === 429 || status >= 500;
}

async function fetchJson(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      const text = await response.text();
      let payload = {};
      try { payload = text ? JSON.parse(text) : {}; } catch (error) { payload = { message: text }; }
      if (response.ok) return payload;
      const message = payload && payload.error && payload.error.message || payload.message || `HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      if (!retryableStatus(response.status) || attempt === attempts - 1) throw error;
      lastError = error;
    } catch (error) {
      lastError = error;
      if (attempt === attempts - 1) throw error;
    }
    await new Promise(resolve => setTimeout(resolve, 1000 * (2 ** attempt)));
  }
  throw lastError || new Error('Meta request failed');
}

async function verifyFacebookPage() {
  const params = new URLSearchParams({ fields: 'id,name', access_token: accessToken });
  const payload = await fetchJson(`https://graph.facebook.com/${graphVersion}/me?${params}`);
  if (!payload.id) throw new Error('Meta did not return the Page ID');
  if (String(payload.id) !== pageId) {
    throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is not issued for FACEBOOK_PAGE_ID.');
  }
  return payload;
}

async function diagnoseFacebookCredentials() {
  if (!pageId || !accessToken) {
    throw new Error('FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be configured.');
  }
  const permissionParams = new URLSearchParams({ access_token: accessToken });
  try {
    const permissionPayload = await fetchJson(`https://graph.facebook.com/${graphVersion}/me/permissions?${permissionParams}`);
    const granted = (permissionPayload.data || [])
      .filter(item => item && item.status === 'granted')
      .map(item => item.permission)
      .filter(Boolean)
      .sort();
    console.log(`Granted Facebook permissions: ${granted.join(', ') || 'none returned'}.`);
  } catch (error) {
    console.log(`Facebook permission inspection unavailable: ${error.message}`);
  }

  const accountParams = new URLSearchParams({ fields: 'id,name,tasks', access_token: accessToken });
  try {
    const accounts = await fetchJson(`https://graph.facebook.com/${graphVersion}/me/accounts?${accountParams}`);
    const target = (accounts.data || []).find(item => String(item && item.id || '') === pageId);
    if (target) {
      console.log('Stored credential is a User access token that can retrieve the target Page.');
      return;
    }
    console.log('Stored credential did not return the target Page through /me/accounts.');
  } catch (error) {
    console.log(`Facebook account inspection unavailable: ${error.message}`);
  }
}

async function verifyFacebookPublishCapability() {
  if (!pageId || !accessToken) {
    throw new Error('FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be configured.');
  }

  let postId = '';
  try {
    const body = new URLSearchParams({
      message: `Ghid RTA MTL credential check ${nowIso()}`,
      published: 'false',
      unpublished_content_type: 'DRAFT',
      access_token: accessToken
    });
    const payload = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}/feed`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body
    }, 1);
    postId = String(payload.id || '').trim();
    if (!postId) throw new Error('Meta did not return an ID for the unpublished verification post.');
    console.log('Facebook publish permission verified with an unpublished Page post.');
  } finally {
    if (postId) {
      const deleteParams = new URLSearchParams({ access_token: accessToken });
      const deleted = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(postId)}?${deleteParams}`, {
        method: 'DELETE'
      }, 1);
      if (deleted.success !== true) {
        throw new Error('The unpublished verification post was created but Meta did not confirm its deletion.');
      }
      console.log('Unpublished Facebook verification post deleted.');
    }
  }
}

async function waitForPublicLink(url) {
  if (!/^https:\/\/ghid-rta\.ro\//i.test(url)) return;
  let lastStatus = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow', cache: 'no-store' });
      lastStatus = response.status;
      if (response.ok) return;
    } catch (error) {
      lastStatus = 0;
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  throw new Error(`Pagina publică nu este încă disponibilă (${lastStatus || 'network'}): ${url}`);
}

async function waitForPublicImage(url) {
  if (!/^https:\/\//i.test(url)) throw new Error('Fotografia atomizorului lipsește.');
  let lastStatus = 0;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'GET', redirect: 'follow', cache: 'no-store' });
      lastStatus = response.status;
      const type = response.headers.get('content-type') || '';
      if (response.ok && /^image\//i.test(type)) return;
      if (response.status >= 400 && response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastStatus = 0;
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  throw new Error(`Fotografia atomizorului nu este disponibilă (${lastStatus || 'network'}): ${url}`);
}

async function publishEvent(event) {
  await waitForPublicLink(event.link);
  if (event.image) {
    const candidates = Array.from(new Set([].concat(event.imageCandidates || [], event.image).filter(Boolean)));
    let selectedImage = '';
    let lastImageError;
    for (const candidate of candidates) {
      try {
        await waitForPublicImage(candidate);
        selectedImage = candidate;
        break;
      } catch (error) {
        lastImageError = error;
      }
    }
    if (!selectedImage) throw lastImageError || new Error(`Fotografia atomizorului lipsește: ${event.name}`);
    event.image = selectedImage;
    const photoBody = new URLSearchParams({
      url: selectedImage,
      caption: event.message,
      published: 'true',
      access_token: accessToken
    });
    const photo = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}/photos`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: photoBody
    });
    const photoPostId = photo.post_id || photo.id;
    if (!photoPostId) throw new Error(`Meta did not return a photo post ID for ${event.name}`);
    return photoPostId;
  }
  const body = new URLSearchParams({
    message: event.message,
    link: event.link,
    access_token: accessToken
  });
  const payload = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}/feed`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!payload.id) throw new Error(`Meta did not return a post ID for ${event.name}`);
  return payload.id;
}

async function main() {
  if (verifyPublishCapabilityOnly) {
    await verifyFacebookPublishCapability();
    return;
  }

  if (diagnoseCredentialsOnly) {
    await diagnoseFacebookCredentials();
    return;
  }

  if (verifyCredentialsOnly) {
    if (!pageId || !accessToken) {
      throw new Error('FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be configured.');
    }
    const page = await verifyFacebookPage();
    console.log(`Facebook credentials valid for Page: ${page.name || page.id}.`);
    return;
  }

  if (publishEditorial || editorialPendingCountOnly || editorialUnpostedCountOnly || checkEditorialOnly) {
    const catalog = loadCatalog(ROOT);
    const feed = readJson(REVIEW_PATH, { schemaVersion: 1, models: {} });
    let campaignState = normalizeCampaignState(readJson(CAMPAIGN_STATE_PATH, emptyCampaignState()));
    const events = planEditorialPosts(catalog, feed, campaignState, { maxPosts });

    if (editorialUnpostedCountOnly) {
      const remaining = uniqueAtomizers(catalog).filter(atom => !campaignState.postedAtomizers[slugify(atom.name)]).length;
      process.stdout.write(String(remaining));
      return;
    }
    if (editorialPendingCountOnly) {
      process.stdout.write(String(events.length));
      return;
    }
    if (checkEditorialOnly) {
      console.log(`Facebook editorial state valid; ${events.length} eligible post(s), limit ${maxPosts}.`);
      return;
    }
    if (!pageId || !accessToken) {
      throw new Error('FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be configured.');
    }
    if (!events.length) {
      console.log('Facebook editorial series is complete, the daily limit is reached, or a verified product image is pending.');
      return;
    }

    const page = await verifyFacebookPage();
    console.log(`Facebook editorial publisher connected to Page: ${page.name || page.id}.`);
    for (const event of events) {
      const postId = await publishEvent(event);
      campaignState = applyEditorialPublished(campaignState, event, postId);
      writeJsonAtomic(CAMPAIGN_STATE_PATH, campaignState);
      console.log(`Facebook editorial post published: ${event.name} (${postId}).`);
    }
    return;
  }

  const catalog = loadCatalog(ROOT);
  const feed = readJson(REVIEW_PATH, { schemaVersion: 1, models: {} });
  const stateExists = fs.existsSync(STATE_PATH);
  let state = readJson(STATE_PATH, emptyState());

  if (initialize || !stateExists) {
    state = baselineState(catalog, feed);
    writeJsonAtomic(STATE_PATH, state);
    if (!pendingCountOnly) {
      console.log(`Facebook baseline initialized: ${Object.keys(state.seenAtomizers).length} atomizers and ${Object.keys(state.seenVideos).length} videos.`);
    }
    return;
  }

  const errors = validateState(state);
  if (errors.length) throw new Error(errors.join('\n'));
  const events = planUpdates(catalog, feed, state, { maxPosts });

  if (pendingCountOnly) {
    process.stdout.write(String(events.length));
    return;
  }

  if (checkOnly) {
    console.log(`Facebook publisher state valid; ${events.length} pending post(s), limit ${maxPosts}.`);
    return;
  }

  if (!publish) {
    console.log(JSON.stringify(events.map(event => ({ type: event.type, name: event.name, link: event.link })), null, 2));
    return;
  }

  if (!pageId || !accessToken) {
    console.warn('Facebook publisher is ready but inactive: FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN are not configured.');
    return;
  }

  if (!events.length) {
    console.log('Facebook publisher: no new atomizers, reviews or recommendation changes.');
    return;
  }

  const page = await verifyFacebookPage();
  console.log(`Facebook publisher connected to Page: ${page.name || page.id}.`);
  const failures = [];
  for (const event of events) {
    try {
      const postId = await publishEvent(event);
      applyPublishedEvent(state, event, postId);
      writeJsonAtomic(STATE_PATH, state);
      console.log(`Facebook published ${event.type}: ${event.name} (${postId}).`);
    } catch (error) {
      failures.push(`${event.type} ${event.name}: ${error.message}`);
      console.error(`Facebook publish failed for ${event.name}: ${error.message}`);
    }
  }
  if (failures.length) throw new Error(failures.join('\n'));
}

module.exports = {
  applyEditorialPublished,
  applyPublishedEvent,
  atomizerImage,
  atomizerImageCandidates,
  atomizerMessage,
  atomizerUrl,
  baselineState,
  editorialAtomizerMessage,
  dateInRomania,
  emptyCampaignState,
  emptyState,
  normalizeCampaignState,
  planEditorialPosts,
  planUpdates,
  recommendationMessage,
  recommendationSignature,
  reviewEntries,
  reviewMessage,
  uniqueAtomizers,
  validateState
};

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
