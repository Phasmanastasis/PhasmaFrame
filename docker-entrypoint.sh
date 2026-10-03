#!/usr/bin/env sh
# Container entrypoint for the PhasmaFrame API + static frontend.
#
# Applies the SQLite schema to the mounted data volume, then execs the server.
# `prisma db push` is idempotent: it brings the database at DATABASE_URL in line
# with schema.prisma without a migration history, so it is safe to run on every
# start, including against an existing volume. It never drops data on its own
# here (no --accept-data-loss), so a redeploy preserves the named volume's data.
set -eu

echo "Applying database schema (prisma db push)…"
node_modules/.bin/prisma db push --skip-generate

echo "Starting server…"
exec "$@"
