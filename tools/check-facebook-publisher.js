#!/usr/bin/env node

const assert = require('assert');
const {
  applyPublishedEvent,
  atomizerUrl,
  baselineState,
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

console.log('Facebook publisher: baseline, deduplication, recommendation and review checks passed.');
