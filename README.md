# PhasmaFrame

Project repository for an **offline-first hypertension follow-up** MVP for Philippine
community healthcare. A patient or caregiver records blood-pressure readings offline and
manually transfers one patient's record to a barangay health worker (BHW) device; the BHW
reviews the history and prepares an RHU/YAKAP-ready summary. There is no cloud sync and no
direct BHW→RHU transfer in the MVP.

> Scope, acceptance criteria, and design are frozen in [`docs/prd.md`](./docs/prd.md),
> [`docs/sdd.md`](./docs/sdd.md), and [`docs/solution-brief.md`](./docs/solution-brief.md).
> Market/business framing lives under [`docs/market/`](./docs/market/README.md).

## This repository

This repo is the **web/API companion stack** used for the hosted demo and tooling — an
Astro + React + Tailwind frontend, a Hono API, Prisma, Zod, and shared TypeScript
contracts. (The offline device-to-device app described in the SDD is tracked separately;
see the FE/BE issues and the specs in `docs/`.)

### Workspace layout

- `apps/web` — Astro site with React islands and Tailwind CSS.
- `apps/api` — Hono server, Zod validation, and Prisma data access.
- `packages/shared` — API schemas and TypeScript contracts consumed by both apps.

## Requirements

- Node.js 20.19+ or 22.12+
- pnpm 10+
- [`just`](https://github.com/casey/just) — the task runner (recipes wrap the pnpm scripts)

See [`docs/dev/getting-started.md`](./docs/dev/getting-started.md) for full machine setup.

## Getting started

Using `just` (preferred — run `just` to list all recipes):

```bash
just install            # pnpm install
cp apps/api/.env.example apps/api/.env
just db-migrate         # create the local SQLite database
just dev                # run API + web
```

Equivalent raw pnpm commands if you don't have `just`:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:migrate
pnpm dev
```

Then open the web app at <http://localhost:4321>. The API runs on
<http://localhost:3000>; shared request/response schemas and types live in
`packages/shared`.

## Deployment

Two independent targets (see the docs for the full flow):

- **Komodo** (Docker container, Node runtime) — [`docs/dev/deployment.md`](./docs/dev/deployment.md).
- **Cloudflare** (Workers + D1 for the API, Pages for the web) — [`docs/dev/deployment-cloudflare.md`](./docs/dev/deployment-cloudflare.md).
  Live at <https://kasigla.kuyacarlo.dev> (API same-origin at `/api/*`).

## Documentation

| Doc | What |
| --- | --- |
| [`docs/prd.md`](./docs/prd.md) | Product requirements, scope, acceptance criteria |
| [`docs/sdd.md`](./docs/sdd.md) | Software design: ERD, architecture, transfer, flows |
| [`docs/solution-brief.md`](./docs/solution-brief.md) | MVP decision, roles, workflow, boundaries |
| [`docs/market/`](./docs/market/README.md) | Market / business-development deliverables |
| [`docs/dev/getting-started.md`](./docs/dev/getting-started.md) | Machine setup and first run |
| [`docs/dev/devtools.md`](./docs/dev/devtools.md) | Tool reference: just, pnpm, Prisma, Docker, Komodo, Cloudflare |
| [`docs/dev/deployment.md`](./docs/dev/deployment.md) | Deploy to Komodo |
| [`docs/dev/deployment-cloudflare.md`](./docs/dev/deployment-cloudflare.md) | Deploy to Cloudflare |
| [`docs/dev/workflow.md`](./docs/dev/workflow.md) | One feature per branch / PR / Linear task |

Agents and contributors: start with [`AGENTS.md`](./AGENTS.md).

## License

Licensed under the Mozilla Public License 2.0 (MPL-2.0). See [`LICENSE`](./LICENSE).
