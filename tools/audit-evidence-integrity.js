'use strict';

const fs = require('node:fs');
const path = require('node:path');

function audit(documents, now = new Date()) {
  const findings = [];
  const add = (severity, file, code, detail) => findings.push({severity, file, code, detail});
  const timestamp = value => typeof value === 'string' ? Date.parse(value) : NaN;
  for (const [file, doc] of Object.entries(documents)) {
    const generated = timestamp(doc.generatedAt || doc.updatedAt);
    if (!Number.isFinite(generated)) add('error', file, 'missing_timestamp', 'No valid generation timestamp.');
    else if (generated > now.getTime() + 300000) add('error', file, 'future_snapshot', 'Generation timestamp is in the future.');
    else if (now.getTime() - generated > 36 * 3600000) add('warning', file, 'stale_snapshot', 'Snapshot is over 36 hours old.');
    if (doc.pendingRefresh === true) add('warning', file, 'refresh_pending', 'Refresh has not completed.');
    if (doc.observedPopularity) {
      const truth = doc.truth || {};
      if (truth.exactPeriodUnitsAvailable !== true) add('warning', file, 'no_unit_sales', 'Public rankings are not measured period sales.');
      if (truth.nationalMarketShareAvailable !== true) add('warning', file, 'no_national_share', 'National market coverage is not established.');
      if (truth.evidenceFirstObservedAt > truth.requestedStart) add('warning', file, 'partial_history', `${truth.requestedStart} requested; evidence starts ${truth.evidenceFirstObservedAt}.`);
    }
    for (const row of doc.products || []) {
      const id = row.id || 'unidentified';
      const first = timestamp(row.firstPublicEvidenceAt);
      if (Number.isFinite(first) && first > now.getTime()) add('error', file, 'future_public_evidence', `${id}: future ETA cannot be a past public observation.`);
      if (row.window !== 'after') continue;
      const event = timestamp(row.eventDate);
      const reference = timestamp(doc.snapshotReferenceAt);
      if (!Number.isFinite(event) || !Number.isFinite(reference)) add('error', file, 'missing_event_date', `${id}: event or reference date missing.`);
      else if (event > reference || reference - event > 30 * 86400000) add('error', file, 'outside_release_window', `${id}: event outside the stated 30-day window.`);
      const evidence = (row.sources || []).filter(s => s.decisionEligible === true && s.discoveryOnly !== true);
      if (!evidence.length) add('error', file, 'no_eligible_evidence', `${id}: no decision-eligible evidence.`);
      if (/catalog|retail/i.test(String(row.dateConfidence || ''))) add('warning', file, 'listing_not_launch', `${id}: listing date does not by itself establish global launch date.`);
    }
    for (const run of doc.sourceRuns || []) {
      if (run.ok !== true) add('warning', file, 'source_not_verified', `${run.id || 'unknown'}: source collection not successful.`);
      if (run.ok === true && run.pages && (run.pages.failedPages || []).length) add('warning', file, 'partial_source', `${run.id}: successful source contains failed pages.`);
    }
    if ((doc.sourceRuns || []).length) {
      const working = doc.sourceRuns.filter(run => run.ok === true).length;
      const ratio = working / doc.sourceRuns.length;
      if (ratio < 0.9) add('error', file, 'source_coverage_below_gate', `${working}/${doc.sourceRuns.length} direct sources succeeded; minimum is 90%.`);
    }
    for (const skipped of doc.skippedSources || []) add('warning', file, 'source_explicitly_skipped', `${skipped.id}: ${skipped.reason || 'direct collection unavailable'}.`);
  }
  const references = Object.entries(documents).filter(([,d]) => d.snapshotReferenceAt);
  if (new Set(references.map(([,d]) => d.snapshotReferenceAt)).size > 1) add('error', 'snapshots', 'mixed_snapshot_references', 'Datasets belong to different refresh windows.');
  return {
    checkedAt: now.toISOString(),
    status: findings.some(f => f.severity === 'error') ? 'fail' : findings.length ? 'partial' : 'pass',
    scope: 'Metadata integrity only; does not prove source accuracy, market completeness, or sales.',
    findings
  };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..', 'data');
  const requested = (process.argv.find(value => value.startsWith('--scope=')) || '--scope=all').slice(8);
  const scopes = {
    analysis: ['market-analysis-public-2026.json'],
    hype: ['market-hype-products-2026.json', 'market-hype-pods-2026.json', 'market-hype-direct-catalogs-2026.json'],
    all: ['market-analysis-public-2026.json', 'market-hype-products-2026.json', 'market-hype-pods-2026.json', 'market-hype-direct-catalogs-2026.json']
  };
  const files = scopes[requested];
  if (!files) throw new Error(`Unknown scope: ${requested}`);
  const documents = Object.fromEntries(files.map(file => [file, JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))]));
  const result = audit(documents);
  console.log(JSON.stringify(result, null, 2));
  if (result.status === 'fail') process.exitCode = 1;
}

module.exports = {audit};
