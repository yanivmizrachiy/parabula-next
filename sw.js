'use strict';

const VERSION = '__MOBILE_VERSION__';
const CACHE_PREFIX = 'parabula-mobile-';
const CACHE_NAME = `${CACHE_PREFIX}${VERSION}`;
const CORE_ASSETS = [
  './',
  './index.html',
  './index.css',
  './index.js',
  './mobile-app.html',
  './mobile-app.css',
  './mobile-app.js',
  './mobile-app.webmanifest',
  './reader-actions.css',
  './reader-actions.js',
  './icon.svg',
  './meta/topics.json',
  './vendor/fonts/rubik.css'
];

function normalizedRequest(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return request;
  url.hash = '';
  url.search = '';
  return new Request(url.href, { method: 'GET', credentials: 'same-origin' });
}

async function safeCachePut(cache, request, response) {
  if (!response || !response.ok) return;
  try {
    await cache.put(normalizedRequest(request), response.clone());
  } catch (error) {
    console.warn('[sw] cache put skipped', error);
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const results = await Promise.allSettled(CORE_ASSETS.map(asset => {
      const absolute = new URL(asset, self.registration.scope).href;
      return cache.add(new Request(absolute, { cache: 'reload', credentials: 'same-origin' }));
    }));
    const failed = results.filter(result => result.status === 'rejected');
    if (failed.length) console.warn(`[sw] ${failed.length} core assets were not precached`);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request, { cache: 'no-store' });
    await safeCachePut(cache, request, fresh);
    return fresh;
  } catch (error) {
    const cached = await cache.match(normalizedRequest(request));
    if (cached) return cached;

    if (request.mode === 'navigate') {
      const pathname = new URL(request.url).pathname;
      const shellPath = new URL('./mobile-app.html', self.registration.scope).pathname;
      const indexPath = new URL('./index.html', self.registration.scope).pathname;
      const scopePath = new URL('./', self.registration.scope).pathname;
      if ([shellPath, indexPath, scopePath].includes(pathname)) {
        const shell = await cache.match(new Request(new URL('./mobile-app.html', self.registration.scope).href));
        if (shell) return shell;
      }
      return new Response('הדף אינו שמור במכשיר ואין כרגע חיבור לאינטרנט.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const key = normalizedRequest(request);
  const cached = await cache.match(key);
  const refresh = fetch(request, { cache: 'no-store' })
    .then(async response => {
      await safeCachePut(cache, request, response);
      return response;
    })
    .catch(() => null);
  return cached || refresh || Response.error();
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate' || request.destination === 'document';
  const isStaticAsset = ['style', 'script', 'font', 'image', 'manifest'].includes(request.destination);
  event.respondWith(isNavigation ? networkFirst(request) : isStaticAsset ? staleWhileRevalidate(request) : networkFirst(request));
});
