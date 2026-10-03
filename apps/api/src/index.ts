import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { createApp } from './app.js';
import { prisma } from './db.js';

const port = Number(process.env.PORT ?? 3000);
const isDev = (process.env.NODE_ENV ?? 'development') !== 'production';

const app = createApp({
  prisma,
  webOrigin: process.env.WEB_ORIGIN,
  exposeDocs: isDev,
});

// Static frontend (Cloudflare parity): the API container also serves the built
// Astro site, so `/` and page routes are served same-origin alongside `/api/*`,
// mirroring Cloudflare Pages + the Worker `/api/*` route on one origin.
//
// Directory can be overridden with WEB_DIST; defaults to ./public, where the
// Docker image copies apps/web/dist. If the directory is absent (e.g. running
// the API alone in dev), static serving is simply inert.
const webDist = process.env.WEB_DIST ?? './public';

// Unknown /api/* must return a JSON 404, never the frontend HTML. This is
// registered before the static handler so API paths never fall through to it.
app.all('/api/*', (c) => c.json({ error: 'Not Found' }, 404));

// Serve hashed assets and pages from the static build. `index: 'index.html'`
// serves the site root at `/`.
app.use('/*', serveStatic({ root: webDist, index: 'index.html' }));

// Final fallback for non-API paths that match no static file: serve the static
// site's own 404 page if present (matching the static Pages per-page 404), else
// a plain 404. No SPA rewrite — Cloudflare serves the static build without one.
app.notFound(async (c) => {
  const res = await serveStatic({ root: webDist, path: '404.html' })(c, async () => {});
  if (res instanceof Response && res.status === 200) {
    return new Response(res.body, { status: 404, headers: res.headers });
  }
  return c.text('404 Not Found', 404);
});

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
  if (isDev) {
    console.log(`API docs available on http://localhost:${info.port}/docs`);
  }
});
