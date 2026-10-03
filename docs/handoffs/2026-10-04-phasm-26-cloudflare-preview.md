# PHASM-26 — Cloudflare Pages previews

## Scope

Isolate Cloudflare Pages Git integration details from frontend PR #29. This change sets the Pages account ID in the existing `phasmaframe-web` Wrangler config and documents the connected Git preview setup. It does not modify app UI or deploy Cloudflare resources.

## Configuration

- Pages project: `phasmaframe-web` in the `magallanes` Cloudflare account.
- Git repository: `Phasmanastasis/PhasmaFrame`.
- Preview branches: all branches and pull requests; preview URLs are public.
- Build command: `pnpm --filter @app/web run build` from repository root.
- Build output: `apps/web/dist`.
- Production deployment from `master`: disabled for `phasmaframe-web`.
- Existing `kasigla` deployment remains documented separately.

## Verification

- `git diff --check` — passed.
- `pnpm --filter @app/web run check` — passed, zero errors/warnings/hints.
- `pnpm --filter @app/web run build` — passed; Astro emitted existing dependency annotation warnings from Zod.
- `pnpm --filter @app/web exec wrangler pages dev dist --ip 127.0.0.1 --port 8790` — passed; local Pages server started and was stopped after verification.

No Wrangler deploy or Cloudflare resource mutation was performed.
