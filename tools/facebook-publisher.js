#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  loadCatalog,
  publicAtomName,
  sourceUrl,
  slugify
} = require('./catalog-data');

const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'data', 'facebook-publish-state.json');
const CAMPAIGN_STATE_PATH = path.join(ROOT, 'data', 'facebook-campaign-state.json');
const REVIEW_PATH = path.join(ROOT, 'data', 'youtube-reviews.json');
const MODS_PATH = path.join(ROOT, 'data', 'smokee-mods.json');
const SITE = 'https://ghid-rta.ro';
const DEFAULT_GRAPH_VERSION = 'v25.0';
const DEFAULT_DAILY_POSTS = 2;
const DEFAULT_MAX_POSTS = DEFAULT_DAILY_POSTS;
const GUIDE_FIT_LINE = 'https://ghid-rta.ro/';
const GUIDE_CONTEXT_LINE = 'Pentru modul de utilizare, configurare si detalii, consultati ghidul.';
const TRIANGULATION_LINE = 'Redarea corecta si coerenta a gustului depinde de triangularea dintre profilul lichidului, arhitectura atomizorului si caracteristicile buildului.';
const ADULT_TECHNICAL_LINE = 'Documentatie tehnica destinata adultilor 18+.';
const FACEBOOK_FORMAT_VERSION = 'educational-editorial-photo-v8';
const FACEBOOK_MESSAGE_VERSION = 'documented-model-guide-triangulation-v4';
const FACEBOOK_ALBUM_VERSION = 'original-editorial-photo-v4';
const ATOMIZER_TITLE_FRAME = 'FISA DOCUMENTATA IN GHID';
const MOD_TITLE_FRAME = 'FISA DOCUMENTATA IN GHID';
const EDITORIAL_IMAGE_BASE = `${SITE}/assets/facebook/hourly-2026-07-30`;
const EDITORIAL_IMAGES = Array.from({ length: 7 }, (_, index) =>
  `${EDITORIAL_IMAGE_BASE}/photo-${String(index + 1).padStart(2, '0')}.png`
);
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
const repairMissingLiquidGalleries = args.includes('--repair-missing-liquid-galleries');
const checkRepairMissingLiquidGalleries = args.includes('--check-repair-missing-liquid-galleries');
const repairZeroNicotineGalleries = args.includes('--repair-zero-nicotine-galleries');
const checkRepairZeroNicotineGalleries = args.includes('--check-repair-zero-nicotine-galleries');
const repairLegacyPostGalleries = args.includes('--repair-legacy-post-galleries');
const checkRepairLegacyPostGalleries = args.includes('--check-repair-legacy-post-galleries');
const dedupePosts = args.includes('--dedupe-posts');
const checkDedupePosts = args.includes('--check-dedupe-posts');
const repairVisibility = args.includes('--repair-visibility');
const checkVisibility = args.includes('--check-visibility');
const repairModel = String(valueAfter('--model') || '').trim();
const maxPosts = Math.max(1, Number(valueAfter('--max-posts') || DEFAULT_MAX_POSTS));
const pageId = String(process.env.FACEBOOK_PAGE_ID || '').trim();
const accessToken = String(process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '').trim();
const graphVersion = String(process.env.FACEBOOK_GRAPH_VERSION || DEFAULT_GRAPH_VERSION).trim();

function boldText(value) {
  const upperStart = 0x1d5d4;
  const lowerStart = 0x1d5ee;
  const digitStart = 0x1d7ec;
  return String(value || '').split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(upperStart + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(lowerStart + code - 97);
    if (code >= 48 && code <= 57) return String.fromCodePoint(digitStart + code - 48);
    return char;
  }).join('');
}

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

function canonicalFamilyText(value) {
  return normalizeMatchText(value)
    .replace(/\b(?:atomizor|atomizer|rta|mtl|dl|rdl|by|the|mods?|mod)\b/g, ' ')
    .replace(/\b(?:stainless|steel|ss|black|full|matte|silver|dlc|gunmetal|gun|metal|dark|grey|gray|green|blue|red|gold|purple|pink|white|orange|brown|polished|finish|bundle|nano|standard|set|top|refill|edition|limited|resigilat)\b/g, ' ')
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:ml|mm|w|mah)\b/g, ' ')
    .replace(/\b(?:18650|18500|21700|18350)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalAtomizerFamilyKey(value) {
  const text = canonicalFamilyText(publicAtomName(value));
  if (!text) return '';
  if (/\bprime\s+minister\b/.test(text)) return text.includes('freehand') ? 'prime minister freehand' : 'prime minister';
  if (/\bminister\b/.test(text)) return 'minister';
  if (/\bbishop\b/.test(text)) return 'bishop';
  if (/\bblaze\b/.test(text)) return 'blaze';
  if (/\bby\s*ka\s*v?\s*11\b|\bbyka\s*v?\s*11\b/.test(text)) return 'by ka v11';
  if (/\bby\s*ka\s*v?\s*7\b|\bbyka\s*v?\s*7\b/.test(text)) return 'by ka v7';
  if (/\bby\s*ka\s*v?\s*8\b|\bbyka\s*v?\s*8\b/.test(text)) return 'by ka v8';
  return slugify(text);
}

function modFamilyKey(item) {
  const text = canonicalFamilyText(item && (item.familyKey || item.title));
  if (/\bkhonsu\b.*\beclipse\b/.test(text)) return 'khonsu eclipse';
  if (/\bmood\b.*\bv\s*2\b/.test(text)) return 'mood v2';
  if (/\btelli\b.*\bqueen\s*iii\b/.test(text)) return 'telli queen iii';
  if (/\btelli\b.*\bking\s*v\s*2\b/.test(text)) return 'telli king v2';
  if (/\barcana\b.*\bsbs\b/.test(text)) return 'arcana sbs';
  if (/\barcana\b.*\bbox\b/.test(text)) return 'arcana box';
  if (/\bambition\b.*\bmorer\b/.test(text)) return 'ambition morer sbs';
  if (/\bnitrous\b.*\bpocket\b/.test(text)) return 'nitrous pocket';
  if (/\bparamour\b.*\bv\s*2\b/.test(text)) return 'paramour v2 sbs';
  if (/\bearly\b.*\bbird\b.*\bharrier\b/.test(text)) return 'early bird harrier';
  if (/\bdicodes\b.*\bdani\b.*\bmicro\b/.test(text)) return 'dicodes dani box micro';
  if (/\blost\b.*\bvape\b.*\bthelema\b.*\bsolo\b/.test(text)) return 'lost vape thelema solo';
  if (/\bvandy\b.*\bvape\b.*\bel\b.*\bmono\b/.test(text)) return 'vandy vape el mono';
  if (/\bvsmosfet\b/.test(text)) return 'vsmosfet tube';
  if (/\bminister\b/.test(text)) return 'centenary minister mod';
  return text;
}

function editorialImageForKey(value) {
  const digest = crypto.createHash('sha256').update(String(value || 'ghid-rta')).digest();
  return EDITORIAL_IMAGES[digest[0] % EDITORIAL_IMAGES.length];
}
function highEndModCandidates(modsFeed = readJson(MODS_PATH, { items: [] })) {
  const explicit = Array.isArray(modsFeed && modsFeed.highEndItems) ? modsFeed.highEndItems : null;
  const source = explicit || [].concat(modsFeed && modsFeed.items || []).filter(item => {
    const title = normalizeMatchText(item && item.title);
    return /(?:arcana|vsmosfet|morer|dna\s*(?:60|80)|dicodes|pipeline|telli|khonsu|ennequadro|early bird|fakirs|centenary|parsons|paramour|sentinel|am\s*60)/.test(title);
  });
  const seen = new Set();
  return source.filter(item => {
    const key = modFamilyKey(item);
    const reviewUrl = String(item && item.review && item.review.url || '');
    if (!key || seen.has(key)) return false;
    const valid = item && item.highEnd !== false &&
      /^https:\/\/smokee\.ro\/product\//i.test(String(item && item.url || '')) &&
      /^https:\/\//i.test(String(item && item.image || '')) &&
      /^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/i.test(reviewUrl) &&
      modReviewLooksRelevant(item);
    if (valid) seen.add(key);
    return valid;
  });
}

function modReviewLooksRelevant(item) {
  const key = modFamilyKey(item);
  const title = normalizeMatchText(item && item.review && item.review.title || '');
  if (!key || !title) return false;
  const exactRules = [
    ['khonsu eclipse', ['khonsu', 'eclipse']],
    ['mood v2', ['mood']],
    ['telli queen iii', ['queen']],
    ['telli king v2', ['king']],
    ['arcana sbs dna60', ['arcana', 'sbs']],
    ['arcana sbs', ['arcana', 'sbs']],
    ['arcana box dna60', ['arcana', 'box']],
    ['arcana box', ['arcana', 'box']],
    ['ambition morer sbs', ['morer']],
    ['vsmosfet tube', ['vsmosfet']],
    ['centenary minister mod', ['minister']]
  ];
  const matchedRule = exactRules.find(([ruleKey]) => key === ruleKey);
  if (matchedRule) return matchedRule[1].every(token => title.includes(token));
  const keyTokens = key.split(' ').filter(token => token.length >= 4 && !['mods', 'high', 'end', 'tube', 'sbs', 'dna60', 'dna80'].includes(token));
  if (!keyTokens.length) return true;
  return keyTokens.some(token => title.includes(token));
}

function highEndModForAtom(atom, modsFeed, options = {}) {
  const candidates = highEndModCandidates(modsFeed);
  const usedKeys = new Set([].concat(options.usedKeys || []).map(normalizeMatchText));
  const available = candidates.filter(item => !usedKeys.has(modFamilyKey(item)));
  const pool = available.length ? available : candidates;
  const atomText = normalizeMatchText([
    atom && atom.name,
    atom && atom.classes,
    atom && atom.dna,
    atom && atom.market,
    JSON.stringify(atom && atom.builds || [])
  ].join(' '));
  return pool.map((item, index) => {
    const title = normalizeMatchText(item.title);
    let score = Math.max(0, 30 - index);
    if (/arcana|muted|chariot|temperature|control temperatura|nife|ss316|tc\b/.test(atomText) && /arcana/.test(title)) score += 45;
    if (/vape systems|by ka|dvarw|kayfun|taifun|gtr|fev|22 mm|22mm|21 mm|21mm|20 mm|20mm|19 mm|19mm/.test(atomText) && /vsmosfet/.test(title)) score += 38;
    if (/ambition|amazier|revorie|trinity|bi2hop|compact|mini|nano|daily/.test(atomText) && /morer/.test(title)) score += 40;
    if (/23 mm|23mm|24 mm|24mm|sbs|side by side/.test(atomText) && /arcana|morer/.test(title)) score += 20;
    if (/temperature|control temperatura|nife|ss316|tc\b/.test(atomText) && /dna|dicodes|bf\s*60|am\s*60/.test(title)) score += 34;
    if (/compact|mini|nano|18 mm|18mm|19 mm|19mm|20 mm|20mm/.test(atomText) && /sbs|micro|tube|minister/.test(title)) score += 24;
    if (/22 mm|22mm|23 mm|23mm|24 mm|24mm/.test(atomText) && /sbs|box|parsons|harrier|queen|king/.test(title)) score += 16;
    const atomBrand = atomText.split(' ').find(token => token.length >= 5 && !['atomizor', 'tobacco', 'camera', 'airflow'].includes(token));
    if (atomBrand && title.includes(atomBrand)) score += 28;
    return { item, score };
  }).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))[0]?.item || null;
}

