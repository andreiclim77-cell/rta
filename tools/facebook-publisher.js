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
const SMOKEE_FACEBOOK_URL = 'https://www.facebook.com/www.smokee.ro/';
const DEFAULT_GRAPH_VERSION = 'v25.0';
const DEFAULT_DAILY_POSTS = 2;
const DEFAULT_MAX_POSTS = DEFAULT_DAILY_POSTS;
const LIQUID_TEASER = 'Cele 3 lichide sunt alese prin triangulare; explicațiile complete apar în textul extins.';
const FACEBOOK_FORMAT_VERSION = 'educational-atomizer-high-end-mod-v4-unique-rotation';
const FACEBOOK_MESSAGE_VERSION = 'three-linked-liquids-high-end-mod-v13-unique-rotation';
const FACEBOOK_ALBUM_VERSION = 'atomizer-mod-photos-three-linked-liquids-v3-unique-rotation';
const ADULT_SMOKER_NOTICE = 'Doar pentru a renunța la fumat, fiind o variantă mai puțin nocivă decât continuarea fumatului, dar nu lipsită de riscuri.';
const NICOTINE_FREE_NOTICE = 'Recomandat a se consuma fără nicotină.';
const ATOMIZER_TITLE_FRAME = '━━ 𝗔𝗧𝗢𝗠𝗜𝗭𝗢𝗥 𝗥𝗧𝗔 𝗠𝗧𝗟 ━━';
const NOTICE_FRAME_TOP = '┏━ 𝗢𝗥𝗜𝗘𝗡𝗧𝗔𝗥𝗘 𝗜𝗠𝗣𝗢𝗥𝗧𝗔𝗡𝗧𝗔';
const ADULT_SMOKER_EMPHASIS = '𝗗𝗢𝗔𝗥 𝗣𝗘𝗡𝗧𝗥𝗨 𝗥𝗘𝗡𝗨𝗡𝗧𝗔𝗥𝗘 • 𝗠𝗔𝗜 𝗣𝗨𝗧𝗜𝗡 𝗡𝗢𝗖𝗜𝗩𝗔';
const NICOTINE_FREE_EMPHASIS = '𝗥𝗘𝗖𝗢𝗠𝗔𝗡𝗗𝗔𝗧 𝗙𝗔𝗥𝗔 𝗡𝗜𝗖𝗢𝗧𝗜𝗡𝗔';

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

function modFamilyKey(item) {
  return normalizeMatchText(item && (item.familyKey || item.title));
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
    seen.add(key);
    return item && item.highEnd !== false &&
      /^https:\/\/smokee\.ro\/product\//i.test(String(item && item.url || '')) &&
      /^https:\/\//i.test(String(item && item.image || '')) &&
      /^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/i.test(reviewUrl);
  });
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

