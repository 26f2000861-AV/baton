# Baton Round 3 — Deploy Runbook (Vercel + Neon)

Target: `gitlostbaton.xyz` (existing Vercel project, team GIT LOST).
Branch to ship: `round3/improvements`. **Do not push before Round 3 opens
(Nov 13, 11:59 PM IST)** — commit timestamps must show in-window work.

---

## 1. Prerequisites (do these once, before the round opens)

| Item | Where | Notes |
|---|---|---|
| Neon Postgres database | neon.tech → new project `baton-prod` | Region closest to Vercel region (e.g. `aws-ap-south-1`). Copy the **pooled** connection string. |
| GitHub OAuth app | github.com → Settings → Developer settings → OAuth Apps → New | App name: `Baton`. Homepage: `https://gitlostbaton.xyz`. Callback: `https://gitlostbaton.xyz/api/auth/callback/github` |
| Vercel project env vars | Vercel → Project → Settings → Environment Variables | See table below. |
| Local sanity | `bun install && bun run typecheck && bun run lint && bun run test` | All green before push. |

## 2. Environment variables (Vercel → Production)

```text
DATABASE_URL     = postgresql://<user>:<password>@<host>/<db>?sslmode=require   (Neon pooled)
NEXTAUTH_URL     = https://gitlostbaton.xyz
NEXTAUTH_SECRET  = <openssl rand -base64 32>
GITHUB_ID        = <OAuth App Client ID>
GITHUB_SECRET    = <OAuth App Client Secret>
```

Notes:
- `GITHUB_ID`/`GITHUB_SECRET` enable the **only** production sign-in: GitHub OAuth.
  They must be present or judges cannot sign in at all.
- The import engine uses each signed-in user's own GitHub token (stored in the
  `Account` table by the adapter). No extra token variable is needed. To give
  headless fallback capacity you may optionally add `GITHUB_TOKEN` (read-only
  PAT) — the code prefers the user's token and falls back to unauthenticated
  calls for public repos.

## 3. Database migration (first deploy)

The schema is provider-agnostic (no native types, no enums, no JSON columns —
payloads are TEXT JSON owned by `src/lib/serializers.ts`).

```bash
# locally, pointed at Neon (one-time):
DATABASE_URL="postgresql://...neon..." bunx prisma db push --schema prisma/schema.prisma
DATABASE_URL="postgresql://...neon..." bunx prisma generate  --schema prisma/schema.prisma
```

`db push` is sufficient for the hackathon window (no migration history needed).
The FinTrack… → Helios template is **auto-seeded** on first use by
`ensureTemplate()` — no manual seed step is required in production.

## 4. Deploy sequence (after Round 3 opens)

```bash
git checkout round3/improvements
git push origin round3/improvements
# if main is the tracked branch on Vercel:
git checkout main && git merge --ff-only round3/improvements && git push origin main
```

Vercel auto-deploys. Post-deploy checklist:

- [ ] `https://gitlostbaton.xyz/signin` shows **Continue with GitHub**
      (if it shows the dev-local form, `GITHUB_ID`/`GITHUB_SECRET` are not set)
- [ ] Sign in with GitHub → role picker → create the Helios sample handover
- [ ] Claims view shows 9 claims (HR claim withheld)
- [ ] Lead seat: settle `conflict_01`, invite a teammate by GitHub username
- [ ] Sources & import: import `26f2000861-AV/baton` (or any public repo)
- [ ] History view shows the settle + import events
- [ ] Sign out, sign in on a **phone**: state matches (cross-device persistence)

## 5. Rollback / incident notes

- The build is stateless except Postgres. Neon branch `baton-prod` can be
  reset by re-running `prisma db push --accept-data-loss` + fresh seed.
- If GitHub import hits rate limits during judging, sign in judges with their
  own GitHub accounts — each brings a 5,000 req/h quota via OAuth.

## 6. Local sandbox specifics (for the team)

- Sandbox has no PostgreSQL service; `DATABASE_URL` there points at a SQLite
  file and `scripts/dev-db.sh` derives `prisma/schema.sqlite.prisma`
  automatically. Never commit a generated `schema.sqlite.prisma` change — it
  is derived.
- Optional local Postgres for parity testing: `node .localpg-runtime/daemon.cjs`
  (embedded PG on 127.0.0.1:5433, db `baton`, user/password `baton`), then set
  `DATABASE_URL=postgresql://baton:baton@127.0.0.1:5433/baton` and re-run
  `scripts/dev-db.sh push`.
- Useful scripts: `bun run typecheck | lint | test | db:push | db:seed`,
  `node scripts/parse-audit.cjs`, `bun scripts/seed-integrity-check.mts`.
