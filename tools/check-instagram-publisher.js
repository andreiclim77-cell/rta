#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadCatalog } = require('./catalog-data');
const {
  applyInstagramPublished,
  collectFacebookRecords,
  emptyInstagramState,
  instagramCaption,
  manualFacebookRecord,
  mergeManualFacebookRecords,
  normalizeInstagramState,
  planInstagramMirrors,
  recordIdentity,
  syncBackfillSummary,
  validateInstagramState
} = require('./instagram-publisher');

const ROOT = path.resolve(__dirname, '..');
const readJson = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const catalog = loadCatalog(ROOT);
const campaignState = readJson('data/facebook-campaign-state.json');
const facebookState = readJson('data/facebook-publish-state.json');
const photoState = readJson('data/facebook-hourly-photo-state.json');
const modsFeed = readJson('data/smokee-mods.json');
const state = normalizeInstagramState(emptyInstagramState());

const records = collectFacebookRecords(campaignState, facebookState, photoState);
assert(records.length > 0, 'Facebook history should expose mirrorable product records');
assert.strictEqual(new Set(records.map(recordIdentity)).size, records.length, 'Facebook records must be deduplicated by product family');
const backfill = syncBackfillSummary(state, records, '2026-08-11T08:00:00.000Z');
assert.strictEqual(backfill.total, records.length, 'Backfill summary must include every unique Facebook product family');
assert.strictEqual(backfill.remaining, records.length, 'Fresh Instagram state must retain the complete Facebook backfill');

const plan = planInstagramMirrors(campaignState, facebookState, state, catalog, modsFeed, {
  maxPosts: 500,
  dailyLimit: 500,
  photoState,
  now: '2026-08-09T12:00:00.000Z'
});
assert.strictEqual(plan.skipped.length, 0, 'Every historical Facebook product post must remain eligible through catalog or Facebook-photo fallback');
assert.strictEqual(plan.candidates.length, records.length, 'Every unique Facebook product family should be planned once');
assert.strictEqual(new Set(plan.candidates.map(candidate => candidate.identity)).size, plan.candidates.length, 'Instagram plan must not repeat product families');
assert(plan.candidates.some(candidate => candidate.event.productType === 'atomizer'), 'Instagram plan needs atomizers');
assert(plan.candidates.some(candidate => candidate.event.productType === 'mod'), 'Instagram plan needs mods');
assert(plan.candidates.some(candidate => candidate.event.productType === 'editorial'), 'Instagram plan needs the historical RTA photo series');
assert(plan.candidates.every(candidate => candidate.event.image || candidate.event.requiresFacebookAttachment), 'Each planned item needs a verified catalog image or its original Facebook attachment');

const manualOne = manualFacebookRecord({
  id: '1221839447687298_manual_1',
  message: 'Text manual pastrat exact.\nA doua linie.',
  created_time: '2026-08-11T12:00:00+0000',
  is_published: true,
  attachments: { data: [{ media: { image: { src: 'https://example.com/manual-1.jpg' } } }] }
});
const manualTwo = manualFacebookRecord({
  id: '1221839447687298_manual_2',
  message: 'Text manual pastrat exact.\nA doua linie.',
  created_time: '2026-08-11T12:05:00+0000',
  attachments: { data: [{
    subattachments: { data: [
      { media: { image: { src: 'https://example.com/manual-2a.jpg' } } },
      { media: { image: { src: 'https://example.com/manual-2b.jpg' } } }
    ] }
  }] }
});
assert(manualOne && manualTwo, 'Manual Facebook photo posts must be recognized');
assert.strictEqual(manualTwo.images.length, 2, 'Manual Facebook carousels must retain every photo');
mergeManualFacebookRecords(state, [manualOne, manualTwo]);
const manualPlan = planInstagramMirrors(campaignState, facebookState, state, catalog, modsFeed, {
  maxPosts: 500,
  dailyLimit: 500,
  photoState,
  manualRecords: Object.values(state.manualFacebookRecords),
  now: '2026-08-11T12:10:00.000Z'
});
const manualCandidates = manualPlan.candidates.filter(candidate => candidate.event.productType === 'manual');
assert.strictEqual(manualCandidates.length, 2, 'Manual posts must be deduplicated only by Facebook post ID, even when captions repeat');
assert.strictEqual(instagramCaption(manualCandidates[0].event), manualCandidates[0].record.message, 'Manual Facebook text must be preserved exactly on Instagram');

const first = plan.candidates[0];
const caption = instagramCaption(first.event);
assert(caption.startsWith('https://ghid-rta.ro/\n'), 'Guide URL must be visible before Instagram caption truncation');
assert(caption.includes(first.event.name), 'Instagram caption must identify the exact model');
assert(caption.includes('18+'), 'Instagram caption must retain the adult technical notice');
assert(!/pret|preț|stoc|cumpar|cumpăr|comenzi|telefon/i.test(caption), 'Instagram caption must remain educational, not commercial');

state.queue.push({
  sourcePostId: first.record.sourcePostId,
  sourcePublishedAt: first.record.sourcePublishedAt,
  identity: first.identity,
  productType: first.event.productType,
  familyKey: first.event.familyKey,
  slug: first.event.slug,
  name: first.event.name,
  imageUrl: 'https://ghid-rta.ro/assets/instagram/test.jpg',
  formatVersion: 'test'
});
applyInstagramPublished(state, state.queue[0], {
  id: 'ig_media_1',
  permalink: 'https://www.instagram.com/p/test/',
  timestamp: '2026-08-09T12:05:00.000Z'
}, {
  pageId: 'page_1',
  id: 'ig_1',
  username: 'ghid-rta.ro'
}, '2026-08-09T12:05:00.000Z');
assert.strictEqual(state.queue.length, 0, 'Successful Instagram publish must remove the prepared item');
assert(state.mirroredFacebookPosts[first.record.sourcePostId], 'Successful Instagram publish must record the source Facebook post');
assert(state.mirroredFamilies[first.identity], 'Successful Instagram publish must record the product family');

const secondPlan = planInstagramMirrors(campaignState, facebookState, state, catalog, modsFeed, {
  maxPosts: 500,
  dailyLimit: 500,
  photoState,
  now: '2026-08-10T12:00:00.000Z'
});
assert(!secondPlan.candidates.some(candidate => candidate.identity === first.identity), 'A mirrored family must never be planned again');

const invalid = normalizeInstagramState(emptyInstagramState());
invalid.queue = [
  { sourcePostId: 'same', identity: 'atomizer:test', name: 'Test', imageUrl: 'https://ghid-rta.ro/a.jpg' },
  { sourcePostId: 'same', identity: 'atomizer:test', name: 'Test', imageUrl: 'https://ghid-rta.ro/a.jpg' }
];
assert(validateInstagramState(invalid).length >= 2, 'State validation must reject duplicated posts and families');

console.log(`Instagram publisher checks passed: ${records.length} unique Facebook posts, exact-photo fallback, daily pacing and durable deduplication.`);
