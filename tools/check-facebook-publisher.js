#!/usr/bin/env node

const assert = require('assert');
const {
  applyEditorialPublished,
  applyPublishedEvent,
  assertEventLiquidTriplet,
  canonicalAtomizerFamilyKey,
  createHighEndModRotation,
  duplicateFacebookPostGroups,
  educationalAlbumPhotoEntries,
  emptyCampaignState,
  emptyState,
  historyEntryMessage,
  highEndModCandidates,
  modFamilyKey,
  planEditorialPosts,
  planUpdates,
  postedAtomizerSlugs
} = require('./facebook-publisher');

const atomA = {
  name: 'Centenary Mods Minister MTL RTA 20mm 4.5ml Black',
  image: 'https://images.example/minister.jpg',
  addedAt: '2026-07-12',
  classes: 'Tutun, NET, camera compacta.',
  dna: 'Airflow MTL si camera concentrata.',
  sources: [{ URL: 'https://smokee.ro/product/centenary-mods-minister-mtl-rta-20mm-4-5ml/' }],
  builds: [{ wire: 'SS316L 30 GA', build: 'diam 2,0 mm / 6 spire' }]
};

const atomB = {
  name: 'Chephren RTA by Khonsu Tech',
  image: 'https://images.example/chephren.jpg',
  addedAt: '2026-07-13',
  classes: 'NET complex si tutun robust.',
  dna: 'Camera rotunda si airflow precis.',
  sources: [{ URL: 'https://smokee.ro/product/chephren-rta-by-khonsu-tech/' }],
  builds: [{ wire: 'K1 28 GA', build: 'diam 2,5 mm / 6 spire' }]
};

const catalog = {
  atomizers: [atomA, atomB, { ...atomA, name: 'Centenary Mods Minister MTL RTA 20mm 4.5ml Nano' }],
  profiles: [],
  liquids: { net: [], tutun: [] }
};

const feed = {
  schemaVersion: 1,
  models: {
    'centenary-mods-minister-mtl-rta': {
      name: atomA.name,
      videos: [{
        videoId: 'abc123DEF45',
        title: 'Centenary Minister MTL RTA review',
        url: 'https://www.youtube.com/watch?v=abc123DEF45',
        kind: 'review',
        scope: 'original',
        viewCount: 12000
      }]
    },
    'chephren-rta-by-khonsu-tech': {
      name: atomB.name,
      videos: [{
        videoId: 'xyz987ZYX65',
        title: 'Chephren RTA by Khonsu Tech review',
        url: 'https://www.youtube.com/watch?v=xyz987ZYX65',
        kind: 'review',
        scope: 'original',
        viewCount: 8000
      }]
    }
  }
};

const modsFeed = {
  schemaVersion: 1,
  highEndItems: [
    ['Khonsu Eclipse DNA60C Black Ash', 'https://smokee.ro/product/mod-khonsu-tech-eclipse-dna60c-plus-black-ash/', 'khonsu1.jpg', 'Khonsu Eclipse DNA60C review', 'modVideo001'],
    ['Khonsu Eclipse DNA60C Afzelia', 'https://smokee.ro/product/mod-khonsu-tech-eclipse-dna60c-afzelia/', 'khonsu2.jpg', 'Khonsu Eclipse DNA60C review', 'modVideo002'],
    ['Telli Queen III Juma DNA60C', 'https://smokee.ro/product/tellis-mod-queen-iii-juma-dna60c-laguna-dragon/', 'queen.jpg', 'Telli Queen III review', 'modVideo003'],
    ['Arcana Mods Arcana SBS DNA60C', 'https://smokee.ro/product/mod-arcana-mods-arcana-sbs-dna60c-dlc/', 'arcana.jpg', 'Arcana SBS DNA60C review', 'modVideo004']
  ].map(([title, url, image, reviewTitle, videoId]) => ({
    familyKey: title,
    title,
    url,
    image: `https://images.example/${image}`,
    highEnd: true,
    review: {
      title: reviewTitle,
      url: `https://www.youtube.com/watch?v=${videoId}`
    }
  }))
};

assert.strictEqual(canonicalAtomizerFamilyKey('Centenary Mods Minister MTL RTA 20mm 4.5ml Black'), 'minister');
assert.strictEqual(canonicalAtomizerFamilyKey('Centenary Mods Minister MTL RTA 20mm 4.5ml Nano'), 'minister');
assert.strictEqual(modFamilyKey({ familyKey: 'Mod Khonsu Tech Eclipse DNA60C Plus Black Ash' }), 'khonsu eclipse');
assert.strictEqual(modFamilyKey({ familyKey: 'Mod Khonsu Tech Eclipse DNA60C Afzelia' }), 'khonsu eclipse');

