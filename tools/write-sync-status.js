#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { atomizerValidation, loadCatalog } = require('./catalog-data');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'sync-status.json');
const catalog = loadCatalog(ROOT);
const previous = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : {};

function countLists(value) {
  return Object.values(value || {}).filter(Array.isArray).reduce((sum, list) => sum + list.length, 0);
}

const now = new Date();
const explicitSync = process.argv.find(arg => arg.startsWith('--source-sync-at='));
const sourceSync = process.argv.includes('--source-sync') || Boolean(explicitSync);
const requestedSyncAt = explicitSync ? explicitSync.slice('--source-sync-at='.length) : '';
const sourceSyncAt = requestedSyncAt && !Number.isNaN(Date.parse(requestedSyncAt)) ? new Date(requestedSyncAt).toISOString() : now.toISOString();
const lastSuccessfulRun = sourceSync ? sourceSyncAt : (previous.lastSuccessfulRun || sourceSyncAt);
const status = {
  schemaVersion: 1,
  status: 'valid',
  lastSuccessfulRun,
  catalogBuiltAt: now.toISOString(),
  fallbackPolicy: 'last-known-good',
  browserPolling: false,
  timezone: 'Europe/Bucharest',
  schedule: ['06:00', '06:20'],
  newsWindowDays: 7,
  catalogDate: catalog.liquids.generated || catalog.consumables.generated || catalog.data.generated || '',
  counts: {
    atomizers: catalog.atomizers.length,
    comparableAtomizers: catalog.atomizers.map(atomizerValidation).filter(item => item.comparable).length,
    profiles: catalog.profiles.length,
    liquids: countLists(catalog.liquids),
    consumables: countLists(catalog.consumables)
  }
};

fs.writeFileSync(OUTPUT, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
console.log(`Sync status written for ${status.counts.atomizers} atomizers and ${status.counts.liquids} liquids; last source sync ${status.lastSuccessfulRun}.`);
