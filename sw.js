// Nach JEDER Änderung am Spiel hochzählen, sonst liefert der Worker die alte Fassung aus.
const VERSION = 'v8';
const CACHE = `sternen-roboter-${VERSION}`;
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './fonts/fredoka-latin.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-512-maskable.png',
  './icons/icon-180.png', './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(f => c.add(f)))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for(const k of await caches.keys()) if(k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;   // alles Nötige liegt lokal
  e.respondWith((async () => {
    const hit = await caches.match(req, {ignoreSearch: req.mode === 'navigate'});
    if(hit) return hit;
    try{
      const res = await fetch(req);
      if(res.ok) (await caches.open(CACHE)).put(req, res.clone());
      return res;
    }catch(err){
      if(req.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
