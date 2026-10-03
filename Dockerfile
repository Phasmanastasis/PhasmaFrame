# syntax=docker/dockerfile:1.7
#
# Lean, reproducible multi-stage build for the @app/api service.
# Base image is pinned by tag + digest for reproducibility.

ARG NODE_IMAGE=node:22-bookworm-slim@sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c

# ---------- Stage 1: build ----------
# Install the workspace with a frozen lockfile, generate the Prisma client, then
# produce a self-contained deploy bundle for just the api workspace.
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=true \
    DATABASE_URL=file:./dev.db
# Enable the pnpm version pinned by package.json's "packageManager" field.
RUN corepack enable
# Copy manifests first so the install layer caches on dependency changes only.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
# BuildKit cache mount keeps the pnpm store warm; --frozen-lockfile makes the
# lockfile authoritative.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile
# Now the sources.
COPY . .
# Create a flattened, self-contained bundle in /app/out containing the api + its
# workspace deps (including the tsx runtime and the linked @app/shared package).
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter @app/api --prod=false deploy --legacy /app/out
# Generate the Prisma client *inside* that bundle so the engine ships with the image.
WORKDIR /app/out
RUN pnpm exec prisma generate
WORKDIR /app

# ---------- Stage 2: runtime ----------
# Minimal final image: non-root, only the self-contained api bundle.
FROM ${NODE_IMAGE} AS runtime
WORKDIR /app

LABEL org.opencontainers.image.title="phasmaframe-api" \
      org.opencontainers.image.description="PhasmaFrame Hono API service" \
      org.opencontainers.image.source="https://github.com/Phasmanastasis/PhasmaFrame" \
      org.opencontainers.image.licenses="MPL-2.0"

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=file:/data/dev.db

# tini for correct signal handling / zombie reaping; curl for the healthcheck.
# hadolint ignore=DL3008  # bookworm-slim is rolling; pinning tini/curl patch versions is brittle
RUN apt-get update \
    && apt-get install -y --no-install-recommends tini curl \
    && rm -rf /var/lib/apt/lists/*

# Self-contained api bundle (node_modules includes tsx, the Prisma client, and the
# workspace-linked @app/shared TypeScript source resolved at runtime by tsx).
COPY --from=build /app/out ./

# SQLite data directory, owned by the non-root user.
RUN mkdir -p /data && chown -R node:node /data /app
USER node

EXPOSE 3000

# Healthcheck hits the API's own health endpoint.
# hadolint ignore=DL3025  # shell form is required here for the `|| exit 1` fallback
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:${PORT}/api/health" || exit 1

# tini as PID 1; run the API via the workspace tsx binary (exec form).
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node_modules/.bin/tsx", "src/index.ts"]
