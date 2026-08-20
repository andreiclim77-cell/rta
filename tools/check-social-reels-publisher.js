#!/usr/bin/env node

const assert = require('assert');
const {
  completedOnBothPlatforms,
  displayTitle,
  emptyReelsState,
  facebookReelStatus,
  finishQueueItemIfComplete,
  markSourceBlocked,
  normalizeReelsState,
  planReels,
  sourcesStartedToday,
  sourceBlockIsActive,
  validateReelsState
} = require('./social-reels-publisher');

const records = [
  { sourcePostId: 'page_1', sourcePublishedAt: '2026-08-11T07:00:00Z', name: 'Primul RTA' },
  { sourcePostId: 'page_2', sourcePublishedAt: '2026-08-11T06:00:00Z', name: 'Primul RTA' },
  { sourcePostId: 'page_3', sourcePublishedAt: '2026-08-10T06:00:00Z', name: 'Alt mod' }
];
const state = normalizeReelsState(emptyReelsState());
assert.deepStrictEqual(state.facebookPendingReels, {}, 'Pending Facebook uploads must always have a durable map');
assert.deepStrictEqual(state.facebookFailedReels, {}, 'Terminal Facebook uploads must always have a durable map');
let plan = planReels(records, state, { maxPosts: 4, dailyLimit: 4, now: '2026-08-11T09:00:00Z' });
assert.strictEqual(plan.length, 3, 'Each distinct Facebook post ID must remain eligible, even when titles repeat');

state.sourceStarts.page_1 = '2026-08-11T07:15:00Z';
state.queue.push({ sourcePostId: 'page_1', name: 'Primul RTA', videoUrl: 'https://ghid-rta.ro/a.mp4', videoPath: 'assets/social-reels/a.mp4' });
plan = planReels(records, state, { maxPosts: 4, dailyLimit: 4, now: '2026-08-11T09:00:00Z' });
assert.deepStrictEqual(plan.map(record => record.sourcePostId), ['page_2', 'page_3'], 'Queued source must not be planned twice');
assert.strictEqual(sourcesStartedToday(state, '2026-08-11T09:00:00Z'), 1, 'Romania daily pacing must count source starts');

const pendingState = normalizeReelsState(emptyReelsState());
pendingState.facebookPendingReels.page_1 = { id: 'pending_1' };
assert.deepStrictEqual(
  planReels(records, pendingState, { maxPosts: 4, dailyLimit: 4, now: '2026-08-11T09:00:00Z' }).map(record => record.sourcePostId),
  ['page_2', 'page_3'],
  'A pending Facebook Reel must not be uploaded again or block later sources'
);
pendingState.facebookFailedReels.page_2 = { id: 'failed_2' };
assert.deepStrictEqual(
  planReels(records, pendingState, { maxPosts: 4, dailyLimit: 4, now: '2026-08-11T09:00:00Z' }).map(record => record.sourcePostId),
  ['page_3'],
  'A terminal Facebook Reel must remain deduplicated while later sources continue'
);

const blockedState = normalizeReelsState(emptyReelsState());
markSourceBlocked(blockedState, 'page_1', 'HTTP 403', '2026-08-11T09:00:00.000Z');
assert(sourceBlockIsActive(blockedState, 'page_1', '2026-08-11T09:30:00.000Z'), 'A failed Reel image must enter a bounded retry pause');
assert.deepStrictEqual(
  planReels(records, blockedState, { maxPosts: 1, dailyLimit: 4, now: '2026-08-11T09:30:00.000Z' }).map(record => record.sourcePostId),
  ['page_2'],
  'A blocked Reel source must not stop the next source'
);
assert.deepStrictEqual(
  planReels(records, blockedState, { maxPosts: 1, dailyLimit: 4, now: '2026-08-12T10:00:00.000Z' }).map(record => record.sourcePostId),
  ['page_1'],
  'A blocked Reel source must become retryable after the cooling interval'
);

state.sourceStarts.page_2 = '2026-08-11T07:20:00Z';
state.sourceStarts.page_3 = '2026-08-11T07:25:00Z';
state.sourceStarts.page_4 = '2026-08-11T07:30:00Z';
plan = planReels(records, state, { maxPosts: 1, dailyLimit: 4, now: '2026-08-11T09:00:00Z' });
assert.deepStrictEqual(plan, [], 'The Reel daily limit must produce zero candidates, not one extra Reel');

state.facebookReels.page_1 = { id: 'fb_reel_1', verifiedStatus: 'PUBLISHED' };
assert.strictEqual(completedOnBothPlatforms(state, 'page_1'), false, 'Facebook success alone must not mark the pair complete');
assert.strictEqual(finishQueueItemIfComplete(state, state.queue[0]), false, 'Partial platform success must remain queued');
state.instagramReels.page_1 = { id: 'ig_reel_1', mediaProductType: 'REELS' };
assert.strictEqual(completedOnBothPlatforms(state, 'page_1'), true, 'Both platform receipts must complete the pair');
assert.strictEqual(finishQueueItemIfComplete(state, state.queue[0], '2026-08-11T09:05:00Z'), true, 'Complete pair must leave the queue');
assert.strictEqual(state.queue.length, 0, 'Complete pair must be removed from the queue');
assert.strictEqual(state.history.length, 1, 'Complete pair must have durable history');

const invalid = normalizeReelsState(emptyReelsState());
invalid.queue = [
  { sourcePostId: 'same', name: 'A', videoUrl: 'https://ghid-rta.ro/a.jpg', videoPath: 'a.jpg' },
  { sourcePostId: 'same', name: 'A', videoUrl: 'https://ghid-rta.ro/a.jpg', videoPath: 'a.jpg' }
];
assert(validateReelsState(invalid).length >= 2, 'Invalid media and duplicate source IDs must fail validation');
assert.strictEqual(displayTitle('https://example.com Test   RTA'), 'Test RTA', 'Public title must be concise and URL-free');
assert.strictEqual(
  facebookReelStatus({ status: { publishing_phase: { status: 'complete' } } }).ready,
  true,
  'A completed Facebook publishing phase must be accepted'
);
assert.strictEqual(
  facebookReelStatus({ status: { processing_phase: { status: 'in_progress' } } }).ready,
  false,
  'A processing Facebook Reel must remain pending'
);
assert.strictEqual(
  facebookReelStatus({ status: { publishing_phase: { status: 'error' } } }).error,
  true,
  'A terminal Facebook publishing error must be detected'
);

console.log('Social Reels publisher checks passed: source-level dedupe, two-platform receipts, retry safety and daily pacing.');
