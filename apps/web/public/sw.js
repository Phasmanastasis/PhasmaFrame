// Kasigla service worker — static, root scope ("/").
// Hand-written plain JS (copied verbatim from public/ to dist/sw.js at build time).

const CACHE_VERSION = 'kasigla-pwa-v2';

// App shell precached on install. All absolute, "/"-rooted URLs.
const APP_SHELL = [
  '/',
  '/about',
  '/offline',
  '/manifest.webmanifest',
  '/manifest-patient.webmanifest',
  '/manifest-bhw.webmanifest',
  '/patient',
  '/bhw',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/apple-touch-icon.png',
  '/kasigla-logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_VERSION);
        // addAll is atomic; fall back to best-effort per-URL so one 404 can't
        // abort the whole install.
        await cache.addAll(APP_SHELL).catch(async () => {
          await Promise.all(
            APP_SHELL.map((url) => cache.add(url).catch(() => undefined)),
          );
        });
      } catch (err) {
        // Never block activation on a cache failure.
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const names = await caches.keys();
        await Promise.all(
          names
            .filter((name) => name !== CACHE_VERSION)
            .map((name) => caches.delete(name)),
        );
      } catch (err) {
        // Ignore cleanup failures.
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET; let everything else go straight to the network.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Never cache the API — let requests hit the network and fail naturally
  // offline so ApiStatus can show its error state.
  if (sameOrigin && url.pathname.startsWith('/api/')) return;

  // Navigation requests: network-first, then use the exact cached URL or its
  // clean-URL slash alias before falling back to /offline.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Other same-origin assets (CSS/JS/images/icons): stale-while-revalidate.
  if (sameOrigin) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    // Cache successful navigations so repeat visits work offline.
    if (response && response.ok) {
      try {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(request, response.clone());
      } catch (err) {
        // Ignore cache write failures.
      }
    }
    return response;
  } catch (err) {
    const cached = await safeMatchNavigation(request);
    if (cached) return cached;
    const offline = await safeMatch('/offline');
    if (offline) return offline;
    return new Response('You are offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function safeMatchNavigation(request) {
  const cached = await safeMatch(request);
  if (cached) return cached;

  // Astro emits clean routes such as /patient/index.html, while hosts and
  // browsers may request either /patient or /patient/ for that route.
  const url = new URL(request.url);
  const aliases = [];
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    aliases.push(`${url.origin}${url.pathname.slice(0, -1)}${url.search}`);
  } else if (url.pathname !== '/') {
    aliases.push(`${url.origin}${url.pathname}/${url.search}`);
  }

  for (const alias of aliases) {
    const match = await safeMatch(alias);
    if (match) return match;
  }

  return undefined;
}

async function staleWhileRevalidate(request) {
  const cached = await safeMatch(request);

  const network = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        try {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put(request, response.clone());
        } catch (err) {
          // Ignore cache write failures.
        }
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;

  const fresh = await network;
  if (fresh) return fresh;

  return new Response('', { status: 504, statusText: 'Offline' });
}

async function safeMatch(request) {
  try {
    const cache = await caches.open(CACHE_VERSION);
    const match = await cache.match(request, { ignoreSearch: false });
    if (match) return match;
    // Fall back to any cache for robustness.
    return (await caches.match(request)) ?? undefined;
  } catch (err) {
    return undefined;
  }
}