function recordedModSequence(campaignState, publishState) {
  const records = [];
  const seenPostIds = new Set();
  const add = entry => {
    if (!entry || !entry.mod) return;
    const postId = String(entry.postId || '');
    if (postId && seenPostIds.has(postId)) return;
    if (postId) seenPostIds.add(postId);
    records.push({ publishedAt: String(entry.originalPublishedAt || entry.publishedAt || ''), mod: entry.mod });
  };
  [].concat(campaignState && campaignState.history || []).forEach(add);
  [].concat(publishState && publishState.history || []).forEach(add);
  return records.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt)).map(record => record.mod);
}

function createHighEndModRotation(modsFeed, campaignState, publishState, options = {}) {
  const candidates = highEndModCandidates(modsFeed);
  const candidateKeys = new Set(candidates.map(modFamilyKey));
  const used = new Set();
  if (!options.reset) {
    recordedModSequence(campaignState, publishState).forEach(mod => {
      const key = modFamilyKey(mod);
      if (!candidateKeys.has(key)) return;
      if (used.size >= candidateKeys.size) used.clear();
      used.add(key);
    });
  }
  return {
    candidates,
    used,
    pick(atom) {
      if (!candidates.length) return null;
      if (used.size >= candidateKeys.size) used.clear();
      const mod = highEndModForAtom(atom, modsFeed, { usedKeys: Array.from(used) });
      if (mod) used.add(modFamilyKey(mod));
      return mod;
    }
  };
}

function modStateItem(mod) {
  if (!mod) return null;
  return {
    familyKey: modFamilyKey(mod),
    title: cleanText(mod.title, 160),
    url: String(mod.url || '').trim(),
    image: String(mod.image || '').trim(),
    reviewUrl: String(mod.review && mod.review.url || '').trim()
  };
}

