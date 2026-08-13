#!/usr/bin/env node

const assert = require('assert');
const {
  applyEditorialPublished,
  applyPublishedEvent,
  assertEventLiquidTriplet,
  canonicalAtomizerFamilyKey,
  duplicateFacebookPostGroups,
  educationalAlbumPhotoEntries,
  emptyCampaignState,
  emptyState,
  facebookPostsOnDate,
  historyEntryMessage,
  modCatalogCandidates,
  modFamilyKey,
  planEditorialPosts,
  planUpdates,
  postedAtomizerSlugs,
  postedModFamilyKeys,
  productPhotoOverlaySvg
} = require('./facebook-publisher');

const atomA = {
  name: 'Centenary Mods Minister MTL RTA 20mm 4.5ml Black',
  image: 'https://images.example/minister.jpg',
  addedAt: '2026-07-12',
  classes: 'Camera compacta si airflow MTL.',
  dna: 'Configuratie orientata spre precizie.',
  sources: [{ URL: 'https://smokee.ro/product/centenary-mods-minister-mtl-rta-20mm-4-5ml/' }],
  builds: [{ wire: 'SS316L 30 GA', build: 'diam 2,0 mm / 6 spire' }]
};

const atomB = {
  name: 'Chephren RTA by Khonsu Tech',
  image: 'https://images.example/chephren.jpg',
  addedAt: '2026-07-13',
  classes: 'Camera rotunda si airflow precis.',
  dna: 'Configuratie MTL reconstructibila.',
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
  catalogItems: [
    {
      title: 'MechVape x Nitrous Pocket SBS Black',
      url: 'https://smokee.ro/product/mechvape-x-nitrous-pocket-sbs-black/',
      image: 'https://images.example/nitrous-black.jpg',
      publishedAt: '2026-07-15'
    },
    {
      title: 'MechVape x Nitrous Pocket SBS Silver',
      url: 'https://smokee.ro/product/mechvape-x-nitrous-pocket-sbs-silver/',
      image: 'https://images.example/nitrous-silver.jpg',
      publishedAt: '2026-07-14'
    },
    {
      title: 'Mod MechVape Paramour V2 SBS',
      url: 'https://smokee.ro/product/mod-mechvape-paramour-v2-sbs/',
      image: 'https://images.example/paramour.jpg',
      publishedAt: '2026-07-13'
    }
  ]
};

