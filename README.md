# Full-stack starter

Monorepo starter with an Astro + React + Tailwind frontend, a Hono API, Prisma, Zod, and shared TypeScript contracts.

## Requirements

- Node.js 20.19+ or 22.12+
- pnpm 10+

## Getting started

1. Install dependencies with `pnpm install`.
2. Copy `apps/api/.env.example` to `apps/api/.env`.
3. Run `pnpm db:migrate` to create the local SQLite database.
4. Run `pnpm dev` and open `http://localhost:4321`.

The API runs on `http://localhost:3000`. Shared request/response schemas and types live in `packages/shared`.

## Workspace layout

- `apps/web` — Astro site with React islands and Tailwind CSS.
- `apps/api` — Hono server, Zod validation, and Prisma data access.
- `packages/shared` — API schemas and TypeScript contracts consumed by both apps.
