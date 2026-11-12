#!/bin/bash
# Baton local dev database helper (sandbox / machines without PostgreSQL).
# The authoritative schema is prisma/schema.prisma (provider: postgresql, Neon in prod).
# This script derives prisma/schema.sqlite.prisma (one-word provider swap — the schema
# is deliberately provider-agnostic: no native types, no enums, no Json columns)
# and runs generate/push against whichever provider DATABASE_URL indicates.
set -euo pipefail
cd "$(dirname "$0")/.."

COMMAND="${1:-push}"

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
    bunx prisma db push --schema "$SCHEMA" --skip-generate
    bunx prisma generate --schema "$SCHEMA"
    ;;
  generate)
    bunx prisma generate --schema "$SCHEMA"
    ;;
  studio)
    bunx prisma studio --schema "$SCHEMA"
    ;;
  seed)
    bunx tsx prisma/seed-template.ts 2>/dev/null || bun run prisma/seed-template.ts
    ;;
  *)
    echo "Usage: scripts/dev-db.sh [push|generate|studio|seed]"
    exit 1
    ;;
esac
