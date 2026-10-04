# Testing

How unit tests are run and written in this repository. This is the canonical testing
reference; `devtools.md` and `getting-started.md` link here instead of duplicating it.

## Runner

Tests use the **Node.js built-in test runner** (`node:test` + `node:assert/strict`) with
[`tsx`](https://github.com/esbuild-kit/tsx) as the TypeScript loader
(`node --import tsx --test`). This was already the setup in `apps/mobile`; it is now the
standard across the workspace.

Why this runner and not Vitest/Jest:

1. It ships with Node (no framework dependency tree to install, audit, or pin), and `tsx`
   is already a dependency used by the API dev server, so the only package that gained a
   dev dependency is `packages/shared` (it needed `tsx`).
2. The code under test is plain TypeScript (domain logic, Zod schemas, a Hono app). None of
   it needs a browser/DOM environment or a bundler-aware test runtime, so a heavier runner
   would add cost without adding capability.

## How to run

Everything is wired through `just` (recipes call the `pnpm` scripts; see `devtools.md`):

```bash
just test                 # every workspace's unit tests
just test -- --test-only  # pass flags through to node:test
just test-shared          # packages/shared only
just test-api             # apps/api only
just test-mobile          # apps/mobile domain only
just test-web             # apps/web route map + offline service-worker cache behavior
just test-watch @app/shared     # watch mode for one package (human devs)
just test-coverage @app/api     # node:test coverage report for one package
```

`just ci` runs `db-generate → check → build → test`, i.e. everything CI should run.

The suites are self-contained: a fresh clone that follows
[`getting-started.md`](./getting-started.md) (`just install`) can run `just test` with no
database, no `.env`, and no network.

## What is tested

| Area | Package | Covered behavior |
| --- | --- | --- |
| Shared contracts | `packages/shared` | Zod schemas: `healthResponseSchema`, `createExampleRequestSchema` (trim, min 1, max 80), `exampleResponseSchema` (ISO-8601 `createdAt`) — valid, boundary, invalid, and error-shape cases. |
| API routes | `apps/api` | The Hono app via in-process `app.request()` with a mocked Prisma client: `/api/health` body, `GET`/`POST /api/examples`, POST validation failures, unknown-route 404 status. No network, no real database. |
| Domain logic | `apps/mobile` | The pure `src/domain` layer: reading validation, the transfer-bundle codec (round-trip, determinism, versioning, malformed input), the repeat-safe/append-only import store, the import use-case stages, the Send/Receive transfer state machines, and the CSV summary builder. |
| Web routing and offline cache | `apps/web` | Role route mapping and the service worker's offline route aliases, query-string handling, and readable cache-miss response. |

## What is deliberately not tested, and why

- **`apps/web`** — role mapping (`src/lib/routes.ts`) and the service worker cache behavior
  (`public/offline-worker.js`) have focused unit coverage. The React islands themselves
  (`HealthHub.tsx`, `PatientFlow.tsx`, `ApiStatus.tsx`) are not unit-tested: their logic is
  DOM-rendered state and a `fetch` inside `useEffect`, which needs a DOM renderer and a
  Vite/`import.meta.env` environment — an integration concern, not a unit one.
- **Static markup / Tailwind classes / Astro pages** — pure presentation; snapshotting it
  tests nothing about behavior.
- **Prisma against a real database** — the API tests inject a fake Prisma client, so the
  query-building glue is exercised without a real SQLite/D1 file. End-to-end database
  behavior belongs to integration tests (see `tests/k6` for API smoke/load checks).
- **The transport mock, deploy tooling, and Komodo/Cloudflare paths** — environment- and
  network-bound; out of scope for unit tests.

## Blood-pressure rules: what the docs do and do not say

The product docs (`docs/prd.md`, `docs/sdd.md`, `docs/solution-brief.md`) require that a
reading records **systolic, diastolic, time, who measured, and who entered it** (note and
heart rate optional). They do **not** define any numeric validity ranges and do **not**
define any blood-pressure classification or thresholds.

Therefore:

- The tests assert the **required-field** and **structural** rules the docs state.
- The numeric bounds in `apps/mobile/src/domain/validation.ts` (systolic 60–260, diastolic
  40–160, and "diastolic must be lower than systolic") are an **implementation choice, not
  a documented clinical rule**. They are tested *as implemented* so the behavior is pinned,
  but they must not be read as a medical specification. If a clinician-reviewed range or a
  classification feature is ever added, update the docs first, then the tests.
- No classification/category logic is invented, because none exists in the docs or the
  code.

## Known spec-vs-code gaps (not failing tests)

These are behaviors described or implied around the product that are **not implemented** in
this repo. They are recorded here rather than covered by a passing test:

- **JSON 404 body.** A JSON `404 {"error":"Not Found"}` for unknown `/api/*` routes is not
  implemented — the Hono app has no `notFound` handler, so the default response is
  plain-text `404 Not Found`. The API tests assert the 404 **status** only. Adding the JSON
  body is a separate change (its own task/PR) if the team wants it.
- **API static-serving layer.** The Node API serves no static assets (in production the web
  app is served by Cloudflare Pages / the compose web path, not the API). There is no
  static layer in `apps/api` to unit-test.
- **Atomic import.** The SDD calls import "atomic". The in-memory store imports entries
  append-only and skips duplicates by id, so a repeated bundle adds no new ids; it does not
  implement transactional rollback across a partially-applied bundle. Tests cover the
  repeat-safe/append-only behavior that exists and this limitation is noted here.
- **Android project.** The docs describe an Android/Kotlin app; this repo is a TypeScript
  web/Expo monorepo. There is no `apps/android`, so there is no `test-android` recipe. The
  equivalent domain logic lives in `apps/mobile` and is tested there.

## Conventions

- Test files live in a `test/` directory per package (`__tests__/` in `apps/mobile`, kept
  for its existing history) and are named `*.test.ts`.
- Use `node:test` (`test`, and `describe`/`it` if preferred) and `node:assert/strict`.
- **One behavior per test.** The test name states the rule being checked, e.g.
  `"validateReading: rejects a diastolic equal to systolic"`.
- **Expected values come from the docs or from the rule**, never copied from the code's
  output. A test that only echoes the implementation proves nothing.
- Cover **boundaries, invalid input, and failure paths**, not just the happy path.
- **Deterministic and fast:** inject clocks/ids, no sleeps, no network, no `.env`, no real
  filesystem outside a temp dir, no dependence on test order.

## How to add a test

1. Put the file under the package's test directory, e.g.
   `packages/shared/test/my-rule.test.ts`.
2. Import the unit under test from `../src/...` and assert its behavior:

   ```ts
   import { test } from 'node:test';
   import assert from 'node:assert/strict';
   import { createExampleRequestSchema } from '../src/index';

   test('createExampleRequestSchema: rejects an empty name', () => {
     const result = createExampleRequestSchema.safeParse({ name: '' });
     assert.equal(result.success, false);
   });
   ```

3. Run `just test-shared` (or the matching package recipe) and then `just test`.
4. If a test exposes a real bug, **do not** weaken the test or silently fix the code inside
   a test change. Report it and fix it as its own task/PR (per the workflow rule), or raise
   it for a product/clinical decision if the fix is not purely technical.

Agents: run `just test` before opening any PR, and add or update tests whenever you change
behavior.