const modCandidates = highEndModCandidates(modsFeed);
assert.strictEqual(new Set(modCandidates.map(modFamilyKey)).size, modCandidates.length, 'high-end mod families must be unique after normalization');

const rotation = createHighEndModRotation(modsFeed, emptyCampaignState(), emptyState(), { reset: true });
const first = rotation.pick(atomA);
const second = rotation.pick(atomB);
assert(first && second);
assert.notStrictEqual(modFamilyKey(first), modFamilyKey(second), 'daily mod rotation must not repeat a high-end family while alternatives exist');

const campaignState = emptyCampaignState();
const plan = planEditorialPosts(catalog, feed, campaignState, {
  maxPosts: 2,
  today: '2026-07-13',
  modsFeed,
  publishState: emptyState()
});
assert.strictEqual(plan.length, 2);
assert.strictEqual(new Set(plan.map(event => event.familyKey)).size, 2, 'editorial plan must not repeat atomizer families');
plan.forEach(event => {
  assert.strictEqual(event.liquidMatches.length, 0);
  assert(event.message.includes('Pentru a se potrivi cu buildul si lichidul consultati ghid-rta.ro: https://ghid-rta.ro/'));
  assert(!/3 lichide|triangulare|lichide analizate|lichide recomandate/i.test(event.message));
  assert.doesNotThrow(() => assertEventLiquidTriplet(event));
  assert.strictEqual(educationalAlbumPhotoEntries(event).length, 2);
});

let appliedCampaign = applyEditorialPublished(emptyCampaignState(), plan[0], 'page_post_1', '2026-07-13T05:00:00.000Z');
assert.strictEqual(appliedCampaign.postedAtomizers[plan[0].slug].liquids.length, 0);
assert.strictEqual(appliedCampaign.postedAtomizers[plan[0].slug].messageVersion, 'atomizer-mod-guide-fit-v1');
assert(postedAtomizerSlugs(appliedCampaign, emptyState()).has(plan[0].familyKey));

const publishPlan = planUpdates(catalog, feed, emptyState(), {
  maxPosts: 2,
  dailyPublished: 0,
  modsFeed,
  campaignState: appliedCampaign
});
assert(!publishPlan.some(event => event.familyKey === plan[0].familyKey), 'catalog updates must respect already posted editorial families');
publishPlan.forEach(event => {
  assert.strictEqual(event.liquidMatches.length, 0);
  assert.doesNotThrow(() => assertEventLiquidTriplet(event));
});

const publishState = emptyState();
const event = publishPlan[0] || plan[1];
applyPublishedEvent(publishState, event, 'page_post_2', '2026-07-13T06:00:00.000Z');
assert.strictEqual(publishState.history[0].liquids.length, 0);

const duplicateState = emptyCampaignState();
duplicateState.postedAtomizers['minister-mtl'] = {
  name: 'Centenary Mods Minister MTL RTA 20mm 4.5ml',
  familyKey: 'minister',
  postId: 'keep',
  publishedAt: '2026-07-13T05:00:00.000Z'
};
duplicateState.history = [{
  slug: 'minister-mtl',
  name: 'Centenary Mods Minister MTL RTA 20mm 4.5ml',
  familyKey: 'minister',
  postId: 'keep',
  publishedAt: '2026-07-13T05:00:00.000Z'
}, {
  slug: 'minister-mtl-nano',
  name: 'Centenary Mods Minister MTL RTA 20mm 4.5ml Nano',
  familyKey: 'minister',
  postId: 'remove',
  publishedAt: '2026-07-13T06:00:00.000Z'
}];
duplicateState.postedAtomizers['minister-mtl-nano'] = {
  name: 'Centenary Mods Minister MTL RTA 20mm 4.5ml Nano',
  familyKey: 'minister',
  postId: 'remove',
  publishedAt: '2026-07-13T06:00:00.000Z'
};
assert.strictEqual(duplicateFacebookPostGroups(duplicateState, emptyState()).length, 1);

const details = historyEntryMessage({ key: `atomizer:${event.slug}`, name: event.name, type: event.type }, catalog, feed, { modsFeed });
assert(details.message.includes('https://ghid-rta.ro/'));
assert.strictEqual(details.liquidMatches.length, 0);

console.log('Facebook publisher checks passed: no liquid content, unique atomizer families, unique mod rotation, two-photo posts and guide-fit link.');
