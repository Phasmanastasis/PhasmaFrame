# Doc-comment convention: every public recipe has a single `# Description` line
# directly above it, so `just --list` and tooling can parse recipe names + docs.
# Private helpers are marked `[private]` and hidden from `just --list`.
#
# regex to match recipe names and their comments:
# ^    (?P<recipe>\S+)(?P<args>(?:\s[^#\s]+)*)(?:\s+# (?P<docs>.+))*

# direnv (.envrc) and this `dotenv-load` setting are redundant by design: direnv loads
# .env for interactive shells, while `dotenv-load` keeps `just` self-sufficient for
# people who don't use direnv and in CI. `set dotenv-load` is the formatter's canonical
# form of `set dotenv-load := true`.
set dotenv-load
set shell := ["bash", "-cu"]

# Composite values derived from env vars so recipes work without a .env but can be overridden.
export API_URL := "http://localhost:" + env_var_or_default("PORT", "3000")
export WEB_URL := env_var_or_default("WEB_ORIGIN", "http://localhost:4321")

# Docker image tag for build/deploy (override: `just IMAGE=foo docker-build`).
IMAGE := env_var_or_default("API_IMAGE", "phasmaframe-api:latest")

# Choose recipes
default:
    @ just -l

# Install all workspace dependencies
install:
    pnpm install

# Generate the Prisma client (apps/api)
db-generate:
    pnpm run db:generate

# Create/apply the local SQLite migrations (apps/api)
db-migrate:
    pnpm run db:migrate

# Type-check every workspace (tsc + astro check)
check:
    pnpm run check

# Build every workspace
build:
    pnpm run build

# Run the API dev server only (tsx watch)
dev-api:
    pnpm --filter @app/api dev

# Run the web dev server only (astro dev)
dev-web:
    pnpm --filter @app/web dev

[private]
ensure-db:
    @ pnpm run db:generate

# Run API + web dev servers together (hot reload)
dev: ensure-db
    pnpm run dev

# Run a production-style build then serve the built API from dist
run: ensure-db build
    NODE_ENV=production node apps/api/dist/index.js

[private]
lint-ts:
    @ pnpm run check

[private]
lint-prisma:
    @ pnpm --filter @app/api exec prisma validate

# Lint JS files
[private]
lint-js:
    @ exit 0

# Lint CSS files
[private]
lint-css:
    @ exit 0

# Lint Astro files
[private]
lint-astro:
    @ exit 0

# Format Prisma schema files
[private]
format-prisma:
    @ pnpm --filter @app/api exec prisma format

# Lint the whole codebase
lint:
    just lint-ts
    just lint-prisma
    just lint-js
    just lint-css
    just lint-astro

# Format source files in place
format:
    just format-prisma

# Run all checks the way CI does (generate client, type-check, build)
ci:
    just db-generate
    just check
    just build

# Build the production Docker image
docker-build:
    DOCKER_BUILDKIT=1 docker build -t {{ IMAGE }} .

# Validate the compose file (resolves env + checks schema)
docker-config:
    docker compose config

# Start the stack with docker compose (detached)
docker-up:
    docker compose up -d

# Stop the compose stack
docker-down:
    docker compose down

# Read-only: probe what the Komodo service user can see (version, stacks, servers, target stack)
komodo-probe:
    bash scripts/komodo-deploy.sh probe

# Read-only: show the target Komodo stack's status
komodo-status:
    bash scripts/komodo-deploy.sh status

# Deploy the project's Komodo stack (asks for human confirmation first)
komodo-deploy:
    bash scripts/komodo-deploy.sh deploy

# --- Cloudflare (alternative deploy target: Workers API + Pages web) ---

# Run the API locally on the Workers runtime (wrangler dev, uses local D1)
cf-dev-api:
    pnpm --filter @app/api run cf:dev

# Run the web app locally on the Pages runtime (wrangler pages dev)
cf-dev-web:
    pnpm --filter @app/web run cf:dev

# Apply D1 SQL migrations to the LOCAL D1 database (safe, no account)
cf-migrate-local:
    pnpm --filter @app/api run cf:migrate:local

# Apply D1 SQL migrations to the REMOTE D1 database (needs CF auth)
cf-migrate:
    pnpm --filter @app/api run cf:migrate

# Deploy the API to Cloudflare Workers (needs CF auth + a real D1 database_id)
cf-deploy-api:
    pnpm --filter @app/api run cf:deploy

# Build then deploy the web app to Cloudflare Pages (needs CF auth)
cf-deploy-web:
    just build
    pnpm --filter @app/web run cf:deploy

# Validate the Worker config + bundle without deploying (no account needed)
cf-check:
    cd apps/api && npx wrangler deploy --dry-run

# --- Android app (apps/android): Gradle multi-module Kotlin project ---
# These recipes wrap the Gradle wrapper (apps/android/gradlew); they do not duplicate
# Gradle command bodies. The `:core` module is pure Kotlin/JVM and builds/tests with any
# JDK 17 or 21. The `:app` module additionally needs the Android SDK (set ANDROID_HOME or
# apps/android/local.properties) and, for UI/instrumented tests, an emulator or device.
# See docs/dev/getting-started.md.

# Assemble the debug APK (:app) — requires the Android SDK
android-build:
    cd apps/android && ./gradlew :app:assembleDebug

# Run JVM unit tests for the pure-Kotlin :core module (no Android SDK needed)
android-test-core:
    cd apps/android && ./gradlew :core:test

# Run all JVM unit tests (:core + :app host tests) — :app needs the Android SDK
android-test:
    cd apps/android && ./gradlew test

# Run Android Lint on the app module — requires the Android SDK
android-lint:
    cd apps/android && ./gradlew :app:lintDebug

# Run on-device/emulator instrumented tests — requires the Android SDK + a device
android-connected-test:
    cd apps/android && ./gradlew :app:connectedDebugAndroidTest

# Delete the Android build outputs
android-clean:
    cd apps/android && ./gradlew clean
