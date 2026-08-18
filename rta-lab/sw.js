const CACHE="rta-lab-v5-three-wire-airflow-20260818";
const ASSETS=[
  "./","./index.html","./styles.css","./lab-update.css","./app.js","./lab-update.js","./manifest.webmanifest","./icon-192.png",
  "./data/core.js","./data/atoms-1.js","./data/atoms-2.js","./data/atoms-3.js","./data/wires.js",
  "./data/liquids-1a.js","./data/liquids-1b.js","./data/liquids-2a.js","./data/liquids-2b.js",
  "./data/liquids-3a.js","./data/liquids-3b.js","./data/liquids-4a.js","./data/liquids-4b.js",
  "./data/liquids-5-tutun-simplu.js","./data/liquids-5-tutun-complex.js",
  "./data/liquids-5-net-simplu.js","./data/liquids-5-net-complex.js"
];
self.addEventListener("install",event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener("activate",event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match("./index.html"))));
});
