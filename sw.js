const CACHE_VERSION = 'ghid-rta-static-v2';
const OFFLINE_URL = '/offline.html';
const SAFE_PAGES = [
  OFFLINE_URL,
  '/ghid-rta-mtl.html',
  '/sarme-rta-builduri.html',
  '/builduri-mtl-sarme-rta.html',
  '/airflow-camera-rta-mtl.html',
  '/control-temperatura-mtl.html',
  '/diagnostic-gust-rta-mtl.html',
  '/calculator-lichide-vape.html',
  '/legislativ-vape.html'
];
const STATIC_ASSETS = [
  '/assets/favicon-192.png',
  '/assets/favicon-512.png',
  '/assets/apple-touch-icon.png',
  '/assets/smokee-logo-official.png',
  '/assets/rta-hero-background.png',
  '/assets/seo-pages.css',
  '/assets/enhancements.css',
  '/assets/enhancements.js',
  '/site.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(SAFE_PAGES.concat(STATIC_ASSETS))));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

async function networkFirst(request, fallback) {
  try {
    const response = await fetch(request);
    if (response && response.ok && SAFE_PAGES.includes(new URL(request.url).pathname)) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return (await caches.match(request)) || (await caches.match(fallback));
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    const isSafeGuide = SAFE_PAGES.includes(url.pathname);
    event.respondWith(networkFirst(request, isSafeGuide ? url.pathname : OFFLINE_URL));
    return;
  }

  if (url.pathname === '/sync-status.json' || url.pathname === '/' || url.pathname === '/index.html' || url.pathname.startsWith('/en/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname === '/site.webmanifest') {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (!response || !response.ok) return response;
        const copy = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        return response;
      }))
    );
  }
});
