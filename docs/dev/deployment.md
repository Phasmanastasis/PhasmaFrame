# Deployment (Komodo)

The API is deployed to a [Komodo](https://komo.do) instance that runs the repo's
`docker-compose.yaml` as a **Stack**. This page covers the flow, prerequisites, and
troubleshooting. The binding rules live in the always-on steering file
`.kiro/steering/komodo-deploy.md`.

## Prerequisites

1. **Credentials in `.env`** (root), never committed:
   - `KOMODO_URL` — e.g. `https://komodo-ckn-omv-main.lyra-on.top`
   - `KOMODO_API_KEY`, `KOMODO_API_SECRET` — the **service user's** API key/secret, created
     in the Komodo UI under *Settings → Profile → API Keys*.
   - Optional: `KOMODO_STACK` (defaults to `phasmaframe`) — the one stack this project may
     touch.
2. The Komodo **Stack** must exist and point at this repo's compose file (an admin creates
   it; the service user only deploys it — see permissions below).

## API shape (verified)

- `POST {KOMODO_URL}/{read|write|execute}/{Request}`
- Headers: `Content-Type: application/json`, `X-Api-Key`, `X-Api-Secret`
- Body: JSON params; errors return `{ "error": ..., "trace": [...] }`.

## Least-privilege rules (summary)

The service user is intentionally **non-admin**. Agents and tooling must:

- act only on the single named stack (`KOMODO_STACK`), never other resources;
- ask a human for confirmation immediately before any deploy/redeploy/destroy;
- never create, delete, rename, or change permissions on Komodo resources;
- read credentials from env only, never printing/committing the secret;
- report stack status and logs after a deploy.

If an action is denied, **stop** and report what an admin must do in the Komodo UI. Do not
work around it.

## Flow

```bash
# 1. One-time (and whenever unsure): see what the service user can actually do.
just komodo-probe     # version, visible stacks/servers, GetStack on the target

# 2. Check current state.
just komodo-status

# 3. Deploy (prompts: type the stack name to confirm).
just komodo-deploy    # runs execute/DeployStack, then prints post-deploy status
```

All three wrap `scripts/komodo-deploy.sh`.

## Service-user permissions

Run `just komodo-probe` once credentials are in `.env` and record the result here. What to
look for:

- **ListStacks** should include `phasmaframe` (or your `KOMODO_STACK`). If it is missing,
  the service user has no access to it — an admin must grant **Execute** (deploy) on that
  stack.
- **GetStack** on the target should succeed. A permission error means the same.
- Admin-only actions (creating stacks/servers, changing permissions) are expected to be
  **denied** — that is correct; do not attempt to work around it.

> Status as of writing: credentials were not yet present in `.env`, so the probe has not
> been run. Fill `.env` and run `just komodo-probe`, then paste the findings here.

## Troubleshooting

- **`must attach either AUTHORIZATION header ... OR pass X-API-KEY and X-API-SECRET`** —
  credentials are missing/empty in `.env`. Fill `KOMODO_API_KEY` / `KOMODO_API_SECRET`.
- **403 / permission denied on the stack** — the service user lacks access. Ask an admin to
  grant Execute on the `phasmaframe` stack. Do not escalate or use another account.
- **Stack not found** — the Stack has not been created in Komodo yet, or `KOMODO_STACK`
  doesn't match its name. An admin creates it pointing at this repo's compose file.
- **Deploy succeeds but the container is unhealthy** — check the compose healthcheck and
  the API logs in Komodo; verify `DATABASE_URL` and the data volume. See the Docker section
  in `devtools.md`.

## Exit codes

The `komodo-*` recipes exit **non-zero** when the Komodo API returns a non-2xx HTTP status
or a JSON body with a top-level `error` (for example a wrong `KOMODO_STACK`, which returns
HTTP 500 `did not find any Stack matching …`), and `komodo-deploy` also fails if
`DeployStack` reports `success=false`. A successful `probe`/`status`/`deploy` exits 0.
Error messages are written to stderr and never contain the API key or secret.
