const CACHE = "rta-lab-v7-network-first-three-wire-20260818";
const FALLBACK = "./index.html?v=7";
const ASSETS = [
  "./index.html?v=7",
  "./styles.css?v=7",
  "./lab-update.css?v=7",
  "./engine.js?v=7",
  "./bootstrap.js?v=7",
  "./manifest.webmanifest?v=7",
  "./icon-192.png?v=7",
  "./data/core.js?v=7",
  "./data/atoms-1.js?v=7",
  "./data/atoms-2.js?v=7",
  "./data/atoms-3.js?v=7",
  "./data/wires.js?v=7",
  "./data/liquids-1a.js?v=7",
  "./data/liquids-1b.js?v=7",
  "./data/liquids-2a.js?v=7",
  "./data/liquids-2b.js?v=7",
  "./data/liquids-3a.js?v=7",
  "./data/liquids-3b.js?v=7",
  "./data/liquids-4a.js?v=7",
  "./data/liquids-4b.js?v=7",
  "./data/liquids-5-tutun-simplu.js?v=7",
  "./data/liquids-5-tutun-complex.js?v=7",
  "./data/liquids-5-net-simplu.js?v=7",
  "./data/liquids-5-net-complex.js?v=7"
];

async function putFresh(request, response) {
  if (!response || !response.ok) return response;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, fallbackUrl) {
  try {
    const freshRequest = new Request(request, { cache: "no-store" });
    const response = await fetch(freshRequest);
    return await putFresh(request, response);
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw error;
  }
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => key === CACHE ? Promise.resolve(false) : caches.delete(key)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
  if (event.data === "CLEAR_RTA_LAB_CACHES") {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))));
  }
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, FALLBACK));
    return;
  }

  if (url.pathname.includes("/rta-lab/")) {
    event.respondWith(networkFirst(request));
  }
});
