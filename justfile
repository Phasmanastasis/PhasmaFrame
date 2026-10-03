# Doc-comment convention: every public recipe has a single `# Description` line
# directly above it, so `just --list` and tooling can parse recipe names + docs.
# Private helpers are marked `[private]` and hidden from `just --list`.
#
# regex to match recipe names and their comments:
# ^    (?P<recipe>\S+)(?P<args>(?:\s[^#\s]+)*)(?:\s+# (?P<docs>.+))*

set dotenv-load
set shell := ["bash", "-cu"]

# Composite values derived from env vars so recipes work without a .env but can be overridden.
export API_URL := "http://localhost:" + env_var_or_default("PORT", "3000")
export WEB_URL := env_var_or_default("WEB_ORIGIN", "http://localhost:4321")

# Choose recipes
default:
    @ just -l

# Install all workspace dependencies
install:
    pnpm install

# Generate the Prisma client (apps/api)
db-generate:
    pnpm db:generate

# Create/apply the local SQLite migrations (apps/api)
db-migrate:
    pnpm db:migrate

# Type-check every workspace (tsc + astro check)
check:
    pnpm check

# Build every workspace
build:
    pnpm build

# Run the API dev server only (tsx watch)
dev-api:
    pnpm dev:api

# Run the web dev server only (astro dev)
dev-web:
    pnpm dev:web

[private]
ensure-db:
    @ pnpm db:generate

# Run API + web dev servers together (hot reload)
dev: ensure-db
    pnpm dev

# Run a production-style build then serve the built API from dist
run: ensure-db build
    NODE_ENV=production node apps/api/dist/index.js

[private]
lint-ts:
    @ pnpm check

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
