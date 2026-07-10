const fs = require('fs');
const path = require('path');
const vm = require('vm');

function extractAppData(html) {
  const match = html.match(/<script id="app-data" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('app-data JSON block not found');
  return JSON.parse(match[1]);
}

function extractExpression(html, variableName) {
  const pattern = new RegExp(`(?:var|let|const)\\s+${variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=`);
  const match = pattern.exec(html);
  if (!match) throw new Error(`${variableName} assignment not found`);
  let start = match.index + match[0].length;
  while (/\s/.test(html[start] || '')) start += 1;
  const opener = html[start];
  const closer = opener === '[' ? ']' : opener === '{' ? '}' : '';
  if (!closer) throw new Error(`${variableName} is not an array or object literal`);

  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = start; i < html.length; i += 1) {
    const ch = html[i];
    const next = html[i + 1];
    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === opener) depth += 1;
    if (ch === closer) {
      depth -= 1;
      if (depth === 0) return html.slice(start, i + 1);
    }
  }
  throw new Error(`${variableName} literal is not balanced`);
}

function smokeeSource(atom, url, claim) {
  return { Atomizor: atom, 'Tip sursa': 'Smokee/product', URL: url, 'Ce sustine / motiv folosire': claim };
}

function searchVideos(atom) {
  return [
    { Atomizor: atom, 'Titlu / identificare review YouTube': `${atom} - recenzie directa`, URL: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${atom} RTA review`)}`, Observatie: 'recenzie directa indisponibila; se afiseaza cautare YouTube' },
    { Atomizor: atom, 'Titlu / identificare review YouTube': `${atom} - build direct`, URL: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${atom} RTA build wick coil`)}`, Observatie: 'build direct indisponibil; se afiseaza cautare YouTube' }
  ];
}

function clarityBuilds() {
  return [
    { type: 'Build 1', wire: 'K1 29 GA', build: 'diam 2,0-2,5 mm / 6-7 spire | contur sec pentru Virginia, Oriental si tutun tip cigarette' },
    { type: 'Build 2', wire: 'SS316L 30 GA', build: 'diam 2,0 mm / 6-7 spire | claritate si separare pentru NET luminos' },
    { type: 'Build 3', wire: 'NiFe30 30 GA', build: 'diam 2,0-2,5 mm / 6-8 spire | control fin pentru varfuri aspre' }
  ];
}

function bodyBuilds() {
  return [
    { type: 'Build 1', wire: 'K1 28 GA', build: 'diam 2,5 mm / 5-6 spire | corp curat pentru Burley, Kentucky, Latakia si cigar' },
    { type: 'Build 2', wire: 'SS32 twisted', build: 'diam 2,5 mm / 6-7 spire | textura cu separare pentru NET complex' },
    { type: 'Build 3', wire: 'K1 Clapton fin', build: 'diam 2,5 mm / 5 spire | doar pentru lichide foarte seci sau cigar light' }
  ];
}

function smoothBuilds() {
  return [
    { type: 'Build 1', wire: 'K1 28 GA', build: 'diam 2,5 mm / 6 spire | echilibru pentru pipe, Cavendish si tutun rotund' },
    { type: 'Build 2', wire: 'Ni80 30 GA', build: 'diam 2,5 mm / 6-7 spire | raspuns rapid si rotunjire la putere moderata' },
    { type: 'Build 3', wire: 'Clapton fin 1-core', build: 'diam 2,5 mm / 5-6 spire | textura prudenta cand lichidul ramane prea sec' }
  ];
}

function openRtaBuilds() {
  return [
    { type: 'Build 1', wire: 'Ni80 28 GA', build: 'diam 2,5-3,0 mm / 5-6 spire | RDL/open, tutun aromatizat sau dark sweet' },
    { type: 'Build 2', wire: 'SS316L 28 GA', build: 'diam 2,5-3,0 mm / 5-6 spire | raspuns curat, putere moderata' },
    { type: 'Build 3', wire: 'Clapton fin 1-core / 2-core', build: 'diam 2,5-3,0 mm / 4-5 spire | doar cand atomizorul si lichidul cer masa si textura' }
  ];
}

function tp(group, name, tags, top, wire, avoid, note) {
  return { group, name, tags: String(tags || '').split('|').filter(Boolean), top, wire, avoid, note };
}

function evaluateLiteral(html, variableName) {
  const expression = extractExpression(html, variableName);
  return vm.runInNewContext(`(${expression})`, {
    smokeeSource,
    searchVideos,
    clarityBuilds,
    bodyBuilds,
    smoothBuilds,
    openRtaBuilds,
    tp,
    encodeURIComponent
  }, { timeout: 1500 });
}

function sourceUrl(source) {
  if (!source || typeof source !== 'object') return '';
  return source.URL || source.Url || source.url || source.Link || '';
}

function allSources(atom) {
  return [].concat(atom.sources || [], atom.Surse || [], atom.youtube || []);
}

function directSource(source) {
  const url = sourceUrl(source);
  return /^https?:\/\//i.test(url) && !/google\.com\/search|youtube\.com\/results/i.test(url);
}

function directReview(atom) {
  return allSources(atom).some(source => /(?:youtube\.com\/watch|youtu\.be\/)/i.test(sourceUrl(source)));
}

function isCandidate(atom) {
  return /candidate|candidat|surse insuficiente|de verificat|in verificare/i.test([
    atom.validationStatus,
    atom.confidence,
    atom.catalogStatus,
    atom.market
  ].filter(Boolean).join(' '));
}

