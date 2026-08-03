#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { canUseLastKnownGood } = require('./sync-smokee-mods');

const feedPath = path.join(__dirname, '..', 'data', 'smokee-mods.json');
const validFeed = JSON.parse(fs.readFileSync(feedPath, 'utf8'));

if (!canUseLastKnownGood(validFeed)) {
  throw new Error('The current Smokee mod catalog must be accepted as last-known-good.');
}

if (canUseLastKnownGood({ schemaVersion: 1, items: [], catalogItems: [], highEndItems: [] })) {
  throw new Error('An empty Smokee mod catalog must never replace the last-known-good catalog.');
}

console.log('Smokee mod fallback valid: empty or partial live responses preserve the last-known-good catalog.');
