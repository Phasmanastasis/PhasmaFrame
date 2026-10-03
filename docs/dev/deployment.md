# Deployment (Komodo)

The API is deployed to a [Komodo](https://komo.do) instance that runs the repo's
`docker-compose.yaml` as a **Stack**. This page covers the flow, prerequisites, and
troubleshooting. The binding rules live in the always-on steering file
`.kiro/steering/komodo-deploy.md`.

## Live deployment

- **Base URL:** <https://phasmanastasis.lyra-on.top>
- **Health endpoint:** `GET /api/health` → `200` `{"status":"ok","service":"api"}`
- The stack serves the API only. The site root `/` returns `404` (there is no web app
  mounted at the root in this deployment).
- TLS is a Let's Encrypt certificate for the hostname, terminated by the reverse proxy in
  front of the stack; plain `http` redirects to `https`.

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

## How to verify the deployment

Read-only checks against the live hostname (keep the request count low):

```bash
HOST=phasmanastasis.lyra-on.top

# 1. DNS resolves to the proxy host.
getent hosts "$HOST"

# 2. TLS: valid Let's Encrypt cert for the name, with expiry.
echo | openssl s_client -servername "$HOST" -connect "$HOST":443 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates

# 3a. http redirects to https.
curl -sS -o /dev/null -D - "http://$HOST/" | grep -i '^location:'

# 3b. Health endpoint returns 200 + the expected JSON.
curl -sS "https://$HOST/api/health"      # => {"status":"ok","service":"api"}

# 3c. Root is API-only; it returns 404 (no web app at /).
curl -sS -o /dev/null -w '%{http_code}\n' "https://$HOST/"   # => 404
```

Expected results: DNS resolves; the certificate is issued by Let's Encrypt and in date;
`http` 301/302-redirects to `https`; `/api/health` returns `200` with
`{"status":"ok","service":"api"}`; `/` returns `404`. The public JSON from `/api/health`
must match what the container reports internally.

Cross-check in Komodo (or via the deploy tooling): the stack state is **running** and the
`…-api-1` container is **healthy** with no restarts — `just komodo-status`, or the stack's
page in the Komodo UI.

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