function atomizerValidation(atom) {
  const sources = allSources(atom).filter(directSource);
  const builds = Array.isArray(atom.builds) ? atom.builds : [];
  let points = 10;
  if (/^https?:\/\//i.test(atom.image || '')) points += 10;
  if (String(atom.dna || '').length >= 45) points += 15;
  if (String(atom.classes || '').length >= 35) points += 10;
  if (builds.length >= 1) points += 15;
  if (builds.length >= 3) points += 5;
  if (sources.length >= 1) points += 10;
  if (sources.length >= 3) points += 10;
  if (directReview(atom)) points += 5;
  if (/airflow|aer|pin|insert|side|bottom|lateral|inferior/i.test(`${atom.dna || ''} ${atom.market || ''} ${sources.map(s => s['Ce sustine / motiv folosire'] || '').join(' ')}`)) points += 5;
  if (/camera|cupola|clopot|bell|chamber|deck/i.test(`${atom.dna || ''} ${atom.market || ''} ${sources.map(s => s['Ce sustine / motiv folosire'] || '').join(' ')}`)) points += 5;
  points = Math.min(100, points);
  const candidate = isCandidate(atom);
  const status = candidate ? 'candidate' : points >= 75 ? 'verified' : points >= 60 ? 'partial' : 'limited';
  return { points, status, comparable: !candidate && points >= 60, directSources: sources.length, directReview: directReview(atom) };
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' si ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function publicAtomName(value) {
  return String(value || '')
    .replace(/\b\d+(?:[.,]\d+)?\s*ml\b/gi, '')
    .replace(/\b(?:matte|full|silk)\s+(?:black|blue|red|green|silver|gold)\b/gi, '')
    .replace(/\s+-\s+(?:black|blue|red|green|silver|gold|polished finish|stainless steel)\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+-\s*$/g, '')
    .trim();
}

function catalogNameKey(value) {
  return publicAtomName(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function youtubeSourceFromRecord(atomName, video, fallbackDate) {
  const clone = video.scope === 'clone';
  const kind = video.kind === 'build' ? 'Build' : 'Review';
  const checked = video.lastSeenAt || fallbackDate || '';
  return {
    Atomizor: atomName,
    'Titlu / identificare review YouTube': `${kind} YouTube verificat${clone ? ' pe clona' : ''} - ${video.title}`,
    URL: video.url,
    Observatie: clone
      ? `Exemplu realizat pe clona; nu este recenzie a originalului.${checked ? ` Identificat la ${checked}.` : ''}`
      : `Titlul identifica direct modelul.${checked ? ` Identificat la ${checked}.` : ''}`
  };
}

function mergeYouTubeReviewFeed(atomizers, root) {
  const feedPath = path.join(root, 'data', 'youtube-reviews.json');
  if (!fs.existsSync(feedPath)) return;
  let feed;
  try {
    feed = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
  } catch (error) {
    return;
  }
  const byName = new Map(atomizers.map(atom => [catalogNameKey(atom.name), atom]));
  Object.values(feed.models || {}).forEach(entry => {
    const atom = byName.get(catalogNameKey(entry.name));
    if (!atom) return;
    const existing = new Set(allSources(atom).map(sourceUrl).filter(Boolean));
    const additions = (entry.videos || []).filter(video => video.url && !existing.has(video.url)).map(video => {
      existing.add(video.url);
      return youtubeSourceFromRecord(publicAtomName(atom.name), video, String(feed.generatedAt || '').slice(0, 10));
    });
    if (additions.length) atom.youtube = additions.concat(atom.youtube || []);
  });
}

function loadCatalog(root = path.resolve(__dirname, '..')) {
  const indexPath = path.join(root, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  const data = extractAppData(html);
  const atomizers = [].concat(
    data.atomizers || [],
    evaluateLiteral(html, 'ATOMIZER_EXTENSIONS'),
    evaluateLiteral(html, 'SMOKEE_RTA_EXTENSIONS'),
    evaluateLiteral(html, 'SMOKEE_RTA_AUTO_EXTENSIONS')
  );
  const updates = evaluateLiteral(html, 'SMOKEE_RTA_SOURCE_UPDATES');
  Object.keys(updates).forEach(name => {
    const atom = atomizers.find(item => item && item.name === name);
    if (!atom) return;
    const update = updates[name] || {};
    if (update.image && !atom.image) atom.image = update.image;
    atom.sources = [].concat(atom.sources || [], update.sources || []);
    atom.catalogStatus = atom.catalogStatus || 'Smokee RTA confirmat';
  });
  mergeYouTubeReviewFeed(atomizers, root);
  const profiles = [].concat(
    data.profiles || [],
    evaluateLiteral(html, 'NET_PROFILE_EXTENSIONS'),
    evaluateLiteral(html, 'TUTUN_PROFILE_EXTENSIONS')
  );
  const liquids = evaluateLiteral(html, 'SMOKEE_LIQUIDS');
  const consumables = evaluateLiteral(html, 'SMOKEE_CONSUMABLES');
  return { html, data, atomizers, profiles, liquids, consumables };
}

module.exports = {
  allSources,
  atomizerValidation,
  directSource,
  extractAppData,
  extractExpression,
  loadCatalog,
  publicAtomName,
  slugify,
  sourceUrl
};

if (require.main === module) {
  const catalog = loadCatalog();
  const validations = catalog.atomizers.map(atomizerValidation);
  console.log(JSON.stringify({
    atomizers: catalog.atomizers.length,
    comparableAtomizers: validations.filter(item => item.comparable).length,
    profiles: catalog.profiles.length,
    liquids: Object.values(catalog.liquids).filter(Array.isArray).reduce((sum, list) => sum + list.length, 0),
    consumables: Object.values(catalog.consumables).filter(Array.isArray).reduce((sum, list) => sum + list.length, 0)
  }, null, 2));
}
