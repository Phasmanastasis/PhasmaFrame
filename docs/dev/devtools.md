# Dev tools

A reference for the development tooling in this repository, one section per tool. For
installation instructions, see [getting-started.md](./getting-started.md).

## How the tools relate

- **pnpm** is the package manager. `package.json` holds only the scripts the JS ecosystem
  expects to find by name (`dev`, `build`, `check`) plus the Prisma helpers CI calls
  (`db:generate`, `db:migrate`). Those scripts contain the actual tool invocations.
- **just** is a thin orchestration layer on top. Its recipes call `pnpm run <script>`
  rather than duplicating command lines, and it owns everything cross-cutting (lint
  everything, project setup, dev/run flows, non-JS tasks). No command is defined in both
  places.
- **direnv** (optional) auto-loads environment variables from `.env` files when you enter
  the project directory. `just` loads `.env` on its own via `set dotenv-load`, so direnv
  is a convenience for your interactive shell, not a requirement.
- **Prisma** manages the database schema and the local SQLite database for the API.
- **Docker** (+ Compose) builds and runs the API as a container; the compose file doubles
  as the Komodo Stack definition.
- **Komodo** is the deploy target. The deploy tooling calls Komodo's HTTP API using
  credentials from `.env`; it is governed by a strict least-privilege rule
  (see `docs/dev/deployment.md` and the Komodo deploy steering).

## just