function modCatalogCandidates(modsFeed = readJson(MODS_PATH, { items: [] })) {
  const source = Array.isArray(modsFeed && modsFeed.catalogItems) && modsFeed.catalogItems.length
    ? modsFeed.catalogItems
    : [].concat(modsFeed && modsFeed.items || [], modsFeed && modsFeed.highEndItems || []);
  const ordered = source.slice().sort((a, b) => {
    return String(b && (b.publishedAt || b.addedAt) || '').localeCompare(String(a && (a.publishedAt || a.addedAt) || '')) ||
      String(a && a.title || '').localeCompare(String(b && b.title || ''));
  });
  const seen = new Set();
  return ordered.filter(item => {
    const key = modFamilyKey(item);
    const valid = key && cleanText(item && item.title, 160) &&
      /^https:\/\/smokee\.ro\/product\//i.test(String(item && item.url || '')) &&
      /^https:\/\//i.test(String(item && item.image || ''));
    if (!valid || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function smokeeAtomizerCandidates(catalog) {
  return uniqueAtomizers(catalog).filter(atom => {
    return /^https:\/\/smokee\.ro\/product\//i.test(atomizerSourceUrl(atom));
  });
}

function eventProductType(event) {
  if (event && (event.productType === 'mod' || event.type === 'mod' || String(event.key || '').startsWith('mod:'))) return 'mod';
  return 'atomizer';
}

function postedModFamilyKeys(campaignState, publishState) {
  const keys = new Set();
  Object.entries(campaignState && campaignState.postedMods || {}).forEach(([key, entry]) => {
    const family = modFamilyKey(entry || { title: key });
    if (family) keys.add(family);
  });
  const add = entry => {
    if (!entry || !entry.postId) return;
    if (eventProductType(entry) === 'mod') {
      const family = modFamilyKey({ familyKey: entry.familyKey, title: entry.name });
      if (family) keys.add(family);
    }
  };
  [].concat(campaignState && campaignState.history || []).forEach(add);
  [].concat(publishState && publishState.history || []).forEach(add);
  return keys;
}

function lastPublishedProductType(campaignState, publishState) {
  const records = [].concat(campaignState && campaignState.history || [], publishState && publishState.history || [])
    .filter(entry => entry && (entry.publishedAt || entry.originalPublishedAt))
    .sort((a, b) => String(b.publishedAt || b.originalPublishedAt).localeCompare(String(a.publishedAt || a.originalPublishedAt)));
  return records.length ? eventProductType(records[0]) : '';
}
function modSelectionChanged(previous, mod) {
  const next = modStateItem(mod);
  return !previous || !next || modFamilyKey(previous) !== next.familyKey || previous.title !== next.title || previous.url !== next.url ||
    previous.image !== next.image || previous.reviewUrl !== next.reviewUrl;
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

function isNicotineFreeFacebookLiquid(item) {
  const title = String(item && item.title || '').trim();
  const url = String(item && item.url || '').trim();
  const text = `${title} ${url}`;
  const isConcentrateOrLongfill = /\barom(?:a|ă|e)\b|\blong\s*fill\b|\blongfill\b/i.test(text);
  const hasNicotineMarker = /\b\d+(?:[.,]\d+)?\s*mg(?:\s*\/\s*ml)?\b|\bnicotin(?:ă|a|e|ei)?\b|\bnicotine\b|\bnic\s*-?\s*shot\b|\bnicshot\b|\bbooster\s+nicotin/i.test(text);
  return isConcentrateOrLongfill && !hasNicotineMarker;
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
    return item.title && /^https:\/\/smokee\.ro\/product\//i.test(String(item.url || '')) &&
      isNicotineFreeFacebookLiquid(item);
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
      nicotineFree: true,
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
  return [];
}

function liquidHeadlineLines(matches) {
  return [];
}

function noticeBannerLines() {
  return [ADULT_TECHNICAL_LINE];
}

function atomizerHeadingLines(atom) {
  return [
    ATOMIZER_TITLE_FRAME,
    cleanText(atom && atom.name, 160),
    ''
  ];
}

function liquidStateItems(matches) {
  return [].concat(matches || []).slice(0, 3).map(match => ({
    title: cleanText(match.title, 150),
    tag: cleanText(match.tag, 80),
    profile: cleanText(match.profile, 120),
    url: String(match.url || '').trim(),
    image: String(match.image || '').trim(),
    stock: match.stock !== false,
    nicotineFree: true
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

function isRealAtomizerImage(value) {
  const image = String(value || '').trim();
  if (!/^https:\/\//i.test(image)) return false;
  try {
    const host = new URL(image).hostname.toLowerCase().replace(/^www\./, '');
    return host !== 'youtube.com' && !host.endsWith('.youtube.com') &&
      host !== 'youtu.be' && host !== 'i.ytimg.com' && !host.endsWith('.ytimg.com');
  } catch (error) {
    return false;
  }
}

function isVerifiedReviewThumbnail(value) {
  const image = String(value || '').trim();
  if (!/^https:\/\//i.test(image)) return false;
  try {
    const url = new URL(image);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return (host === 'i.ytimg.com' || host === 'img.youtube.com') &&
      /^\/vi\/[A-Za-z0-9_-]{6,}\/(?:hqdefault|maxresdefault|sddefault)\.(?:jpg|webp)$/i.test(url.pathname);
  } catch (error) {
    return false;
  }
}

function isPublishableAtomizerImage(value) {
  return isRealAtomizerImage(value) || isVerifiedReviewThumbnail(value);
}

function isLikelyAtomizerImageSource(value) {
  const image = String(value || '').trim();
  if (!isRealAtomizerImage(image)) return false;
  const lower = image.toLowerCase();
  return !(
    lower.includes('google.com/search') ||
    lower.includes('google.com/url?') ||
    lower.includes('youtube.com/results') ||
    /youtu\.be\//.test(lower) ||
    /youtube\.com\/(?:watch|embed|shorts)\//.test(lower) ||
    /smokee\.ro\/product\//.test(lower) ||
    lower.includes('/?s=')
  );
}

function atomizerImageCandidates(atom) {
  const candidates = []
    .concat(atom && atom.image || '')
    .concat(extractAtomizerLocalImages(atom))
    .concat(
      atom && atom.imageUrl,
      atom && atom.image_url,
      atom && atom.Image,
      atom && atom.cover,
      atom && atom.coverImage,
      atom && atom.thumbnail,
      atom && atom.imageVariants,
      atom && atom.media
    )
    .filter(Boolean)
    .map(value => String(value).trim())
    .filter(isLikelyAtomizerImageSource)
    .filter(value => !/^https:\/\/i\.ytimg\.com\//i.test(value));
  return Array.from(new Set(candidates)).filter(Boolean);
}

function atomizerSourceUrl(atom) {
  const candidates = [].concat(atom && atom.sources || [], atom && atom.Surse || [])
    .map(source => ({
      url: typeof source === 'string' ? String(source).trim() : String(sourceUrl(source) || '').trim(),
      type: normalizeMatchText(source && typeof source === 'object'
        ? (source['Tip sursa'] || source.type || source.tip || '')
        : '')
    }))
    .filter(item => /^https?:\/\//i.test(item.url))
    .filter(item => !/google\.com\/search|youtube\.com|youtu\.be|ghid-rta\.ro/i.test(item.url));
  const score = item => {
    if (/smokee\.ro\/product\//i.test(item.url)) return 0;
    if (/official|manufacturer|producator|product|produs/i.test(item.type)) return 1;
    if (/review|forum|community/i.test(item.type)) return 3;
    return 2;
  };
  return candidates.sort((a, b) => score(a) - score(b))[0]?.url || '';
}

function atomizerSourceLines(atom) {
  const url = atomizerSourceUrl(atom);
  return url ? ['', `Sursa modelului: ${url}`] : [];
}

function atomizerYouTubeFallbackCandidates(atom, videos = []) {
  const ids = new Set();
  [].concat(atom && atom.youtube || []).forEach(source => {
    const id = youtubeVideoId(source && source.URL);
    if (id) ids.add(id);
  });
  [].concat(videos || []).forEach(video => {
    const id = youtubeVideoId(video && video.url || video && video.URL);
    if (id) ids.add(id);
  });
  return Array.from(ids).map(id => `https://img.youtube.com/vi/${id}/hqdefault.jpg`);
}

function atomizerImage(atom, videos = [], options = {}) {
  const candidates = atomizerImageCandidates(atom);
  if (candidates.length) return candidates[0];
  if (!options.fallbackToVideos) return '';
  return atomizerYouTubeFallbackCandidates(atom, videos)[0] || '';
}

function extractAtomizerLocalImages(atom) {
  const slug = slugify(publicAtomName(atom && atom.name || ''));
  const localPage = path.join(ROOT, 'atomizoare', slug, 'index.html');
  if (!slug || !fs.existsSync(localPage)) return [];
  const html = fs.readFileSync(localPage, 'utf8');
  const candidates = [];
  const fromMeta = [
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i),
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
  ];
  fromMeta.forEach(match => {
    if (match && match[1]) candidates.push(match[1]);
  });
  const figure = html.match(/<figure[^>]+class=["'][^"']*product-detail-media[^"']*["'][^>]*>\s*<[^>]+class=["'][^"']*[^"']*["'][^>]*>\s*<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (figure && figure[1]) candidates.push(figure[1]);
  const ld = html.match(/\"image\"\s*:\s*\"([^\"]+)\"/i);
  if (ld && ld[1]) candidates.push(ld[1]);
  const pageUrl = atomizerUrl(atom);
  return candidates.map(candidate => {
    const value = String(candidate || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (/^\/\//.test(value)) return `https:${value}`;
    if (/^\//.test(value) && /^https:\/\//i.test(pageUrl)) return `${pageUrl.replace(/\/$/, '')}${value}`;
    return '';
  }).filter(Boolean);
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
        viewCount: Math.max(0, Number(video.viewCount || 0)),
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
    modBaselineAt: '',
    updatedAt: '',
    pageId: '',
    seenAtomizers: {},
    seenMods: {},
    recommendationSignatures: {},
    seenVideos: {},
    history: []
  };
}
function baselineState(catalog, feed, modsFeed = readJson(MODS_PATH, { items: [] }), timestamp = nowIso()) {
  const state = emptyState();
  state.baselineAt = timestamp;
  state.modBaselineAt = timestamp;
  state.updatedAt = timestamp;
  uniqueAtomizers(catalog).forEach(atom => {
    const slug = slugify(atom.name);
    state.seenAtomizers[slug] = { seenAt: timestamp, source: 'baseline' };
    state.recommendationSignatures[slug] = recommendationSignature(atom);
  });
  modCatalogCandidates(modsFeed).forEach(mod => {
    const familyKey = modFamilyKey(mod);
    state.seenMods[familyKey] = { seenAt: timestamp, source: 'baseline' };
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
    pace: 'one-post-per-day',
    pageId: '',
    postedAtomizers: {},
    postedMods: {},
    history: []
  };
}

function normalizeCampaignState(value) {
  const state = value && typeof value === 'object' ? value : emptyCampaignState();
  state.schemaVersion = 1;
  state.startedAt = state.startedAt || nowIso();
  state.updatedAt = state.updatedAt || '';
  state.pace = 'one-atomizer-one-mod-per-day';
  state.pageId = state.pageId || '';
  state.postedAtomizers = state.postedAtomizers && typeof state.postedAtomizers === 'object' ? state.postedAtomizers : {};
  state.postedMods = state.postedMods && typeof state.postedMods === 'object' ? state.postedMods : {};
  state.history = Array.isArray(state.history) ? state.history : [];
  return state;
}

function ensureModBaseline(state, modsFeed, timestamp = nowIso()) {
  const hasBaseline = state && state.seenMods && typeof state.seenMods === 'object' && state.modBaselineAt;
  if (hasBaseline) return false;
  state.seenMods = {};
  modCatalogCandidates(modsFeed).forEach(mod => {
    const familyKey = modFamilyKey(mod);
    state.seenMods[familyKey] = { seenAt: timestamp, source: 'migration-baseline' };
  });
  state.modBaselineAt = timestamp;
  state.updatedAt = timestamp;
  return true;
}
function facebookPostsOnDate(campaignState, publishState, targetDate = todayInRomania()) {
  const posts = new Set();
  const add = (scope, key, item) => {
    if (dateInRomania(item && item.publishedAt) !== targetDate) return;
    posts.add(String(item.postId || `${scope}:${key}:${item.publishedAt}`));
  };
  Object.entries(campaignState && campaignState.postedAtomizers || {}).forEach(([slug, item]) => add('atomizer', slug, item));
  Object.entries(campaignState && campaignState.postedMods || {}).forEach(([key, item]) => add('mod', key, item));
  [].concat(campaignState && campaignState.history || []).forEach(item => add('campaign', item && (item.key || item.slug || item.name), item));
  [].concat(publishState && publishState.history || []).forEach(item => add('update', item && (item.key || item.name), item));
  return posts.size;
}

function facebookProductTypesOnDate(campaignState, publishState, targetDate = todayInRomania()) {
  const posts = new Map();
  const add = (scope, key, item, fallbackType) => {
    if (dateInRomania(item && item.publishedAt) !== targetDate) return;
    const postId = String(item.postId || `${scope}:${key}:${item.publishedAt}`);
    posts.set(postId, eventProductType(item) || fallbackType);
  };
  Object.entries(campaignState && campaignState.postedAtomizers || {}).forEach(([slug, item]) => add('atomizer', slug, item, 'atomizer'));
  Object.entries(campaignState && campaignState.postedMods || {}).forEach(([key, item]) => add('mod', key, item, 'mod'));
  [].concat(campaignState && campaignState.history || []).forEach(item => add('campaign', item && (item.key || item.slug || item.name), item, 'atomizer'));
  [].concat(publishState && publishState.history || []).forEach(item => add('update', item && (item.key || item.name), item, 'atomizer'));
  return new Set(posts.values());
}
function canonicalAtomizerSlug(value) {
  return slugify(publicAtomName(value));
}

function historyAtomizerSlug(entry) {
  if (entry && entry.name) return canonicalAtomizerSlug(entry.name);
  const match = String(entry && entry.key || '').match(/^(?:atomizer|recommendation|review):([^:]+)/);
  return canonicalAtomizerSlug(match ? match[1] : '');
}

function postedAtomizerSlugs(campaignState, publishState) {
  const slugs = new Set();
  Object.entries(campaignState && campaignState.postedAtomizers || {}).forEach(([slug, entry]) => {
    const canonical = canonicalAtomizerFamilyKey(entry && entry.name || slug) || canonicalAtomizerSlug(entry && entry.name || slug);
    if (canonical) slugs.add(canonical);
  });
  [].concat(publishState && publishState.history || []).forEach(entry => {
    if (!entry || !entry.postId || eventProductType(entry) === 'mod') return;
    const canonical = canonicalAtomizerFamilyKey(entry.name || historyAtomizerSlug(entry)) || historyAtomizerSlug(entry);
    if (canonical) slugs.add(canonical);
  });
  return slugs;
}

function duplicateFacebookPostGroups(campaignState, publishState) {
  const records = [];
  Object.entries(campaignState && campaignState.postedAtomizers || {}).forEach(([slug, entry]) => {
    if (!entry || !entry.postId) return;
    records.push({
      scope: 'campaign',
      slug,
      name: entry.name || slug,
      familyKey: entry.familyKey || '',
      postId: entry.postId,
      publishedAt: entry.publishedAt || ''
    });
  });
  [].concat(publishState && publishState.history || []).forEach(entry => {
    if (!entry || !entry.postId || eventProductType(entry) === 'mod') return;
    records.push({
      scope: 'publish',
      entry,
      slug: historyAtomizerSlug(entry),
      name: entry.name || historyAtomizerSlug(entry),
      familyKey: entry.familyKey || '',
      postId: entry.postId,
      publishedAt: entry.publishedAt || ''
    });
  });

  const grouped = new Map();
  records.forEach(record => {
    const canonical = record.familyKey || canonicalAtomizerFamilyKey(record.name || record.slug) || canonicalAtomizerSlug(record.name || record.slug);
    if (!canonical) return;
    if (!grouped.has(canonical)) grouped.set(canonical, []);
    grouped.get(canonical).push(record);
  });
  return Array.from(grouped.entries())
    .map(([canonical, recordsForModel]) => {
      const uniquePosts = Array.from(new Map(recordsForModel.map(record => [record.postId, record])).values());
      return {
        canonical,
        records: uniquePosts.sort((a, b) => String(a.publishedAt).localeCompare(String(b.publishedAt)))
      };
    })
    .filter(group => group.records.length > 1)
    .sort((a, b) => a.canonical.localeCompare(b.canonical));
}

function validateState(state) {
  const errors = [];
  if (!state || state.schemaVersion !== 1) errors.push('invalid schemaVersion');
  ['seenAtomizers', 'seenMods', 'recommendationSignatures', 'seenVideos'].forEach(key => {
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

function videoPriority(video) {
  const clonePenalty = video && video.scope === 'clone' ? 2 : 0;
  const buildPenalty = video && video.kind === 'build' ? 1 : 0;
  return clonePenalty + buildPenalty;
}

function compareVideos(a, b) {
  return videoPriority(a) - videoPriority(b) ||
    Number(b && b.viewCount || 0) - Number(a && a.viewCount || 0) ||
    String(a && a.videoId || '').localeCompare(String(b && b.videoId || ''));
}

function videosForAtom(feedVideos, slug) {
  return feedVideos.filter(video => video.slug === slug).sort(compareVideos);
}

function principalVideo(videos) {
  return [].concat(videos || [])
    .filter(video => video && youtubeVideoId(video.url))
    .sort(compareVideos)[0] || null;
}

function directVideoLines(videos) {
  if (!Array.isArray(videos) || !videos.length) return [];
  const principal = principalVideo(videos);
  if (!principal) return [];
  const hasClone = videos.some(video => video.scope === 'clone');
  const label = principal.kind === 'build' ? 'Build video principal' : 'Recenzie video principala';
  const clone = principal.scope === 'clone' ? ' (material realizat pe clona; nu este recenzia originalului)' : '';
  const views = Number(principal.viewCount || 0) > 0
    ? `, ${new Intl.NumberFormat('ro-RO').format(Number(principal.viewCount))} vizualizari verificate`
    : '';
  return [
    `${label}${clone}${views}: ${cleanText(principal.title, 160)}`,
    principal.url,
    `Recenziile si buildurile video verificate sunt disponibile in fisa completa${hasClone ? '; materialele pe clone sunt marcate distinct' : ''}.`
  ];
}

function safeAtomizerMessage(atom) {
  return [
    ATOMIZER_TITLE_FRAME,
    cleanText(atom && atom.name, 160),
    GUIDE_FIT_LINE,
    '',
    'Camera de evaporare, alimentarea, geometria airflowului si buildul trebuie evaluate impreuna.',
    '',
    TRIANGULATION_LINE,
    '',
    GUIDE_CONTEXT_LINE,
    '',
    ADULT_TECHNICAL_LINE
  ].join('\n');
}

function modMessage(mod) {
  return [
    MOD_TITLE_FRAME,
    cleanText(mod && mod.title, 160),
    GUIDE_FIT_LINE,
    '',
    'Stabilitatea alimentarii, atomizorul si buildul trebuie evaluate impreuna.',
    '',
    TRIANGULATION_LINE,
    '',
    GUIDE_CONTEXT_LINE,
    '',
    ADULT_TECHNICAL_LINE
  ].join('\n');
}

function atomizerMessage(atom) {
  return safeAtomizerMessage(atom);
}

function editorialAtomizerMessage(atom) {
  return safeAtomizerMessage(atom);
}

function recommendationMessage(atom) {
  return safeAtomizerMessage(atom);
}

function reviewMessage(atom) {
  return safeAtomizerMessage(atom);
}

function atomizerProductEvent(atom, feedVideos, type = 'atomizer') {
  const slug = slugify(atom.name);
  const familyKey = canonicalAtomizerFamilyKey(atom.name) || canonicalAtomizerSlug(atom.name);
  const imageCandidates = atomizerImageCandidates(atom);
  const productImage = imageCandidates[0] || '';
  if (!productImage) return null;
  const image = editorialImageForKey(familyKey || slug);
  return {
    type,
    productType: 'atomizer',
    key: `${type}:${slug}`,
    slug,
    familyKey,
    name: atom.name,
    link: `${SITE}/`,
    image,
    imageCandidates: [image],
    productImage,
    message: type === 'editorial' ? editorialAtomizerMessage(atom) : atomizerMessage(atom),
    liquidMatches: [],
    mod: null,
    signature: recommendationSignature(atom),
    videoIds: [].concat(feedVideos || []).map(video => video.videoId),
    videoCount: [].concat(feedVideos || []).length,
    publishedAt: atom.addedAt || atom.firstSeenAt || ''
  };
}

function modProductEvent(mod, type = 'mod') {
  const familyKey = modFamilyKey(mod);
  const productImage = String(mod && mod.image || '').trim();
  if (!familyKey || !/^https:\/\//i.test(productImage)) return null;
  const image = editorialImageForKey(familyKey);
  return {
    type: 'mod',
    productType: 'mod',
    key: `mod:${slugify(familyKey)}`,
    slug: slugify(familyKey),
    familyKey,
    name: cleanText(mod.title, 160),
    link: `${SITE}/`,
    image,
    imageCandidates: [image],
    productImage,
    message: modMessage(mod),
    liquidMatches: [],
    mod: null,
    videoIds: [],
    videoCount: 0,
    publishedAt: mod.publishedAt || mod.addedAt || ''
  };
}

function planUpdates(catalog, feed, state, options = {}) {
  const alreadyPublished = Number.isFinite(Number(options.dailyPublished)) ? Math.max(0, Number(options.dailyPublished)) : 0;
  const limit = Math.min(1, Math.max(1, Number(options.maxPosts || DEFAULT_MAX_POSTS)), Math.max(0, DEFAULT_DAILY_POSTS - alreadyPublished));
  if (limit === 0) return [];
  const videos = reviewEntries(feed);
  const modsFeed = options.modsFeed || readJson(MODS_PATH, { items: [] });
  const blockedAtomFamilies = new Set([].concat(options.blockedModelSlugs || []).map(item => canonicalAtomizerFamilyKey(item) || canonicalAtomizerSlug(item)));
  const postedAtoms = postedAtomizerSlugs(options.campaignState || emptyCampaignState(), state);
  const postedMods = postedModFamilyKeys(options.campaignState || emptyCampaignState(), state);
  const candidates = [];

  smokeeAtomizerCandidates(catalog).forEach(atom => {
    const slug = slugify(atom.name);
    const familyKey = canonicalAtomizerFamilyKey(atom.name) || canonicalAtomizerSlug(atom.name);
    if (state.seenAtomizers && state.seenAtomizers[slug]) return;
    if (blockedAtomFamilies.has(familyKey) || postedAtoms.has(familyKey)) return;
    const event = atomizerProductEvent(atom, videosForAtom(videos, slug), 'atomizer');
    if (event) candidates.push(event);
  });

  modCatalogCandidates(modsFeed).forEach(mod => {
    const familyKey = modFamilyKey(mod);
    if (state.seenMods && state.seenMods[familyKey]) return;
    if (postedMods.has(familyKey)) return;
    const event = modProductEvent(mod);
    if (event) candidates.push(event);
  });

  return candidates.sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')) || a.name.localeCompare(b.name)).slice(0, limit);
}

function applyPublishedEvent(state, event, postId, timestamp = nowIso()) {
  const productType = eventProductType(event);
  if (productType === 'atomizer') {
    state.seenAtomizers[event.slug] = { seenAt: timestamp, source: 'facebook-post', postId };
    if (event.signature) state.recommendationSignatures[event.slug] = event.signature;
    (event.videoIds || []).forEach(videoId => {
      state.seenVideos[videoId] = { seenAt: timestamp, model: event.name, source: 'facebook-post', postId };
    });
  } else {
    state.seenMods = state.seenMods && typeof state.seenMods === 'object' ? state.seenMods : {};
    state.seenMods[event.familyKey] = { seenAt: timestamp, source: 'facebook-post', postId };
  }
  state.updatedAt = timestamp;
  state.pageId = pageId || state.pageId || '';
  state.history.unshift({
    key: event.key,
    type: event.type,
    productType,
    name: event.name,
    familyKey: event.familyKey,
    postId,
    publishedAt: timestamp,
    formatVersion: FACEBOOK_FORMAT_VERSION,
    messageVersion: FACEBOOK_MESSAGE_VERSION,
    liquids: [],
    mod: null
  });
  state.history = state.history.slice(0, 200);
}

function planEditorialPosts(catalog, feed, campaignState, options = {}) {
  const state = normalizeCampaignState(campaignState);
  const targetDate = String(options.today || todayInRomania());
  const campaignPublishedToday = facebookPostsOnDate(state, options.publishState || emptyState(), targetDate);
  const publishedToday = Number.isFinite(Number(options.dailyPublished)) ? Math.max(0, Number(options.dailyPublished)) : campaignPublishedToday;
  const requestedPosts = Math.min(DEFAULT_DAILY_POSTS, Math.max(1, Number(options.maxPosts || DEFAULT_MAX_POSTS)));
  const remainingSlots = Math.min(requestedPosts, Math.max(0, DEFAULT_DAILY_POSTS - publishedToday));
  if (remainingSlots === 0) return [];

  const videos = reviewEntries(feed);
  const modsFeed = options.modsFeed || readJson(MODS_PATH, { items: [] });
  const blockedAtomFamilies = new Set([].concat(options.blockedModelSlugs || []).map(item => canonicalAtomizerFamilyKey(item) || canonicalAtomizerSlug(item)));
  const postedAtoms = postedAtomizerSlugs(state, options.publishState || emptyState());
  const postedMods = postedModFamilyKeys(state, options.publishState || emptyState());

  const atomEvents = smokeeAtomizerCandidates(catalog)
    .filter(atom => {
      const familyKey = canonicalAtomizerFamilyKey(atom.name) || canonicalAtomizerSlug(atom.name);
      return !blockedAtomFamilies.has(familyKey) && !postedAtoms.has(familyKey);
    })
    .map(atom => atomizerProductEvent(atom, videosForAtom(videos, slugify(atom.name)), 'editorial'))
    .filter(Boolean)
    .sort((a, b) => b.videoCount - a.videoCount || a.name.localeCompare(b.name));

  const modEvents = modCatalogCandidates(modsFeed)
    .filter(mod => !postedMods.has(modFamilyKey(mod)))
    .map(mod => modProductEvent(mod))
    .filter(Boolean)
    .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')) || a.name.localeCompare(b.name));

  const publishedTypes = facebookProductTypesOnDate(state, options.publishState || emptyState(), targetDate);
  const events = [];
  if (!publishedTypes.has('atomizer') && atomEvents[0]) events.push(atomEvents[0]);
  if (!publishedTypes.has('mod') && modEvents[0]) events.push(modEvents[0]);
  return events.slice(0, remainingSlots);
}

function applyEditorialPublished(stateValue, event, postId, timestamp = nowIso()) {
  const state = normalizeCampaignState(stateValue);
  const productType = eventProductType(event);
  const record = {
    name: event.name,
    familyKey: event.familyKey,
    productType,
    publishedAt: timestamp,
    image: event.image,
    source: 'facebook-api-educational',
    postId,
    formatVersion: FACEBOOK_FORMAT_VERSION,
    messageVersion: FACEBOOK_MESSAGE_VERSION,
    liquids: [],
    mod: null
  };
  state.updatedAt = timestamp;
  state.pageId = pageId || state.pageId || '';
  if (productType === 'mod') state.postedMods[event.familyKey] = record;
  else state.postedAtomizers[event.slug] = record;
  state.history.unshift(Object.assign({ key: event.key, slug: event.slug }, record));
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
      const requestOptions = options.signal
        ? options
        : { ...options, signal: AbortSignal.timeout(60000) };
      const response = await fetch(url, requestOptions);
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

function facebookVisibilityResult(payload = {}) {
  const privacyValue = String(payload && payload.privacy && payload.privacy.value || '').trim().toUpperCase();
  const published = payload.is_published !== false;
  const hidden = payload.is_hidden === true;
  const publicAudience = !privacyValue || privacyValue === 'EVERYONE' || privacyValue === 'PUBLIC';
  return {
    hidden,
    isPublic: published && !hidden && publicAudience,
    permalink: String(payload.permalink_url || '').trim(),
    privacyValue: privacyValue || 'PAGE_DEFAULT',
    published
  };
}

async function inspectFacebookPostVisibility(postId) {
  const base = `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(postId)}`;
  const read = async fields => {
    const params = new URLSearchParams({ fields, access_token: accessToken });
    return fetchJson(`${base}?${params}`, {}, 1);
  };
  let payload;
  try {
    payload = await read('id,is_published,is_hidden,permalink_url,privacy');
  } catch (error) {
    payload = await read('id,is_published,is_hidden,permalink_url');
  }
  return { payload, ...facebookVisibilityResult(payload) };
}

async function verifyFacebookPostPublic(postId) {
  const visibility = await inspectFacebookPostVisibility(postId);
  if (!visibility.isPublic) {
    throw new Error(`Meta a creat postarea ${postId} cu audienta ${visibility.privacyValue}, published=${visibility.published}, hidden=${visibility.hidden}.`);
  }
  console.log(`Facebook public visibility confirmed: ${postId} (${visibility.privacyValue})${visibility.permalink ? ` ${visibility.permalink}` : ''}.`);
  return visibility;
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
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        cache: 'no-store',
        signal: AbortSignal.timeout(12000)
      });
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
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
        signal: AbortSignal.timeout(15000)
      });
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
  if (!event || !event.image) throw new Error(`Fotografia produsului lipseste: ${event && event.name || 'produs necunoscut'}.`);
  if (!/^https:\/\//i.test(String(event.image || ''))) throw new Error(`Fotografia produsului nu este publica pentru ${event.name}.`);
  const message = String(event.message || '');
  const expectedFrame = eventProductType(event) === 'mod' ? MOD_TITLE_FRAME : ATOMIZER_TITLE_FRAME;
  if (!message.startsWith(`${expectedFrame}\n${cleanText(event.name, 160)}\n`) ||
      !message.includes(TRIANGULATION_LINE) ||
      !message.includes(GUIDE_FIT_LINE) ||
      !message.includes(ADULT_TECHNICAL_LINE)) {
    throw new Error(`Structura educativa obligatorie lipseste din postarea pentru ${event.name}.`);
  }
  const urls = message.match(/https?:\/\/[^\s]+/g) || [];
  if (urls.length !== 1 || urls[0].replace(/[),.;]+$/, '') !== 'https://ghid-rta.ro/') {
    throw new Error(`Postarea pentru ${event.name} trebuie sa contina exclusiv legatura principala a ghidului.`);
  }
  const forbidden = /smokee\.ro|youtube\.com|youtu\.be|pret|preț|stoc|cumpar|cumpăr|comenzi|telefon|high-end|premium|mai putin nociv|nicotin|3 lichide|lichide recomandate|lichide analizate/i;
  if (forbidden.test(message)) throw new Error(`Postarea pentru ${event.name} contine o formulare comerciala sau sensibila.`);
}

function educationalAlbumPhotoEntries(event) {
  assertEventLiquidTriplet(event);
  return [{
    type: 'editorial',
    image: event.image,
    caption: [
      'GHID RTA MTL',
      'Documentatie tehnica si orientare pentru configurare.',
      GUIDE_FIT_LINE,
      'Material informativ pentru adulti 18+.'
    ].join('\n')
  }];
}
function multiPhotoFeedBody(message, mediaIds, token) {
  return buildPageFeedBody(message, mediaIds, token);
}

function buildPageFeedBody(message, mediaIds, token, options = {}) {
  const body = new URLSearchParams({
    message,
    published: 'true',
    access_token: token
  });
  mediaIds.forEach((id, index) => {
    body.set(`attached_media[${index}]`, JSON.stringify({ media_fbid: id }));
  });
  if (options.forcePublicAudience) {
    body.set('privacy', JSON.stringify({ value: 'EVERYONE' }));
  }
  return body;
}

function isAudiencePrivacyError(error) {
  const message = String(error && error.message || '').toLowerCase();
  return message.includes('privacy') || message.includes('audience');
}

async function deleteFacebookObject(objectId) {
  const params = new URLSearchParams({ access_token: accessToken });
  const payload = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(objectId)}?${params}`, {
    method: 'DELETE'
  }, 1);
  if (payload.success !== true) throw new Error(`Meta did not confirm deletion for ${objectId}.`);
}

function removeDuplicateRecord(campaignState, publishState, record, keptPostId) {
  if (record.scope === 'campaign') {
    delete campaignState.postedAtomizers[record.slug];
    campaignState.history = campaignState.history.filter(entry => entry && entry.postId !== record.postId);
    campaignState.updatedAt = nowIso();
  } else {
    publishState.history = publishState.history.filter(entry => entry && entry.postId !== record.postId);
    Object.values(publishState.seenAtomizers || {}).forEach(entry => {
      if (entry && entry.postId === record.postId) entry.postId = keptPostId;
    });
    Object.values(publishState.seenVideos || {}).forEach(entry => {
      if (entry && entry.postId === record.postId) entry.postId = keptPostId;
    });
    publishState.updatedAt = nowIso();
  }
}

async function dedupeFacebookPosts(options = {}) {
  let campaignState = normalizeCampaignState(readJson(CAMPAIGN_STATE_PATH, emptyCampaignState()));
  let publishState = readJson(STATE_PATH, emptyState());
  const groups = duplicateFacebookPostGroups(campaignState, publishState);
  if (!groups.length) {
    console.log('Facebook deduplication: every atomizer has one post.');
    return { groups: 0, removed: 0 };
  }
  groups.forEach(group => {
    const kept = group.records[0];
    console.log(`Facebook duplicate group: ${group.canonical}; keep ${kept.postId}; remove ${group.records.slice(1).map(record => record.postId).join(', ')}.`);
  });
  if (options.checkOnly) return { groups: groups.length, removed: 0 };
  if (!pageId || !accessToken) {
    throw new Error('FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be configured.');
  }
  await verifyFacebookPage();
  let removed = 0;
  for (const group of groups) {
    const kept = group.records[0];
    for (const duplicate of group.records.slice(1)) {
      await deleteFacebookObject(duplicate.postId);
      removeDuplicateRecord(campaignState, publishState, duplicate, kept.postId);
      writeJsonAtomic(CAMPAIGN_STATE_PATH, campaignState);
      writeJsonAtomic(STATE_PATH, publishState);
      removed += 1;
      console.log(`Facebook duplicate removed: ${duplicate.name} (${duplicate.postId}); retained ${kept.postId}.`);
    }
  }
  return { groups: groups.length, removed };
}

async function selectPublicAtomizerImage(event) {
  const candidates = Array.from(new Set([].concat(event.imageCandidates || [], event.image).filter(isPublishableAtomizerImage)));
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
  await waitForPublicLink(`${SITE}/`);
  event.link = `${SITE}/`;
  event.image = await selectPublicAtomizerImage(event);
  assertEventLiquidTriplet(event);
  event.albumPhotos = educationalAlbumPhotoEntries(event);
  return event;
}
async function publishPreparedEvent(event) {
  if (!Array.isArray(event.albumPhotos) || event.albumPhotos.length !== 1) {
    throw new Error(`Postarea pentru ${event.name} necesita exact o fotografie editoriala originala.`);
  }
  const mediaIds = [];
  try {
    for (const photoEntry of event.albumPhotos) {
      const photoBody = new URLSearchParams({
        url: photoEntry.image,
        caption: photoEntry.caption,
        published: 'false',
        access_token: accessToken
      });
      const photo = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}/photos`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: photoBody
      });
      const mediaId = String(photo.id || '').trim();
      if (!mediaId) throw new Error(`Meta did not return a media ID for ${event.name}.`);
      mediaIds.push(mediaId);
    }
    let payload;
    try {
      const body = buildPageFeedBody(event.message, mediaIds, accessToken);
      payload = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}/feed`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body
      });
    } catch (error) {
      if (isAudiencePrivacyError(error)) {
        const body = buildPageFeedBody(event.message, mediaIds, accessToken, { forcePublicAudience: true });
        payload = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}/feed`, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body
        });
      } else {
        throw error;
      }
    }
    if (!payload.id) throw new Error(`Meta did not return an album post ID for ${event.name}.`);
    try {
      await verifyFacebookPostPublic(payload.id);
    } catch (error) {
      try { await deleteFacebookObject(payload.id); } catch (cleanupError) { /* best effort */ }
      throw error;
    }
    return payload.id;
  } catch (error) {
    for (const mediaId of mediaIds) {
      try { await deleteFacebookObject(mediaId); } catch (cleanupError) { /* best effort */ }
    }
    throw error;
  }
}

async function publishEvent(event) {
  return publishPreparedEvent(await prepareEventForPublish(event));
}

function editorialEventForAtom(atom, catalog, feed, options = {}) {
  const slug = slugify(atom.name);
  const atomVideos = videosForAtom(reviewEntries(feed), slug);
  const event = atomizerProductEvent(atom, atomVideos, 'editorial');
  if (!event) throw new Error(`Fotografia reala a atomizorului lipseste pentru ${atom.name}.`);
  return event;
}
function historyEntryMessage(entry, catalog, feed, options = {}) {
  const atomsBySlug = new Map(uniqueAtomizers(catalog).map(atom => [slugify(atom.name), atom]));
  const keyParts = String(entry && entry.key || '').split(':');
  const slug = keyParts[1] || slugify(entry && entry.name);
  const atom = atomsBySlug.get(slug);
  if (!atom) throw new Error(`Atomizorul ${entry && entry.name || slug} nu mai exista in catalog.`);
  const videos = videosForAtom(reviewEntries(feed), slug);
  const message = safeAtomizerMessage(atom);
  assertEventLiquidTriplet({ productType: 'atomizer', name: atom.name, image: atomizerImageCandidates(atom)[0], message });
  return { atom, liquidMatches: [], message, slug, videos, mod: null };
}
function historyEntryEvent(entry, catalog, feed, options = {}) {
  const details = historyEntryMessage(entry, catalog, feed, options);
  const event = atomizerProductEvent(details.atom, details.videos, entry.type || 'atomizer');
  if (!event) throw new Error(`Fotografia reala a atomizorului lipseste pentru ${details.atom.name}.`);
  event.key = entry.key || event.key;
  return event;
}
function needsLiquidGalleryRepair(entry) {
  return Boolean(entry && entry.postId && entry.formatVersion !== FACEBOOK_FORMAT_VERSION);
}

function applyRepairedHistoryPost(state, entry, event, oldPostId, replacementId, timestamp = nowIso(), options = {}) {
  entry.originalPublishedAt = entry.originalPublishedAt || entry.publishedAt || timestamp;
  if (options.replaced !== false) entry.galleryUpdatedAt = timestamp;
  entry.noticeUpdatedAt = timestamp;
  entry.postId = replacementId;
  entry.formatVersion = FACEBOOK_FORMAT_VERSION;
  entry.messageVersion = FACEBOOK_MESSAGE_VERSION;
  entry.albumVersion = FACEBOOK_ALBUM_VERSION;
  entry.noticePlacement = options.replaced === false ? 'post-message' : 'post-and-one-photo';
  entry.liquids = [];
  entry.mod = null;
  entry.image = event.image;
  Object.values(state.seenAtomizers || {}).forEach(item => {
    if (item && item.postId === oldPostId) item.postId = replacementId;
  });
  Object.values(state.seenVideos || {}).forEach(item => {
    if (item && item.postId === oldPostId) item.postId = replacementId;
  });
  state.updatedAt = timestamp;
}

async function repairMissingLiquidGalleryPosts(options = {}) {
  const catalog = loadCatalog(ROOT);
  const feed = readJson(REVIEW_PATH, { schemaVersion: 1, models: {} });
  const state = readJson(STATE_PATH, emptyState());
  const entries = state.history.filter(needsLiquidGalleryRepair)
    .sort((a, b) => String(a.publishedAt || '').localeCompare(String(b.publishedAt || '')));
  if (!entries.length) {
    console.log('Facebook post repair: every recorded atomizer post already includes its high-end mod.');
    return;
  }
  const prepared = [];
  const skipped = [];
  for (const entry of entries) {
    try {
      const event = historyEntryEvent(entry, catalog, feed);
      await prepareEventForPublish(event);
      prepared.push({ entry, event, oldPostId: entry.postId });
    } catch (error) {
      skipped.push({ entry, error: error.message || String(error) });
      console.log(`Facebook gallery repair skip: ${entry.name || entry.key || entry.postId || 'unknown'} nu poate fi reparat acum: ${error.message || String(error)}`);
    }
  }
  if (!prepared.length) {
    if (skipped.length) {
      console.log('Facebook gallery repair: toate intrările eligibile nu au putut fi reparate acum.');
    } else {
      console.log('Facebook gallery repair: nu există postări pentru reparație.');
    }
    return;
  }
  if (options.checkOnly) {
    prepared.forEach(item => {
      console.log(`Facebook post repair ready: ${item.event.name} -> atomizer + high-end mod + 3 linked liquids.`);
    });
    skipped.forEach(item => {
      console.log(`Facebook gallery repair pending: ${item.entry.name || item.entry.key || item.entry.postId || 'model necunoscut'} a rămas nerezolvat.`);
    });
    return;
  }
  if (!pageId || !accessToken) {
    throw new Error('FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be configured.');
  }
  await verifyFacebookPage();
  for (const item of prepared) {
    const replacementId = await publishPreparedEvent(item.event);
    try {
      await deleteFacebookObject(item.oldPostId);
    } catch (error) {
      try { await deleteFacebookObject(replacementId); } catch (rollbackError) { /* best effort */ }
      throw new Error(`Postarea veche pentru ${item.event.name} nu a putut fi înlocuită: ${error.message}`);
    }
    applyRepairedHistoryPost(state, item.entry, item.event, item.oldPostId, replacementId);
    writeJsonAtomic(STATE_PATH, state);
    console.log(`Facebook post repaired: ${item.event.name} (${replacementId}).`);
  }
}

function liquidSelectionChanged(previousMatches, currentMatches) {
  const keys = matches => [].concat(matches || []).map(match => {
    return String(match && (match.url || match.title) || '').trim().toLowerCase();
  }).filter(Boolean).sort();
  const previous = keys(previousMatches);
  const current = keys(currentMatches);
  return previous.length !== 3 || current.length !== 3 || previous.some((value, index) => value !== current[index]);
}

async function updateFacebookPostMessage(postId, message) {
  const body = new URLSearchParams({ message, access_token: accessToken });
  const payload = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(postId)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  }, 1);
  if (payload.success !== true) throw new Error(`Meta did not confirm the text update for ${postId}.`);
}

function applyCampaignZeroNicotineUpdate(stateValue, slug, event, oldPostId, postId, replaced, timestamp = nowIso()) {
  const state = normalizeCampaignState(stateValue);
  const previous = state.postedAtomizers[slug] || {};
  const publishedAt = previous.publishedAt || timestamp;
  const updated = {
    ...previous,
    name: event.name,
    publishedAt,
    originalPublishedAt: previous.originalPublishedAt || publishedAt,
    postId,
    image: event.image,
    source: replaced ? 'facebook-api-zero-nicotine-repaired' : (previous.source || 'facebook-api-educational'),
    formatVersion: FACEBOOK_FORMAT_VERSION,
    messageVersion: FACEBOOK_MESSAGE_VERSION,
    albumVersion: FACEBOOK_ALBUM_VERSION,
    noticeUpdatedAt: timestamp,
    noticePlacement: replaced ? 'post-and-two-photos' : 'post-message',
    liquids: [],
    mod: modStateItem(event.mod)
  };
  if (replaced) updated.galleryUpdatedAt = timestamp;
  state.postedAtomizers[slug] = updated;
  const historyIndex = state.history.findIndex(item => item && item.slug === slug);
  const historyItem = {
    ...(historyIndex >= 0 ? state.history[historyIndex] : {}),
    slug,
    name: event.name,
    publishedAt,
    originalPublishedAt: previous.originalPublishedAt || publishedAt,
    postId,
    image: event.image,
    formatVersion: FACEBOOK_FORMAT_VERSION,
    messageVersion: FACEBOOK_MESSAGE_VERSION,
    albumVersion: FACEBOOK_ALBUM_VERSION,
    noticeUpdatedAt: timestamp,
    noticePlacement: replaced ? 'post-and-two-photos' : 'post-message',
    liquids: [],
    mod: modStateItem(event.mod)
  };
  if (replaced) historyItem.galleryUpdatedAt = timestamp;
  if (historyIndex >= 0) state.history.splice(historyIndex, 1);
  state.history.unshift(historyItem);
  state.history = state.history.slice(0, 200);
  state.updatedAt = timestamp;
  state.pageId = pageId || state.pageId || '';
  return state;
}

function zeroNicotineRepairCandidates(catalog, feed, campaignState, publishState, options = {}) {
  const atomsBySlug = new Map(uniqueAtomizers(catalog).map(atom => [slugify(atom.name), atom]));
  const records = [];
  const seenPostIds = new Set();
  Object.entries(campaignState.postedAtomizers || {}).forEach(([slug, entry]) => {
    if (!entry || !entry.postId || seenPostIds.has(entry.postId)) return;
    seenPostIds.add(entry.postId);
    records.push({ scope: 'campaign', slug, entry, oldPostId: entry.postId, publishedAt: entry.originalPublishedAt || entry.publishedAt });
  });
  [].concat(publishState.history || []).forEach(entry => {
    if (!entry || !entry.postId || seenPostIds.has(entry.postId)) return;
    const keyParts = String(entry.key || '').split(':');
    const slug = keyParts[1] || slugify(entry.name);
    seenPostIds.add(entry.postId);
    records.push({ scope: 'publish', slug, entry, oldPostId: entry.postId, publishedAt: entry.originalPublishedAt || entry.publishedAt });
  });
  const modsFeed = readJson(MODS_PATH, { items: [] });
  const rotation = createHighEndModRotation(modsFeed, emptyCampaignState(), emptyState(), { reset: true });
  return records.sort((a, b) => String(a.publishedAt || '').localeCompare(String(b.publishedAt || ''))).map(record => {
    const atom = atomsBySlug.get(record.slug);
    if (!atom) throw new Error(`Atomizorul ${record.entry.name || record.slug} nu mai există în catalog.`);
    const mod = rotation.pick(atom);
    if (!mod) throw new Error(`Nu există un mod high-end complet pentru ${atom.name}.`);
    const event = record.scope === 'campaign'
      ? editorialEventForAtom(atom, catalog, feed, { mod, modsFeed })
      : historyEntryEvent(record.entry, catalog, feed, { mod, modsFeed });
    const entry = record.entry;
    const replace = options.forceReplace === true || entry.formatVersion !== FACEBOOK_FORMAT_VERSION ||
      entry.messageVersion !== FACEBOOK_MESSAGE_VERSION ||
      Array.isArray(entry.liquids) && entry.liquids.length > 0 ||
      modSelectionChanged(entry.mod, event.mod) ||
      (isRealAtomizerImage(event.image) && String(entry.image || '') !== event.image);
    if (!replace && entry.formatVersion === FACEBOOK_FORMAT_VERSION && entry.messageVersion === FACEBOOK_MESSAGE_VERSION) return null;
    return { ...record, slug: event.slug, event, replace };
  }).filter(Boolean);
}

async function repairZeroNicotineGalleryPosts(options = {}) {
  const catalog = loadCatalog(ROOT);
  const feed = readJson(REVIEW_PATH, { schemaVersion: 1, models: {} });
  let campaignState = normalizeCampaignState(readJson(CAMPAIGN_STATE_PATH, emptyCampaignState()));
  const publishState = readJson(STATE_PATH, emptyState());
  const requestedModel = canonicalAtomizerSlug(options.model || '');
  const candidates = zeroNicotineRepairCandidates(catalog, feed, campaignState, publishState, {
    forceReplace: options.forceReplace === true
  })
    .filter(candidate => !requestedModel || canonicalAtomizerSlug(candidate.event.name) === requestedModel)
    .slice(0, Number.isFinite(Number(options.maxPosts)) ? Math.max(1, Number(options.maxPosts)) : Number.POSITIVE_INFINITY);
  if (!candidates.length) {
    console.log('Facebook zero-nicotine repair: every recorded gallery already follows the current rule.');
    return;
  }
  const prepared = [];
  const skipped = [];
  for (const candidate of candidates) {
    try {
      if (candidate.replace) await prepareEventForPublish(candidate.event);
      else assertEventLiquidTriplet(candidate.event);
      prepared.push(candidate);
    } catch (error) {
      skipped.push({ candidate, error: error.message || String(error) });
      console.log(`Facebook zero-nicotine repair skip: ${candidate.event.name} nu poate fi reparat acum: ${error.message || String(error)}`);
    }
  }
  if (options.checkOnly) {
    prepared.forEach(candidate => {
      const operation = candidate.replace ? 'replace gallery' : 'update notice';
      console.log(`Facebook zero-nicotine repair ready: ${candidate.event.name} -> ${operation} -> ${candidate.event.mod.title}.`);
    });
    skipped.forEach(item => {
      const candidate = item.candidate;
      console.log(`Facebook zero-nicotine repair pending: ${candidate.event.name} a rămas nerezolvat.`);
    });
    if (!prepared.length && skipped.length) {
      console.log('Facebook zero-nicotine repair: toate intrările eligibile nu au putut fi reparate acum.');
    }
    return;
  }
  if (!prepared.length) {
    console.log('Facebook zero-nicotine repair: toate intrările eligibile nu au putut fi reparate acum.');
    return;
  }
  if (!pageId || !accessToken) {
    throw new Error('FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be configured.');
  }
  await verifyFacebookPage();
  const failed = [];
  for (const candidate of prepared) {
    try {
      let postId = candidate.oldPostId;
      if (candidate.replace) {
        postId = await publishPreparedEvent(candidate.event);
        try {
          await deleteFacebookObject(candidate.oldPostId);
        } catch (error) {
          try { await deleteFacebookObject(postId); } catch (rollbackError) { /* best effort */ }
          throw new Error(`Postarea veche pentru ${candidate.event.name} nu a putut fi înlocuită: ${error.message}`);
        }
      } else {
        await updateFacebookPostMessage(candidate.oldPostId, candidate.event.message);
      }
      const timestamp = nowIso();
      if (candidate.scope === 'campaign') {
        campaignState = applyCampaignZeroNicotineUpdate(
          campaignState,
          candidate.slug,
          candidate.event,
          candidate.oldPostId,
          postId,
          candidate.replace,
          timestamp
        );
        writeJsonAtomic(CAMPAIGN_STATE_PATH, campaignState);
      } else {
        applyRepairedHistoryPost(
          publishState,
          candidate.entry,
          candidate.event,
          candidate.oldPostId,
          postId,
          timestamp,
          { replaced: candidate.replace }
        );
        candidate.entry.albumVersion = FACEBOOK_ALBUM_VERSION;
        candidate.entry.noticePlacement = candidate.replace ? 'post-and-one-photo' : 'post-message';
        writeJsonAtomic(STATE_PATH, publishState);
      }
      console.log(`Facebook zero-nicotine ${candidate.replace ? 'gallery replaced' : 'notice updated'}: ${candidate.event.name} (${postId}).`);
    } catch (error) {
      failed.push({ name: candidate.event.name, message: error.message || String(error) });
      console.log(`Facebook zero-nicotine repair deferred: ${candidate.event.name}: ${error.message || String(error)}`);
    }
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
  if (failed.length) {
    throw new Error(`Facebook migration deferred ${failed.length} post(s): ${failed.map(item => item.name).join(', ')}`);
  }
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
    if (update.entry.formatVersion !== FACEBOOK_FORMAT_VERSION) {
      update.entry.formatVersion = 'educational-legacy-photo';
    }
    update.entry.messageVersion = update.entry.formatVersion === FACEBOOK_FORMAT_VERSION
      ? FACEBOOK_MESSAGE_VERSION
      : 'three-liquids-after-expand-v2';
    update.entry.messageUpdatedAt = timestamp;
    state.updatedAt = timestamp;
    writeJsonAtomic(STATE_PATH, state);
    console.log(`Facebook liquid details updated: ${update.atom.name} (${update.entry.postId}).`);
  }
}

async function main() {
  if (dedupePosts || checkDedupePosts) {
    await dedupeFacebookPosts({ checkOnly: checkDedupePosts });
    return;
  }
  if (repairVisibility || checkVisibility) {
    await repairZeroNicotineGalleryPosts({
      checkOnly: checkVisibility,
      forceReplace: true,
      maxPosts,
      model: repairModel
    });
    return;
  }
  if (repairLegacyPostGalleries || checkRepairLegacyPostGalleries) {
    await repairZeroNicotineGalleryPosts({ checkOnly: checkRepairLegacyPostGalleries, model: repairModel });
    return;
  }
  if (repairZeroNicotineGalleries || checkRepairZeroNicotineGalleries) {
    await repairZeroNicotineGalleryPosts({ checkOnly: checkRepairZeroNicotineGalleries, model: repairModel });
    return;
  }
  if (repairMissingLiquidGalleries || checkRepairMissingLiquidGalleries) {
    await repairMissingLiquidGalleryPosts({ checkOnly: checkRepairMissingLiquidGalleries });
    return;
  }
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
    const modsFeed = readJson(MODS_PATH, { items: [] });
    let campaignState = normalizeCampaignState(readJson(CAMPAIGN_STATE_PATH, emptyCampaignState()));
    const publishState = readJson(STATE_PATH, emptyState());
    const dailyPublished = facebookPostsOnDate(campaignState, publishState);
    const blockedModelSlugs = postedAtomizerSlugs(campaignState, publishState);
    const events = planEditorialPosts(catalog, feed, campaignState, {
      maxPosts,
      dailyPublished,
      publishState,
      modsFeed,
      blockedModelSlugs: Array.from(blockedModelSlugs)
    });

    if (editorialUnpostedCountOnly) {
      const remainingAtoms = smokeeAtomizerCandidates(catalog).filter(atom => !blockedModelSlugs.has(canonicalAtomizerFamilyKey(atom.name) || canonicalAtomizerSlug(atom.name))).length;
      const remainingMods = modCatalogCandidates(modsFeed).filter(mod => !postedModFamilyKeys(campaignState, publishState).has(modFamilyKey(mod))).length;
      const remaining = remainingAtoms + remainingMods;
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
  const modsFeed = readJson(MODS_PATH, { items: [] });
  const stateExists = fs.existsSync(STATE_PATH);
  let state = readJson(STATE_PATH, emptyState());

  if (initialize || !stateExists) {
    state = baselineState(catalog, feed, modsFeed);
    writeJsonAtomic(STATE_PATH, state);
    if (!pendingCountOnly) {
      console.log(`Facebook baseline initialized: ${Object.keys(state.seenAtomizers).length} atomizers and ${Object.keys(state.seenVideos).length} videos.`);
    }
    return;
  }

  if (ensureModBaseline(state, modsFeed)) writeJsonAtomic(STATE_PATH, state);
  const errors = validateState(state);
  if (errors.length) throw new Error(errors.join('\n'));
  const campaignState = normalizeCampaignState(readJson(CAMPAIGN_STATE_PATH, emptyCampaignState()));
  const dailyPublished = facebookPostsOnDate(campaignState, state);
  const events = planUpdates(catalog, feed, state, {
    maxPosts,
    dailyPublished,
    campaignState,
    modsFeed,
    blockedModelSlugs: Array.from(postedAtomizerSlugs(campaignState, state))
  });

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
    console.log('Facebook publisher: no new Smokee atomizer or mod is pending, or the daily limit is complete.');
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
  canonicalAtomizerFamilyKey,
  canonicalAtomizerSlug,
  createHighEndModRotation,
  duplicateFacebookPostGroups,
  editorialAtomizerMessage,
  dateInRomania,
  educationalAlbumPhotoEntries,
  editorialImageForKey,
  emptyCampaignState,
  emptyState,
  facebookPostsOnDate,
  facebookProductTypesOnDate,
  facebookVisibilityResult,
  inferAtomRoles,
  isNicotineFreeFacebookLiquid,
  historyEntryMessage,
  historyEntryEvent,
  highEndModCandidates,
  highEndModForAtom,
  isRealAtomizerImage,
  liquidMatchLines,
  noticeBannerLines,
  multiPhotoFeedBody,
  modCatalogCandidates,
  modFamilyKey,
  modMessage,
  needsLiquidGalleryRepair,
  normalizeCampaignState,
  planEditorialPosts,
  planUpdates,
  principalVideo,
  postedAtomizerSlugs,
  postedModFamilyKeys,
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
