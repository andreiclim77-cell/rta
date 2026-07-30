#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'data', 'facebook-hourly-photo-state.json');
const SITE = 'https://ghid-rta.ro';
const PAGE_ID = String(process.env.FACEBOOK_PAGE_ID || '').trim();
const ACCESS_TOKEN = String(process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '').trim();
const GRAPH_VERSION = String(process.env.FACEBOOK_GRAPH_VERSION || 'v25.0').trim();

const captions = [
  'RTA MTL intr-un cadru de vara.',
  'Un setup RTA MTL intr-o atmosfera calma.',
  'Doua interpretari RTA MTL, acelasi reper de precizie.',
  'RTA MTL intr-un cadru urban, cu accent pe echilibru.',
  'Un setup compact, prezentat intr-o atmosfera de seara.',
  'RTA MTL intr-un moment de liniste.',
  'Doua setup-uri RTA MTL, doua stiluri distincte.'
];

const photos = captions.map((lead, index) => ({
  key: `photo-${String(index + 1).padStart(2, '0')}`,
  image: `${SITE}/assets/facebook/hourly-2026-07-30/photo-${String(index + 1).padStart(2, '0')}.png`,
  message: [
    lead,
    '',
    `Ghid orientativ: ${SITE}/`,
    'Material informativ destinat exclusiv adultilor 18+.',
    '',
    '#GhidRTAMTL #RTAMTL #BuildRTA'
  ].join('\n')
}));

function readState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    return {
      schemaVersion: 1,
      series: 'hourly-2026-07-30',
      nextIndex: Math.max(0, Number(parsed.nextIndex) || 0),
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch {
    return { schemaVersion: 1, series: 'hourly-2026-07-30', nextIndex: 0, history: [] };
  }
}

function writeState(state) {
  const temporary = `${STATE_PATH}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, STATE_PATH);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(45000)
  });
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { message: text };
  }
  if (!response.ok || payload.error) {
    const message = payload.error && payload.error.message || payload.message || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

async function assertPublicImage(url) {
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store',
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok || !String(response.headers.get('content-type') || '').startsWith('image/')) {
    throw new Error(`Imaginea publica nu este disponibila: ${url}`);
  }
}

async function publishNext() {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    throw new Error('Lipsesc FACEBOOK_PAGE_ID sau FACEBOOK_PAGE_ACCESS_TOKEN.');
  }

  const state = readState();
  if (state.nextIndex >= photos.length) {
    console.log('Seria foto este completa.');
    return;
  }

  const photo = photos[state.nextIndex];
  if (state.history.some(item => item && item.key === photo.key)) {
    throw new Error(`Stare incoerenta: ${photo.key} este deja publicata.`);
  }

  await assertPublicImage(photo.image);
  const body = new URLSearchParams({
    url: photo.image,
    caption: photo.message,
    published: 'true',
    access_token: ACCESS_TOKEN
  });
  const payload = await fetchJson(
    `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(PAGE_ID)}/photos`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body
    }
  );
  const postId = String(payload.post_id || payload.id || '').trim();
  if (!postId) throw new Error('Meta nu a returnat identificatorul postarii.');

  state.history.push({
    key: photo.key,
    image: photo.image,
    postId,
    publishedAt: new Date().toISOString()
  });
  state.nextIndex += 1;
  state.updatedAt = new Date().toISOString();
  writeState(state);
  console.log(`Publicat ${photo.key}: ${postId}`);
}

const state = readState();
if (process.argv.includes('--remaining')) {
  console.log(Math.max(0, photos.length - state.nextIndex));
} else if (process.argv.includes('--check')) {
  if (photos.length !== 7) throw new Error('Seria trebuie sa contina exact sapte fotografii.');
  if (new Set(photos.map(item => item.key)).size !== photos.length) throw new Error('Chei foto duplicate.');
  console.log(`Seria foto valida: ${photos.length} imagini, ${Math.max(0, photos.length - state.nextIndex)} ramase.`);
} else if (process.argv.includes('--publish-next')) {
  publishNext().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
} else {
  console.log('Folosire: --check | --remaining | --publish-next');
}
