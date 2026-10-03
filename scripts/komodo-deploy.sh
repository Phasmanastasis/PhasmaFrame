#!/usr/bin/env bash
# Komodo deploy helper for PhasmaFrame.
#
# Guardrails (see .kiro/steering/komodo-deploy.md and docs/dev/deployment.md):
#   - Reads credentials from environment variables ONLY. Never prints the secret.
#   - Operates on the single named stack ($KOMODO_STACK) and no other resource.
#   - deploy/destroy require interactive human confirmation.
#   - Never creates, deletes, or modifies permissions on Komodo resources.
#
# Usage:
#   komodo-deploy.sh probe      # read-only: version, list stacks/servers, show target stack
#   komodo-deploy.sh status     # read-only: inspect the target stack
#   komodo-deploy.sh deploy     # execute DeployStack (asks for confirmation)
#   komodo-deploy.sh destroy    # execute DestroyStack (asks for confirmation)
#
set -euo pipefail

: "${KOMODO_URL:?Set KOMODO_URL in your environment (.env)}"
: "${KOMODO_API_KEY:?Set KOMODO_API_KEY in your environment (.env) — never commit it}"
: "${KOMODO_API_SECRET:?Set KOMODO_API_SECRET in your environment (.env) — never commit it}"
# The one stack this project is allowed to touch. Override via env if your stack
# is named differently in Komodo, but it must remain a single named stack.
KOMODO_STACK="${KOMODO_STACK:-phasmaframe}"

base="${KOMODO_URL%/}"

# Make a Komodo API call. $1 = path (e.g. read/ListStacks), $2 = JSON body.
# Credentials are passed via headers from env; they are never echoed.
# On a non-2xx HTTP status or a top-level JSON `error` field, print a clear,
# secret-free message to stderr and return non-zero so callers/CI can detect it.
komo() {
  local path="$1" body="${2:-{}}" resp http out
  # Append the HTTP status on its own trailing line, then split it off.
  resp="$(curl -sS -m 30 -w $'\n%{http_code}' -X POST "$base/$path" \
    -H "Content-Type: application/json" \
    -H "X-Api-Key: ${KOMODO_API_KEY}" \
    -H "X-Api-Secret: ${KOMODO_API_SECRET}" \
    -d "$body")" || {
      echo "ERROR: request to '$path' failed (network/TLS/timeout)." >&2
      return 1
    }
  http="${resp##*$'\n'}"
  out="${resp%$'\n'*}"
  # Surface the body for the caller.
  printf '%s\n' "$out"
  # Detect a top-level JSON error field, if the body is JSON.
  local apierr=""
  if command -v jq >/dev/null 2>&1; then
    apierr="$(printf '%s' "$out" | jq -r 'if type=="object" and has("error") then (.error|tostring) else "" end' 2>/dev/null || true)"
  fi
  if [ "${http:0:1}" != "2" ]; then
    echo "ERROR: '$path' returned HTTP ${http}.${apierr:+ API error: ${apierr}}" >&2
    return 1
  fi
  if [ -n "$apierr" ]; then
    echo "ERROR: '$path' returned an API error: ${apierr}" >&2
    return 1
  fi
}

confirm() {
  local action="$1"
  echo "About to '$action' the Komodo stack: ${KOMODO_STACK}"
  echo "Target instance: ${base}"
  read -r -p "Type the stack name to confirm (${KOMODO_STACK}): " reply
  if [ "$reply" != "$KOMODO_STACK" ]; then
    echo "Confirmation did not match. Aborting." >&2
    exit 1
  fi
}

cmd="${1:-}"
case "$cmd" in
  probe)
    echo "== GetVersion =="
    komo read/GetVersion '{}'
    echo
    echo "== ListStacks (what the service user can see) =="
    komo read/ListStacks '{}'
    echo
    echo "== ListServers =="
    komo read/ListServers '{}'
    echo
    echo "== GetStack: ${KOMODO_STACK} (permission/visibility on the target) =="
    komo read/GetStack "{\"stack\":\"${KOMODO_STACK}\"}"
    echo
    ;;
  status)
    echo "== GetStack: ${KOMODO_STACK} =="
    komo read/GetStack "{\"stack\":\"${KOMODO_STACK}\"}"
    echo
    ;;
  deploy)
    confirm "deploy"
    echo "== DeployStack: ${KOMODO_STACK} =="
    deploy_resp="$(komo execute/DeployStack "{\"stack\":\"${KOMODO_STACK}\"}")"
    printf '%s\n' "$deploy_resp"
    # DeployStack returns an Update object; a false `success` means the deploy was rejected.
    if command -v jq >/dev/null 2>&1; then
      ok="$(printf '%s' "$deploy_resp" | jq -r '.success // "unknown"' 2>/dev/null || echo unknown)"
      if [ "$ok" = "false" ]; then
        echo "ERROR: DeployStack reported success=false for ${KOMODO_STACK}." >&2
        exit 1
      fi
    fi
    echo
    echo "== Post-deploy status =="
    komo read/GetStack "{\"stack\":\"${KOMODO_STACK}\"}"
    echo
    ;;
  destroy)
    confirm "destroy"
    echo "== DestroyStack: ${KOMODO_STACK} =="
    komo execute/DestroyStack "{\"stack\":\"${KOMODO_STACK}\"}"
    echo
    ;;
  *)
    echo "Usage: $0 {probe|status|deploy|destroy}" >&2
    exit 2
    ;;
esac
