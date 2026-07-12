const CACHE_NAME = 'parabula-mobile-20260712001';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;

  event.respondWith((async () => {
    try {
      const fresh = await fetch(req, {cache:'no-store'});
      if(fresh.ok){
        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, fresh.clone());
      }
      return fresh;
    } catch(error) {
      const cached = await caches.match(req);
      if(cached) return cached;
      throw error;
    }
  })());
});
