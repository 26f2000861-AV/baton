#!/bin/bash
# Baton local dev database helper (sandbox / machines without PostgreSQL).
# The authoritative schema is prisma/schema.prisma (provider: postgresql, Neon in prod).
# This script derives prisma/schema.sqlite.prisma (one-word provider swap — the schema
# is deliberately provider-agnostic: no native types, no enums, no Json columns)
# and runs generate/push against whichever provider DATABASE_URL indicates.
# Works with npm-only machines (npx) and falls back to nothing else — bun is
# optional and used when present.
set -euo pipefail
cd "$(dirname "$0")/.."

COMMAND="${1:-push}"

# Prefer bunx when available (faster, runs TS natively); npx otherwise so the
# README's npm-only prerequisites are sufficient.
if command -v bunx >/dev/null 2>&1; then
  RUNNER="bunx"
else
  RUNNER="npx"
fi

url="${DATABASE_URL:-$(grep -E '^DATABASE_URL=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' || true)}"

if [[ "$url" == file:* ]]; then
  echo "[dev-db] DATABASE_URL is SQLite — deriving schema.sqlite.prisma"
  sed 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma > prisma/schema.sqlite.prisma
  SCHEMA="prisma/schema.sqlite.prisma"
else
  echo "[dev-db] DATABASE_URL is Postgres — using authoritative schema"
  SCHEMA="prisma/schema.prisma"
fi

case "$COMMAND" in
  push)
    "$RUNNER" prisma db push --schema "$SCHEMA" --skip-generate
    "$RUNNER" prisma generate --schema "$SCHEMA"
    ;;
  generate)
    "$RUNNER" prisma generate --schema "$SCHEMA"
    ;;
  studio)
    "$RUNNER" prisma studio --schema "$SCHEMA"
    ;;
  seed)
    if command -v bun >/dev/null 2>&1; then
      bun run prisma/seed-template.ts
    else
      npx tsx prisma/seed-template.ts
    fi
    ;;
  *)
    echo "Usage: scripts/dev-db.sh [push|generate|studio|seed]"
    exit 1
    ;;
esac
