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
const DEFAULT_GRAPH_VERSION = 'v25.0';
const DEFAULT_DAILY_POSTS = 2;
const DEFAULT_MAX_POSTS = DEFAULT_DAILY_POSTS;
const LIQUID_TEASER = 'Sunt incluse exact 3 lichide asociate; denumirile și explicațiile apar în textul extins.';

const ATOM_ROLE_RULES = {
  clarity: ['clar', 'analytic', 'analitic', 'virginia', 'oriental', 'cigarette', 'rolling', 'bright', 'luminos', 'uscat', 'dry', 'dvarw mtl fl', 'kayfun lite', 'spica', 'fev vs', '415'],
  body: ['body', 'corp', 'hit', 'latakia', 'kentucky', 'cigar', 'dark', 'fire', 'burley', 'asylum', 'muted', 'dvarw cl', 'prime minister'],
  smooth: ['smooth', 'elegant', 'round', 'rotund', 'taifun', 'by-ka', 'kayfun prime', 'kayfun x', 'diplomat'],
  modular: ['modular', 'bell', 'clopot', 'insert', 'pins', 'pin', 'air disk', 'disc', 'millennium', 'diplomat', 'sputnik', '415', 'prime minister', 'minister'],
  daily: ['daily', 'baseline', 'berserker', 'ares', 'sirens', 'easy', 'general', 'versatil', 'versatile']
};

const PROFILE_ROLE_RULES = {
  clarity: ['virginia', 'bright', 'oriental', 'turkish', 'perique', 'cigarette', 'rolling', 'blond', 'sec', 'dry', 'luminos'],
  body: ['kentucky', 'latakia', 'dark', 'dark-fired', 'fire', 'cigar', 'trabuc', 'fum', 'smoky', 'earthy', 'piele', 'lemn', 'robust', 'amar', 'greu'],
  smooth: ['cavendish', 'pipe', 'vanilie', 'rom', 'bourbon', 'crema', 'cream', 'dulce', 'sweet', 'aromatizat', 'aromatic', 'cafea', 'cacao', 'nuci', 'moale', 'rotund'],
  modular: ['complex', 'blend', 'organic', 'balkan', 'english', 'italian', 'straturi', 'layer', 'oriental-forward']
};

const TOBACCO_AXES = [
  'virginia', 'oriental', 'turkish', 'perique', 'kentucky', 'latakia', 'burley',
  'cigar', 'trabuc', 'pipe', 'cavendish', 'ry4', 'dark', 'fire', 'smoky',
  'blend', 'balkan', 'english', 'rolling', 'cigarette', 'vanilie', 'caramel',
  'crema', 'cafea', 'cacao', 'rom', 'bourbon', 'miere', 'nuci'
];

const MATCH_STOPWORDS = new Set([
  'aroma', 'arome', 'longfill', 'lichid', 'lichide', 'tutun', 'tutunuri', 'tobacco',
  'simplu', 'simpla', 'complex', 'complexa', 'dulce', 'net', 'ml', 'mix', 'vape',
  'profil', 'foarte', 'pentru', 'care', 'este', 'sau', 'din', 'mai', 'fara', 'prin'
]);

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
const repairTodayLiquids = args.includes('--repair-today-liquids');
const checkRepairTodayLiquids = args.includes('--check-repair-today-liquids');
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

function normalizeMatchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchTokens(value) {
  return Array.from(new Set(normalizeMatchText(value)
    .split(' ')
    .filter(token => token.length >= 3 && !MATCH_STOPWORDS.has(token))));
}

function modelKey(value) {
  const generic = new Set(['rta', 'mtl', 'atomizor', 'atomizer', 'mods', 'mod', 'by', 'the']);
  return normalizeMatchText(publicAtomName(value))
    .split(' ')
    .filter(token => token && !generic.has(token))
    .join('');
}

function sameModelName(left, right) {
  const a = modelKey(left);
  const b = modelKey(right);
  if (!a || !b) return false;
  return a === b || (Math.min(a.length, b.length) >= 7 && (a.includes(b) || b.includes(a)));
}

function profileGroup(profile) {
  return cleanText(profile && (profile.group || profile.Group || profile.Grup || profile.Clasa), 100) || 'Tutun';
}

