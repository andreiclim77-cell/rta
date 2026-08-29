#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'market-retailers-2026.json');
const MARKET_PATH = path.join(ROOT, 'data', 'market-2026.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'market-coverage-2026.json');
const WRITE = process.argv.includes('--write');
const REQUIRE_CERTIFIED = process.argv.includes('--require-certified');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function bucharestDate(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function operatorKey(retailer) {
  return retailer.operatorId || `storefront:${retailer.id}`;
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function main() {
  const registry = readJson(REGISTRY_PATH);
  const market = readJson(MARKET_PATH);
  const date = bucharestDate();

  if (Number(registry.scopeYear) !== 2026 || Number(market.scopeYear) !== 2026) {
    throw new Error('National coverage audit is locked to Market 2026.');
  }

  const configured = array(registry.retailers);
  if (!configured.length) throw new Error('National registry is empty.');

  const observations = array(market.observations).filter(row => row.observedAt === date);
  const genericStatus = market.collectorStatus || {};
  const specialistStatus = market.specializedCollectorStatus || {};
  const genericById = new Map(array(genericStatus.byRetailer).map(row => [row.retailerId, row]));
  const specialistById = new Map(array(specialistStatus.byRetailer).map(row => [row.retailerId, row]));
  const observationsById = new Map();

  for (const row of observations) {
    observationsById.set(row.retailerId, Number(observationsById.get(row.retailerId) || 0) + 1);
  }

  const storefronts = configured.map(retailer => {
    const generic = genericById.get(retailer.id) || null;
    const specialist = specialistById.get(retailer.id) || null;
    const count = Number(observationsById.get(retailer.id) || 0);
    const genericErrors = generic ? array(generic.errors) : [];
    const specialistErrors = specialist ? array(specialist.errors) : [];
    const skippedMode = generic && generic.skipped || null;
    const fallbackUsed = Boolean(
      generic && generic.fallbackUsed ||
      specialist && specialist.fallbackUsed ||
      generic && /cache/i.test(String(generic.sourceMode || '')) ||
      specialist && /cache/i.test(String(specialist.sourceMode || ''))
    );
    const sourceAttemptedToday = Boolean(
      genericStatus.date === date && generic && (Number(generic.pagesFetched || 0) > 0 || skippedMode) ||
      specialistStatus.date === date && specialist
    );
    const sourceErrors = genericErrors.length + specialistErrors.length;
    const parserComplete = specialist
      ? specialist.collectionComplete === true
      : Boolean(generic && Number(generic.pagesFetched || 0) > 0 && genericErrors.length === 0 && !skippedMode);

    return {
      retailerId: retailer.id,
      name: retailer.name,
      url: retailer.url,
      operatorKey: operatorKey(retailer),
      observationsToday: count,
      sourceAttemptedToday,
      pagesFetched: Number(generic && generic.pagesFetched || 0) + Number(specialist && specialist.pagesFetched || 0),
      errors: sourceErrors,
      fallbackUsed,
      skippedMode,
      parserComplete,
      captureState: count > 0
        ? (fallbackUsed ? 'same-day-fallback' : sourceErrors ? 'captured-with-source-errors' : 'captured')
        : (sourceErrors ? 'source-error-no-observations' : sourceAttemptedToday ? 'zero-observations' : 'not-attempted'),
      exhaustiveCertified: false
    };
  });

  const operators = new Set(configured.map(operatorKey));
  const observedStorefronts = storefronts.filter(row => row.observationsToday > 0).length;
  const zeroObservationStorefronts = storefronts.filter(row => row.observationsToday === 0).map(row => row.retailerId);
  const errorStorefronts = storefronts.filter(row => row.errors > 0).map(row => row.retailerId);
  const fallbackStorefronts = storefronts.filter(row => row.fallbackUsed).map(row => row.retailerId);
  const notAttemptedStorefronts = storefronts.filter(row => !row.sourceAttemptedToday).map(row => row.retailerId);
  const discoveryCertified = registry.nationalAudit && registry.nationalAudit.discoveryCertified === true;

  // A national 100% claim needs a separately certified discovery universe AND
  // verified exhaustive collection for every storefront. A successful HTTP fetch
  // or a non-zero product count is deliberately insufficient.
  const allStorefrontsExhaustive = storefronts.length > 0 && storefronts.every(row => row.exhaustiveCertified === true);
  const claim100Romania = discoveryCertified && allStorefrontsExhaustive && errorStorefronts.length === 0 && fallbackStorefronts.length === 0;

  const report = {
    schemaVersion: 1,
    scopeYear: 2026,
    date,
    generatedAt: new Date().toISOString(),
    nationalClaim: {
      label: 'ROMANIA 100%',
      allowed: claim100Romania,
      discoveryCertified,
      allStorefrontsExhaustive,
      reason: claim100Romania
        ? 'Universul national si colectarea exhaustiva pentru fiecare storefront sunt certificate.'
        : 'Nu este permisa afirmarea 100% Romania pana la certificarea separata a universului national si a colectarii exhaustive pentru fiecare storefront.'
    },
    coverage: {
      storefrontsConfigured: storefronts.length,
      uniqueOperatorsConfigured: operators.size,
      storefrontsWithObservationsToday: observedStorefronts,
      zeroObservationStorefronts,
      sourceErrorStorefronts: errorStorefronts,
      fallbackStorefronts,
      notAttemptedStorefronts,
      observationsToday: observations.length
    },
    qualityState: claim100Romania
      ? 'national-certified'
      : errorStorefronts.length || fallbackStorefronts.length || notAttemptedStorefronts.length
        ? 'national-audit-in-progress-with-source-gaps'
        : 'national-audit-in-progress',
    storefronts
  };

  if (WRITE) writeJson(OUTPUT_PATH, report);
  console.log(JSON.stringify(report, null, 2));

  if (REQUIRE_CERTIFIED && !claim100Romania) {
    throw new Error('ROMANIA 100% is not certified.');
  }
}

try {
  main();
} catch (error) {
  console.error(error && error.stack || error);
  process.exitCode = 1;
}