function assertSafeSingleProduct(event) {
  assert.doesNotThrow(() => assertEventLiquidTriplet(event));
  const photoEntries = educationalAlbumPhotoEntries(event);
  assert.strictEqual(photoEntries.length, 1, 'each post must have one exact product photo');
  assert.match(event.image, /^https:\/\/images\.example\//);
  assert.strictEqual(photoEntries[0].image, event.image);
  assert.strictEqual(event.productImage, event.image, 'published photo must be the product image bound to the model');
  assert.strictEqual(photoEntries[0].type, 'verified-product');
  const overlay = productPhotoOverlaySvg(event).toString('utf8');
  assert(overlay.includes('ghid-rta.ro'), 'photo overlay must include the real guide domain');
  assert(overlay.includes(event.name.replace(/&/g, '&amp;')), 'photo overlay must identify the exact model');
  assert(event.message.includes('Redarea corecta si coerenta a gustului depinde de triangularea'));
  assert.strictEqual(event.message.split('\n')[0], 'https://ghid-rta.ro/', 'guide link must be the first visible line before See more');
  assert(event.message.includes('Pentru modul de utilizare, configurare si detalii, consultati ghidul.'));
  assert(event.message.includes('Documentatie tehnica destinata adultilor 18+.'));
  assert.strictEqual((event.message.match(/https?:\/\/[^\s]+/g) || []).length, 1, 'message must contain one link');
  assert(!/smokee\.ro|youtube\.com|youtu\.be|pret|stoc|comenzi|high-end|premium|nicotin/i.test(event.message));
}

assert.strictEqual(canonicalAtomizerFamilyKey('Centenary Mods Minister MTL RTA 20mm 4.5ml Black'), 'minister');
assert.strictEqual(canonicalAtomizerFamilyKey('Centenary Mods Minister MTL RTA 20mm 4.5ml Nano'), 'minister');
assert.strictEqual(modFamilyKey({ title: 'MechVape x Nitrous Pocket SBS Black' }), 'nitrous pocket');
assert.strictEqual(modFamilyKey({ title: 'MechVape x Nitrous Pocket SBS Silver' }), 'nitrous pocket');
assert.strictEqual(modCatalogCandidates(modsFeed).length, 2, 'color variants must collapse into one mod family');

const dayOne = planEditorialPosts(catalog, feed, emptyCampaignState(), {
  maxPosts: 9,
  today: '2026-07-13',
  modsFeed,
  publishState: emptyState(),
  dailyPublished: 0
});
assert.strictEqual(dayOne.length, 2, 'the publisher must prepare one atomizer and one mod per day');
const dayOneAtom = dayOne.find(event => event.productType === 'atomizer');
const dayOneMod = dayOne.find(event => event.productType === 'mod');
assert(dayOneAtom, 'the daily pair must include an atomizer');
assert(dayOneMod, 'the daily pair must include a mod');
assertSafeSingleProduct(dayOneAtom);
assertSafeSingleProduct(dayOneMod);

let campaign = applyEditorialPublished(emptyCampaignState(), dayOneAtom, 'page_post_1', '2026-07-13T05:00:00.000Z');
campaign = applyEditorialPublished(campaign, dayOneMod, 'page_post_2', '2026-07-13T05:01:00.000Z');
assert.strictEqual(facebookPostsOnDate(campaign, emptyState(), '2026-07-13'), 2);
assert(postedAtomizerSlugs(campaign, emptyState()).has(dayOneAtom.familyKey));
assert(postedModFamilyKeys(campaign, emptyState()).has(dayOneMod.familyKey));
assert.strictEqual(planEditorialPosts(catalog, feed, campaign, {
  maxPosts: 9,
  today: '2026-07-13',
  modsFeed,
  publishState: emptyState()
}).length, 0, 'a second atomizer/mod pair on the same day must be blocked');

const dayTwo = planEditorialPosts(catalog, feed, campaign, {
  maxPosts: 9,
  today: '2026-07-14',
  modsFeed,
  publishState: emptyState(),
  dailyPublished: 0
});
assert.strictEqual(dayTwo.length, 2);
assert(dayTwo.some(event => event.productType === 'atomizer'));
assert(dayTwo.some(event => event.productType === 'mod'));
dayTwo.forEach(assertSafeSingleProduct);
assert.strictEqual(campaign.postedMods[dayOneMod.familyKey].messageVersion, 'visible-guide-exact-model-v5');

const updateState = emptyState();
updateState.seenAtomizers[dayOneAtom.slug] = { seenAt: '2026-07-13T05:00:00.000Z' };
updateState.seenMods[dayOneMod.familyKey] = { seenAt: '2026-07-13T05:01:00.000Z' };
const updatePlan = planUpdates(catalog, feed, updateState, {
  maxPosts: 8,
  dailyPublished: 0,
  modsFeed,
  campaignState: campaign
});
assert(updatePlan.length <= 2, 'catalog updates must also respect the daily cap');
updatePlan.forEach(assertSafeSingleProduct);
if (updatePlan[0]) {
  applyPublishedEvent(updateState, updatePlan[0], 'page_post_3', '2026-07-15T05:00:00.000Z');
  assert.strictEqual(updateState.history[0].mod, null);
}

const duplicateState = emptyCampaignState();
duplicateState.postedAtomizers['minister-mtl'] = {
  name: 'Centenary Mods Minister MTL RTA 20mm 4.5ml',
  familyKey: 'minister',
  postId: 'keep',
  publishedAt: '2026-07-13T05:00:00.000Z'
};
duplicateState.postedAtomizers['minister-mtl-nano'] = {
  name: 'Centenary Mods Minister MTL RTA 20mm 4.5ml Nano',
  familyKey: 'minister',
  postId: 'remove',
  publishedAt: '2026-07-14T05:00:00.000Z'
};
assert.strictEqual(duplicateFacebookPostGroups(duplicateState, emptyState()).length, 1);

duplicateState.postedMods['queen-iii-black'] = {
  name: "Telli's Mod QUEEN III Juma DNA60C Black",
  familyKey: 'telli queen iii',
  postId: 'keep-mod',
  publishedAt: '2026-07-13T06:00:00.000Z'
};
duplicateState.postedMods['queen-iii-white'] = {
  name: "Telli's Mod QUEEN III Juma DNA60C White",
  familyKey: 'telli queen iii',
  postId: 'remove-mod',
  publishedAt: '2026-07-14T06:00:00.000Z'
};
const duplicateProductGroups = duplicateFacebookPostGroups(duplicateState, emptyState());
assert.strictEqual(duplicateProductGroups.length, 2, 'Automatic atomizer and mod variants must both be deduplicated by family');
assert(duplicateProductGroups.some(group => group.canonical === 'mod:telli queen iii'), 'Mod duplicate family must be detected');

const details = historyEntryMessage({ key: `atomizer:${dayOneAtom.slug}`, name: dayOneAtom.name, type: 'atomizer' }, catalog, feed);
assertSafeSingleProduct({
  productType: 'atomizer',
  name: details.atom.name,
  image: details.atom.image,
  productImage: details.atom.image,
  message: details.message
});

console.log('Facebook publisher checks passed: one atomizer and one mod/day, exact model photos branded ghid-rta.ro, visible guide link, no commercial copy.');
