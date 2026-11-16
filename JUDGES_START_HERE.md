# Judges Start Here — 2-Minute Orientation

**Baton** is an accountable engineering handover platform: when an engineer
leaves a team, Baton compiles *the decisions already taken, what is still
unfinished, who owned what, and where the risk sits — without having to
chase anyone.* Every claim is traced to a verbatim source quote; every
reader only sees what their clearance allows.

- **Live product:** https://www.gitlostbaton.xyz
- **Sign in:** https://www.gitlostbaton.xyz/signin — use the 1-click demo
  seats (no GitHub OAuth needed): `Successor · Priya Sharma` is the
  recommended judge seat; `Lead · Vikram Malhotra` and `Leaver · Alex Chen`
  show the other roles.
- **Guided 3-minute walkthrough:** [`docs/JUDGE_DEMO_SCRIPT.md`](./docs/JUDGE_DEMO_SCRIPT.md)
- **Full product dossier (12 pages):** [`docs/Baton_Round_3_Final_Product_Dossier.pdf`](./docs/Baton_Round_3_Final_Product_Dossier.pdf)

## Where to find evidence for each scoring dimension

| Dimension | Direct evidence |
| --- | --- |
| **Completeness (25)** | Live end-to-end product (auth → import → claims → conflicts → sign-off). Capability map and the four pillars in [`README.md`](./README.md). Architecture: [`docs/00_overview_and_workflow_architecture.md`](./docs/00_overview_and_workflow_architecture.md). Claim ledger engine: [`docs/01_claim_ledger_and_provenance_engine.md`](./docs/01_claim_ledger_and_provenance_engine.md). |
| **Three improvements (20)** | Each Round-2 promise mapped to what shipped, with a live "try this" verification step: the **Three Promised Improvements** table in [`README.md`](./README.md). Verification commands included per improvement. |
| **Reliability (20)** | CI runs typecheck + the unit suite on every push (badge above). 46 tests across 9 files: `npm test`. Authz truth table (`tests/authz.test.mts`), tenant isolation (`tests/tenant.test.mts`), URL sanitization (`tests/utils.test.mts`), serializer/privacy boundary (`tests/serializers.test.mts`), health probe (`tests/health.test.mts`). Fix loop with before/after PoCs: [`AUDIT_CHANGELOG.md`](./AUDIT_CHANGELOG.md). Uptime endpoint: `GET /api/health`. |
| **Usability (20)** | 1-click demo seats (no OAuth friction), responsive at 390px, keyboard-focusable dialogs (focus trap), `aria-label`s on all icon controls, disclosure chevrons on help panels, reader-scoped "N visible · M withheld" transparency. Landing is server-rendered with metadata, `sitemap.xml`, `llms.txt` (for AI answer engines), and Open Graph cards. |
| **Docs & roadmap (15)** | Ten numbered design docs (`docs/00`–`docs/09`) covering workflow, ledger, rationale, ownership, risk, privacy, interviews, acceptance, and differentiation. Deployment runbook, testing notes, AI-usage disclosure, and the dossier PDF. Honest technical-debt register: [`docs/03_unfinished_work_and_technical_debt.md`](./docs/03_unfinished_work_and_technical_debt.md). |

## The three Round-3 improvements (summary)

1. **Persistent, authenticated workspace** — NextAuth sign-in, server-side
   role authorization, PostgreSQL persistence. Role comes from the database,
   never the client; non-members get 404s.
2. **Evidence-backed source import** — live GitHub REST import; merged PRs
   become claims with deterministic verbatim excerpts, open PRs become
   unfinished work, all linking back to origin.
3. **Shared, verifiable work history** — dated team updates with author
   identity, machine verification rendered separately from human
   explanation, cross-device persistent.

Full table with verification steps: [`README.md`](./README.md).

## Run it locally (2 commands after clone)

```bash
npm install && npx prisma generate
npm run db:push && npm run db:seed   # local SQLite path — see README for details
npm run dev                          # http://localhost:3000
```

The CI workflow (`.github/workflows/ci.yml`) runs the same gates on every
push: `tsc --noEmit` + the full unit suite.

## Known trade-offs (stated up front)

- 4 of our 60 SEO/GEO checklist items are accepted trade-offs of the
  animated landing (inline styles in two animated components, footer
  `mailto:`, sign-in page styling). The other 56 pass — see
  `scripts/verify_seo.py`.
- Demo sign-in accounts are deliberately whitelist-only fixed seats (audit
  finding C1) — they can never match or take over a real GitHub account.
- The roadmap and remaining technical debt are documented honestly in
  [`docs/03_unfinished_work_and_technical_debt.md`](./docs/03_unfinished_work_and_technical_debt.md)
  rather than hidden.

Questions while evaluating? `docs/` has a numbered doc for every subsystem,
and `AUDIT_CHANGELOG.md` records every fix with its verification.
