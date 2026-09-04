#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKET_PATH = path.join(ROOT, 'data', 'market-2026.json');
const HISTORY_DIR = path.join(ROOT, 'data', 'market-history-2026');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
const ANALYSIS_START = '2025-01-01';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function bucharestDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const obj = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${obj.year}-${obj.month}-${obj.day}`;
}

function norm(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function inferBrand(title) {
  const known = [
    '528 Custom Vapes','Advken','Ambition Mods','Arcana Mods','Asmodus','Aspire','Auguse','BD Vape','Blitz',
    'BP Mods','Centenary Mods','Cloud Chasers Inc','Coilart','Creavap','Cthulhu','Damn Vape','Dicodes','Dovpo',
    'Drops','Early Bird','Eleaf','Ennequadro Mods','Flavor Madness','Footoon','Fumytech','Gas Mods','Geekvape',
    'Gemz','Guerra Flavors','Hellvape','Hotcig','Innokin','K&C Mods','KHW Mods','La Tabaccheria','LIQUA',
    'Lost Vape','Mechvape','Neutral Brand','Oumier','QP Design','Sirius Mods','Steam Crave','StattQualm',
    'Suicide Mods','SvoeMesto','SvoëMesto','Taifun','Telli\'s Mod','The Vaping Gentlemen Club','THC','Timesvape',
    'TNT Vape','Umbrella Mods','Van & Del Design','Vandy Vape','VandyVape','Vape Systems','Vapefly','Vaporesso',
    'Voopoo','VooPoo','Wick N Vape','Wotofo','Yachtvape','YiHi','YIHI','ZQ'
  ];
  return known.find(brand => new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(String(title || ''))) || '';
}

function cleanBrand(brand, title) {
  const raw = String(brand == null ? '' : brand).trim();
  if (!raw || /^\[object Object\]$/i.test(raw) || /^object Object$/i.test(raw)) return inferBrand(title);
  return raw;
}

function normalizedCategory(row) {
  const title = String(row.product || '');
  const t = norm(title);
  const current = String(row.category || '');
  if (!t) return current;

  const hasRta = /\brta\b/.test(t);
  const hasRda = /\brda\b/.test(t);
  const hasRdta = /\brdta\b/.test(t);
  const hasAtomizer = /\b(?:atomizor|atomizer)\b/.test(t);
  const platform = /dvarw|kayfun|taifun|diplomat|muted|asylum|bishop|pioneer|purity|millennium|millenium|gtr|chariot|prime minister|by ka|spica|squape|baya|vico|chephren|ares|radiator|trinity|era pro/.test(t);

  const strongPart = /\b(?:geam|glass|pyrex|bell|bell cap|chimney|chamber|camera|clopot|air pin|airflow pin|insert|reducer|reductie|top cap|bottom cap|tank kit|nano kit|extension|extensie|o ring|oring|spare kit|insulator|izolator|screw|surub|deck|jfc|juice control|510 pin)\b/.test(t);
  const glassTank = /\b(?:glass tank|replacement tank|tank glass|pei tank|ultem tank|psu tank)\b/.test(t);
  if ((strongPart || glassTank) && (hasRta || platform)) return 'componente RTA';

  if (/\b(?:bridge|rba)\b/.test(t)) return 'RBA/bridge';
  if (hasRta && (hasRda || hasRdta)) return 'RTA/RDA mixed';
  if (hasRta && !hasRda && !hasRdta) return 'RTA';
  if (!hasRta && (hasRda || hasRdta)) return 'RDA/RDTA';

  const isKit = /\bkit\b/.test(t) && /\b(?:mod|dna|yihi|sx|atomizor|atomizer|rta|rda|rdta|tank)\b/.test(t);
  if (isKit) return 'kit RTA/mod';

  const explicitBoard = /\b(?:board|pcb|chipset|placa|circuit|electronics?|module)\b/.test(t);
  if (explicitBoard) return 'chipset/board';

  const isMod = /\b(?:mod|box mod|sbs|side by side|squonk)\b/.test(t) && !hasAtomizer && !hasRta && !hasRda && !hasRdta;
  if (isMod) return 'mod';

  // BF60/FL80 are chipset names, but a finished device may contain one in its title.
  // Only classify them as boards when the listing itself contains board/module evidence.
  const dicodesChip = /\bdicodes\b/.test(t) && /\b(?:bf60|fl80)\b/.test(t);
  if (dicodesChip && explicitBoard) return 'chipset/board';

  if (/\b(?:wrap|folie|sleeve|izolator)\b/.test(t) && /\b(?:18350|18650|20700|21700|26650|acumulator|battery|baterie)\b/.test(t)) return 'accesoriu acumulator';
  if (/\b(?:acumulator|battery|baterie)\b/.test(t) && /\b(?:18350|18650|20700|21700|26650|mah|li ion)\b/.test(t)) return 'acumulator';
  if (/\b(?:incarcator|charger|charging)\b/.test(t) && /\b(?:acumulator|battery|baterie|18350|18650|20700|21700|slot)\b/.test(t)) return 'incarcator';

  if (/\b(?:drip tip|mustiuc|beauty ring|heat sink|atomizer stand|suport atomizor|adaptor 510|adapter 510)\b/.test(t)) return 'accesoriu RTA/mod';

  const cottonNoise = /\b(?:cotton candy|candy ice|lichid|liquid|aroma|flavour|flavor)\b/.test(t);
  const wick = /\b(?:bumbac|rayon|vata|wick|wicking|cotton bacon|cotton gods|organic cotton|native wicks|fiber n cotton|muji cotton)\b/.test(t);
  if (wick && !cottonNoise) return 'bumbac/wick';

  const wireExplicit = /\b(?:sarma|wire|kanthal|ka1|nichrome|ni80|ss316l?|nife30|nife52|nife|ni200|titanium wire)\b/.test(t);
  const wireConstruction = /\b(?:clapton|fused clapton|alien|twisted)\b/.test(t);
  const wireGeometry = /\b(?:awg|ga|gauge|\d{2}ga|\d{2}awg|\d+(?: \d+)? mm|metri|meter|meters|metres)\b/.test(t);
  const stockCoilNoise = /\b(?:pod|cartus|cartridge|nautilus|gtl|z coil|pnp|tpp|rpm|coil head|mesh head)\b/.test(t);
  const prebuilt = /\b(?:prebuilt|pre built|handmade|coil|coils|rezistenta|rezistente)\b/.test(t);
  if ((wireExplicit || wireConstruction) && !stockCoilNoise) {
    if (prebuilt) return 'coil prebuilt';
    if (wireGeometry || /\b(?:sarma|wire)\b/.test(t)) return 'sarma';
  }
  if (current === 'sarma/coil') return prebuilt ? 'coil prebuilt' : 'sarma';

  if (/\b(?:ohm meter|ohm reader|build tab|coil jig|coiling tool|penseta ceramica|ceramic tweezers|tweezers|cleste|cutter|foarfeca|scissors|tool kit|trusa build|ustensile build)\b/.test(t)) return 'unelte build';

  const tobacco = /\b(?:tutun|tobacco|net|virginia|burley|kentucky|kentuky|latakia|oriental|turkish|perique|cigar|cigarro|cavendish|balkan|english blend|american blend)\b/.test(t);
  const liquidForm = /\b(?:lichid|liquid|e liquid|eliquid|aroma|longfill|shortfill|concentrat|extract|shot)\b/.test(t);
  if (tobacco && liquidForm) return 'lichid tutunos/NET/DIY';

  if (current === 'accesoriu') return 'accesoriu RTA/mod';
  return current;
}

function informativeStock(a, b) {
  if (a && a !== 'unknown') return a;
  if (b && b !== 'unknown') return b;
  return a || b || 'unknown';
}

function mergeRows(a, b) {
  const aStructured = a.sourceMode === 'json-ld' || a.sourceMode === 'woo-store-api';
  const bStructured = b.sourceMode === 'json-ld' || b.sourceMode === 'woo-store-api';
  const preferred = bStructured && !aStructured ? b : a;
  const other = preferred === a ? b : a;
  return {
    ...preferred,
    priceRon: preferred.priceRon == null ? other.priceRon : preferred.priceRon,
    stock: informativeStock(preferred.stock, other.stock),
    brand: cleanBrand(preferred.brand || other.brand, preferred.product || other.product),
    source: preferred.source || other.source,
    sourceMode: preferred.sourceMode || other.sourceMode
  };
}

function dedupeRows(rows) {
  const map = new Map();
  for (const raw of rows) {
    if (!raw || String(raw.observedAt || '') < ANALYSIS_START) continue;
    const row = {
      ...raw,
      category: normalizedCategory(raw),
      brand: cleanBrand(raw.brand, raw.product)
    };
    const text = norm(`${row.brand} ${row.product}`);
    const isDicodes = /\bdicodes\b/.test(text);
    const hasBoardEvidence = /\b(?:board|pcb|chipset|placa|circuit|electronics?|module)\b/.test(text);
    const looksFinishedMod = /\b(?:mod|box mod|sbs|side by side|squonk)\b/.test(text);
    if (isDicodes && row.category === 'mod') continue;
    if (isDicodes && row.category === 'chipset/board' && looksFinishedMod && !hasBoardEvidence) continue;
    const key = `${row.retailerId}|${row.category}|${norm(row.product)}`;
    if (!key || /\|\|$/.test(key)) continue;
    const previous = map.get(key);
    map.set(key, previous ? mergeRows(previous, row) : row);
  }
  return [...map.values()].sort((a, b) => `${a.retailerId}|${a.category}|${a.product}`.localeCompare(`${b.retailerId}|${b.category}|${b.product}`, 'ro'));
}

function summaryByCategory(observations) {
  const groups = {};
  for (const row of observations) {
    const key = row.category || 'necunoscut';
    if (!groups[key]) groups[key] = { listed: 0, inStock: 0, outOfStock: 0, unknownStock: 0, retailers: new Set() };
    groups[key].listed += 1;
    groups[key].retailers.add(row.retailerId);
    if (row.stock === 'in_stock') groups[key].inStock += 1;
    else if (row.stock === 'out_of_stock') groups[key].outOfStock += 1;
    else groups[key].unknownStock += 1;
  }
  return Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, {
    listed: value.listed,
    inStock: value.inStock,
    outOfStock: value.outOfStock,
    unknownStock: value.unknownStock,
    retailers: value.retailers.size
  }]));
}

function updateStatus(market, observations, date) {
  market.collectorStatus = market.collectorStatus || {};
  market.collectorStatus.date = date;
  market.collectorStatus.observations = observations.length;
  const counts = observations.reduce((acc, row) => {
    acc[row.retailerId] = (acc[row.retailerId] || 0) + 1;
    return acc;
  }, {});
  if (Array.isArray(market.collectorStatus.byRetailer)) {
    market.collectorStatus.byRetailer = market.collectorStatus.byRetailer.map(row => ({
      ...row,
      observations: Number(counts[row.retailerId] || 0)
    }));
  }
}

function refreshTodayTrend(market, observations, date) {
  const trend = {
    date,
    observations: observations.length,
    retailersWithObservations: new Set(observations.map(row => row.retailerId)).size,
    categories: summaryByCategory(observations)
  };
  const prior = (market.trendSnapshots || []).filter(item => String(item.date || '') >= ANALYSIS_START && item.date !== date);
  prior.push(trend);
  prior.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  market.trendSnapshots = prior;
  return trend;
}

function main() {
  const market = readJson(MARKET_PATH);
  const date = bucharestDate();
  if (Number(market.scopeYear) !== 2026 || date < ANALYSIS_START) {
    console.log(`Market normalizer starts at ${ANALYSIS_START}; current Bucharest date is ${date}.`);
    return;
  }

  const before = Array.isArray(market.observations) ? market.observations.length : 0;
  const observations = dedupeRows(market.observations || []);
  const trend = refreshTodayTrend(market, observations, date);
  updateStatus(market, observations, date);
  market.observations = observations;
  market.analysisStart = ANALYSIS_START;
  market.analysisEnd = date;
  market.updatedAt = new Date().toISOString();

  const badBrands = observations.filter(row => /^\[object Object\]$/i.test(String(row.brand || '')));
  const finishedDicodes = observations.filter(row => {
    const text = norm(`${row.brand} ${row.product}`);
    const hasBoardEvidence = /\b(?:board|pcb|chipset|placa|circuit|electronics?|module)\b/.test(text);
    const looksFinishedMod = /\b(?:mod|box mod|sbs|side by side|squonk)\b/.test(text);
    return /\bdicodes\b/.test(text) && (row.category === 'mod' || (row.category === 'chipset/board' && looksFinishedMod && !hasBoardEvidence));
  });
  const obviousMistakes = observations.filter(row => {
    const t = norm(row.product);
    return (row.category === 'unelte build' && /\bmustiuc\b/.test(t)) ||
      (row.category === 'acumulator' && /\b(?:wrap|folie|sleeve)\b/.test(t));
  });

  if (badBrands.length || finishedDicodes.length || obviousMistakes.length) {
    const sample = [...badBrands, ...finishedDicodes, ...obviousMistakes]
      .slice(0, 5)
      .map(row => `${row.retailerId}:${row.category}:${row.product}`)
      .join(' | ');
    throw new Error(`Normalization QA failed: badBrands=${badBrands.length}, finishedDicodes=${finishedDicodes.length}, obviousMistakes=${obviousMistakes.length}; sample=${sample}`);
  }

  if (CHECK) {
    console.log(JSON.stringify({ before, after: observations.length, retailers: trend.retailersWithObservations, categories: Object.keys(trend.categories).length }, null, 2));
    return;
  }

  if (WRITE) {
    writeJson(MARKET_PATH, market);
    const historyPath = path.join(HISTORY_DIR, `${date}.json`);
    const history = {
      schemaVersion: 1,
      scopeYear: 2026,
      analysisStart: ANALYSIS_START,
      date,
      generatedAt: market.updatedAt,
      observations,
      categorySnapshots: (market.categorySnapshots || []).filter(row => row.observedAt === date),
      summary: trend,
      collectorStatus: market.collectorStatus
    };
    writeJson(historyPath, history);
    console.log(`Normalized Market 2026: ${before} -> ${observations.length} observations; ${trend.retailersWithObservations} retailers.`);
    return;
  }

  console.log(JSON.stringify({ before, after: observations.length, retailers: trend.retailersWithObservations }, null, 2));
}

main();
