# Round 3 Final Submission — Copy-Paste Answers

> **Submission Form URL:** [https://forms.gle/FxhT5Z1NupvGTGSw6](https://forms.gle/FxhT5Z1NupvGTGSw6)  
> **Deadline:** 11:59 PM, 16 November 2026 (72-hour window)  
> **Team Name:** GIT LOST  
> **Team Leader:** Aditya Verma (adityaverma200911@gmail.com)  
> **Team Member:** Manas Kapoor  

---

### 1. Final Working Project Link
```text
https://www.gitlostbaton.xyz
```
*(Demo sign-in available directly on https://www.gitlostbaton.xyz/signin with 1-click credentials for demo_successor, demo_lead, and demo_leaver).*

---

### 2. Final Source-Code Repository
```text
https://github.com/26f2000861-AV/baton
```

---

### 3. Demo Account Credentials (Prominently Highlighted as Requested)
```text
Role 1 (Successor - Recommended for Judges): demo_successor (Priya Sharma - Senior Backend Engineer)
Role 2 (Lead): demo_lead (Vikram Malhotra - Engineering Director)
Role 3 (Leaver): demo_leaver (Alex Chen - Staff Platform Engineer)

All 3 demo accounts feature 1-click passwordless sign-in directly on https://www.gitlostbaton.xyz/signin. Real GitHub OAuth is also available.
```

---

### 4. Complete List of Features Built
```text
• Persistent Multi-Tenant Workspace: NextAuth authentication with GitHub OAuth and 1-click passwordless Demo Credentials; server-side role authorization guards (requireSession → requireMembership → requireRole) ensuring unauthenticated callers receive 401 and non-members receive 404.
• Pillar 1 — Decisions & Architecture Rationale: Timeline of decisions taken, alternatives considered, rationale confidence ratings, and an in-work capture drawer for capturing rationale, next actions, and source references while working.
• Pillar 2 — Unfinished Work & Technical Debt: Successor's First 30 Days triage roadmap, severity and impact badges, successor work adoption actions, and automated ingestion of open pull requests into actionable work items.
• Pillar 3 — Ownership Matrix & Contact Routing: System asset registry, active owners, designated successors, target transfer dates, and escalation contact routing.
• Pillar 4 — Risk Detection & Contradiction Settlement: Side-by-side cross-source contradiction queue (e.g. SQS code commit vs RabbitMQ rollback Slack chat); lead-only settlement workflow recording authoritative human decisions and dual-scope notes.
• Gap-Driven Leaver Interview: 5-question interview generated from undocumented technical gaps; responses update claims to stated_by_leaver with full audit timestamps.
• Successor Review & Sign-Off: Section-by-section acceptance with undo functionality, contextual question drawer, and lead replies.
• Evidence-Backed GitHub Import Engine: Scoped read-only REST import of pull requests and commits into SourceRecords with 3-tier auth fallback (user_oauth → server_pat → public); failure state tracking in UI.
• Shared Work History & Activity Log: Multi-user activity timeline tracking settlements, imports, and member updates across devices with author attribution.
• Deterministic Quote Verifier: Standalone /api/verify endpoint performing verbatim substring extraction and character offset calculation without LLM hallucinations.
```

---

### 5. Technical Architecture and Implementation Summary
```text
Baton is built with Next.js 14 App Router, React 18, TypeScript, and Tailwind CSS, backed by Neon Serverless PostgreSQL and Prisma ORM v6.

Architecture Highlights:
1. Authentication & Session Management: NextAuth.js v4 configured with JWT strategy. Supports both real GitHub OAuth (requesting 'read:user user:email repo' for private repository imports) and CredentialsProvider for 1-click judge evaluation. Sessions carry the user's database ID and GitHub login.
2. Server-Side Security Model: Every API route enforces strict layered guards (requireSession → requireMembership → requireRole). The client is treated as completely untrusted; role capabilities (such as settling contradictions or importing repos) are validated against database Membership records. Non-members receive 404 rather than 403 to prevent handover ID enumeration.
3. Multi-Tenant Handover Engine: Template cloning system (ensureTemplate + copyHandoverContent) provisions private, isolated clones of the synthetic Helios case for new users within atomic PostgreSQL transactions.
4. GitHub Ingestion Engine: Implemented in src/lib/github.ts using a 3-tier auth resolution chain: (1) user's OAuth token (5,000 req/h), (2) server GITHUB_PAT fallback, and (3) public unauthenticated mode (60 req/h). Pull requests and commits are mapped to SourceRecord and Claim entities with links back to origin.
5. Deterministic Verifier: Substring matching with CRLF normalization, whitespace degradation, and boundary checks that computes exact charStart/charEnd spans against source documents.
```

---

### 6. The Three Improvements Completed After Round 2
```text
Improvement 1: Persistent, Authenticated Workspace
• Promised: Add sign-in, server-side role authorization, and persistent storage for handover records. A successor can return later and see the same state; persona-switch no longer grants access.
• Delivered: Integrated NextAuth v4 (GitHub OAuth + 1-Click Demo Accounts) and PostgreSQL (Neon) via Prisma. Replaced client-side localStorage with server-side database persistence. Enforced server-side authorization guards (requireSession → requireMembership → requireRole) where non-members receive 404 and unauthorized mutations return 403.
• Proof: Sign in on two separate devices/browsers; state persists identically. Calling POST /api/handovers/:id/contradictions/:cid/settle as a successor returns 403 Forbidden.

Improvement 2: Evidence-Backed Source Import
• Promised: Add scoped GitHub import for pull requests and commits, map imported records to claims with verifiable excerpts and links back to origin. Show clear import errors and unsupported sources.
• Delivered: Implemented GitHub REST import engine (src/lib/github.ts). Merged PRs map to claims with verbatim excerpts; open PRs map to unfinished work items. Implemented a 3-tier auth fallback chain (user OAuth → server PAT → public). Failed jobs and unsupported source types (Slack/Linear/Jira) are declared and tracked in the Sources panel.
• Proof: Enter any repository (e.g. 26f2000861-AV/baton) in the Sources panel to import real PRs, open origin links on GitHub, and inspect import status.

Improvement 3: Shared, Verifiable Work History
• Promised: Extend local capture prototype into a shared, dated team history. Persist entries with author identity, link to imported PRs, and render machine verification separately from author explanations.
• Delivered: Built shared History view (src/components/HistoryView.tsx) and backend (/api/handovers/:id/work-updates). Every update records author identity, rationale, next action, and linked source. The deterministic verifier badge is rendered separately from the human's explanation. Team activity timeline synchronizes settlements and imports across devices.
• Proof: Record a work update in one account; sign in as another member to see the update, linked quote, and audit status in the shared History timeline.
```

---

### 7. Testing Details
```text
Testing encompasses unit testing, TypeScript strict typechecking, security regression checks, and manual end-to-end journey tests:

1. Automated Unit Tests (tests/verifier.test.mts & tests/github-mappers.test.mts):
• 13 passing unit tests executed via Node's native test runner (node --experimental-strip-types --test).
• Verifier tests: Exact substring extraction, CRLF normalization, whitespace mismatch degradation, and empty/absent quote rejections.
• GitHub mapper tests: Repository input parsing (handles owner/name, full URLs, and .git extensions), PR and commit mapping to SourceRecord, deleted author resilience, claim excerpt building, and open PR triage into work items.

2. Static Analysis & Type Safety:
• Full TypeScript compilation check (tsc --noEmit) passes with zero errors across the entire codebase.
• ESLint verification across Next.js components and API handlers.

3. Security & Authorization Verification:
• Unauthenticated requests to /api/handovers and /api/me return 401 Unauthenticated.
• Requests with invalid or non-member handover IDs return 404 Not Found to prevent ID enumeration.
• Attempting lead-only operations (e.g. contradiction settlement) from a successor session returns 403 Forbidden.

4. End-to-End Workflow Verification:
• Tested complete successor journey: sign in → inspect decisions → adopt unfinished work items → ask leaver questions → mark sections accepted.
• Tested lead journey: sign in → resolve contradiction with note → view exposure audit diff → trigger GitHub import.
• Cross-browser resilience verified across Chrome, Safari, and Firefox.
```

---

### 8. Product Roadmap and Future Development Plan
```text
• Months 1–3 (Q1): Third-Party Connectors & Deep Integrations
  - Native Slack App to capture architecture discussions and ephemeral decisions directly from threads into Baton claims.
  - Linear and Jira two-way synchronization to convert unfinished work items into active sprint tickets.

• Months 4–6 (Q2): Cryptographic Attestation & Knowledge Graph
  - Generation of cryptographically signed handover certificates upon complete successor acceptance.
  - Interactive knowledge graph visualizing dependencies between architectural decisions, code assets, and outgoing team owners.

• Months 7–9 (Q3): Enterprise Identity & Offboarding Triggers
  - SCIM 2.0 integration with Okta, Google Workspace, and Microsoft Entra ID to automatically provision handover workspaces the moment an employee notice period is initiated in HRIS (e.g. BambooHR, Workday).

• Months 10–12 (Q4): Enterprise Compliance & Verification
  - SOC 2 Type II and ISO 27001 evidence export packages.
  - Tenant-level data retention and legal hold policies.
```
