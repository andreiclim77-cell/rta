#!/usr/bin/env node

const assert = require('assert');
const {
  applyEditorialPublished,
  applyPublishedEvent,
  assertEventLiquidTriplet,
  atomizerImage,
  atomizerImageCandidates,
  atomizerUrl,
  baselineState,
  canonicalAtomizerSlug,
  dateInRomania,
  duplicateFacebookPostGroups,
  educationalAlbumPhotoEntries,
  emptyCampaignState,
  emptyState,
  facebookPostsOnDate,
  historyEntryMessage,
  historyEntryEvent,
  isNicotineFreeFacebookLiquid,
  liquidMatchLines,
  noticeBannerLines,
  multiPhotoFeedBody,
  needsLiquidGalleryRepair,
  planEditorialPosts,
  planUpdates,
  postedAtomizerSlugs,
  recommendationSignature,
  topLiquidMatchesForAtom,
  uniqueAtomizers,
  validateState
} = require('./facebook-publisher');
const { loadCatalog } = require('./catalog-data');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const atomA = {
  name: 'Test Alpha RTA',
  image: 'https://images.example/test-alpha.jpg',
  addedAt: '2026-07-12',
  classes: 'Virginia, Oriental si NET luminos.',
  dna: 'Camera compacta si airflow inferior.',
  stock: true,
  sources: [{ URL: 'https://smokee.ro/product/test-alpha-rta/' }],
  builds: [{ wire: 'SS316L 30 GA', build: 'diam 2,0 mm / 6 spire' }]
};
const atomB = {
  name: 'Test Beta RTA',
  image: 'https://images.example/test-beta.jpg',
  addedAt: '2026-07-13',
  classes: 'Burley, Kentucky si NET complex.',
  dna: 'Camera rotunda si airflow lateral.',
  stock: false,
  sources: [{ URL: 'https://smokee.ro/product/test-beta-rta/' }],
  builds: [{ wire: 'K1 28 GA', build: 'diam 2,5 mm / 6 spire' }]
};
const catalog = {
  atomizers: [atomA, atomB],
  profiles: [
    {
      group: 'NET simplu',
      name: 'Virginia bright',
      tags: ['virginia', 'bright', 'luminos'],
      top: ['Test Alpha RTA'],
      note: 'Păstrează Virginia luminoasă și separată.'
    },
    {
      group: 'NET complex',
      name: 'Oriental și Virginia',
      tags: ['oriental', 'virginia', 'straturi'],
      top: ['Test Alpha RTA'],
      note: 'Separă notele luminoase ale blendului.'
    },
    {
      group: 'Tutun simplu',
      name: 'Tutun tip rolling',
      tags: ['rolling', 'sec', 'direct'],
      top: ['Test Alpha RTA'],
      note: 'Păstrează conturul sec și direct.'
    },
    {
      group: 'Tutun complex',
      name: 'Kentucky dark-fired',
      tags: ['kentucky', 'dark', 'fire'],
      top: ['Test Beta RTA'],
      note: 'Susține corpul și caracterul dark-fired.'
    },
    {
      group: 'NET complex',
      name: 'Latakia și Kentucky',
      tags: ['latakia', 'kentucky', 'smoky'],
      top: ['Test Beta RTA'],
      note: 'Păstrează structura fumurie a blendului.'
    },
    {
      group: 'Tutun complex',
      name: 'Cigar robust',
      tags: ['cigar', 'robust', 'corp'],
      top: ['Test Beta RTA'],
      note: 'Pune în valoare corpul și baza de trabuc.'
    }
  ],
  liquids: {
    generated: '2026-07-13',
    net: [
      { title: 'Aroma NET Virginia Bright', tag: 'NET simplu Virginia', url: 'https://smokee.ro/product/aroma-net-virginia-bright/', image: 'https://images.example/net-virginia.jpg', stock: true },
      { title: 'Aroma NET Oriental Layers', tag: 'NET complex Oriental', url: 'https://smokee.ro/product/aroma-net-oriental-layers/', image: 'https://images.example/net-oriental.jpg', stock: true },
      { title: 'Aroma NET Kentucky Latakia', tag: 'NET complex Kentucky', url: 'https://smokee.ro/product/aroma-net-kentucky-latakia/', image: 'https://images.example/net-kentucky.jpg', stock: true },
      { title: 'Aroma NET Virginia indisponibil', tag: 'NET simplu Virginia', url: 'https://smokee.ro/product/aroma-net-virginia-indisponibil/', image: 'https://images.example/net-oos.jpg', stock: false }
    ],
    tutun: [
      { title: 'Longfill Tutun Rolling Sec', tag: 'TUTUN simplu', url: 'https://smokee.ro/product/longfill-tutun-rolling-sec/', image: 'https://images.example/rolling.jpg', stock: true },
      { title: 'Longfill Tutun Kentucky Heritage', tag: 'TUTUN complex Kentucky', url: 'https://smokee.ro/product/longfill-tutun-kentucky-heritage/', image: 'https://images.example/kentucky.jpg', stock: true },
      { title: 'Longfill Tutun Latakia Reserve', tag: 'TUTUN complex Latakia', url: 'https://smokee.ro/product/longfill-tutun-latakia-reserve/', image: 'https://images.example/latakia.jpg', stock: true },
      { title: 'Longfill Tutun Cigar Robust', tag: 'TUTUN complex Cigar', url: 'https://smokee.ro/product/longfill-tutun-cigar-robust/', image: 'https://images.example/cigar.jpg', stock: true }
    ]
  }
};
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

