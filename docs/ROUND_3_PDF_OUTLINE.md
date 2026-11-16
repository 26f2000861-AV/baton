# Updated Project PDF — Outline (Round 3 version)

Replaces the Round 2 proposal (`output/pdf/Baton_Round_2_Project_Proposal.pdf`).
Target: same professional, no-template style as Round 1/2 (dark accent cover,
mono labels, 10–12 pages). Owner: Manas Kapoor. Source material: README.md,
PRODUCT.md, docs/ROUND_2_FORM_RESPONSE_DRAFT.md (contract), this repo's code,
docs/TESTING_NOTES.md, docs/AI_DISCLOSURE.md.

## Page map

1. **Cover** — Baton · Round 3 · Team GIT LOST (Aditya Verma, Manas Kapoor) ·
   CodersInPune Final Round · gitlostbaton.xyz
2. **What changed since Round 2 (one page, judge-facing)**
   The three promised improvements, each: promise → shipped → proof
   (mapping table below). This page is the answer to "deliver the three major
   improvements your team previously promised".
3. **Problem & users** (compressed from R2 PDF, updated wording)
   Handover knowledge is scattered across GitHub/Slack/heads; successor chases
   humans. Users: successor (Priya), leaver (Alex), lead (Vikram).
4. **Product workflow** — sign in → seat assigned server-side → clearance-
   filtered claims → capture while working → settle conflicts → import real
   repo evidence → successor sign-off. Screenshot strip per step.
5. **Improvement 1 — Persistent, authenticated workspace**
   - NextAuth (GitHub OAuth in prod; JWT), Prisma + Postgres (Neon)
   - Server-side role authorization (`src/lib/authz.ts`: requireSession →
     requireMembership → requireRole; non-members get 404)
   - Persona switching removed: role comes from the Membership row
   - Cross-device persistence; localStorage fully removed
6. **Improvement 2 — Evidence-backed GitHub import**
   - Read-only REST import of PRs + commits (30/50 per job) into SourceRecords
   - Deterministic claim generation from merged PRs; open PRs → unfinished
     work items; import jobs tracked with failure states and error surfacing
   - User's own OAuth token (5,000 req/h) vs unauthenticated fallback
   - Clearly unsupported sources declared in-UI (issues/Slack/Linear/Jira)
7. **Improvement 3 — Shared, verifiable work history**
   - Every entry persisted with author identity from the session
   - Machine verification rendered separately from author's words (char-offset
     quote check, deterministic — no LLM)
   - Activity timeline (settle/create/import) + work-update entries, cross-device
8. **Architecture** — diagram: Next.js 14 App Router · Prisma · Postgres ·
   NextAuth v4 · GitHub REST · Vercel. Authz flow diagram. "No LLM in the
   evidence path" callout.
9. **Technical challenges & handling**
   - Provider-agnostic schema (SQLite sandbox ↔ Postgres prod)
   - Server-authoritative state (no optimistic drift)
   - Rate limits and error paths; 404-not-403 for handover ids
10. **Round-wise plan recap & what moved** — R1 plan → R2 demo → R3 upgrades;
    honest "changes from original plan" (pgvector/Slack integrations deferred)
11. **Testing & quality** — summarize docs/TESTING_NOTES.md (typecheck, lint,
    33 unit tests, browser E2E incl. 401/403 checks, seed integrity check)
12. **Contributions & disclosure**
    - Aditya: architecture, backend, integration, deploy
    - Manas: documentation, testing protocol, submission PDF
    - AI tools disclosure (docs/AI_DISCLOSURE.md) — same text as form field
13. **Future scope** — Slack/Linear connectors, LLM-assisted (clearly-labeled)
    claim drafts, org-wide handover templates, SCIM offboarding triggers

## The contract page (page 2) — exact mapping

| Promised in Round 2 form | Shipped in Round 3 | Proof for judges |
|---|---|---|
| 1. Persistent, authenticated workspace — real sign-in, server-side roles, cross-device persistence, persona-switch no longer grants access | NextAuth + Prisma/Postgres + authz guards; role from Membership; localStorage removed | Sign in on two devices; try `POST /settle` as successor → 403 |
| 2. Evidence-backed GitHub import — real PRs/commits mapped to claims with verifiable excerpts + links, refresh from live repo, clear import errors | Import engine + Sources panel; excerpt quote-check with char offsets; failed jobs visible | Import `26f2000861-AV/baton`, open origin links, inspect error states |
| 3. Shared, verifiable work history — entries persist with author, link to imported PRs, verification shown separately | History view (entries + activity), author blocks, separate machine-check wedge, evidence links | Settle a conflict, capture an update with linked quote, view History as another member |
