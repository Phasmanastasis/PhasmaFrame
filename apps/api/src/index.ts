import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { prisma } from './db.js';

const port = Number(process.env.PORT ?? 3000);
const isDev = (process.env.NODE_ENV ?? 'development') !== 'production';

const app = createApp({
  prisma,
  webOrigin: process.env.WEB_ORIGIN,
  exposeDocs: isDev,
});

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
  if (isDev) {
    console.log(`API docs available on http://localhost:${info.port}/docs`);
  }
});
