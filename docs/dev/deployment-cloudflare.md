# Deployment (Cloudflare) — alternative to Komodo

Cloudflare is a second, independent deploy target alongside [Komodo](./deployment.md):

- **API (Hono)** → **Cloudflare Workers**, backed by **D1** (Cloudflare's SQLite).
- **Web (Astro)** → **Cloudflare Pages** (static build).

The app code is **dual-targeted**: the same routes run under Node (Komodo/Docker) and under
the Workers runtime. Nothing here changes the Komodo path.

## How the dual target works

- `apps/api/src/app.ts` builds the Hono app (routes) and is shared by both entries.
- `apps/api/src/index.ts` — **Node** entry (`@hono/node-server`), used by Docker/Komodo.
  Uses the Prisma client singleton against `DATABASE_URL` (SQLite file).
- `apps/api/src/worker.ts` — **Workers** entry (`export default { fetch }`). Builds a
  per-request Prisma client via `@prisma/adapter-d1` bound to `env.DB`.
- `apps/web` builds to a static site (`dist/`) that Pages serves. It calls the API via
  `PUBLIC_API_URL` (set at build time to the deployed Worker URL).

## Prerequisites

- A Cloudflare account.
- Authenticate Wrangler locally: `npx wrangler login` (or set `CLOUDFLARE_API_TOKEN` /
  `CLOUDFLARE_ACCOUNT_ID` in your environment — treat the token as a secret; never commit
  it). Wrangler is already a dev dependency in both apps.

## API → Workers + D1

1. **Create the D1 database** (one time):
   ```bash
   cd apps/api
   npx wrangler d1 create phasmaframe
   ```
   Copy the printed `database_id` into `apps/api/wrangler.jsonc`, replacing
   `REPLACE_WITH_D1_DATABASE_ID`.

2. **Apply the schema.** Prisma Migrate does not support D1, so the schema is applied as
   raw SQL from `apps/api/migrations/` via Wrangler:
   ```bash
   just cf-migrate-local   # local D1 (for `wrangler dev`)
   just cf-migrate         # remote D1 (production)
   ```

3. **Set the CORS origin.** Point the Worker at the deployed Pages URL (not a secret):
   ```bash
   cd apps/api && npx wrangler deploy --var WEB_ORIGIN:https://<your-pages-domain>
   ```
   or edit the `vars.WEB_ORIGIN` value in `wrangler.jsonc`.

4. **Develop / deploy:**
   ```bash
   just cf-dev-api        # local Workers runtime + local D1
   just cf-check          # validate config + bundle (no account needed)
   just cf-deploy-api     # deploy to Workers (needs auth + real database_id)
   ```

## Web → Pages

The site is a static Astro build, so Pages serves `dist/` directly.

The `phasmaframe-web` Pages project is connected to `Phasmanastasis/PhasmaFrame` in
the `magallanes` Cloudflare account. Pull requests and other branches build public
preview deployments, and Pages posts the preview link on pull requests. Production
deployments from `master` are currently disabled.

Push a commit to a branch to trigger its preview deployment. The Pages build runs from
the repository root with `pnpm --filter @app/web run build`, publishing
`apps/web/dist`. The preview branch setting is `all`.

```bash
# Point the web app at the deployed API, then build + deploy:
PUBLIC_API_URL=https://<your-worker-subdomain>.workers.dev just cf-deploy-web
```

`cf-deploy-web` performs a Wrangler upload to Pages. Use the Git integration for PR
previews so the build runs from the branch and Pages adds its preview link to the PR.

## Secrets

- Never commit or print `CLOUDFLARE_API_TOKEN` or any account credential. Refer to it by
  name. Wrangler reads it from the environment or your `wrangler login` session.
- `WEB_ORIGIN` and `PUBLIC_API_URL` are **not** secrets — they are public URLs.
- The committed `database_id` placeholder is intentionally fake; the real ID is not a
  secret but is environment-specific.

## Relationship to Komodo

| | Komodo | Cloudflare |
| --- | --- | --- |
| API runtime | Node (Docker container) | Workers |
| Database | SQLite file on a volume | D1 |
| Web | served separately | Pages (static) |
| Entry | `src/index.ts` | `src/worker.ts` |

Both read the same routes from `src/app.ts`, so feature work does not diverge. Use whichever
target is available; Cloudflare is the backup if the Komodo instance is down.