function profileName(profile) {
  return cleanText(profile && (profile.name || profile.Nume || profile.Profil || profile.Subcategorie), 120) || 'Profil tutunos';
}

function profileTags(profile) {
  const raw = profile && (profile.tags || profile.Tags || profile.Taguri || profile.taguri);
  if (Array.isArray(raw)) return raw.map(value => cleanText(value, 80)).filter(Boolean);
  return String(raw || '').split(/[,;|]/).map(value => cleanText(value, 80)).filter(Boolean);
}

function profileTop(profile) {
  const raw = profile && (profile.top || profile.Atomizoare || profile['Atomizoare recomandate'] || profile['Top atomizoare']);
  if (Array.isArray(raw)) return raw.map(value => cleanText(value, 120)).filter(Boolean);
  return String(raw || '').split(/[,;|]/).map(value => cleanText(value, 120)).filter(Boolean);
}

function profileNote(profile) {
  return cleanText(profile && (profile.note || profile.Note || profile.Nota || profile.Observatii || profile.Descriere), 180);
}

function profileFamily(profile) {
  return /\bnet\b/.test(normalizeMatchText(profileGroup(profile))) ? 'NET' : 'TUTUN';
}

function profileSubtype(profile) {
  return /\bcomplex\b/.test(normalizeMatchText(profileGroup(profile))) ? 'complex' : 'simplu';
}

function textHasTerm(text, term) {
  const normalized = normalizeMatchText(term);
  if (!normalized) return false;
  if (/^[a-z0-9]{1,4}$/.test(normalized)) {
    return new RegExp(`(^|[^a-z0-9])${normalized}([^a-z0-9]|$)`).test(text);
  }
  return text.includes(normalized);
}

function inferAtomRoles(atom) {
  const text = normalizeMatchText([
    atom && atom.name,
    atom && atom.dna,
    atom && atom.classes,
    atom && atom.market
  ].filter(Boolean).join(' '));
  const roles = Object.entries(ATOM_ROLE_RULES)
    .filter(([, terms]) => terms.some(term => textHasTerm(text, term)))
    .map(([role]) => role);
  return roles.length ? roles : ['daily'];
}

function inferProfileRoles(profile) {
  const text = normalizeMatchText([
    profileGroup(profile),
    profileName(profile),
    profileTags(profile).join(' '),
    profileNote(profile)
  ].filter(Boolean).join(' '));
  const roles = Object.entries(PROFILE_ROLE_RULES)
    .filter(([, terms]) => terms.some(term => textHasTerm(text, term)))
    .map(([role]) => role);
  return roles.length ? roles : ['smooth', 'daily'];
}

function sharedAxes(left, right) {
  const a = normalizeMatchText(left);
  const b = normalizeMatchText(right);
  return TOBACCO_AXES.filter(axis => textHasTerm(a, axis) && textHasTerm(b, axis));
}

function axesInNormalizedText(text) {
  return TOBACCO_AXES.filter(axis => textHasTerm(text, axis));
}