const alphaLiquidMatches = topLiquidMatchesForAtom(atomA, catalog, 3);
const betaLiquidMatches = topLiquidMatchesForAtom(atomB, catalog, 3);
assert.strictEqual(alphaLiquidMatches.length, 3, 'each atomizer post must receive three liquid matches');
assert.strictEqual(betaLiquidMatches.length, 3, 'body-oriented atomizers must receive three liquid matches');
assert.strictEqual(new Set(alphaLiquidMatches.map(item => item.url)).size, 3, 'liquid links must be unique in one post');
assert.strictEqual(new Set(betaLiquidMatches.map(item => item.url)).size, 3, 'liquid links must be unique in one post');
assert.strictEqual(new Set(alphaLiquidMatches.map(item => item.image)).size, 3, 'liquid images must be unique in one post');
assert.strictEqual(new Set(betaLiquidMatches.map(item => item.image)).size, 3, 'liquid images must be unique in one post');
assert(alphaLiquidMatches.every(item => item.stock !== false), 'out-of-stock liquids must not be recommended while stocked matches exist');
assert(betaLiquidMatches.every(item => item.stock !== false), 'out-of-stock liquids must not be recommended while stocked matches exist');
assert(!alphaLiquidMatches.some(item => item.url.includes('indisponibil')));
assert.strictEqual(isNicotineFreeFacebookLiquid({
  title: 'Aroma BlendFeel SOLO X100 10ml 18mg - Oriental',
  url: 'https://smokee.ro/product/aroma-blendfeel-solo-x100-10ml-18mg-oriental/'
}), false, 'products marked with nicotine concentration must never enter Facebook pairings');
assert.strictEqual(isNicotineFreeFacebookLiquid({
  title: 'Aroma concentrată 10ml',
  url: 'https://smokee.ro/product/aroma-concentrata-10ml/'
}), true, 'a clearly identified concentrate may be used regardless of bottle volume');
assert.strictEqual(isNicotineFreeFacebookLiquid({
  title: 'Lichid gata preparat 10ml',
  url: 'https://smokee.ro/product/lichid-gata-10ml/'
}), false, 'ready-to-vape 10ml liquids must not enter Facebook pairings');
const fallbackCatalog = clone(catalog);
fallbackCatalog.liquids.net = [catalog.liquids.net[0], catalog.liquids.net[1], catalog.liquids.net[3]];
fallbackCatalog.liquids.tutun = [];
const fallbackMatches = topLiquidMatchesForAtom(atomA, fallbackCatalog, 3);
assert.strictEqual(fallbackMatches.length, 3, 'an out-of-stock match may be shown only when three stocked alternatives do not exist');
assert(fallbackMatches.some(item => item.stock === false));
assert(!liquidMatchLines(fallbackMatches).join('\n').includes('Pentru comenzi'));

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
assert(newAtomPlan[0].message.includes('materialele pe clone sunt marcate distinct'));
assert(newAtomPlan[0].message.includes('3 lichide analizate'));
assert(newAtomPlan[0].message.includes('Sunt incluse exact 3 lichide asociate'));
assert(newAtomPlan[0].message.includes('Doar pentru a renunța la fumat, fiind o variantă mai puțin nocivă decât continuarea fumatului, dar nu lipsită de riscuri.'));
assert(newAtomPlan[0].message.includes('Recomandat a se consuma fără nicotină.'));
assert(newAtomPlan[0].message.startsWith('━━ 𝗔𝗧𝗢𝗠𝗜𝗭𝗢𝗥 𝗥𝗧𝗔 𝗠𝗧𝗟 ━━\nTest Beta RTA\n'));
assert(newAtomPlan[0].message.includes('┃ 1. 𝗗𝗢𝗔𝗥 𝗣𝗘𝗡𝗧𝗥𝗨 𝗥𝗘𝗡𝗨𝗡𝗧𝗔𝗥𝗘 • 𝗠𝗔𝗜 𝗣𝗨𝗧𝗜𝗡 𝗡𝗢𝗖𝗜𝗩𝗔'));
assert(newAtomPlan[0].message.includes('┗ 2. 𝗥𝗘𝗖𝗢𝗠𝗔𝗡𝗗𝗔𝗧 𝗙𝗔𝗥𝗔 𝗡𝗜𝗖𝗢𝗧𝗜𝗡𝗔'));
assert.strictEqual(newAtomPlan[0].message.split('\n')[5], '┗ 2. 𝗥𝗘𝗖𝗢𝗠𝗔𝗡𝗗𝗔𝗧 𝗙𝗔𝗥𝗔 𝗡𝗜𝗖𝗢𝗧𝗜𝗡𝗔');
assert(newAtomPlan[0].message.indexOf('Recomandat a se consuma fără nicotină.') < newAtomPlan[0].message.indexOf('Nou în Ghid RTA MTL'));
assert.strictEqual((newAtomPlan[0].message.match(/Recomandat a se consuma fără nicotină\./g) || []).length, 1);
assert.strictEqual(noticeBannerLines().length, 7);
assert(newAtomPlan[0].message.indexOf('Sunt incluse exact 3 lichide asociate') < newAtomPlan[0].message.indexOf('3 lichide analizate'));
assert(!newAtomPlan[0].message.includes('smokee.ro/product'));
assert(!newAtomPlan[0].message.includes('Pentru comenzi'));
assert(!/preț|stoc|cumpărare/i.test(newAtomPlan[0].message));
assert.strictEqual(newAtomPlan[0].liquidMatches.length, 3);
assert.doesNotThrow(() => assertEventLiquidTriplet(newAtomPlan[0]));
assert.throws(() => assertEventLiquidTriplet({ ...newAtomPlan[0], liquidMatches: newAtomPlan[0].liquidMatches.slice(0, 2) }), /exact trei lichide/);
assert.throws(() => assertEventLiquidTriplet({
  ...newAtomPlan[0],
  liquidMatches: newAtomPlan[0].liquidMatches.map((match, index) => ({
    ...match,
    image: index === 0 ? newAtomPlan[0].image : match.image
  }))
}), /patru fotografii distincte/);
const alphaAlbum = educationalAlbumPhotoEntries(newAtomPlan[0]);
assert.strictEqual(alphaAlbum.length, 4, 'each Facebook gallery must contain one atomizer and three liquid photos');
assert.strictEqual(alphaAlbum[0].type, 'atomizer');
assert.deepStrictEqual(alphaAlbum.slice(1).map(item => item.type), ['liquid', 'liquid', 'liquid']);
assert.strictEqual(new Set(alphaAlbum.map(item => item.image)).size, 4);
alphaAlbum.forEach(item => {
  assert(!/preț|stoc|cumpărare|pentru comenzi|0736\s*018\s*023|smokee\.ro\/product/i.test(item.caption));
  assert(item.caption.includes('18+'));
});
alphaAlbum.slice(1).forEach(item => {
  assert(item.caption.includes('Doar pentru a renunța la fumat, fiind o variantă mai puțin nocivă decât continuarea fumatului, dar nu lipsită de riscuri.'));
  assert(item.caption.includes('Recomandat a se consuma fără nicotină.'));
});
const albumBody = multiPhotoFeedBody('Mesaj', ['media-1', 'media-2', 'media-3', 'media-4'], 'token-test');
assert.strictEqual(albumBody.get('message'), 'Mesaj');
assert.deepStrictEqual(JSON.parse(albumBody.get('attached_media[3]')), { media_fbid: 'media-4' });
newAtomPlan[0].liquidMatches.forEach(match => {
  assert(newAtomPlan[0].message.includes(match.title));
  assert(newAtomPlan[0].message.includes(match.profile));
  assert(!newAtomPlan[0].message.includes(match.url));
});
assert.strictEqual((newAtomPlan[0].message.match(/https:\/\//g) || []).length, 1, 'a future Facebook post must contain one guide link');
assert.strictEqual(newAtomPlan[0].link, 'https://ghid-rta.ro/atomizoare/');
assert.strictEqual(
  atomizerUrl({ name: 'Ambition Mods Amazier MTL RTA' }),
  'https://ghid-rta.ro/atomizoare/ambition-mods-amazier-mtl-rta/'
);

const recommendationState = clone(baseline);
recommendationState.recommendationSignatures['test-alpha-rta'] = 'outdated';
const recommendationPlan = planUpdates(catalog, feed, recommendationState);
assert.strictEqual(recommendationPlan.length, 0, 'recommendation changes must update the model page without duplicating its Facebook post');

const reviewState = clone(baseline);
delete reviewState.seenVideos.abc123DEF45;
const reviewPlan = planUpdates(catalog, feed, reviewState);
assert.strictEqual(reviewPlan.length, 0, 'new reviews must update the model sources without duplicating its Facebook post');
assert.strictEqual(
  planUpdates(catalog, feed, reviewState, { maxPosts: 2, dailyPublished: 2 }).length,
  0,
  'catalog updates must share the two-post daily ceiling'
);

const applied = clone(newAtomState);
applyPublishedEvent(applied, newAtomPlan[0], '122_test', '2026-07-13T01:00:00.000Z');
assert(applied.seenAtomizers['test-beta-rta']);
assert(applied.seenVideos.xyz987ZYX65);
assert.strictEqual(applied.history[0].postId, '122_test');
assert.strictEqual(applied.history[0].liquids.length, 3);
assert.strictEqual(applied.history[0].formatVersion, 'educational-four-photo-v4-zero-nicotine');
assert.strictEqual(applied.history[0].messageVersion, 'three-zero-nicotine-liquid-gallery-v10-atomizer-name-first');
assert.strictEqual(needsLiquidGalleryRepair(applied.history[0]), false);
assert.strictEqual(needsLiquidGalleryRepair({ postId: 'legacy', formatVersion: 'educational-single-photo-v2' }), true);

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
assert(editorialPlan[0].message.startsWith('━━ 𝗔𝗧𝗢𝗠𝗜𝗭𝗢𝗥 𝗥𝗧𝗔 𝗠𝗧𝗟 ━━\nTest Beta RTA\n'));
assert(editorialPlan[0].message.includes('3 lichide analizate'));
assert.strictEqual(editorialPlan[0].liquidMatches.length, 3);
const editorialApplied = applyEditorialPublished(clone(campaignState), editorialPlan[0], '122_editorial', '2026-07-13T02:00:00.000Z');
assert.strictEqual(editorialApplied.postedAtomizers['test-beta-rta'].postId, '122_editorial');
assert.strictEqual(editorialApplied.postedAtomizers['test-beta-rta'].liquids.length, 3);
assert.strictEqual(editorialApplied.postedAtomizers['test-beta-rta'].formatVersion, 'educational-four-photo-v4-zero-nicotine');
assert.strictEqual(editorialApplied.postedAtomizers['test-beta-rta'].messageVersion, 'three-zero-nicotine-liquid-gallery-v10-atomizer-name-first');
assert.strictEqual(editorialApplied.pace, 'two-posts-per-day');
assert.strictEqual(dateInRomania('2026-07-12T22:01:25.586Z'), '2026-07-13');

const dailyLimitedState = emptyCampaignState();
for (let index = 0; index < 2; index += 1) {
  dailyLimitedState.postedAtomizers[`manual-${index}`] = {
    name: `Manual ${index}`,
    publishedAt: `2026-07-13T0${index}:00:00.000Z`
  };
}
assert.strictEqual(
  planEditorialPosts(catalog, feed, dailyLimitedState, { maxPosts: 1, today: '2026-07-13' }).length,
  0,
  'editorial publishing must stop after two posts in the Romanian calendar day'
);
assert.strictEqual(facebookPostsOnDate(dailyLimitedState, emptyState(), '2026-07-13'), 2);
const sharedPublishState = emptyState();
sharedPublishState.history.push({
  key: 'review:test',
  name: 'Test review',
  postId: 'page_post_1',
  publishedAt: '2026-07-13T04:00:00.000Z'
});
assert.strictEqual(facebookPostsOnDate(dailyLimitedState, sharedPublishState, '2026-07-13'), 3);

const crossCampaignState = emptyCampaignState();
crossCampaignState.postedAtomizers['test-alpha-rta-black'] = {
  name: 'Test Alpha RTA - Black',
  postId: 'campaign_alpha',
  publishedAt: '2026-07-13T01:00:00.000Z'
};
const crossPublishState = emptyState();
crossPublishState.history.push({
  key: 'review:test-beta-rta:xyz987ZYX65',
  name: 'Test Beta RTA',
  postId: 'publish_beta',
  publishedAt: '2026-07-13T02:00:00.000Z'
});
const postedSlugs = postedAtomizerSlugs(crossCampaignState, crossPublishState);
assert(postedSlugs.has(canonicalAtomizerSlug('Test Alpha RTA')));
assert(postedSlugs.has(canonicalAtomizerSlug('Test Beta RTA')));
assert.strictEqual(planEditorialPosts(catalog, feed, crossCampaignState, {
  maxPosts: 2,
  dailyPublished: 0,
  blockedModelSlugs: Array.from(postedSlugs),
  today: '2099-01-01'
}).length, 0, 'editorial posts must not repeat models already published by catalog updates');

const duplicateCampaign = emptyCampaignState();
duplicateCampaign.postedAtomizers['test-alpha-rta'] = {
  name: 'Test Alpha RTA',
  postId: 'post_alpha_old',
  publishedAt: '2026-07-13T01:00:00.000Z'
};
const duplicatePublish = emptyState();
duplicatePublish.history.push({
  key: 'review:test-alpha-rta:abc123DEF45',
  name: 'Test Alpha RTA - Black',
  postId: 'post_alpha_new',
  publishedAt: '2026-07-14T01:00:00.000Z'
});
const duplicateGroups = duplicateFacebookPostGroups(duplicateCampaign, duplicatePublish);
assert.strictEqual(duplicateGroups.length, 1);
assert.strictEqual(duplicateGroups[0].records[0].postId, 'post_alpha_old');

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

const refreshedReview = historyEntryMessage({
  key: 'review:test-alpha-rta:abc123DEF45',
  type: 'review',
  name: 'Test Alpha RTA'
}, catalog, feed);
assert.strictEqual(refreshedReview.liquidMatches.length, 3);
assert(refreshedReview.message.includes('Sunt incluse exact 3 lichide asociate'));
assert(refreshedReview.liquidMatches.every(match => refreshedReview.message.includes(match.title)));
assert(!/smokee\.ro\/product|preț|stoc|cumpărare|pentru comenzi/i.test(refreshedReview.message));
const refreshedEvent = historyEntryEvent({
  key: 'review:test-alpha-rta:abc123DEF45',
  type: 'review',
  name: 'Test Alpha RTA'
}, catalog, feed);
assert.strictEqual(refreshedEvent.liquidMatches.length, 3);
assert.strictEqual(educationalAlbumPhotoEntries(refreshedEvent).length, 4);

const liveCatalog = loadCatalog();
const livePairingFailures = uniqueAtomizers(liveCatalog).filter(atom => {
  const matches = topLiquidMatchesForAtom(atom, liveCatalog, 3);
  return matches.length !== 3 || new Set(matches.map(item => item.url)).size !== 3 ||
    new Set(matches.map(item => item.image)).size !== 3 ||
    matches.some(item => !/^https:\/\/smokee\.ro\/product\//i.test(item.url) || !/^https:\/\//i.test(item.image) ||
      !isNicotineFreeFacebookLiquid(item));
});
assert.deepStrictEqual(
  livePairingFailures.map(atom => atom.name),
  [],
  'every live atomizer must have three distinct catalog liquid matches before Facebook publishing'
);

const liveEditorialPreview = planEditorialPosts(liveCatalog, { schemaVersion: 1, models: {} }, emptyCampaignState(), {
  maxPosts: 2,
  dailyPublished: 0,
  today: '2099-01-01'
});
assert(liveEditorialPreview.length > 0, 'the live editorial catalog must produce publishable previews');
liveEditorialPreview.forEach(event => {
  assert.strictEqual(event.liquidMatches.length, 3);
  assert.doesNotThrow(() => assertEventLiquidTriplet(event));
  assert(event.message.includes('3 lichide analizate'));
  assert(event.message.includes('Sunt incluse exact 3 lichide asociate'));
  assert(event.message.includes('Recomandat a se consuma fără nicotină.'));
  assert(!/preț|stoc|cumpărare|pentru comenzi|0736\s*018\s*023/i.test(event.message));
  assert(!/smokee\.ro\/product|youtube\.com|youtu\.be/i.test(event.message));
  assert.strictEqual((event.message.match(/https:\/\//g) || []).length, 1);
  assert(!/[ÃÂÄÈ]/.test(event.message), `mojibake detected in Facebook message for ${event.name}`);
  const photos = educationalAlbumPhotoEntries(event);
  assert.strictEqual(photos.length, 4);
  assert.strictEqual(new Set(photos.map(photo => photo.image)).size, 4);
  photos.forEach(photo => {
    assert(!/preț|stoc|cumpărare|pentru comenzi|0736\s*018\s*023|smokee\.ro\/product/i.test(photo.caption));
    assert(!/[ÃÂÄÈ]/.test(photo.caption), `mojibake detected in Facebook photo caption for ${event.name}`);
  });
});

console.log('Facebook publisher: four-photo zero-nicotine galleries, two-post daily limit, triangulated three-liquid pairing, deduplication, recommendation and review checks passed.');
