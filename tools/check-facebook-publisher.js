#!/usr/bin/env node

const assert = require('assert');
const {
  applyEditorialPublished,
  applyPublishedEvent,
  atomizerImage,
  atomizerImageCandidates,
  atomizerUrl,
  baselineState,
  dateInRomania,
  emptyCampaignState,
  planEditorialPosts,
  planUpdates,
  recommendationSignature,
  validateState
} = require('./facebook-publisher');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const atomA = {
  name: 'Test Alpha RTA',
  image: 'https://images.example/test-alpha.jpg',
  addedAt: '2026-07-12',
  classes: 'Virginia, Oriental si NET luminos.',
  dna: 'Camera compacta si airflow inferior.',
  builds: [{ wire: 'SS316L 30 GA', build: 'diam 2,0 mm / 6 spire' }]
};
const atomB = {
  name: 'Test Beta RTA',
  image: 'https://images.example/test-beta.jpg',
  addedAt: '2026-07-13',
  classes: 'Burley, Kentucky si NET complex.',
  dna: 'Camera rotunda si airflow lateral.',
  builds: [{ wire: 'K1 28 GA', build: 'diam 2,5 mm / 6 spire' }]
};
const catalog = { atomizers: [atomA, atomB] };
const feed = {
  schemaVersion: 1,
  models: {
    'test-alpha-rta': {
      name: 'Test Alpha RTA',
      videos: [{
        videoId: 'abc123DEF45',
        title: 'Test Alpha RTA review',
        url: 'https://www.youtube.com/watch?v=abc123DEF45',
        kind: 'review',
        scope: 'original'
      }]
    },
    'test-beta-rta': {
      name: 'Test Beta RTA',
      videos: [{
        videoId: 'xyz987ZYX65',
        title: 'Test Beta RTA build clone',
        url: 'https://www.youtube.com/watch?v=xyz987ZYX65',
        kind: 'build',
        scope: 'clone'
      }]
    }
  }
};

const baseline = baselineState(catalog, feed, '2026-07-13T00:00:00.000Z');
assert.deepStrictEqual(validateState(baseline), []);
assert.strictEqual(planUpdates(catalog, feed, baseline).length, 0, 'baseline should not publish the existing catalog');

const newAtomState = clone(baseline);
delete newAtomState.seenAtomizers['test-beta-rta'];
delete newAtomState.recommendationSignatures['test-beta-rta'];
delete newAtomState.seenVideos.xyz987ZYX65;
const newAtomPlan = planUpdates(catalog, feed, newAtomState);
assert.strictEqual(newAtomPlan[0].type, 'atomizer');
assert.strictEqual(newAtomPlan[0].name, 'Test Beta RTA');
assert.strictEqual(newAtomPlan[0].image, 'https://images.example/test-beta.jpg');
assert(newAtomPlan[0].message.includes('exemplu pe clonă'));
assert.strictEqual(newAtomPlan[0].link, 'https://ghid-rta.ro/atomizoare/');
assert.strictEqual(
  atomizerUrl({ name: 'Ambition Mods Amazier MTL RTA' }),
  'https://ghid-rta.ro/atomizoare/ambition-mods-amazier-mtl-rta/'
);

const recommendationState = clone(baseline);
recommendationState.recommendationSignatures['test-alpha-rta'] = 'outdated';
const recommendationPlan = planUpdates(catalog, feed, recommendationState);
assert.strictEqual(recommendationPlan[0].type, 'recommendation');
assert.strictEqual(recommendationPlan[0].signature, recommendationSignature(atomA));

const reviewState = clone(baseline);
delete reviewState.seenVideos.abc123DEF45;
const reviewPlan = planUpdates(catalog, feed, reviewState);
assert.strictEqual(reviewPlan[0].type, 'review');
assert(reviewPlan[0].message.includes('Test Alpha RTA review'));

const applied = clone(newAtomState);
applyPublishedEvent(applied, newAtomPlan[0], '122_test', '2026-07-13T01:00:00.000Z');
assert(applied.seenAtomizers['test-beta-rta']);
assert(applied.seenVideos.xyz987ZYX65);
assert.strictEqual(applied.history[0].postId, '122_test');

const campaignState = emptyCampaignState();
campaignState.postedAtomizers['test-alpha-rta'] = {
  name: 'Test Alpha RTA',
  publishedAt: '2026-07-13T01:00:00.000Z'
};
const editorialPlan = planEditorialPosts(catalog, feed, campaignState, { maxPosts: 1 });
assert.strictEqual(editorialPlan.length, 1);
assert.strictEqual(editorialPlan[0].name, 'Test Beta RTA');
assert.strictEqual(editorialPlan[0].image, 'https://images.example/test-beta.jpg');
assert(editorialPlan[0].message.includes('Fișă RTA MTL'));
const editorialApplied = applyEditorialPublished(clone(campaignState), editorialPlan[0], '122_editorial', '2026-07-13T02:00:00.000Z');
assert.strictEqual(editorialApplied.postedAtomizers['test-beta-rta'].postId, '122_editorial');
assert.strictEqual(editorialApplied.pace, 'four-posts-per-day');
assert.strictEqual(dateInRomania('2026-07-12T22:01:25.586Z'), '2026-07-13');

const dailyLimitedState = emptyCampaignState();
for (let index = 0; index < 4; index += 1) {
  dailyLimitedState.postedAtomizers[`manual-${index}`] = {
    name: `Manual ${index}`,
    publishedAt: `2026-07-13T0${index}:00:00.000Z`
  };
}
assert.strictEqual(
  planEditorialPosts(catalog, feed, dailyLimitedState, { maxPosts: 1, today: '2026-07-13' }).length,
  0,
  'editorial publishing must stop after four posts in the Romanian calendar day'
);

const exactVideoFallback = atomizerImage({
  name: 'Test Gamma RTA',
  image: '',
  sources: [{ URL: 'https://www.youtube.com/watch?v=vid123Exact' }]
});
assert.strictEqual(exactVideoFallback, 'https://i.ytimg.com/vi/vid123Exact/hqdefault.jpg');
assert.deepStrictEqual(
  atomizerImageCandidates({
    name: 'Test Multi-source RTA',
    sources: [
      { URL: 'https://www.youtube.com/watch?v=first123Vid' },
      { URL: 'https://youtu.be/second456Vid' }
    ]
  }),
  [
    'https://i.ytimg.com/vi/first123Vid/hqdefault.jpg',
    'https://i.ytimg.com/vi/second456Vid/hqdefault.jpg'
  ]
);
assert.strictEqual(
  atomizerImage({ name: 'Test Search RTA', sources: [{ URL: 'https://www.youtube.com/results?search_query=test+rta' }] }),
  '',
  'YouTube search pages must never be used as product images'
);

console.log('Facebook publisher: baseline, editorial series, deduplication, recommendation and review checks passed.');