[`just`](https://github.com/casey/just) runs the project's task recipes from the root
`justfile`. Run `just` with no arguments to list every **public** recipe:

```bash
just                     # lists public recipes (alias for `just --list`)
just --list              # same
just --list --unsorted   # same recipes, in file order
```

Conventions used in the `justfile`:

- Every public recipe has a single `# Description` comment directly above it; `just --list`
  renders those as docs.
- `[private]` recipes are hidden from `just --list`; they are building blocks called by the
  public aggregators (`lint`, `format`, `dev`, `run`, `ci`) via `just <helper>`.
- `set dotenv-load` auto-loads a root `.env`. `set shell := ["bash", "-cu"]` gives
  predictable shell behavior.
- Exported `API_URL` / `WEB_URL` are composed from env vars via `env_var_or_default`, so
  recipes work without a `.env` but can be overridden.

### Public recipes

| Recipe        | Params (default) | What it does                                                        | Example           |
| ------------- | ---------------- | ------------------------------------------------------------------- | ----------------- |
| `default`     | —                | Lists all public recipes (`just -l`).                               | `just`            |
| `install`     | —                | Install all workspace dependencies (`pnpm install`).                | `just install`    |
| `db-generate` | —                | Generate the Prisma client (`pnpm run db:generate`).                | `just db-generate`|
| `db-migrate`  | —                | Create/apply local SQLite migrations (`pnpm run db:migrate`).       | `just db-migrate` |
| `check`       | —                | Type-check every workspace (`pnpm run check`).                      | `just check`      |
| `test`        | `+args=""`       | Run every workspace's unit tests (`pnpm run test`); flags via `--`. | `just test`       |
| `test-shared` | `+args=""`       | Run `packages/shared` unit tests only.                              | `just test-shared`|
| `test-api`    | `+args=""`       | Run `apps/api` unit tests only.                                     | `just test-api`   |
| `test-mobile` | `+args=""`       | Run `apps/mobile` domain unit tests only.                           | `just test-mobile`|
| `test-web`    | —                | Prints why web has no unit tests (UI-only island).                  | `just test-web`   |
| `test-watch`  | `package`        | Watch mode for one package's tests (human devs).                    | `just test-watch @app/api`|
| `test-coverage`| `package`       | `node:test` coverage report for one package.                        | `just test-coverage @app/shared`|
| `build`       | —                | Build every workspace (`pnpm run build`).                           | `just build`      |
| `dev-api`     | —                | Run only the API dev server (`pnpm --filter @app/api dev`).         | `just dev-api`    |
| `dev-web`     | —                | Run only the web dev server (`pnpm --filter @app/web dev`).         | `just dev-web`    |
| `dev`         | —                | Run API + web dev servers (hot reload); runs `ensure-db` first.     | `just dev`        |
| `run`         | —                | Production-style: `ensure-db` → `build` → serve `apps/api/dist`.    | `just run`        |
| `lint`        | —                | Run every private lint helper in order.                             | `just lint`       |
| `format`      | —                | Format source files in place (Prisma schema).                       | `just format`     |
| `ci`          | —                | What CI runs: `db-generate` → `check` → `build` → `test`.          | `just ci`         |
| `docker-build`| —                | Build the production image (`docker build`).                        | `just docker-build`|
| `docker-config`| —               | Validate the compose file (`docker compose config`).                | `just docker-config`|
| `docker-up`   | —                | Start the compose stack detached.                                   | `just docker-up`  |
| `docker-down` | —                | Stop the compose stack.                                             | `just docker-down`|
| `komodo-probe`| —                | Read-only: Komodo version, visible stacks/servers, target stack.    | `just komodo-probe`|
| `komodo-status`| —               | Read-only: target Komodo stack status.                              | `just komodo-status`|
| `komodo-deploy`| —               | Deploy the Komodo stack (prompts for confirmation).                 | `just komodo-deploy`|

None of the current recipes take parameters.

### Private helpers

Hidden from `just --list`; called by the aggregators above.

| Helper          | Called by    | What it does                                                        |
| --------------- | ------------ | ------------------------------------------------------------------- |
| `ensure-db`     | `dev`, `run` | Generate the Prisma client (`pnpm run db:generate`).                |
| `lint-ts`       | `lint`       | Type-check the codebase (`pnpm run check`).                         |
| `lint-prisma`   | `lint`       | Validate the Prisma schema (`prisma validate`).                     |
| `lint-js`       | `lint`       | Placeholder (`@ exit 0`) — no JS linter configured yet.             |
| `lint-css`      | `lint`       | Placeholder (`@ exit 0`) — no CSS linter configured yet.            |
| `lint-astro`    | `lint`       | Placeholder (`@ exit 0`) — `astro check` already runs via `lint-ts`.|
| `format-prisma` | `format`     | Format the Prisma schema (`prisma format`).                         |

The `@ exit 0` placeholders exist so `lint` does not need to change when a real linter for
that file type is added later — just fill in the helper body.

## direnv

[`direnv`](https://direnv.net/) loads environment variables when you `cd` into the project
and unloads them when you leave. It is **optional**: `just` already loads `.env` via
`set dotenv-load`, and nothing in the repo requires direnv.

What the root `.envrc` loads, and from where:

- `dotenv_if_exists .env` — a root `.env` if present.
- `dotenv_if_exists apps/api/.env` — the API's environment (copy from
  `apps/api/.env.example`).
- `watch_file` on `.env`, `apps/api/.env`, and `apps/api/.env.example` — changing any of
  these reloads the environment automatically.

`.envrc` is executable shell code, so direnv refuses to run it until you trust it:

```bash
direnv allow     # trust and load; re-run after any change to .envrc
direnv status    # show whether the current .envrc is allowed and loaded
```

Re-run `direnv allow` whenever `.envrc` changes.

## pnpm / package.json scripts

[pnpm](https://pnpm.io/) is the package manager (pinned via `packageManager` in
`package.json`). The repo keeps only the scripts that tools call by name; the `justfile`
wraps these rather than duplicating them.

| Script        | Command                                                | Called by                          |
| ------------- | ------------------------------------------------------ | ---------------------------------- |
| `dev`         | `pnpm --parallel --filter @app/api --filter @app/web dev` | README, `just dev`, editors     |
| `build`       | `pnpm --recursive build`                               | CI, hosting platforms, `just build`|
| `check`       | `pnpm --recursive check`                               | CI, `just check`                   |
| `test`        | `pnpm --recursive --if-present test`                   | `just test`, `just ci`             |
| `db:generate` | `pnpm --filter @app/api db:generate`                   | CI, `just db-generate`             |
| `db:migrate`  | `pnpm --filter @app/api db:migrate`                    | README, `just db-migrate`          |

Per-app dev commands (`pnpm --filter @app/api dev` / `@app/web dev` / `@app/patient dev`) are invoked directly
by the `dev-api` / `dev-web` recipes, so there are no `dev:api` / `dev:web` scripts to keep
in sync.

Each workspace has its own scripts (not called directly in day-to-day work):

- `apps/api`: `dev` (`tsx watch src/index.ts`), `build` (`tsc`), `check` (`tsc --noEmit`),
  `db:generate` (`prisma generate`), `db:migrate` (`prisma migrate dev`),
  `test` (`node --import tsx --test`).
- `apps/web`: `dev` (`astro dev`), `check` (`astro check`), `build` (`astro build`),
  `test` (route map only). `/patient` and `/bhw` are separate role home screens and
  installable PWAs with distinct manifests, start URLs, and scopes; the service worker
  precaches both. See
  [testing.md](./testing.md) for web coverage limits.
- `packages/shared`: `build` / `check` (`tsc --noEmit`), `test` (`node --import tsx --test`).
- `apps/mobile`: `dev` (`expo start`), `web` (`expo start --web`), `build:web`
  (`expo export --platform web`), `check` (`tsc --noEmit`), and
  `test` (`node --import tsx --test`).

## Prisma

[Prisma](https://www.prisma.io/) manages the API's schema (`apps/api/prisma/schema.prisma`)
and the local SQLite database. You normally use it through just:

- `just db-generate` — regenerate the client after editing the schema.
- `just db-migrate` — create/apply migrations against the local SQLite DB.
- `just format` → `format-prisma` — format the schema file.
- `just lint` → `lint-prisma` — validate the schema.

## Docker

The API ships as a container. Files at the repo root:

- `Dockerfile` — lean multi-stage build (digest-pinned `node:22-bookworm-slim`, pnpm via
  Corepack with `--frozen-lockfile`, BuildKit cache mounts, a `pnpm deploy` bundle,
  non-root `node` user, `tini`, healthcheck on `/api/health`, exec-form `CMD`). No secrets
  or `.env` are copied in.
- `.dockerignore` — keeps the context small and secrets out (excludes `.env*` except
  `.env.example`, `.git`, `node_modules`, `dist`, `docs`, `.agents`, `.kiro`, …).
- `docker-compose.yaml` — no `version:` key; env via `environment`/`env_file` with
  defaults; `restart: unless-stopped`; a named volume for the SQLite DB; healthcheck.

Common commands (via just):

```bash
just docker-build     # build the image (BuildKit)
just docker-config    # validate the compose file
just docker-up        # run the stack detached
just docker-down      # stop it
```

Enable BuildKit (`DOCKER_BUILDKIT=1`, default in recent Docker) for the cache mounts. For
the full checklist and how to review these files, see the `docker-best-practices` skill
(`.kiro/skills/docker-best-practices/SKILL.md`).

## Komodo (deploy)

Deployment targets a [Komodo](https://komo.do) instance, which runs the compose file as a
**Stack**. The deploy tooling talks to Komodo's HTTP API
(`POST {KOMODO_URL}/{read|write|execute}/{Request}`, headers `X-Api-Key` / `X-Api-Secret`).

Credentials come from `.env` only (`KOMODO_URL`, `KOMODO_API_KEY`, `KOMODO_API_SECRET`) —
never commit or print them. Entry points:

```bash
just komodo-probe     # read-only: version, visible stacks/servers, target stack
just komodo-status    # read-only: target stack status
just komodo-deploy    # deploy the stack (asks you to type the stack name to confirm)
```

These wrap `scripts/komodo-deploy.sh`. Deploys are governed by a strict least-privilege
rule (one named stack, confirm before acting, no resource/permission changes). Full flow,
prerequisites, and troubleshooting: `docs/dev/deployment.md`.

## Cloudflare (alternative deploy)

A second, independent deploy target: the API runs on **Cloudflare Workers** backed by
**D1**, and the web app on **Cloudflare Pages**, both served from a single origin
(`kasigla.kuyacarlo.dev`, with the API same-origin at `/api/*`). [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
is a dev dependency in both apps; authenticate with `npx wrangler login` (or a
`CLOUDFLARE_API_TOKEN` — a secret, never committed). Entry points:

```bash
just cf-dev-api        # run the API locally on the Workers runtime (local D1)
just cf-dev-web        # run the web app locally on the Pages runtime
just cf-migrate-local  # apply D1 SQL migrations to the local database
just cf-migrate        # apply D1 SQL migrations to the remote database
just cf-check          # validate the Worker config + bundle (no account needed)
just cf-deploy-api     # deploy the API Worker (attaches the /api/* route)
just cf-deploy-web     # build + deploy the web app to Pages
```

Config lives in `apps/api/wrangler.jsonc` and `apps/web/wrangler.jsonc`; D1 schema is in
`apps/api/migrations/` (Prisma Migrate does not support D1). Full flow, prerequisites, and
the live URLs: `docs/dev/deployment-cloudflare.md`.

## Testing

Unit tests use the Node built-in test runner (`node:test`) with `tsx` for TypeScript, run
through the `test*` recipes above. The canonical reference — what is and isn't tested, the
blood-pressure rule caveats, known spec-vs-code gaps, conventions, and how to add a test —
is **[testing.md](./testing.md)**. Run `just test` before opening a PR.

## k6 (API smoke and load checks)

[k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) is an external CLI; it is not
installed through pnpm. `tests/k6/api.js` checks the API health response and reads the
examples list. Both requests are read-only.

Start the API against local D1 in one terminal:

```bash
just cf-migrate-local   # first run only; creates/applies migrations to local D1
just cf-dev-api         # Wrangler listens on http://localhost:8787
```

Run the smoke check from another terminal:

```bash
k6 run -e BASE_URL=http://localhost:8787 -e PROFILE=smoke tests/k6/api.js
```

Run the light load profile against the same local API:

```bash
k6 run -e BASE_URL=http://localhost:8787 -e PROFILE=load tests/k6/api.js
```

Smoke uses one virtual user and one iteration. Load uses five virtual users for 30 seconds,
with a one-second pause between iterations. Load checks currently require all checks to
pass, fewer than 1% failed HTTP requests, and p95 latency below 500 ms. These are starter
guardrails for local runs; compare results only under consistent conditions before treating
latency as a service target. Do not aim the load profile at production.

## Keeping this in sync

After editing recipes or scripts, re-run and update this document to match:

```bash
just --list
just --list --unsorted
just --fmt --check
```
