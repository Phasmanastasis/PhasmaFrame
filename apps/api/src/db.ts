import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

/**
 * Node / Komodo path: a process-wide singleton backed by the bundled query engine
 * and the DATABASE_URL (SQLite file). Imported by the Node entry (src/index.ts).
 */
export const prisma = new PrismaClient();

/**
 * Cloudflare Workers path: build a client bound to a D1 database via the driver
 * adapter. A fresh client is created per request in the Worker fetch handler
 * because the D1 binding only exists on the request `env`.
 */
export function createPrismaClient(db: D1Database): PrismaClient {
  const adapter = new PrismaD1(db);
  return new PrismaClient({ adapter });
}