function profileMatchesForAtom(atom, profiles, limit = 18) {
  const atomRoles = inferAtomRoles(atom);
  const atomText = normalizeMatchText([
    atom && atom.name,
    atom && atom.dna,
    atom && atom.classes,
    atom && atom.market
  ].filter(Boolean).join(' '));

  return [].concat(profiles || []).map(profile => {
    const roles = inferProfileRoles(profile);
    const tags = profileTags(profile).slice(0, 8);
    const profileText = [profileGroup(profile), profileName(profile), tags.join(' '), profileNote(profile)].join(' ');
    const axes = sharedAxes(atomText, profileText);
    let score = 0;
    roles.forEach(role => {
      if (atomRoles.includes(role)) score += 20;
    });
    profileTop(profile).forEach((name, index) => {
      if (sameModelName(name, atom && atom.name)) score += Math.max(16, 36 - index * 5);
    });
    tags.forEach(tag => {
      if (textHasTerm(atomText, tag)) score += 5;
    });
    score += Math.min(24, axes.length * 8);
    return { profile, score, roles, axes };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || profileName(a.profile).localeCompare(profileName(b.profile)))
    .slice(0, Math.max(1, Number(limit) || 18));
}

function liquidCatalogItems(catalog) {
  const liquids = catalog && catalog.liquids || {};
  return ['net', 'tutun'].flatMap(group => [].concat(liquids[group] || []).map(item => {
    const text = normalizeMatchText([item && item.title, item && item.tag].join(' '));
    return {
      item,
      family: group === 'net' ? 'NET' : 'TUTUN',
      subtype: liquidSubtype(item),
      text,
      words: new Set(text.split(' ').filter(Boolean)),
      axes: axesInNormalizedText(text)
    };
  }));
}

function liquidSubtype(item) {
  const text = normalizeMatchText([item && item.tag, item && item.title].join(' '));
  if (/\bcomplex\b/.test(text)) return 'complex';
  if (/\bdulce\b|\bsweet\b/.test(text)) return 'dulce';
  return 'simplu';
}

function productProfileScore(atomMeta, catalogItem, profileMatch) {
  const item = catalogItem.item || {};
  const tokenOverlap = profileMatch.tokens.filter(token => catalogItem.words.has(token));
  const profileAxes = catalogItem.axes.filter(axis => profileMatch.axisSet.has(axis));
  const atomAxes = catalogItem.axes.filter(axis => atomMeta.axisSet.has(axis));
  let score = profileMatch.match.score;
  score += catalogItem.family === profileMatch.family ? 30 : -22;
  if (catalogItem.subtype === profileMatch.subtype) score += 14;
  score += Math.min(40, tokenOverlap.length * 10);
  score += Math.min(42, profileAxes.length * 14);
  score += Math.min(36, atomAxes.length * 12);
  if (item.stock === true) score += 12;
  if (item.stock === false) score -= 80;
  if (/^https:\/\/smokee\.ro\/product\//i.test(String(item.url || ''))) score += 5;
  if (/^https:\/\//i.test(String(item.image || ''))) score += 2;
  if (catalogItem.subtype === 'dulce' && profileMatch.match.roles.includes('smooth')) score += 8;
  if (catalogItem.subtype === 'dulce' && profileMatch.match.roles.includes('clarity')) score -= 5;
  return { score, tokenOverlap, profileAxes, atomAxes };
}

function liquidMatchReason(profileMatch, scoreDetails) {
  const note = profileNote(profileMatch.profile);
  if (note) return note;
  const axes = Array.from(new Set([].concat(scoreDetails.atomAxes || [], scoreDetails.profileAxes || []))).slice(0, 3);
  if (axes.length) return `Profilul păstrează în prim-plan notele de ${axes.join(', ')}.`;
  if (profileMatch.roles.includes('clarity')) return 'Profil orientat spre claritate și separarea notelor.';
  if (profileMatch.roles.includes('body')) return 'Profil orientat spre corp, structură și prezență.';
  if (profileMatch.roles.includes('smooth')) return 'Profil orientat spre o redare rotundă și echilibrată.';
  return 'Profil tutunos compatibil cu arhitectura și buildul atomizorului.';
}

function topLiquidMatchesForAtom(atom, catalog, limit = 3) {
  const atomText = normalizeMatchText([atom && atom.classes, atom && atom.dna, atom && atom.market].join(' '));
  const atomMeta = { axisSet: new Set(axesInNormalizedText(atomText)) };
  const profiles = profileMatchesForAtom(atom, catalog && catalog.profiles, 24).map(match => {
    const text = normalizeMatchText([
      profileName(match.profile),
      profileTags(match.profile).join(' '),
      profileNote(match.profile)
    ].join(' '));
    return {
      match,
      family: profileFamily(match.profile),
      subtype: profileSubtype(match.profile),
      tokens: matchTokens(text),
      axisSet: new Set(axesInNormalizedText(text))
    };
  });
  const products = liquidCatalogItems(catalog).filter(entry => {
    const item = entry.item || {};
    return item.title && /^https:\/\/smokee\.ro\/product\//i.test(String(item.url || ''));
  });
  if (!profiles.length || !products.length) return [];

  const ranked = products.map(entry => {
    const scoredProfiles = profiles.map(profileMatch => ({
      profileMatch,
      details: productProfileScore(atomMeta, entry, profileMatch)
    })).sort((a, b) => b.details.score - a.details.score);
    const best = scoredProfiles[0];
    return {
      title: cleanText(entry.item.title, 150),
      url: String(entry.item.url || '').trim(),
      image: String(entry.item.image || '').trim(),
      tag: cleanText(entry.item.tag || entry.family, 80),
      stock: entry.item.stock,
      family: entry.family,
      subtype: entry.subtype,
      profile: profileName(best.profileMatch.match.profile),
      profileGroup: profileGroup(best.profileMatch.match.profile),
      reason: liquidMatchReason(best.profileMatch.match, best.details),
      score: best.details.score
    };
  }).filter(item => /^https:\/\//i.test(item.image))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const selected = [];
  const usedUrls = new Set();
  const usedImages = new Set();
  while (selected.length < Math.max(1, Number(limit) || 3)) {
    const candidates = ranked.filter(item => !usedUrls.has(item.url) && !usedImages.has(item.image)).map(item => {
      const sameTag = selected.filter(chosen => normalizeMatchText(chosen.tag) === normalizeMatchText(item.tag)).length;
      const sameProfile = selected.filter(chosen => normalizeMatchText(chosen.profile) === normalizeMatchText(item.profile)).length;
      return { item, adjustedScore: item.score - sameTag * 16 - sameProfile * 10 };
    }).sort((a, b) => b.adjustedScore - a.adjustedScore || b.item.score - a.item.score || a.item.title.localeCompare(b.item.title));
    if (!candidates.length) break;
    selected.push(candidates[0].item);
    usedUrls.add(candidates[0].item.url);
    usedImages.add(candidates[0].item.image);
  }
  return selected.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

function liquidMatchLines(matches) {
  if (!Array.isArray(matches) || !matches.length) return [];
  const selected = matches.slice(0, 3);
  const lines = [
    '',
    `3 lichide analizate: ${selected.map(match => cleanText(match.title, 90)).join(' • ')}`,
    '',
    'Detalierea potrivirilor:'
  ];
  selected.forEach((match, index) => {
    lines.push(
      `${index + 1}. ${cleanText(match.title, 130)}`,
      `Categorie aromatică: ${cleanText(match.tag || match.profile, 100)}`,
      `Profil aromatic: ${cleanText(match.profile, 110)}`,
      `Comportament estimat: ${cleanText(match.reason, 180)}`
    );
  });
  return lines;
}

function liquidStateItems(matches) {
  return [].concat(matches || []).slice(0, 3).map(match => ({
    title: cleanText(match.title, 150),
    tag: cleanText(match.tag, 80),
    profile: cleanText(match.profile, 120),
    url: String(match.url || '').trim(),
    image: String(match.image || '').trim(),
    stock: match.stock !== false
  }));
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
    pace: 'two-posts-per-day',
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
  state.pace = 'two-posts-per-day';
  state.pageId = state.pageId || '';
  state.postedAtomizers = state.postedAtomizers && typeof state.postedAtomizers === 'object'
    ? state.postedAtomizers
    : {};
  state.history = Array.isArray(state.history) ? state.history : [];
  return state;
}

function facebookPostsOnDate(campaignState, publishState, targetDate = todayInRomania()) {
  const posts = new Set();
  Object.entries(campaignState && campaignState.postedAtomizers || {}).forEach(([slug, item]) => {
    if (dateInRomania(item && item.publishedAt) !== targetDate) return;
    posts.add(String(item.postId || `editorial:${slug}:${item.publishedAt}`));
  });
  (publishState && Array.isArray(publishState.history) ? publishState.history : []).forEach(item => {
    if (dateInRomania(item && item.publishedAt) !== targetDate) return;
    posts.add(String(item.postId || `update:${item.key || item.name}:${item.publishedAt}`));
  });
  return posts.size;
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
  if (!Array.isArray(videos) || !videos.length) return [];
  const hasClone = videos.some(video => video.scope === 'clone');
  return [
    `Recenziile și buildurile video verificate sunt disponibile în fișa completă${hasClone ? '; materialele pe clone sunt marcate distinct' : ''}.`
  ];
}

function atomizerMessage(atom, videos, liquidMatches = []) {
  const profile = cleanText(atom.classes || atom.dna, 260);
  const build = topBuild(atom);
  const lines = [`Nou în Ghid RTA MTL: ${atom.name}`, '', LIQUID_TEASER, '', 'Modelul a fost introdus în biblioteca RTA și în recomandările în care profilul lichidului, arhitectura atomizorului și buildul sunt compatibile.'];
  if (profile) lines.push('', `Potrivire inițială: ${profile}`);
  if (build) lines.push(`Build de pornire: ${build}`);
  lines.push(...liquidMatchLines(liquidMatches));
  const videoLines = directVideoLines(videos);
  if (videoLines.length) lines.push('', ...videoLines);
  lines.push(
    '',
    `Fișa completă, cu surse, recenzii și potriviri: ${atomizerUrl(atom)}`,
    '',
    'Analiză tehnică orientativă; nu reprezintă ofertă comercială.',
    'Conținut informativ destinat exclusiv adulților 18+.',
    '#GhidRTAMTL #AtomizoareRTA #BuildRTA #Smokee'
  );
  return lines.join('\n');
}

function editorialAtomizerMessage(atom, videos, liquidMatches = []) {
  const profile = cleanText(atom.classes || atom.dna, 280);
  const build = topBuild(atom);
  const lines = [`Fișă RTA MTL: ${atom.name}`, '', LIQUID_TEASER, '', 'Profilul aromatic, arhitectura atomizorului și buildul de pornire sunt prezentate împreună pentru o evaluare coerentă.'];
  if (profile) lines.push('', `Potrivire aromatică: ${profile}`);
  if (build) lines.push(`Build de pornire: ${build}`);
  lines.push(...liquidMatchLines(liquidMatches));
  const videoLines = directVideoLines(videos);
  if (videoLines.length) lines.push('', ...videoLines);
  lines.push(
    '',
    `Fișa completă, cu surse, recenzii și potriviri: ${atomizerUrl(atom)}`,
    '',
    'Analiză tehnică orientativă; nu reprezintă ofertă comercială.',
    'Conținut informativ destinat exclusiv adulților 18+.',
    '#GhidRTAMTL #AtomizoareRTA #BuildRTA #Smokee'
  );
  return lines.join('\n');
}

function recommendationMessage(atom, liquidMatches = []) {
  const profile = cleanText(atom.classes || atom.dna, 280);
  const build = topBuild(atom);
  const lines = [`Recomandare actualizată: ${atom.name}`, '', LIQUID_TEASER, '', 'Potrivirea a fost recalibrată după profilul lichidului, arhitectura atomizorului și comportamentul buildului.'];
  if (profile) lines.push('', `Profil: ${profile}`);
  if (build) lines.push(`Build de pornire: ${build}`);
  lines.push(...liquidMatchLines(liquidMatches));
  lines.push(
    '',
    `Fișa completă, cu surse și potriviri: ${atomizerUrl(atom)}`,
    '',
    'Analiză tehnică orientativă; nu reprezintă ofertă comercială.',
    'Conținut informativ destinat exclusiv adulților 18+.',
    '#GhidRTAMTL #RecomandariRTA #BuildRTA #Smokee'
  );
  return lines.join('\n');
}

function reviewMessage(atom, videos, liquidMatches = []) {
  const lines = [`Review nou verificat: ${atom.name}`, '', LIQUID_TEASER, '', 'Materialele identificate se referă direct la model; exemplele realizate pe clone sunt marcate distinct în fișa completă.'];
  videos.slice(0, 2).forEach(video => {
    const label = video.kind === 'build' ? 'Build' : 'Recenzie';
    const clone = video.scope === 'clone' ? ' pe clonă; nu este recenzie a originalului' : '';
    lines.push('', `${label}${clone}: ${cleanText(video.title, 160)}`);
  });
  lines.push(...liquidMatchLines(liquidMatches));
  lines.push(
    '',
    `Fișa completă, cu materialele video și sursele verificate: ${atomizerUrl(atom)}`,
    '',
    'Analiză tehnică orientativă; nu reprezintă ofertă comercială.',
    'Conținut informativ destinat exclusiv adulților 18+.',
    '#GhidRTAMTL #ReviewRTA #BuildRTA #Smokee'
  );
  return lines.join('\n');
}

function planUpdates(catalog, feed, state, options = {}) {
  const alreadyPublished = Number.isFinite(Number(options.dailyPublished))
    ? Math.max(0, Number(options.dailyPublished))
    : 0;
  const limit = Math.min(
    Math.max(1, Number(options.maxPosts || DEFAULT_MAX_POSTS)),
    Math.max(0, DEFAULT_DAILY_POSTS - alreadyPublished)
  );
  if (limit === 0) return [];
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
    const liquidMatches = topLiquidMatchesForAtom(atom, catalog, 3);
    if (liquidMatches.length < 3) return;
    events.push({
      type: 'atomizer',
      key: `atomizer:${slug}`,
      slug,
      name: atom.name,
      link: atomizerUrl(atom),
      image: atomizerImage(atom, atomVideos),
      imageCandidates: atomizerImageCandidates(atom, atomVideos),
      message: atomizerMessage(atom, atomVideos, liquidMatches),
      liquidMatches,
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
    const liquidMatches = topLiquidMatchesForAtom(atom, catalog, 3);
    if (liquidMatches.length < 3) return;
    events.push({
      type: 'recommendation',
      key: `recommendation:${slug}:${signature}`,
      slug,
      name: atom.name,
      link: atomizerUrl(atom),
      image: atomizerImage(atom, atomVideos),
      imageCandidates: atomizerImageCandidates(atom, atomVideos),
      message: recommendationMessage(atom, liquidMatches),
      liquidMatches,
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
    const liquidMatches = topLiquidMatchesForAtom(atom, catalog, 3);
    if (liquidMatches.length !== 3) return;
    events.push({
      type: 'review',
      key: `review:${slug}:${chosen.map(video => video.videoId).join(',')}`,
      slug,
      name: atom.name,
      link: atomizerUrl(atom),
      image: atomizerImage(atom, chosen),
      imageCandidates: atomizerImageCandidates(atom, chosen),
      message: reviewMessage(atom, chosen, liquidMatches),
      liquidMatches,
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
  state.history.unshift({
    key: event.key,
    type: event.type,
    name: event.name,
    postId,
    publishedAt: timestamp,
    formatVersion: 'educational-single-photo-v2',
    messageVersion: 'three-liquids-after-expand-v2',
    liquids: liquidStateItems(event.liquidMatches)
  });
  state.history = state.history.slice(0, 200);
}

function planEditorialPosts(catalog, feed, campaignState, options = {}) {
  const state = normalizeCampaignState(campaignState);
  const targetDate = String(options.today || todayInRomania());
  const campaignPublishedToday = facebookPostsOnDate(state, emptyState(), targetDate);
  const publishedToday = Number.isFinite(Number(options.dailyPublished))
    ? Math.max(0, Number(options.dailyPublished))
    : campaignPublishedToday;
  const dailyRemaining = Math.max(0, DEFAULT_DAILY_POSTS - publishedToday);
  const limit = Math.min(Math.max(1, Number(options.maxPosts || 1)), dailyRemaining);
  if (limit === 0) return [];
  const videos = reviewEntries(feed);
  const candidates = uniqueAtomizers(catalog)
    .filter(atom => !state.postedAtomizers[slugify(atom.name)])
    .map(atom => {
      const slug = slugify(atom.name);
      const atomVideos = videosForAtom(videos, slug);
      return {
        atom,
        slug,
        atomVideos,
        image: atomizerImage(atom, atomVideos),
        imageCandidates: atomizerImageCandidates(atom, atomVideos),
        videoCount: atomVideos.length
      };
    })
    .filter(candidate => Boolean(candidate.image))
    .sort((a, b) => b.videoCount - a.videoCount || a.atom.name.localeCompare(b.atom.name));

  const events = [];
  for (const candidate of candidates) {
    const liquidMatches = topLiquidMatchesForAtom(candidate.atom, catalog, 3);
    if (liquidMatches.length !== 3) continue;
    events.push({
      type: 'editorial',
      key: `editorial:${candidate.slug}`,
      slug: candidate.slug,
      name: candidate.atom.name,
      link: atomizerUrl(candidate.atom),
      image: candidate.image,
      imageCandidates: candidate.imageCandidates,
      message: editorialAtomizerMessage(candidate.atom, candidate.atomVideos, liquidMatches),
      liquidMatches,
      videoIds: candidate.atomVideos.map(video => video.videoId),
      videoCount: candidate.videoCount
    });
    if (events.length >= limit) break;
  }
  return events;
}

function applyEditorialPublished(stateValue, event, postId, timestamp = nowIso()) {
  const state = normalizeCampaignState(stateValue);
  state.updatedAt = timestamp;
  state.pageId = pageId || state.pageId || '';
  state.postedAtomizers[event.slug] = {
    name: event.name,
    publishedAt: timestamp,
    image: event.image,
    source: 'facebook-api-educational',
    postId,
    formatVersion: 'educational-single-photo-v2',
    messageVersion: 'three-liquids-after-expand-v2',
    liquids: liquidStateItems(event.liquidMatches)
  };
  state.history.unshift({
    slug: event.slug,
    name: event.name,
    publishedAt: timestamp,
    postId,
    formatVersion: 'educational-single-photo-v2',
    messageVersion: 'three-liquids-after-expand-v2',
    liquids: liquidStateItems(event.liquidMatches)
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
  if (!/^https:\/\//i.test(url)) throw new Error('Fotografia produsului lipsește.');
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
  throw new Error(`Fotografia produsului nu este disponibilă (${lastStatus || 'network'}): ${url}`);
}

function assertEventLiquidTriplet(event) {
  if (!event || !event.image) throw new Error(`Fotografia atomizorului lipsește: ${event && event.name || 'model necunoscut'}.`);
  if (!Array.isArray(event.liquidMatches) || event.liquidMatches.length !== 3) {
    throw new Error(`Postarea pentru ${event.name} trebuie să includă exact trei lichide.`);
  }
  if (event.liquidMatches.some(match => !cleanText(match.title, 150) || !cleanText(match.profile, 120) || !cleanText(match.reason, 200))) {
    throw new Error(`Una dintre cele trei potriviri de lichid este incompletă pentru ${event.name}.`);
  }
}

async function selectPublicAtomizerImage(event) {
  const candidates = Array.from(new Set([].concat(event.imageCandidates || [], event.image).filter(Boolean)));
  let lastImageError;
  for (const candidate of candidates) {
    try {
      await waitForPublicImage(candidate);
      return candidate;
    } catch (error) {
      lastImageError = error;
    }
  }
  throw lastImageError || new Error(`Fotografia atomizorului lipsește: ${event.name}`);
}

async function prepareEventForPublish(event) {
  await waitForPublicLink(event.link);
  event.image = await selectPublicAtomizerImage(event);
  assertEventLiquidTriplet(event);
  return event;
}

async function publishPreparedEvent(event) {
  if (event.image) {
    const photoBody = new URLSearchParams({
      url: event.image,
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

async function publishEvent(event) {
  return publishPreparedEvent(await prepareEventForPublish(event));
}

function editorialEventForAtom(atom, catalog, feed) {
  const slug = slugify(atom.name);
  const atomVideos = videosForAtom(reviewEntries(feed), slug);
  const liquidMatches = topLiquidMatchesForAtom(atom, catalog, 3);
  if (liquidMatches.length !== 3) {
    throw new Error(`Nu există trei lichide verificabile pentru ${atom.name}.`);
  }
  return {
    type: 'editorial',
    key: `editorial:${slug}`,
    slug,
    name: atom.name,
    link: atomizerUrl(atom),
    image: atomizerImage(atom, atomVideos),
    imageCandidates: atomizerImageCandidates(atom, atomVideos),
    message: editorialAtomizerMessage(atom, atomVideos, liquidMatches),
    liquidMatches,
    videoIds: atomVideos.map(video => video.videoId),
    videoCount: atomVideos.length
  };
}

function historyEntryMessage(entry, catalog, feed) {
  const atomsBySlug = new Map(uniqueAtomizers(catalog).map(atom => [slugify(atom.name), atom]));
  const keyParts = String(entry && entry.key || '').split(':');
  const slug = keyParts[1] || slugify(entry && entry.name);
  const atom = atomsBySlug.get(slug);
  if (!atom) throw new Error(`Atomizorul ${entry && entry.name || slug} nu mai există în catalog.`);
  const liquidMatches = topLiquidMatchesForAtom(atom, catalog, 3);
  if (liquidMatches.length !== 3) throw new Error(`Nu există exact trei lichide pentru ${atom.name}.`);
  const feedVideos = reviewEntries(feed);
  const requestedVideoIds = keyParts.slice(2).join(':').split(',').filter(Boolean);
  const exactVideos = requestedVideoIds.length
    ? feedVideos.filter(video => requestedVideoIds.includes(video.videoId))
    : [];
  const videos = exactVideos.length ? exactVideos : videosForAtom(feedVideos, slug).slice(0, 2);

  let message = '';
  if (entry.type === 'review') message = reviewMessage(atom, videos, liquidMatches);
  else if (entry.type === 'recommendation') message = recommendationMessage(atom, liquidMatches);
  else message = atomizerMessage(atom, videos, liquidMatches);

  if (!message.includes(LIQUID_TEASER) || !liquidMatches.every(match => message.includes(match.title))) {
    throw new Error(`Textul Facebook nu afișează toate cele trei lichide pentru ${atom.name}.`);
  }
  if (/preț|stoc|cumpărare|pentru comenzi|0736\s*018\s*023|smokee\.ro\/product/i.test(message)) {
    throw new Error(`Textul Facebook conține formulări comerciale pentru ${atom.name}.`);
  }
  return { atom, liquidMatches, message };
}

async function refreshTodayLiquidMessages(options = {}) {
  const targetDate = todayInRomania();
  const catalog = loadCatalog(ROOT);
  const feed = readJson(REVIEW_PATH, { schemaVersion: 1, models: {} });
  const state = readJson(STATE_PATH, emptyState());
  const seenPostIds = new Set();
  const entries = state.history.filter(entry => {
    if (!entry || !entry.postId || dateInRomania(entry.publishedAt) !== targetDate) return false;
    if (seenPostIds.has(entry.postId)) return false;
    seenPostIds.add(entry.postId);
    return true;
  });
  const updates = entries.map(entry => ({ entry, ...historyEntryMessage(entry, catalog, feed) }));
  if (!updates.length) {
    console.log(`Facebook liquid details: no posts require an update for ${targetDate}.`);
    return;
  }
  if (options.checkOnly) {
    updates.forEach(update => console.log(`Facebook liquid details ready: ${update.atom.name} -> 3 liquids (${update.entry.postId}).`));
    return;
  }
  if (!pageId || !accessToken) {
    throw new Error('FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be configured.');
  }
  await verifyFacebookPage();
  for (const update of updates) {
    const body = new URLSearchParams({ message: update.message, access_token: accessToken });
    const payload = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(update.entry.postId)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body
    }, 1);
    if (payload.success !== true) throw new Error(`Meta did not confirm the text update for ${update.atom.name}.`);
    const timestamp = nowIso();
    update.entry.formatVersion = 'educational-single-photo-v2';
    update.entry.messageVersion = 'three-liquids-after-expand-v2';
    update.entry.messageUpdatedAt = timestamp;
    state.updatedAt = timestamp;
    writeJsonAtomic(STATE_PATH, state);
    console.log(`Facebook liquid details updated: ${update.atom.name} (${update.entry.postId}).`);
  }
}

async function main() {
  if (repairTodayLiquids || checkRepairTodayLiquids) {
    await refreshTodayLiquidMessages({ checkOnly: checkRepairTodayLiquids });
    return;
  }
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
    const publishState = readJson(STATE_PATH, emptyState());
    const dailyPublished = facebookPostsOnDate(campaignState, publishState);
    const events = planEditorialPosts(catalog, feed, campaignState, { maxPosts, dailyPublished });

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
  const campaignState = normalizeCampaignState(readJson(CAMPAIGN_STATE_PATH, emptyCampaignState()));
  const dailyPublished = facebookPostsOnDate(campaignState, state);
  const events = planUpdates(catalog, feed, state, { maxPosts, dailyPublished });

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
  assertEventLiquidTriplet,
  atomizerImage,
  atomizerImageCandidates,
  atomizerMessage,
  atomizerUrl,
  baselineState,
  editorialAtomizerMessage,
  dateInRomania,
  emptyCampaignState,
  emptyState,
  facebookPostsOnDate,
  inferAtomRoles,
  historyEntryMessage,
  liquidMatchLines,
  normalizeCampaignState,
  planEditorialPosts,
  planUpdates,
  profileMatchesForAtom,
  recommendationMessage,
  recommendationSignature,
  reviewEntries,
  reviewMessage,
  topLiquidMatchesForAtom,
  uniqueAtomizers,
  validateState
};

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
