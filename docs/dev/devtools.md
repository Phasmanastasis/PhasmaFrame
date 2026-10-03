# Dev tools: the `justfile`

This project uses [`just`](https://github.com/casey/just) as its task runner. The
`justfile` at the repo root wraps the real `pnpm` scripts and the Prisma/SQLite setup
so there is one consistent entrypoint for common tasks.

Run `just` (or `just default`) with no arguments to list every **public** recipe:

```bash
just
# or explicitly
just --list
just --list --unsorted   # same recipes, in file order
```

## Conventions

- Every public recipe has a single `# Description` comment directly above it. `just --list`
  renders those as the recipe's docs, and the comment convention lets tooling parse
  recipe names + descriptions.
- `[private]` recipes are hidden from `just --list`. They are small building blocks that
  the public aggregator recipes (`lint`, `format`, `dev`, `run`, `ci`) call via `just <helper>`.
- `set dotenv-load` auto-loads a `.env` file if present. `set shell := ["bash", "-cu"]`
  gives predictable shell behavior.
- Exported `API_URL` / `WEB_URL` are composed from env vars with fallbacks via
  `env_var_or_default`, so recipes work out of the box without a `.env` but can be overridden.

### Exported variables

| Variable  | Composed from                         | Default                 |
| --------- | ------------------------------------- | ----------------------- |
| `API_URL` | `http://localhost:${PORT}`            | `http://localhost:3000` |
| `WEB_URL` | `${WEB_ORIGIN}`                       | `http://localhost:4321` |

## Setup recipes

### `install`
Install all workspace dependencies.
```bash
just install          # → pnpm install
```

### `db-generate`
Generate the Prisma client for `apps/api`.
```bash
just db-generate      # → pnpm db:generate
```

### `db-migrate`
Create/apply the local SQLite migrations for `apps/api`.
```bash
just db-migrate       # → pnpm db:migrate
```

## Dev & run recipes

### `dev`
Run the API and web dev servers together with hot reload. Depends on the private
`ensure-db` helper, which generates the Prisma client first.
```bash
just dev              # ensure-db → pnpm dev
```

### `dev-api`
Run only the API dev server (`tsx watch`).
```bash
just dev-api          # → pnpm dev:api
```

### `dev-web`
Run only the web dev server (`astro dev`).
```bash
just dev-web          # → pnpm dev:web
```

### `run`
Production-style run: ensure the DB client, build every workspace, then serve the
compiled API entry from `apps/api/dist`. Depends on `ensure-db` and `build`.
```bash
just run              # ensure-db → build → NODE_ENV=production node apps/api/dist/index.js
```

## Build & check recipes

### `build`
Build every workspace.
```bash
just build            # → pnpm build
```

### `check`
Type-check every workspace (`tsc --noEmit` for the API/shared packages, `astro check`
for the web app).
```bash
just check            # → pnpm check
```

### `ci`
Run the checks the way CI does: generate the Prisma client, type-check, then build.
```bash
just ci               # just db-generate → just check → just build
```

## Lint & format recipes

### `lint`
Aggregator that runs each private per-type lint helper in order. It never repeats a
command a helper already owns.
```bash
just lint             # lint-ts → lint-prisma → lint-js → lint-css → lint-astro
```

### `format`
Aggregator that formats source files in place.
```bash
just format           # format-prisma
```

## Private helpers

These do not appear in `just --list`. They are called by the aggregators above.

| Helper          | Called by | What it does                                                        |
| --------------- | --------- | ------------------------------------------------------------------- |
| `ensure-db`     | `dev`, `run` | Generates the Prisma client (`pnpm db:generate`).                |
| `lint-ts`       | `lint`    | Type-checks the codebase (`pnpm check`).                            |
| `lint-prisma`   | `lint`    | Validates the Prisma schema (`prisma validate`).                    |
| `lint-js`       | `lint`    | Placeholder (`@ exit 0`) — no JS linter configured yet.             |
| `lint-css`      | `lint`    | Placeholder (`@ exit 0`) — no CSS linter configured yet.            |
| `lint-astro`    | `lint`    | Placeholder (`@ exit 0`) — `astro check` already runs via `lint-ts`.|
| `format-prisma` | `format`  | Formats the Prisma schema (`prisma format`).                        |

The `@ exit 0` placeholders exist so the `lint` aggregator does not need to change when
a real linter for that file type is added later — just fill in the helper body.

## Keeping this in sync

The recipe names and docs above mirror the `justfile`. After editing recipes, re-run:

```bash
just --list
just --list --unsorted
just --fmt --check
```

and update this document to match.
