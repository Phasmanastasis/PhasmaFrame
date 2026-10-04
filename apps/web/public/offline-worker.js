const CACHE_NAME = 'alaga-shell-v4';

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
  '/patient/',
  '/bhw/',
  '/offline/',
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
        await cacheRouteAliases(cache, url, response);
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
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('alaga-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim(),
  ]));
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
          try {
            const cache = await caches.open(CACHE_NAME);
            await cacheRouteAliases(cache, request.url, response);
          } catch { /* cache write is best-effort */ }
        }
        return response;
      } catch {
        return (await matchCachedNavigation(request)) || offlineResponse();
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
      return (await caches.match(request)) || offlineResponse();
    }
  })());
});

function routeAliases(input) {
  const url = new URL(input, self.location.origin);
  const path = url.pathname;
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : '/';
  const aliases = [new URL(path + url.search, url.origin).href];
  if (url.search) aliases.push(new URL(path, url.origin).href);
  if (normalized !== path) aliases.push(new URL(normalized, url.origin).href);
  if (normalized !== '/') aliases.push(new URL(`${normalized}/`, url.origin).href);
  return [...new Set(aliases)];
}

async function cacheRouteAliases(cache, input, response) {
  await Promise.all(routeAliases(input).map(alias => cache.put(alias, response.clone())));
}

async function matchCachedNavigation(request) {
  const url = new URL(request.url);
  const aliases = routeAliases(url.href);
  const roleRoute = /^\/(patient|bhw)(?:\/|$)/.exec(url.pathname)?.[1];
  if (roleRoute) aliases.push(...routeAliases(new URL(`/${roleRoute}`, url.origin).href));

  for (const alias of [...new Set(aliases)]) {
    const cached = await caches.match(alias);
    if (cached) return cached;
  }

  return (await caches.match('/offline/')) || (await caches.match('/offline'));
}

function offlineResponse() {
  return new Response('You are offline. This screen is not cached yet. Open Kasigla once while online, then try again.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
