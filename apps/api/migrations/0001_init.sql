-- D1 migration mirroring the Prisma `Example` model (prisma/schema.prisma).
-- Prisma Migrate does not support D1, so the schema is applied as raw SQL via
-- `wrangler d1 migrations apply` (see docs/dev/deployment-cloudflare.md).

CREATE TABLE IF NOT EXISTS "Example" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "name"      TEXT NOT NULL,
  -- Prisma stores DateTime as milliseconds since epoch for SQLite/D1.
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
