# Deployment (Cloudflare) — alternative to Komodo

Cloudflare is a second, independent deploy target alongside [Komodo](./deployment.md):

- **API (Hono)** → **Cloudflare Workers**, backed by **D1** (Cloudflare's SQLite).
- **Web (Astro)** → **Cloudflare Pages** (static build).

The app code is **dual-targeted**: the same routes run under Node (Komodo/Docker) and under
the Workers runtime. Nothing here changes the Komodo path.

## Live deployment

Everything is served from a **single origin** on the `kuyacarlo.dev` zone (account
`magallanes`):

| What | URL |
| --- | --- |
| Web (Pages project `kasigla`) | <https://kasigla.kuyacarlo.dev> |
| API, same-origin | `https://kasigla.kuyacarlo.dev/api/*` |
| API direct fallback (Worker `kasigla-api`) | <https://kasigla-api.kuyacarlo.workers.dev> |
| D1 database | `kasigla` (bound as `env.DB`) |

A Worker **route** `kasigla.kuyacarlo.dev/api/*` sends API paths to the Worker; Pages serves
everything else. Because the site and API share one origin, the web app calls **relative
`/api/...`** and **no CORS configuration is needed** in production.

## How the dual target works

- `apps/api/src/app.ts` builds the Hono app (routes) and is shared by both entries.
- `apps/api/src/index.ts` — **Node** entry (`@hono/node-server`), used by Docker/Komodo.
  Uses the Prisma client singleton against `DATABASE_URL` (SQLite file).
- `apps/api/src/worker.ts` — **Workers** entry (`export default { fetch }`). Builds a
  per-request Prisma client via `@prisma/adapter-d1` bound to `env.DB`.
- `apps/web` builds to a static site (`dist/`) that Pages serves. It calls the API at
  `PUBLIC_API_URL` when set (local dev), otherwise same-origin `/api` (production).

## Prerequisites

- A Cloudflare account with the `kuyacarlo.dev` zone (currently the `magallanes` account).
- Authenticate Wrangler locally: `npx wrangler login` (or set `CLOUDFLARE_API_TOKEN` /
  `CLOUDFLARE_ACCOUNT_ID` in your environment — treat the token as a secret; never commit
  it). Wrangler is already a dev dependency in both apps.

## API → Workers + D1

The D1 database `kasigla` already exists and its `database_id` is set in
`apps/api/wrangler.jsonc`. To recreate from scratch:

1. **Create the D1 database:**
   ```bash
   cd apps/api
   npx wrangler d1 create kasigla
   ```
   Copy the printed `database_id` into `apps/api/wrangler.jsonc`.

2. **Apply the schema.** Prisma Migrate does not support D1, so the schema is applied as
   raw SQL from `apps/api/migrations/` via Wrangler:
   ```bash
   just cf-migrate-local   # local D1 (for `wrangler dev`)
   just cf-migrate         # remote D1 (production)
   ```

3. **Develop / deploy:**
   ```bash
   just cf-dev-api        # local Workers runtime + local D1
   just cf-check          # validate config + bundle (no account needed)
   just cf-deploy-api     # deploy to Workers (attaches the /api/* route)
   ```

The `kasigla.kuyacarlo.dev/api/*` route is declared in `wrangler.jsonc` and attaches on
deploy. `workers_dev` is kept enabled so the `*.workers.dev` URL stays available as a
fallback.

## Web → Pages

The site is a static Astro build, so Pages serves `dist/` directly. In production the API
is same-origin, so no `PUBLIC_API_URL` is needed:

```bash
just cf-deploy-web     # builds, then deploys dist to the `kasigla` Pages project
```

The extensionless `/patient` and `/bhw` URLs redirect to their trailing-slash Pages routes
through `apps/web/public/_redirects`. Keep those rules when changing the role route paths;
Cloudflare Pages serves the generated `index.html` routes with trailing slashes.

The custom domain `kasigla.kuyacarlo.dev` is already attached to the `kasigla` Pages
project. For a brand-new project, create it first:

```bash
npx wrangler pages project create kasigla --production-branch master
```

### Pull request previews — `phasmaframe-web`

The `phasmaframe-web` Pages project is connected to `Phasmanastasis/PhasmaFrame` in the
`magallanes` Cloudflare account. Git integration builds pull requests and other branches
as public previews, and posts preview links on pull requests. Production deployments from
`master` are disabled for this project.

Pages builds from the repository root with `pnpm --filter @app/web run build` and publishes
`apps/web/dist`. The preview branch setting is `all`. Push a branch commit to trigger a
preview deployment. Use Git integration for PR previews; `cf-deploy-web` remains the
Wrangler upload path for the existing `kasigla` Pages project.

## Secrets

- Never commit or print `CLOUDFLARE_API_TOKEN` or any account credential. Refer to it by
  name. Wrangler reads it from the environment or your `wrangler login` session.
- `WEB_ORIGIN` and `PUBLIC_API_URL` are **not** secrets — they are public URLs.
- The committed D1 `database_id` is an environment identifier, not a secret.

## Relationship to Komodo

| | Komodo | Cloudflare |
| --- | --- | --- |
| API runtime | Node (Docker container) | Workers |
| Database | SQLite file on a volume | D1 (`kasigla`) |
| Web | served separately | Pages (`kasigla`), same origin as the API |
| Entry | `src/index.ts` | `src/worker.ts` |

Both read the same routes from `src/app.ts`, so feature work does not diverge. Use whichever
target is available; Cloudflare is the backup if the Komodo instance is down.
