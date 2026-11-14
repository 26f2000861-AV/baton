# Audit Change Log — Round 3 Hardening (Audit-Fix Loop, Round 1 → Round 2)

Two commits on top of `e08da3c` (main):

- `4204a30` fix(audit): harden demo auth, de-hardcode judge flow, resolve audit findings C1-C2, H1-H2, M1-M6, L1-L6
- `6f307a0` style(ui): consistent disclosure chevrons on claims help panels

Net diff: 37 files changed, +388 / -864 lines.

## Critical

| ID | Fix | Verification |
|----|-----|--------------|
| C1 — demo provider enabled account takeover | `src/lib/auth.ts`: the `dev-local` credentials provider is now whitelist-only (6 fixed demo logins) and resolves accounts by their reserved `@gitlostbaton.xyz` e-mail — never by `githubLogin`. It can only ever return rows it created itself, so no real (OAuth) account can be matched. The unused `allowDevProvider` variable is gone. | The exact takeover PoC that worked pre-fix (signing in as a simulated GitHub user by typing their login) now returns **401 CredentialsSignin** and grants no session. Verified on a fresh database. |
| C2 — demo sign-in hardcoded a production DB row ID | `src/app/signin/page.tsx`: the hardcoded `?h=cmwfhxecd…` callback is gone. Demo sign-in now uses `redirect: false`, then provisions the sample-clone handover on demand (with the seat's role) before routing into the workspace. | On a fresh database, one click on a demo seat lands directly in a **populated** handover workspace — no starting-point picker, no broken promise. Verified live. |

## High

| ID | Fix | Verification |
|----|-----|--------------|
| H1 — NextAuth `debug: true` in production | `src/lib/auth.ts`: debug logging gated on `NODE_ENV !== 'production'`. | Code inspection; no behavior change in dev. |
| H2 — lead-less handovers could never gain a lead | New `requireGovernance()` guard (`src/lib/authz.ts` + pure rules in `src/lib/authzRules.ts`): lead governs as before; when a handover has **no lead**, its creator may invite members and claim the lead seat. MembersPanel shows the affordance. | Live: a creator-successor claimed the lead seat (PATCH 200) and then settled the contradiction (200). Unit tests cover the truth table (`tests/authz.test.mts`). |

## Medium

| ID | Fix | Verification |
|----|-----|--------------|
| M1 — settlement wrote hardcoded Helios narrative into any claim history | `settle/route.ts` derives the history text from the contradiction's own `sourceA/sourceB.extractedValue`; overview card no longer hardcodes `claim_09` or the VM/Thanos copy. | Settling with `accept_dual_scope` wrote `"Resolved dual scope: "<value A>" and "<value B>"…"` derived from the actual payload. |
| M2 — 1.2 MB duplicated `public/public/` | Removed (17 files). Nothing referenced the nested path. | `git ls-files` clean; app builds and serves. |
| M3 — dev database committed | `prisma/db/baton-dev.db` untracked; `prisma/db/*.db` gitignored. | Fresh clones start from a clean baseline. |
| M4 — seed script said "FinTrack" | Comment corrected to Baton. | — |
| M5 — db scripts required bun despite npm-only README | `scripts/dev-db.sh` prefers `bunx` when present, falls back to `npx`; seed falls back to `npx tsx`. README documents the SQLite local path. | Ran on this machine through the npm path. |
| M6 — README claimed authz regression tests that did not exist | Authorization rules extracted to pure `src/lib/authzRules.ts` and a real suite added (`tests/authz.test.mts`, 6 tests); `npm test` includes it; README wording now matches reality. | 19/19 tests pass. |

## Low / polish

| ID | Fix | Verified |
|----|-----|----------|
| L1 — identity chip truncated mid-word | Name rendered without the redundant `(Role)` suffix (the role pill already shows it); full name in `title` + menu. | Chip shows "Priya Sharma" fully on desktop and 390px mobile. |
| L2 — collapsed help panel had no disclosure affordance | Chevron (`▸`, rotates when open) on `How to run this sample`, `How to read these labels` and `More statuses`. | Visual check. |
| L3 — claims view duplicated headings/counters | Intro now reads "N visible to your seat · M withheld"; card counter reads "N of M shown". | Visual check. |
| L4 — landing headline orphaned the word "for" | Headline rebalanced: "A practical handover / for the work that matters". | Visual check. |
| L5 — 98 lines of dead code | `src/lib/personaCompiler.ts` deleted (superseded by `serializers.ts`). | Typecheck/lint/tests green. |
| L6 — stale Round-2 PDF in repo root | `output/` removed. | — |

## Gates after fixes

- `npx tsc --noEmit` — 0 errors
- `npx next lint` — 0 warnings, 0 errors
- `npm test` — 19/19 pass (13 existing + 6 new authz tests)
- `npx next build` — production build succeeds
- Live guards: 401 / 403 / 404 / 200 all enforce as documented
- Takeover PoC: rejected; one-click demo: works on a fresh database