function liquidHeadlineLines(matches) {
  if (!Array.isArray(matches) || !matches.length) return [];
  const selected = matches.slice(0, 3);
  const lines = ['3 lichide recomandate prin triangulare:'];
  selected.forEach((match, index) => {
    lines.push(`${index + 1}. ${cleanText(match.title, 110)}`);
    if (/^https:\/\//i.test(String(match.url || '').trim())) lines.push(String(match.url).trim());
  });
  lines.push('');
  return lines;
}

function noticeBannerLines() {
  return [
    NOTICE_FRAME_TOP,
    `┃ 1. ${ADULT_SMOKER_EMPHASIS}`,
    `┗ 2. ${NICOTINE_FREE_EMPHASIS}`,
    '',
    ADULT_SMOKER_NOTICE,
    NICOTINE_FREE_NOTICE,
    ''
  ];
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
    const canonical = canonicalAtomizerSlug(entry && entry.name || slug);
    if (canonical) slugs.add(canonical);
  });
  [].concat(publishState && publishState.history || []).forEach(entry => {
    if (!entry || !entry.postId) return;
    const canonical = historyAtomizerSlug(entry);
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
      postId: entry.postId,
      publishedAt: entry.publishedAt || ''
    });
  });
  [].concat(publishState && publishState.history || []).forEach(entry => {
    if (!entry || !entry.postId) return;
    records.push({
      scope: 'publish',
      entry,
      slug: historyAtomizerSlug(entry),
      name: entry.name || historyAtomizerSlug(entry),
      postId: entry.postId,
      publishedAt: entry.publishedAt || ''
    });
  });

  const grouped = new Map();
  records.forEach(record => {
    const canonical = canonicalAtomizerSlug(record.name || record.slug);
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

function modHeadlineLines(mod) {
  return mod ? [`Mod high-end: ${cleanText(mod.title, 150)}`] : [];
}

function modDetailLines(mod) {
  if (!mod) return [];
  return [
    '',
    `Mod high-end: ${cleanText(mod.title, 150)}`,
    String(mod.url || '').trim(),
    `Recenzie video: ${cleanText(mod.review && mod.review.title || 'Vezi recenzia', 160)}`,
    String(mod.review && mod.review.url || '').trim(),
    `Smokee pe Facebook: ${SMOKEE_FACEBOOK_URL}`
  ];
}

function atomizerMessage(atom, videos, liquidMatches = [], mod = null) {
  const profile = cleanText(atom.classes || atom.dna, 260);
  const build = topBuild(atom);
  const lines = [
    ...atomizerHeadingLines(atom),
    ...modHeadlineLines(mod),
    ...liquidHeadlineLines(liquidMatches),
    ...noticeBannerLines(),
    'Nou în Ghid RTA MTL',
    '',
    LIQUID_TEASER,
    '',
    'Modelul a fost introdus în biblioteca RTA și în recomandările în care profilul lichidului, arhitectura atomizorului și buildul sunt compatibile.'
  ];
  if (profile) lines.push('', `Potrivire inițială: ${profile}`);
  if (build) lines.push(`Build de pornire: ${build}`);
  lines.push(...liquidMatchLines(liquidMatches));
  lines.push(...atomizerSourceLines(atom));
  const videoLines = directVideoLines(videos);
  if (videoLines.length) lines.push('', ...videoLines);
  lines.push(...modDetailLines(mod));
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

function editorialAtomizerMessage(atom, videos, liquidMatches = [], mod = null) {
  const profile = cleanText(atom.classes || atom.dna, 280);
  const build = topBuild(atom);
  const lines = [
    ...atomizerHeadingLines(atom),
    ...modHeadlineLines(mod),
    ...liquidHeadlineLines(liquidMatches),
    ...noticeBannerLines(),
    'Fișă RTA MTL',
    '',
    LIQUID_TEASER,
    '',
    'Profilul aromatic, arhitectura atomizorului și buildul de pornire sunt prezentate împreună pentru o evaluare coerentă.'
  ];
  if (profile) lines.push('', `Potrivire aromatică: ${profile}`);
  if (build) lines.push(`Build de pornire: ${build}`);
  lines.push(...liquidMatchLines(liquidMatches));
  lines.push(...atomizerSourceLines(atom));
  const videoLines = directVideoLines(videos);
  if (videoLines.length) lines.push('', ...videoLines);
  lines.push(...modDetailLines(mod));
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

function recommendationMessage(atom, liquidMatches = [], mod = null) {
  const profile = cleanText(atom.classes || atom.dna, 280);
  const build = topBuild(atom);
  const lines = [
    ...atomizerHeadingLines(atom),
    ...modHeadlineLines(mod),
    ...liquidHeadlineLines(liquidMatches),
    ...noticeBannerLines(),
    'Recomandare actualizată',
    '',
    LIQUID_TEASER,
    '',
    'Potrivirea a fost recalibrată după profilul lichidului, arhitectura atomizorului și comportamentul buildului.'
  ];
  if (profile) lines.push('', `Profil: ${profile}`);
  if (build) lines.push(`Build de pornire: ${build}`);
  lines.push(...liquidMatchLines(liquidMatches));
  lines.push(...atomizerSourceLines(atom));
  lines.push(...modDetailLines(mod));
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

function reviewMessage(atom, videos, liquidMatches = [], mod = null) {
  const lines = [
    ...atomizerHeadingLines(atom),
    ...modHeadlineLines(mod),
    ...liquidHeadlineLines(liquidMatches),
    ...noticeBannerLines(),
    'Review nou verificat',
    '',
    LIQUID_TEASER,
    '',
    'Materialele identificate se referă direct la model; exemplele realizate pe clone sunt marcate distinct în fișa completă.'
  ];
  videos.slice(0, 2).forEach(video => {
    const label = video.kind === 'build' ? 'Build' : 'Recenzie';
    const clone = video.scope === 'clone' ? ' pe clonă; nu este recenzie a originalului' : '';
    lines.push('', `${label}${clone}: ${cleanText(video.title, 160)}`);
  });
  lines.push(...liquidMatchLines(liquidMatches));
  lines.push(...atomizerSourceLines(atom));
  lines.push(...modDetailLines(mod));
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
  const videos = reviewEntries(feed);
  const modsFeed = options.modsFeed || readJson(MODS_PATH, { items: [] });
  const modRotation = createHighEndModRotation(modsFeed, options.campaignState, state);
  const events = [];
  const blockedModelSlugs = new Set([].concat(options.blockedModelSlugs || []).map(canonicalAtomizerSlug));

  for (const atom of atoms.slice().sort((a, b) => a.name.localeCompare(b.name))) {
    if (events.length >= limit) break;
    const slug = slugify(atom.name);
    if (state.seenAtomizers[slug] || blockedModelSlugs.has(canonicalAtomizerSlug(atom.name))) continue;
    const atomVideos = videosForAtom(videos, slug);
    const liquidMatches = topLiquidMatchesForAtom(atom, catalog, 3);
    const image = atomizerImage(atom, atomVideos, { fallbackToVideos: true });
    if (liquidMatches.length < 3 || !image) continue;
    const mod = modRotation.pick(atom);
    if (!mod) continue;
    events.push({
      type: 'atomizer',
      key: `atomizer:${slug}`,
      slug,
      name: atom.name,
      link: atomizerUrl(atom),
      image,
      imageCandidates: atomizerImageCandidates(atom, atomVideos),
      message: atomizerMessage(atom, atomVideos, liquidMatches, mod),
      liquidMatches,
      mod,
      signature: recommendationSignature(atom),
      videoIds: atomVideos.map(video => video.videoId)
    });
  }
  return events;
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
    formatVersion: FACEBOOK_FORMAT_VERSION,
    messageVersion: FACEBOOK_MESSAGE_VERSION,
    liquids: liquidStateItems(event.liquidMatches),
    mod: modStateItem(event.mod)
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
  const modsFeed = options.modsFeed || readJson(MODS_PATH, { items: [] });
  const modRotation = createHighEndModRotation(modsFeed, state, options.publishState);
  const blockedModelSlugs = new Set([].concat(options.blockedModelSlugs || []).map(canonicalAtomizerSlug));
  const candidates = uniqueAtomizers(catalog)
    .filter(atom => !state.postedAtomizers[slugify(atom.name)] && !blockedModelSlugs.has(canonicalAtomizerSlug(atom.name)))
    .map(atom => {
      const slug = slugify(atom.name);
      const atomVideos = videosForAtom(videos, slug);
      return {
        atom,
        slug,
        atomVideos,
        image: atomizerImage(atom, atomVideos, { fallbackToVideos: true }),
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
    const mod = modRotation.pick(candidate.atom);
    if (!mod) continue;
    events.push({
      type: 'editorial',
      key: `editorial:${candidate.slug}`,
      slug: candidate.slug,
      name: candidate.atom.name,
      link: atomizerUrl(candidate.atom),
      image: candidate.image,
      imageCandidates: candidate.imageCandidates,
      message: editorialAtomizerMessage(candidate.atom, candidate.atomVideos, liquidMatches, mod),
      liquidMatches,
      mod,
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
    formatVersion: FACEBOOK_FORMAT_VERSION,
    messageVersion: FACEBOOK_MESSAGE_VERSION,
    liquids: liquidStateItems(event.liquidMatches),
    mod: modStateItem(event.mod)
  };
  state.history.unshift({
    slug: event.slug,
    name: event.name,
    publishedAt: timestamp,
    postId,
    formatVersion: FACEBOOK_FORMAT_VERSION,
    messageVersion: FACEBOOK_MESSAGE_VERSION,
    liquids: liquidStateItems(event.liquidMatches),
    mod: modStateItem(event.mod)
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
  if (!event || !event.image) throw new Error(`Fotografia atomizorului lipsește: ${event && event.name || 'model necunoscut'}.`);
  if (!Array.isArray(event.liquidMatches) || event.liquidMatches.length !== 3) {
    throw new Error(`Postarea pentru ${event.name} trebuie să includă exact trei lichide.`);
  }
  if (event.liquidMatches.some(match => !cleanText(match.title, 150) || !cleanText(match.profile, 120) || !cleanText(match.reason, 200))) {
    throw new Error(`Una dintre cele trei potriviri de lichid este incompletă pentru ${event.name}.`);
  }
  if (event.liquidMatches.some(match => !isNicotineFreeFacebookLiquid(match))) {
    throw new Error(`Una dintre potrivirile pentru ${event.name} nu este confirmată ca aromă sau longfill fără nicotină.`);
  }
  const message = String(event.message || '');
  if (!message.startsWith(`${ATOMIZER_TITLE_FRAME}\n${cleanText(event.name, 160)}\n`) ||
      !message.includes(NOTICE_FRAME_TOP) ||
      !message.includes(ADULT_SMOKER_EMPHASIS) ||
      !message.includes(ADULT_SMOKER_NOTICE) ||
      !message.includes(NICOTINE_FREE_EMPHASIS) ||
      !message.includes(NICOTINE_FREE_NOTICE)) {
    throw new Error(`Avertizările pentru fumători adulți și lipsa nicotinei lipsesc din postarea pentru ${event.name}.`);
  }
  if (!/^https:\/\//i.test(event.image)) {
    throw new Error(`Fotografia atomizorului lipsește pentru ${event.name}.`);
  }
  const mod = event.mod || {};
  const reviewUrl = String(mod.review && mod.review.url || '').trim();
  if (!cleanText(mod.title, 160) || !/^https:\/\/smokee\.ro\/product\//i.test(String(mod.url || '')) ||
      !/^https:\/\//i.test(String(mod.image || '')) ||
      !/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/i.test(reviewUrl)) {
    throw new Error(`Modul high-end sau recenzia sa lipseste pentru ${event.name}.`);
  }
  if (!message.includes(mod.title) || !message.includes(mod.url) || !message.includes(reviewUrl)) {
    throw new Error(`Modul high-end nu este prezentat complet pentru ${event.name}.`);
  }
  event.liquidMatches.forEach(match => {
    const url = String(match.url || '').trim();
    if (!/^https:\/\//i.test(url) || !message.includes(url)) {
      throw new Error(`Linkul lichidului ${match.title} lipsește din postarea pentru ${event.name}.`);
    }
  });
}

function educationalAlbumPhotoEntries(event) {
  assertEventLiquidTriplet(event);
  const photos = [{
    type: 'atomizer',
    image: event.image,
    caption: [
      ATOMIZER_TITLE_FRAME,
      cleanText(event.name, 160),
      'Atomizor analizat în cadrul Ghid RTA MTL.',
      'Conținut informativ destinat exclusiv adulților 18+.'
    ].join('\n')
  }, {
    type: 'mod',
    image: event.mod.image,
    caption: [
      'MOD HIGH-END',
      cleanText(event.mod.title, 160),
      'Mod prezentat pentru setup-ul RTA.',
      'Recenzia video este disponibila in textul postarii.',
      'Continut informativ destinat exclusiv adultilor 18+.'
    ].join('\n')
  }];
  return photos;
}

function multiPhotoFeedBody(message, mediaIds, token) {
  return buildPageFeedBody(message, mediaIds, token, { forcePublic: true });
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
  await waitForPublicLink(event.link);
  event.image = await selectPublicAtomizerImage(event);
  await waitForPublicImage(event.mod && event.mod.image);
  assertEventLiquidTriplet(event);
  event.albumPhotos = educationalAlbumPhotoEntries(event);
  return event;
}

async function publishPreparedEvent(event) {
  if (!Array.isArray(event.albumPhotos) || event.albumPhotos.length !== 2) {
    throw new Error(`Postarea pentru ${event.name} necesita fotografia atomizorului si fotografia modului high-end.`);
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
      const body = buildPageFeedBody(event.message, mediaIds, accessToken, { forcePublicAudience: true });
      payload = await fetchJson(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}/feed`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body
      });
    } catch (error) {
      if (isAudiencePrivacyError(error)) {
        const body = buildPageFeedBody(event.message, mediaIds, accessToken, { forcePublicAudience: false });
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
  const liquidMatches = topLiquidMatchesForAtom(atom, catalog, 3);
  const mod = options.mod || highEndModForAtom(atom, options.modsFeed);
  if (liquidMatches.length !== 3) {
    throw new Error(`Nu există trei lichide verificabile pentru ${atom.name}.`);
  }
  if (!mod) throw new Error(`Nu exista un mod high-end complet pentru ${atom.name}.`);
  return {
    type: 'editorial',
    key: `editorial:${slug}`,
    slug,
    name: atom.name,
    link: atomizerUrl(atom),
    image: atomizerImage(atom, atomVideos),
    imageCandidates: atomizerImageCandidates(atom, atomVideos),
    message: editorialAtomizerMessage(atom, atomVideos, liquidMatches, mod),
    liquidMatches,
    mod,
    videoIds: atomVideos.map(video => video.videoId),
    videoCount: atomVideos.length
  };
}

function historyEntryMessage(entry, catalog, feed, options = {}) {
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
  const mod = options.mod || highEndModForAtom(atom, options.modsFeed);
  if (!mod) throw new Error(`Nu exista un mod high-end complet pentru ${atom.name}.`);

  let message = '';
  if (entry.type === 'review') message = reviewMessage(atom, videos, liquidMatches, mod);
  else if (entry.type === 'recommendation') message = recommendationMessage(atom, liquidMatches, mod);
  else message = atomizerMessage(atom, videos, liquidMatches, mod);

  if (!message.includes(LIQUID_TEASER) || !liquidMatches.every(match => message.includes(match.title))) {
    throw new Error(`Textul Facebook nu afișează toate cele trei lichide pentru ${atom.name}.`);
  }
  if (/preț|stoc|cumpărare|pentru comenzi|0736\s*018\s*023/i.test(message)) {
    throw new Error(`Textul Facebook conține formulări comerciale pentru ${atom.name}.`);
  }
  return { atom, liquidMatches, message, slug, videos, mod };
}

function historyEntryEvent(entry, catalog, feed, options = {}) {
  const details = historyEntryMessage(entry, catalog, feed, options);
  return {
    type: entry.type || 'atomizer',
    key: entry.key || `atomizer:${details.slug}`,
    slug: details.slug,
    name: details.atom.name,
    link: atomizerUrl(details.atom),
    image: atomizerImage(details.atom, details.videos, { fallbackToVideos: true }),
    imageCandidates: atomizerImageCandidates(details.atom, details.videos),
    message: details.message,
    liquidMatches: details.liquidMatches,
    mod: details.mod,
    signature: recommendationSignature(details.atom),
    videoIds: details.videos.map(video => video.videoId)
  };
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
  entry.noticePlacement = options.replaced === false ? 'post-message' : 'post-and-two-photos';
  entry.liquids = liquidStateItems(event.liquidMatches);
  entry.mod = modStateItem(event.mod);
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
    liquids: liquidStateItems(event.liquidMatches),
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
    liquids: liquidStateItems(event.liquidMatches),
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
      liquidSelectionChanged(entry.liquids, event.liquidMatches) ||
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
        candidate.entry.noticePlacement = candidate.replace ? 'post-and-two-photos' : 'post-message';
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
    let campaignState = normalizeCampaignState(readJson(CAMPAIGN_STATE_PATH, emptyCampaignState()));
    const publishState = readJson(STATE_PATH, emptyState());
    const dailyPublished = facebookPostsOnDate(campaignState, publishState);
    const blockedModelSlugs = postedAtomizerSlugs(campaignState, publishState);
    const events = planEditorialPosts(catalog, feed, campaignState, {
      maxPosts,
      dailyPublished,
      publishState,
      blockedModelSlugs: Array.from(blockedModelSlugs)
    });

    if (editorialUnpostedCountOnly) {
      const remaining = uniqueAtomizers(catalog).filter(atom => !blockedModelSlugs.has(canonicalAtomizerSlug(atom.name))).length;
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
  const events = planUpdates(catalog, feed, state, {
    maxPosts,
    dailyPublished,
    campaignState,
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
    console.log('Facebook publisher: no new atomizers. Review and source updates remain attached to the existing model post.');
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
  canonicalAtomizerSlug,
  createHighEndModRotation,
  duplicateFacebookPostGroups,
  editorialAtomizerMessage,
  dateInRomania,
  educationalAlbumPhotoEntries,
  emptyCampaignState,
  emptyState,
  facebookPostsOnDate,
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
  modFamilyKey,
  needsLiquidGalleryRepair,
  normalizeCampaignState,
  planEditorialPosts,
  planUpdates,
  principalVideo,
  postedAtomizerSlugs,
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
