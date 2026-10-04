# Running PhasmaFrame

How to set up and run everything currently in this repository: the web app, the API, the
local database, builds, Docker, and the two deploy targets. For a conceptual overview of
the project, see [README.md](./README.md). For full machine setup from an empty computer,
see [`docs/dev/getting-started.md`](./docs/dev/getting-started.md).

## What is in this repo

- `apps/web` — Astro site with React islands and Tailwind CSS (dev server on port 4321).
- `apps/api` — Hono API with Zod validation and Prisma data access (dev server on port 3000).
- `apps/patient` — Expo (React Native) patient/caregiver app with the web target enabled, so
  it exports to a static PWA.
- `apps/mobile` — Expo (React Native) app covering the patient/caregiver and BHW flows, also
  web-exportable as a PWA. Replaces the earlier native Kotlin/Gradle skeleton.
- `packages/shared` — TypeScript request/response schemas shared by the apps.
- `Dockerfile` / `docker-compose.yaml` — containerized API build and Compose stack.
- `justfile` — task recipes that wrap the pnpm scripts.

> **Production web build coupling:** `apps/web`'s `build` script builds the Astro site and
> then, when `apps/patient` is present, exports the `apps/patient` Expo web app and
> overwrites `apps/web/dist/index.html` (and copies the `_expo`/`assets` output) with it. So
> the built web root `/` serves the **patient Expo PWA**, not the Astro landing page. `just
> dev` runs the plain Astro dev server without this step.

## Prerequisites

| Tool | Version | Required for |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 20.19+ or 22.12+ | Everything |
| [pnpm](https://pnpm.io/) | 10+ (pinned `pnpm@10.33.0`) | Package management, scripts |
| [just](https://github.com/casey/just) | any recent | Task runner (recommended) |
| [direnv](https://direnv.net/) | any recent | Optional environment loading |
| [Docker](https://www.docker.com/) + Compose | any recent | Building/running the container, Komodo deploy |

`npm` and `npx` ship with Node. `just` is recommended but optional; the raw pnpm commands
are shown alongside each recipe. Install instructions for every tool are in
[`docs/dev/getting-started.md`](./docs/dev/getting-started.md).

## First-time setup

Run these once after cloning:

```bash
# 1. Install all workspace dependencies
just install                         # or: pnpm install

# 2. Create the API environment file (the API reads apps/api/.env)
cp apps/api/.env.example apps/api/.env

# 3. Create the local SQLite database and generate the Prisma client
just db-migrate                      # or: pnpm db:migrate
```

If you installed direnv, run `direnv allow` from the repo root to trust the `.envrc`
(re-run it after any change to `.envrc`). direnv is optional: `just` loads `.env` on its
own.

## Running in development

Start both the API and the web app with hot reload:

```bash
just dev                             # or: pnpm dev
```

Then open:

- Web app: <http://localhost:4321>
- API: <http://localhost:3000>
- API docs (non-production): <http://localhost:3000/docs> (OpenAPI JSON at `/openapi.json`)
- Health check: <http://localhost:3000/api/health>

Run only one side if that is all you need:

```bash
just dev-api                         # API only  (pnpm --filter @app/api dev)
just dev-web                         # web only  (pnpm --filter @app/web dev)
```

> **Making the dev web app talk to the dev API.** The web app reads its API base from
> `PUBLIC_API_URL` and defaults to same-origin (`''`). The Astro dev server (port 4321) does
> **not** proxy `/api/*` to the API (port 3000), so with the default a request to
> `http://localhost:4321/api/health` 404s. To point the dev web app at the dev API, set
> `PUBLIC_API_URL=http://localhost:3000` in the web app's environment (for example
> `PUBLIC_API_URL=http://localhost:3000 just dev-web`). In production the web app and API are
> same-origin, so `PUBLIC_API_URL` is left unset there.

## Type-checking and building

```bash
just check                           # type-check every workspace (pnpm --recursive check)
just build                           # build every workspace       (pnpm --recursive build)
just lint                            # run the lint helpers (type-check + Prisma validate)
just run                             # production-style: ensure DB, build, serve apps/api/dist
```

There is no separate automated test suite configured in this repo yet; `just check`
(TypeScript and `astro check`) is the current correctness gate, and it is what CI runs via
`just ci` (`db-generate` then `check` then `build`).

## Database (Prisma)

The API uses Prisma over a local SQLite database in development.

```bash
just db-generate                     # regenerate the Prisma client after editing the schema
just db-migrate                      # create/apply migrations against the local SQLite DB
just format                          # format the Prisma schema
```

The schema lives at `apps/api/prisma/schema.prisma`. `DATABASE_URL` is read from
`apps/api/.env` (the example uses `file:./dev.db`).

## Running with Docker

The API ships as a container; the Compose stack also serves as the Komodo Stack
definition.

```bash
just docker-build                    # build the production image (BuildKit)
just docker-config                   # validate the compose file
just docker-up                       # start the stack detached
just docker-down                     # stop the stack
```

Enable BuildKit (`DOCKER_BUILDKIT=1`, the default in recent Docker) so the build cache
mounts work. No secrets or `.env` files are copied into the image.

## Deploying

Two independent targets. Both are optional for local development, and deploys are governed
by least-privilege rules documented in the dev guides.

### Komodo (Docker container, Node runtime)

```bash
just komodo-probe                    # read-only: version, visible stacks/servers, target stack
just komodo-status                   # read-only: target stack status
just komodo-deploy                   # deploy the stack (prompts for confirmation)
```

Credentials (`KOMODO_URL`, `KOMODO_API_KEY`, `KOMODO_API_SECRET`) come from a root `.env`
only; never commit or print them. Copy `.env.example` to `.env` and fill in the key/secret
from the Komodo UI. Full flow: [`docs/dev/deployment.md`](./docs/dev/deployment.md).

### Cloudflare (Workers + D1 for the API, Pages for the web)

```bash
just cf-check                        # validate the Worker config + bundle (no account needed)
just cf-dev-api                      # run the API locally on the Workers runtime (local D1)
just cf-dev-web                      # run the web app locally on the Pages runtime
just cf-migrate-local                # apply D1 SQL migrations to the local database
just cf-migrate                      # apply D1 SQL migrations to the remote database
just cf-deploy-api                   # deploy the API Worker (attaches the /api/* route)
just cf-deploy-web                   # build + deploy the web app to Pages
```

Authenticate Wrangler with `npx wrangler login` (or a `CLOUDFLARE_API_TOKEN`, a secret,
never committed). Wrangler is already a dev dependency. The live demo is at
<https://kasigla.kuyacarlo.dev> with the API same-origin at `/api/*`. Full flow:
[`docs/dev/deployment-cloudflare.md`](./docs/dev/deployment-cloudflare.md).

## Task reference

Run `just` with no arguments to list every available recipe. The full tool reference,
including the private helpers and the pnpm scripts each recipe wraps, is in
[`docs/dev/devtools.md`](./docs/dev/devtools.md).

## Troubleshooting

Common issues (wrong Node version, missing `just`/`pnpm` on `PATH`, blocked `.envrc`,
Prisma/database errors, ports already in use) and their fixes are covered in the
Troubleshooting section of
[`docs/dev/getting-started.md`](./docs/dev/getting-started.md#troubleshooting). Quick
pointers:

- **Port already in use** — the API uses `PORT` (default 3000) and the web app uses 4321.
  Stop the conflicting process, or override `PORT` / `WEB_ORIGIN` in `apps/api/.env`.
- **Prisma or database errors** — ensure `apps/api/.env` exists with `DATABASE_URL` set,
  then re-run `just db-generate` and `just db-migrate`.
