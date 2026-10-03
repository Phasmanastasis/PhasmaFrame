# PhasmaFrame

<img src="kasigla-logo.png" alt="Kasigla logo" width="96" height="96" />

PhasmaFrame is the web and API companion stack for **Kasigla**, an offline-first
hypertension follow-up MVP for Philippine community healthcare. The product lets a patient
or caregiver record blood-pressure readings offline and manually transfer one patient's
record to a barangay health worker (BHW) device, so the BHW can review the history and
export a summary for the Rural Health Unit (RHU) through its existing process, without
relying on live internet.

This repository holds the hosted demo and tooling: an Astro + React frontend, a Hono API,
shared TypeScript contracts, and the infrastructure to build, run, and deploy them. The
offline device-to-device application described in the design docs is tracked separately.

> For how to run everything in this repository, see **[RUNNING.md](./RUNNING.md)**.

---

## The problem

Community follow-up for chronic conditions like hypertension happens in places where
connectivity is unreliable and records are fragmented. The problem framing (grounded in the
team's case context and desk research, and treated as provisional until validated) is:

- **Scattered history.** Blood-pressure readings live on paper or on a household device and
  rarely travel with the patient between visits.
- **Broken handoff.** A BHW visiting a patient often lacks the recent record at the moment
  of the visit.
- **No reliable live access.** Far-flung visits and intermittent connectivity make
  on-the-spot retrieval from a server unreliable.

The root hypothesis: low-connectivity community follow-up lacks a simple, practical way to
bring a patient's recorded blood-pressure history to a BHW for review. The full evidence
state, Carlos Dela Torre matrix, and 5 Whys analysis are documented, with unknowns marked
explicitly, under [`docs/market/`](./docs/market/README.md).

## The solution

A deliberate, offline, device-to-device handoff of a single patient's record:

1. **Record** a blood-pressure reading offline: systolic, diastolic, time, who measured,
   and who entered it (notes and heart rate optional).
2. **Transfer** one patient's record from a patient/caregiver device to a BHW device, with
   an explicit confirmation step on the receiving device.
3. **Review** the imported history on the BHW device and add a visit note or reading.
4. **Export** the summary as CSV so the BHW can hand it to the RHU through the existing
   process.

The MVP deliberately excludes cloud sync, background or bulk replication, automatic
merging, and direct BHW-to-RHU digital transfer. Those boundaries are intentional and are
spelled out in the product docs below. No health-outcome or adoption claims are made
without supporting evidence.

## Technologies used

**Frontend (`apps/web`)**

- [Astro](https://astro.build/) static site with [React](https://react.dev/) islands
- [Tailwind CSS](https://tailwindcss.com/) via the Tailwind Vite plugin
- [TypeScript](https://www.typescriptlang.org/)

**Backend (`apps/api`)**

- [Hono](https://hono.dev/) HTTP framework (runs on both Node and the Cloudflare Workers runtime)
- [Prisma](https://www.prisma.io/) ORM over SQLite locally, and Cloudflare D1 in production
- [Zod](https://zod.dev/) schema validation
- OpenAPI docs via `hono-openapi` and a [Scalar](https://scalar.com/) reference UI (non-production)

**Shared (`packages/shared`)**

- TypeScript request/response schemas and contracts consumed by both apps

**Tooling and infrastructure**

- [pnpm](https://pnpm.io/) workspaces (pinned via `packageManager`)
- [just](https://github.com/casey/just) task runner wrapping the pnpm scripts
- [direnv](https://direnv.net/) (optional) for environment loading
- [Docker](https://www.docker.com/) multi-stage build and Compose stack
- [Komodo](https://komo.do/) and [Cloudflare](https://www.cloudflare.com/) (Workers + D1 + Pages) as deploy targets
- GitHub Actions CI

The hackathon also requires concrete use of **Kiro** (spec, design, and implementation
assistance) and **Amazon Quick** (research synthesis). See the market docs for how each is
used in the workflow.

## Architecture

```
                 +------------------+        /api/*         +------------------+
   Browser  -->  |  apps/web        |  ----------------->   |  apps/api        |
                 |  Astro + React   |                       |  Hono API        |
                 |  Tailwind        |  <-----------------    |  Zod validation  |
                 +------------------+     JSON responses     +--------+---------+
                          |                                           |
                          |              shared contracts             |
                          +---------->  packages/shared  <------------+
                                                                      |
                                                            Prisma    |
                                                                      v
                                                     SQLite (local) / D1 (prod)
```

The same Hono app (`apps/api/src/app.ts`) is served two ways: a Node server
(`src/index.ts`) for local dev and the Docker/Komodo target, and a Cloudflare Worker
(`src/worker.ts`) backed by D1. The routes stay identical across both. Request and response
schemas are defined once in `packages/shared` and imported by both the API and the web app.

## Project structure

```
PhasmaFrame/
  apps/
    web/            Astro site with React islands and Tailwind CSS
    api/            Hono server, Zod validation, Prisma data access
  packages/
    shared/         API schemas and TypeScript contracts for both apps
  docs/
    prd.md          Product requirements, scope, acceptance criteria
    sdd.md          Software design: ERD, architecture, transfer, flows
    solution-brief.md  MVP decision, roles, workflow, boundaries
    market/         Market and business-development deliverables
    dev/            Setup, tooling, and deployment guides
  Dockerfile        Multi-stage production image for the API
  docker-compose.yaml  Compose stack (doubles as the Komodo Stack definition)
  justfile          Task recipes (run `just` to list them)
```

## Documentation

| Doc | What it covers |
| --- | --- |
| [RUNNING.md](./RUNNING.md) | How to set up and run everything currently in this repo |
| [`docs/prd.md`](./docs/prd.md) | Product requirements, scope, acceptance criteria |
| [`docs/sdd.md`](./docs/sdd.md) | Software design: ERD, architecture, transfer, flows |
| [`docs/solution-brief.md`](./docs/solution-brief.md) | MVP decision, roles, workflow, boundaries |
| [`docs/market/`](./docs/market/README.md) | Market and business-development deliverables |
| [`docs/dev/getting-started.md`](./docs/dev/getting-started.md) | Machine setup and first run |
| [`docs/dev/devtools.md`](./docs/dev/devtools.md) | Tool reference: just, pnpm, Prisma, Docker, Komodo, Cloudflare |
| [`docs/dev/deployment.md`](./docs/dev/deployment.md) | Deploy to Komodo |
| [`docs/dev/deployment-cloudflare.md`](./docs/dev/deployment-cloudflare.md) | Deploy to Cloudflare |
| [`docs/dev/workflow.md`](./docs/dev/workflow.md) | One feature per branch, PR, and Linear task |
| [`docs/dev/testing.md`](./docs/dev/testing.md) | Unit testing: runner, `just test*` recipes, coverage, gaps |

Agents and contributors: start with [`AGENTS.md`](./AGENTS.md).

## License

Licensed under the Mozilla Public License 2.0 (MPL-2.0). See [`LICENSE`](./LICENSE).
