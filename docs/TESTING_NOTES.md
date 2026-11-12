# Baton Round 3 — Testing Notes

**Product:** Baton (`gitlostbaton.xyz`) · **Branch:** `round3/improvements`
**Test date:** 2026-11-12 · **Environment:** cloud sandbox (Next.js 14 dev
server, Prisma + SQLite dev database; production target Neon Postgres per
`docs/DEPLOY_RUNBOOK.md`)

> Template for Round 3: re-run this whole sheet against the **deployed**
> production URL right before submission and tick the boxes. Judges should be
> able to reproduce every line with a browser only.

## 1. Automated checks

- [x] `bun run typecheck` — 0 errors (fresh `tsc --noEmit`, incremental cache cleared)
- [x] `bun run lint` — 0 warnings/errors
- [x] `bun run test` — 13/13 pass (deterministic verifier suite + GitHub mapper suite)
- [x] `node scripts/parse-audit.cjs` — every `.ts/.tsx` file parses clean
- [x] `bun scripts/seed-integrity-check.mts` — all 11 seed quotes verbatim-consistent
      with the source corpus (claim_04 intentionally a paraphrase → `quoted_unverified`)

## 2. Authentication & authorization (Improvement 1)

| # | Scenario | Expected | Result |
|---|---|---|---|
| 2.1 | Visit `/workspace` signed out | Redirect to `/signin` | PASS |
| 2.2 | Sign in (dev-local in sandbox; GitHub OAuth in prod) | Role picker on first login | PASS |
| 2.3 | Create handover from role picker | Server-side membership role assigned | PASS |
| 2.4 | Unauthenticated `GET /api/handovers/{id}` | 401 | PASS |
| 2.5 | Unauthenticated `POST /api/handovers/{id}/import` | 401 | PASS |
| 2.6 | Successor calls settle endpoint | 403 `FORBIDDEN_ROLE` | PASS |
| 2.7 | Persona switcher removed; role comes from membership | Banner states it explicitly | PASS |
| 2.8 | Re-login on a second browser profile | Same state (no localStorage) | PASS (sandbox) / re-run on prod |

## 3. Persistence (Improvement 1)

- [x] Work update captured by one user appears for another member (server state, not browser)
- [x] Interview answer, section sign-off, conflict settlement all survive full page reload
- [x] All mutations POST to guarded routes and render the **server's** response
      (no optimistic local-only writes)
- [x] Reset (creator only) wipes workflow data and re-copies the template; memberships kept

## 4. GitHub import (Improvement 2)

| # | Scenario | Expected | Result |
|---|---|---|---|
| 4.1 | Import `26f2000861-AV/baton` (lead or successor) | PRs + commits stored as SourceRecords with origin links | PASS — re-verify on prod (sandbox IP hit GitHub's 60 req/h unauthenticated cap during testing; error path verified instead) |
| 4.2 | Rate-limited import | Friendly error incl. reset time; failed job row visible in Sources panel immediately | PASS (fixed: client now re-hydrates after a failed import) |
| 4.3 | Nonexistent repo (`owner/name` that 404s) | `Repository not found or private` | PASS (unit + route mapping) |
| 4.4 | Bad repo format | 400 `BAD_REPO_FORMAT` | PASS (unit: `parseRepoInput`) |
| 4.5 | Imported claims deterministic | Open PRs generate "work in progress" claims via fixed mappers, no LLM | PASS (mapper unit tests) |
| 4.6 | Leaver seat import attempt | UI hides form; route enforces `lead|successor` | PASS |

## 5. Shared, verifiable work history (Improvement 3)

- [x] Every entry shows **author identity from the session** (name/avatar/role), never free text
- [x] Machine verification block rendered **separately** from the author's words:
      "quote found verbatim … (chars 391–446)" with char offsets from the deterministic check
- [x] Linked evidence shows origin link (`Open origin`) next to the entry
- [x] Activity events (settle, create, import) appear in the same timeline
- [x] Cross-device: state identical after sign-in from a second browser

## 6. Sample-case content (Helios Observability Platform)

- [x] 10 seeded claims; successor sees 9 (claim_10 HR-restricted, withheld with reason)
- [x] Lead (clearance `confidential_lead`) sees all 10
- [x] Conflict deep link `#/conflict` opens `conflict_01` (id mismatch from Round 2 fixed)
- [x] Quote-check: verbatim quotes pass; paraphrased claim_04 correctly reports "not found"
- [x] Landing page, role picker, modals and pillar cards all reference the Helios case
      (grep-swept: zero FinTrack/SQS/RabbitMQ remnants outside git history)

## 7. UI / responsiveness

- [x] Mobile 390×844: no horizontal overflow; mobile menu lists all 10 views + tools
- [x] Modals trap focus and close on Escape; drawer opens from claim rows
- [x] Successor cannot reach settle form (textarea disabled + explanatory copy updated to Round 3 wording)

## 8. Known limitations (disclosed, unchanged from Round 2)

- Import covers GitHub PRs/commits only; issues, Slack, Linear, Jira are
  declared unsupported in the UI.
- Quote verification proves text presence, not truth.
- Dev-local sign-in exists ONLY when GitHub OAuth env vars are absent
  (sandbox); production shows GitHub sign-in exclusively.

## 9. Pre-submission checklist (re-run on production)

- [ ] All section 1 commands green on the final commit
- [ ] Sections 2–7 re-verified against `https://gitlostbaton.xyz`
- [ ] Incognito test of every submitted link
- [ ] PDF updated to match shipped behaviour (three improvements mapping)
