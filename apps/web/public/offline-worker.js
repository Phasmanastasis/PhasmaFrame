const CACHE_NAME = 'alaga-shell-v1';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch('/');
    await cache.put('/', response.clone());
    const html = await response.text();
    const assets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
      .map(([, path]) => new URL(path, self.location.origin).href)
      .filter(url => new URL(url).origin === self.location.origin);
    const visited = new Set();

    const cacheAsset = async url => {
      if (visited.has(url)) return;
      visited.add(url);
      try {
        const asset = await fetch(url);
        if (!asset.ok) return;
        await cache.put(url, asset.clone());
        if (/\.m?js(?:$|\?)/.test(url)) {
          const source = await asset.text();
          const imports = [...source.matchAll(/(?:from\s*|import\s*\(\s*)["']([^"']+)["']/g)]
            .map(([, path]) => new URL(path, url))
            .filter(importUrl => importUrl.origin === self.location.origin)
            .map(importUrl => importUrl.href);
          await Promise.all(imports.map(cacheAsset));
        }
      } catch {
        // A secondary asset can retry through the runtime cache on next use.
      }
    };

    await Promise.all(assets.map(cacheAsset));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('alaga-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) await caches.open(CACHE_NAME).then(cache => cache.put('/', response.clone()));
        return response;
      } catch {
        return (await caches.match(request)) || caches.match('/');
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
    return response;
  })());
});
