#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { validateFeed } = require('./sync-smokee-mods');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'smokee-mods.json');
const INDEX_PATH = path.join(ROOT, 'index.html');
const START_MARKER = '/* AUTO-SMOKEE-MODS-START */';
const END_MARKER = '/* AUTO-SMOKEE-MODS-END */';

const feed = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const errors = validateFeed(feed);
const html = fs.readFileSync(INDEX_PATH, 'utf8');
const start = html.indexOf(START_MARKER);
const end = html.indexOf(END_MARKER);

if (start < 0 || end < 0 || end <= start) errors.push('index.html is missing the mods data markers');
if (!html.includes('data-tab="mods"')) errors.push('top navigation is missing the RTA Mods button');
if (!html.includes('id="modsGrid"')) errors.push('RTA Mods grid is missing');
if (!html.includes('id="registryModList"')) errors.push('RTA Mods news registry is missing');

if (start >= 0 && end > start) {
  const embedded = html.slice(start + START_MARKER.length, end).trim();
  try {
    const parsed = JSON.parse(embedded);
    if (JSON.stringify(parsed) !== JSON.stringify(feed)) errors.push('embedded mods data differs from data/smokee-mods.json');
  } catch (error) {
    errors.push(`embedded mods JSON is invalid: ${error.message}`);
  }
}

const familyKeys = new Set((feed.items || []).map(item => item.familyKey));
if (familyKeys.size !== (feed.items || []).length) errors.push('visible mod list contains duplicate families');
const catalogKeys = new Set((feed.catalogItems || []).map(item => item.familyKey));
if (catalogKeys.size !== (feed.catalogItems || []).length) errors.push('full mod catalog contains duplicate families');
const highEndKeys = new Set((feed.highEndItems || []).map(item => item.familyKey));
if (highEndKeys.size !== (feed.highEndItems || []).length) errors.push('high-end mod list contains duplicate families');
if ((feed.highEndItems || []).some(item => item.highEnd !== true)) errors.push('high-end mod list contains an unclassified item');
for (const item of feed.recentItems || []) {
  if (!item.publishedAt) errors.push(`recent mod is missing publication date: ${item.title}`);
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

const reviewed = feed.items.filter(item => item.review).length;
const reviewedHighEnd = feed.highEndItems.filter(item => item.review).length;
console.log(`Smokee mods valid: ${feed.items.length} visible, ${feed.catalogItems.length} catalog families, ${feed.highEndItems.length} high-end (${reviewedHighEnd} reviewed), ${feed.recentItems.length} recent, ${reviewed} visible exact YouTube review(s).`);
