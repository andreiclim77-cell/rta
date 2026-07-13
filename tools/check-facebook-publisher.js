#!/usr/bin/env node

const assert = require('assert');
const {
  applyEditorialPublished,
  applyPublishedEvent,
  albumPhotoEntries,
  atomizerImage,
  atomizerImageCandidates,
  atomizerProduct,
  atomizerUrl,
  baselineState,
  dateInRomania,
  emptyCampaignState,
  emptyState,
  facebookPostsOnDate,
  liquidMatchLines,
  multiPhotoFeedBody,
  planEditorialPosts,
  planUpdates,
  recommendationSignature,
  smokeeProductUrl,
  stockFromProductHtml,
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
      { title: 'NET Virginia Bright', tag: 'NET simplu Virginia', url: 'https://smokee.ro/product/net-virginia-bright/', image: 'https://images.example/net-virginia.jpg', stock: true },
      { title: 'NET Oriental Layers', tag: 'NET complex Oriental', url: 'https://smokee.ro/product/net-oriental-layers/', image: 'https://images.example/net-oriental.jpg', stock: true },
      { title: 'NET Kentucky Latakia', tag: 'NET complex Kentucky', url: 'https://smokee.ro/product/net-kentucky-latakia/', image: 'https://images.example/net-kentucky.jpg', stock: true },
      { title: 'NET Virginia indisponibil', tag: 'NET simplu Virginia', url: 'https://smokee.ro/product/net-virginia-indisponibil/', image: 'https://images.example/net-oos.jpg', stock: false }
    ],
    tutun: [
      { title: 'Tutun Rolling Sec', tag: 'TUTUN simplu', url: 'https://smokee.ro/product/tutun-rolling-sec/', image: 'https://images.example/rolling.jpg', stock: true },
      { title: 'Tutun Kentucky Heritage', tag: 'TUTUN complex Kentucky', url: 'https://smokee.ro/product/tutun-kentucky-heritage/', image: 'https://images.example/kentucky.jpg', stock: true },
      { title: 'Tutun Latakia Reserve', tag: 'TUTUN complex Latakia', url: 'https://smokee.ro/product/tutun-latakia-reserve/', image: 'https://images.example/latakia.jpg', stock: true },
      { title: 'Tutun Cigar Robust', tag: 'TUTUN complex Cigar', url: 'https://smokee.ro/product/tutun-cigar-robust/', image: 'https://images.example/cigar.jpg', stock: true }
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
const fallbackCatalog = clone(catalog);
fallbackCatalog.liquids.net = [catalog.liquids.net[0], catalog.liquids.net[1], catalog.liquids.net[3]];
fallbackCatalog.liquids.tutun = [];
const fallbackMatches = topLiquidMatchesForAtom(atomA, fallbackCatalog, 3);
assert.strictEqual(fallbackMatches.length, 3, 'an out-of-stock match may be shown only when three stocked alternatives do not exist');
assert(fallbackMatches.some(item => item.stock === false));
assert(liquidMatchLines(fallbackMatches).join('\n').includes('Pentru comenzi sunați la 0736 018 023.'));

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
assert(newAtomPlan[0].message.includes('3 lichide potrivite din catalog'));
assert(newAtomPlan[0].message.includes('https://smokee.ro/product/test-beta-rta/'));
assert(newAtomPlan[0].message.includes('Pentru comenzi sunați la 0736 018 023.'));
assert.strictEqual(newAtomPlan[0].liquidMatches.length, 3);
newAtomPlan[0].liquidMatches.forEach(match => assert(newAtomPlan[0].message.includes(match.url)));
const plannedAlbum = albumPhotoEntries(newAtomPlan[0]);
assert.strictEqual(plannedAlbum.length, 4, 'an RTA post must contain one atomizer photo and three liquid photos');
assert.strictEqual(new Set(plannedAlbum.map(item => item.image)).size, 4, 'all album photos must be distinct');
newAtomPlan[0].liquidMatches.forEach(match => {
  const photo = plannedAlbum.find(item => item.image === match.image);
  assert(photo.caption.includes(match.url));
  assert(photo.caption.includes('Descriere:'));
});
const albumBody = multiPhotoFeedBody('Test album', ['media-1', 'media-2', 'media-3', 'media-4'], 'test-token');
assert.strictEqual(albumBody.get('message'), 'Test album');
assert.strictEqual(albumBody.get('access_token'), 'test-token');
for (let index = 0; index < 4; index += 1) {
  assert.deepStrictEqual(JSON.parse(albumBody.get(`attached_media[${index}]`)), { media_fbid: `media-${index + 1}` });
}
assert.strictEqual(smokeeProductUrl(atomA), 'https://smokee.ro/product/test-alpha-rta/');
assert.deepStrictEqual(atomizerProduct(atomB), { url: 'https://smokee.ro/product/test-beta-rta/', stock: false });
assert.strictEqual(stockFromProductHtml('<p class="stock out-of-stock">Stoc epuizat</p>'), false);
assert.strictEqual(stockFromProductHtml('<p class="stock in-stock">În stoc</p>'), true);
assert.strictEqual(stockFromProductHtml('<p class="stock in-stock">În stoc</p><article class="outofstock">Produs asociat</article>'), true);
assert.strictEqual(stockFromProductHtml('<main>status necunoscut</main>', false), false);
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
assert.strictEqual(recommendationPlan[0].liquidMatches.length, 3);

const reviewState = clone(baseline);
delete reviewState.seenVideos.abc123DEF45;
const reviewPlan = planUpdates(catalog, feed, reviewState);
assert.strictEqual(reviewPlan[0].type, 'review');
assert(reviewPlan[0].message.includes('Test Alpha RTA review'));
assert.strictEqual(
  planUpdates(catalog, feed, reviewState, { maxPosts: 4, dailyPublished: 4 }).length,
  0,
  'catalog updates must share the four-post daily ceiling'
);

const applied = clone(newAtomState);
applyPublishedEvent(applied, newAtomPlan[0], '122_test', '2026-07-13T01:00:00.000Z');
assert(applied.seenAtomizers['test-beta-rta']);
assert(applied.seenVideos.xyz987ZYX65);
assert.strictEqual(applied.history[0].postId, '122_test');
assert.strictEqual(applied.history[0].liquids.length, 3);

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
assert(editorialPlan[0].message.includes('3 lichide potrivite din catalog'));
assert.strictEqual(editorialPlan[0].liquidMatches.length, 3);
const editorialApplied = applyEditorialPublished(clone(campaignState), editorialPlan[0], '122_editorial', '2026-07-13T02:00:00.000Z');
assert.strictEqual(editorialApplied.postedAtomizers['test-beta-rta'].postId, '122_editorial');
assert.strictEqual(editorialApplied.postedAtomizers['test-beta-rta'].liquids.length, 3);
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
assert.strictEqual(facebookPostsOnDate(dailyLimitedState, emptyState(), '2026-07-13'), 4);
const sharedPublishState = emptyState();
sharedPublishState.history.push({
  key: 'review:test',
  name: 'Test review',
  postId: 'page_post_1',
  publishedAt: '2026-07-13T04:00:00.000Z'
});
assert.strictEqual(facebookPostsOnDate(dailyLimitedState, sharedPublishState, '2026-07-13'), 5);

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

const liveCatalog = loadCatalog();
const livePairingFailures = uniqueAtomizers(liveCatalog).filter(atom => {
  const matches = topLiquidMatchesForAtom(atom, liveCatalog, 3);
  return matches.length !== 3 || new Set(matches.map(item => item.url)).size !== 3 ||
    new Set(matches.map(item => item.image)).size !== 3 ||
    matches.some(item => !/^https:\/\/smokee\.ro\/product\//i.test(item.url) || !/^https:\/\//i.test(item.image));
});
assert.deepStrictEqual(
  livePairingFailures.map(atom => atom.name),
  [],
  'every live atomizer must have three distinct catalog liquid matches before Facebook publishing'
);

const liveEditorialPreview = planEditorialPosts(liveCatalog, { schemaVersion: 1, models: {} }, emptyCampaignState(), {
  maxPosts: 4,
  dailyPublished: 0,
  today: '2099-01-01'
});
assert(liveEditorialPreview.length > 0, 'the live editorial catalog must produce publishable previews');
liveEditorialPreview.forEach(event => {
  assert.strictEqual(event.liquidMatches.length, 3);
  assert(event.message.includes('3 lichide potrivite din catalog'));
  assert.strictEqual(albumPhotoEntries(event).length, 4);
  assert(!/[ÃÂÄÈ]/.test(event.message), `mojibake detected in Facebook message for ${event.name}`);
});

console.log('Facebook publisher: baseline, three-liquid pairing, editorial series, deduplication, recommendation and review checks passed.');
