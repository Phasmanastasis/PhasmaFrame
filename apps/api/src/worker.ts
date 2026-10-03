import { createApp } from './app.js';
import { createPrismaClient } from './db.js';

export interface Env {
  /** D1 database binding (see wrangler.jsonc d1_databases). */
  DB: D1Database;
  /** CORS allow-origin for the deployed web app. Set as a Worker var/secret. */
  WEB_ORIGIN?: string;
}

/**
 * Cloudflare Workers entry. Hono's app.fetch is already a standard
 * (request, env, ctx) fetch handler, so we build a fresh app per request with a
 * D1-backed Prisma client (the DB binding only exists on the request `env`).
 */
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
    const app = createApp({
      prisma: createPrismaClient(env.DB),
      webOrigin: env.WEB_ORIGIN,
      exposeDocs: false,
    });
    return app.fetch(request, env, ctx);
  },
};
