const CACHE_NAME = 'alaga-shell-v3';

// Document routes that must survive a first-ever offline navigation. Each is
// crawled at install time (same as the root) so its hashed /_astro/* chunks and
// hydrated island JS are precached — not just the shell markup. The static
// routes (/ and /offline) carry no island; the role routes (/choose, /patient,
// /bhw) each mount the HealthHub island, so crawling them is what lets them
// actually hydrate offline rather than render a dead shell.
const ROUTES = ['/', '/choose', '/patient', '/bhw', '/about', '/offline'];

// Routes and assets seeded directly into the cache on install. Each entry
// tolerates individual fetch failure, so a missing asset never breaks install.
const PRECACHE_URLS = [
  ...ROUTES,
  '/offline.html',
  '/manifest.webmanifest',
  '/manifest-patient.webmanifest',
  '/manifest-bhw.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/apple-touch-icon.png',
  '/kasigla-logo.png',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    const visited = new Set();
    const sameOrigin = href => new URL(href).origin === self.location.origin;

    const cacheAsset = async url => {
      if (visited.has(url)) return;
      visited.add(url);
      try {
        const asset = await fetch(url);
        if (!asset.ok) return;
        await cache.put(url, asset.clone());
        if (/\.m?js(?:$|\?)/.test(url)) {
          // Follow ESM imports so transitively-loaded chunks are cached too.
          const source = await asset.text();
          const imports = [...source.matchAll(/(?:from\s*|import\s*\(\s*)["']([^"']+)["']/g)]
            .map(([, path]) => new URL(path, url).href)
            .filter(sameOrigin);
          await Promise.all(imports.map(cacheAsset));
        } else if (/\.css(?:$|\?)/.test(url)) {
          // Follow url(...) references in CSS (e.g. @font-face woff2 files) so
          // fonts are available offline instead of failing to load.
          const source = await asset.text();
          const refs = [...source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)]
            .map(([, path]) => path.trim())
            .filter(path => path && !path.startsWith('data:'))
            .map(path => new URL(path, url).href)
            .filter(sameOrigin);
          await Promise.all(refs.map(cacheAsset));
        }
      } catch {
        // A secondary asset can retry through the runtime cache on next use.
      }
    };

    // Seed the known precache list first so core routes/icons/manifest are always
    // present. Each entry tolerates individual failure (same as crawled assets).
    await Promise.all(PRECACHE_URLS.map(path => {
      const url = new URL(path, self.location.origin).href;
      return cacheAsset(url);
    }));

    // Then crawl each document route to pick up the hashed /_astro/* chunks it
    // links. The role routes (/choose, /patient, /bhw) each mount the HealthHub
    // island, so crawling them precaches their hydration JS — without this they
    // would render a dead shell on a cold offline load. Each route is crawled
    // independently and tolerates failure, same resilience as the seed list.
    const crawlRoute = async route => {
      try {
        const url = new URL(route, self.location.origin).href;
        const response = await fetch(url);
        if (!response.ok) return;
        await cache.put(url, response.clone());
        const html = await response.text();
        // Capture classic asset attributes (src/href) AND Astro island hydration
        // attributes (component-url/renderer-url) so the React island's JS chunks
        // are precached — without them the app cannot hydrate offline.
        const assets = [...html.matchAll(/(?:src|href|component-url|renderer-url)=["']([^"']+)["']/g)]
          .map(([, path]) => new URL(path, self.location.origin).href)
          .filter(sameOrigin);
        await Promise.all(assets.map(cacheAsset));
      } catch {
        // Precache list above still covers this route's shell if the crawl fails.
      }
    };
    await Promise.all(ROUTES.map(crawlRoute));
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

  // Never cache or serve /api/* from the cache: clinical data must always come
  // from the network and is allowed to fail when offline, so the app can never
  // show stale readings. Let these requests pass straight through to the network.
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          try { await caches.open(CACHE_NAME).then(cache => cache.put('/', response.clone())); } catch { /* cache write is best-effort */ }
        }
        return response;
      } catch {
        // Offline: prefer the exact cached document, then the cached shell at /,
        // then the static offline fallback. Guard so a cache miss never throws.
        return (await caches.match(request))
          || (await caches.match('/'))
          || (await caches.match('/offline.html'))
          || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        try { await caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())); } catch { /* cache write is best-effort */ }
      }
      return response;
    } catch {
      // Guard: a cache miss plus a network failure must resolve, not throw.
      return (await caches.match(request)) || Response.error();
    }
  })());
});
