#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exactModelMatch, parseViewCount, selectVideos, validateFeed } = require('./sync-youtube-reviews');

const root = path.resolve(__dirname, '..');
const jsonPath = path.join(root, 'data', 'youtube-reviews.json');
const jsPath = path.join(root, 'data', 'youtube-reviews.js');

if (!fs.existsSync(jsonPath) || !fs.existsSync(jsPath)) {
  throw new Error('YouTube review feed files are missing.');
}

const feed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const errors = validateFeed(feed);
const strictCases = [
  ['Asylum V3 RTA', 'Asylum V3 RTA review', true],
  ['Asylum V3 RTA', 'Asylum RTA review', false],
  ['Asylum RTA', 'Asylum V3 RTA review', false],
  ['Asylum V3 RTA', 'Asylum Mods Sherman RTA V3 review', false],
  ['Asylum V3 RTA', 'Asylum V2, not called the V3', false],
  ['Arcana Mods Chariot 23 RTA', 'Chariot 23 - Arcana Mods review', true],
  ['Kayfun Lite Plus 2021 / KLP', 'Kayfun Lite Plus 2021 review', true],
  ['FOUR ONE FIVE 415RTA V2', '415 RTA V2 review and build', true],
  ['Atmizoo Tripod', 'Tripod 2 RTA by Atmizoo review', false],
  ['Atmizoo Tripod', 'Tripod MTL RTA by Atmizoo review', true],
  ['Minister MTL', 'Prime Minister RTA by Centenary Mods', false],
  ['Minister MTL', 'Minister RTA by Centenary Mods review', true],
  ['Auguse Era / Mulan MTL', 'Era RDA by Auguse review', false],
  ['Auguse Era / Mulan MTL', 'Era Pro RTA by Auguse review', false]
];

strictCases.forEach(([model, title, expected]) => {
  if (exactModelMatch(model, title) !== expected) errors.push(`strict match failed: ${model} / ${title}`);
});

if (parseViewCount('1.2K views') !== 1200 || parseViewCount('12,345 views') !== 12345) {
  errors.push('YouTube view count parsing failed');
}
const ranked = selectVideos('Test Alpha RTA', [
  { videoId: 'aaa111BBB22', title: 'Test Alpha RTA review', kind: 'review', channel: 'A', viewCount: 100, durationSeconds: 300 },
  { videoId: 'ccc333DDD44', title: 'Test Alpha RTA review detailed', kind: 'review', channel: 'B', viewCount: 900, durationSeconds: 300 },
  { videoId: 'eee555FFF66', title: 'Test Alpha RTA build tutorial', kind: 'build', channel: 'C', viewCount: 700, durationSeconds: 300 }
], []);
if (!ranked[0] || ranked[0].videoId !== 'ccc333DDD44' || !ranked.find(video => video.videoId === 'eee555FFF66')) {
  errors.push('YouTube reviews/builds are not ranked by view count');
}

const script = fs.readFileSync(jsPath, 'utf8');
if (!/^window\.RTA_YOUTUBE_REVIEW_FEED=\{/.test(script)) errors.push('browser feed wrapper is invalid');

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`YouTube review feed passed: ${Object.keys(feed.models || {}).length} models, ${Object.values(feed.models || {}).reduce((sum, entry) => sum + (entry.videos || []).length, 0)} direct links.`);
