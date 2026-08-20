#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadCatalog } = require('./catalog-data');
const {
  applyInstagramPublished,
  collectFacebookRecords,
  dedupeSourceImages,
  dedupeManualFacebookRecords,
  emptyInstagramState,
  generatedFacebookReelPostIds,
  instagramCaption,
  isGeneratedFacebookReelPost,
  markSourceBlocked,
  manualFacebookRecord,
  manualContentFingerprint,
  mergeManualFacebookRecords,
  normalizeInstagramState,
  planInstagramMirrors,
  postContainsVideo,
  purgeGeneratedFacebookReelRecords,
  purgeManualFacebookRecordIds,
  recordIdentity,
  sourceBlockIsActive,
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
const manualOneReshare = manualFacebookRecord({
  id: '1221839447687298_manual_1_reshare',
  message: '',
  created_time: '2026-08-11T12:03:00+0000',
  attachments: { data: [{ media: { image: { src: 'https://example.com/manual-1.jpg?size=large' } } }] }
});
assert.deepStrictEqual(
  dedupeSourceImages([
    ['https://fresh.example/media/manual-1.jpg?token=new'],
    ['https://stale.example/media/manual-1.jpg?token=old', 'https://fresh.example/media/manual-2.jpg']
  ]),
  ['https://fresh.example/media/manual-1.jpg?token=new', 'https://fresh.example/media/manual-2.jpg'],
  'A fresh Graph API image URL must win over the stored CDN URL for the same photograph'
);
assert(manualOne && manualTwo, 'Manual Facebook photo posts must be recognized');
assert.strictEqual(manualTwo.images.length, 2, 'Manual Facebook carousels must retain every photo');
assert.strictEqual(manualContentFingerprint(manualOne), manualContentFingerprint(manualOneReshare), 'Facebook CDN query parameters must not create a new manual-content identity');
const deduplicatedManual = dedupeManualFacebookRecords([manualOneReshare, manualOne, manualTwo]);
assert.strictEqual(deduplicatedManual.length, 2, 'A manual reshare of the same photos must be collapsed');
assert.strictEqual(deduplicatedManual.find(record => record.sourcePostId === manualOne.sourcePostId).message, manualOne.message, 'The original manual post with text must win over an empty reshare');
const generatedReel = manualFacebookRecord({
  id: '1221839447687298_generated_reel',
  message: 'https://ghid-rta.ro/\nFISA DOCUMENTATA IN GHID',
  created_time: '2026-08-11T12:06:00+0000',
  attachments: { data: [{
    media_type: 'video_autoplay',
    target: { url: 'https://www.facebook.com/reel/123456789/' },
    media: { image: { src: 'https://example.com/reel-thumbnail.jpg' } }
  }] }
});
assert.strictEqual(generatedReel, null, 'A generated Facebook Reel thumbnail must not re-enter the Instagram photo queue');
const metadataOnlyReel = manualFacebookRecord({
  id: '1221839447687298_987654321',
  message: 'Reel cu miniatura foto.',
  created_time: '2026-08-11T12:07:00+0000',
  status_type: 'added_video',
  permalink_url: 'https://www.facebook.com/reel/987654321/',
  attachments: { data: [{ media: { image: { src: 'https://example.com/video-thumbnail.jpg' } } }] }
});
assert.strictEqual(metadataOnlyReel, null, 'A Facebook Reel identified by post metadata must not enter the photo queue');
assert.strictEqual(postContainsVideo({ status_type: 'added_video' }), true, 'Facebook video status must be recognized without attachment metadata');
const generatedIds = generatedFacebookReelPostIds({
  facebookReels: { source: { id: '987654321' } },
  history: [{ facebook: { id: '123456789' } }]
});
assert(isGeneratedFacebookReelPost('1221839447687298_987654321', generatedIds), 'A generated Facebook Reel ID must be excluded deterministically');
const persistedEchoState = normalizeInstagramState({
  ...emptyInstagramState(),
  manualFacebookRecords: {
    '1221839447687298_987654321': {
      sourcePostId: '1221839447687298_987654321',
      productType: 'manual',
      images: ['https://example.com/video-thumbnail.jpg']
    }
  }
});
assert.strictEqual(purgeGeneratedFacebookReelRecords(persistedEchoState, generatedIds), 1, 'Persisted generated Reel records must be purged');
assert.strictEqual(Object.keys(persistedEchoState.manualFacebookRecords).length, 0, 'Generated Reel records must not survive in the manual queue');
const persistedVideoWrapper = normalizeInstagramState({
  ...emptyInstagramState(),
  manualFacebookRecords: {
    '1221839447687298_video_wrapper': {
      sourcePostId: '1221839447687298_video_wrapper',
      productType: 'manual',
      images: ['https://example.com/video-wrapper-thumbnail.jpg']
    }
  },
  queue: [{ sourcePostId: '1221839447687298_video_wrapper' }]
});
assert.strictEqual(purgeManualFacebookRecordIds(persistedVideoWrapper, ['1221839447687298_video_wrapper']), 1, 'A video wrapper rediscovered through Page metadata must be purged');
assert.strictEqual(persistedVideoWrapper.queue.length, 0, 'A purged video wrapper must leave the Instagram preparation queue');
const reelEchoState = normalizeInstagramState({
  ...emptyInstagramState(),
  manualFacebookRecords: { reel_post: { sourcePostId: 'reel_post' } },
  mirroredFacebookPosts: {
    reel_post: {
      sourcePostId: 'reel_post',
      productType: 'manual',
      identity: 'manual:reel-post',
      source: 'instagram-existing-media-detected',
      permalink: 'https://www.instagram.com/reel/example/'
    }
  },
  mirroredFamilies: { 'manual:reel-post': { sourcePostId: 'reel_post' } },
  history: [{ sourcePostId: 'reel_post' }]
});
assert(!reelEchoState.manualFacebookRecords.reel_post, 'A previously stored Reel echo must be removed during state normalization');
assert(!reelEchoState.mirroredFacebookPosts.reel_post, 'A Reel echo must not consume Instagram publication history');
assert.strictEqual(reelEchoState.history.length, 0, 'A Reel echo must not consume the daily publication limit');
mergeManualFacebookRecords(state, [manualOne, manualOneReshare, manualTwo]);
const manualPlan = planInstagramMirrors(campaignState, facebookState, state, catalog, modsFeed, {
  maxPosts: 500,
  dailyLimit: 500,
  photoState,
  manualRecords: Object.values(state.manualFacebookRecords),
  now: '2026-08-11T12:10:00.000Z'
});
const manualCandidates = manualPlan.candidates.filter(candidate => candidate.event.productType === 'manual');
assert.strictEqual(manualCandidates.length, 2, 'Manual Facebook reshares must be deduplicated by photo content');
assert.strictEqual(instagramCaption(manualCandidates[0].event), manualCandidates[0].record.message, 'Manual Facebook text must be preserved exactly on Instagram');

const manualDuplicateOfAutomatic = collectFacebookRecords({
  history: [{
    postId: 'automatic_1',
    publishedAt: '2026-08-11T11:55:00+0000',
    productType: 'atomizer',
    familyKey: 'automatic-test',
    name: 'Automatic Test RTA',
    image: manualOne.images[0]
  }]
}, { history: [] }, { history: [] }, [manualOne]);
assert.strictEqual(manualDuplicateOfAutomatic.length, 2, 'A manual duplicate of an automatic post must remain allowed');

const blockedState = normalizeInstagramState(emptyInstagramState());
const blockedCandidate = plan.candidates[0];
markSourceBlocked(blockedState, blockedCandidate.record.sourcePostId, 'HTTP 403', '2026-08-11T09:00:00.000Z');
assert(sourceBlockIsActive(blockedState, blockedCandidate.record.sourcePostId, '2026-08-11T09:30:00.000Z'), 'A failed CDN source must enter a bounded retry pause');
const afterBlocked = planInstagramMirrors(campaignState, facebookState, blockedState, catalog, modsFeed, {
  maxPosts: 1,
  dailyLimit: 500,
  photoState,
  now: '2026-08-11T09:30:00.000Z'
});
assert(afterBlocked.candidates.length === 1, 'A blocked source must not stop the remaining Instagram queue');
assert.notStrictEqual(afterBlocked.candidates[0].record.sourcePostId, blockedCandidate.record.sourcePostId, 'The next Instagram candidate must advance past an inaccessible source');
const afterRetryWindow = planInstagramMirrors(campaignState, facebookState, blockedState, catalog, modsFeed, {
  maxPosts: 1,
  dailyLimit: 500,
  photoState,
  now: '2026-08-12T10:00:00.000Z'
});
assert.strictEqual(afterRetryWindow.candidates[0].record.sourcePostId, blockedCandidate.record.sourcePostId, 'A blocked source must become retryable after the cooling interval');

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
