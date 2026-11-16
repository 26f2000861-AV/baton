# Baton — Accountable Engineering Handover Platform

> **CodersInPune Hackathon (Round 3 — The Final Product)**  
> **Team Name:** GIT LOST  
> **Team Leader:** Aditya Verma (adityaverma200911@gmail.com)  
> **Team Member:** Manas Kapoor  
> **Live Deployed Product:** [https://www.gitlostbaton.xyz](https://www.gitlostbaton.xyz)  
> **Source Repository:** [https://github.com/26f2000861-AV/baton](https://github.com/26f2000861-AV/baton)  
> **Product Dossier:** [Baton Round 3 Final Product Dossier (PDF)](./docs/Baton_Round_3_Final_Product_Dossier.pdf)  
> **Core Evaluated Workflow:** *"the decisions already taken, what is still unfinished, who owned what, and where the risk sits — without having to chase anyone."*

---

## 🚀 Judge & Evaluator Quick Start (1-Click Demo Access)

To make evaluation seamless without requiring GitHub OAuth authorization or repository permissions, **pre-configured 1-click demo accounts** are available directly on the sign-in page:

1. Open **[https://www.gitlostbaton.xyz/signin](https://www.gitlostbaton.xyz/signin)**.
2. Click any of the pre-configured role buttons:
   * **`Successor · Priya Sharma`** (`demo_successor`) — **Recommended for Judges**: Review claims, adopt unfinished work, ask questions, and sign off section-by-section.
   * **`Lead · Vikram Malhotra`** (`demo_lead`): Settle cross-source contradictions with decision notes, review audit exposure diffs, invite members, and import GitHub repositories.
   * **`Leaver · Alex Chen`** (`demo_leaver`): Complete the gap-driven exit interview and attest knowledge while still at the organization.
3. *Alternatively*, use **Continue with GitHub** to authenticate with your real GitHub identity and import live repositories.

---

## 🏆 Round 3 Deliverables — The Three Promised Improvements

In Round 2, we committed to three specific improvements for Round 3. Here is how each has been fully delivered:

| Promised in Round 2 | Shipped in Round 3 | Architecture & Verification |
| :--- | :--- | :--- |
| **Improvement 1: Persistent, authenticated workspace**<br>Add sign-in, server-side role authorization, and persistent storage for handover records. A successor can return later and see the same state; persona-switch no longer grants access. | **Delivered:** NextAuth v4 (GitHub OAuth + Credentials for judges), PostgreSQL (Neon) via Prisma ORM, strict server-side authorization guards (`requireSession` → `requireMembership` → `requireRole`), and cross-device persistence. Multi-tenant handovers with private clones. | Role is determined server-side from the `Membership` database row. Non-members receive `404 Not Found` (preventing ID enumeration). Try `POST /api/handovers/:id/contradictions/:cid/settle` as a successor → returns `403 Forbidden`. |
| **Improvement 2: Evidence-backed source import**<br>Add scoped GitHub import for pull requests and commits, map imported records to claims with verifiable excerpts and links back to origin. Surfacing clear import errors and unsupported sources. | **Delivered:** Live GitHub REST import engine (`src/lib/github.ts`, `src/lib/githubMappers.ts`). Merged PRs map to claims with deterministic verbatim excerpts; open PRs map to unfinished work items. Three-tier auth fallback chain (`user_oauth` → `server_pat` → `public`). | Import any repository (e.g. `26f2000861-AV/baton`), inspect job cards in the Sources panel, check origin links to GitHub, and verify character-offset quote matching. |
| **Improvement 3: Shared, verifiable work history**<br>Extend local capture prototype into a shared, dated team history. Persist entries with author identity, link to imported PRs, and render machine verification separately from author explanations. | **Delivered:** Shared Work History (`src/components/HistoryView.tsx`, `src/app/api/handovers/:id/work-updates`). Author identity attached to every update; character-offset quote checking rendered as a distinct machine-check badge. Activity timeline tracks contradiction settlements, imports, and member updates across devices. | Record a work update in one browser; sign in from another device/browser as another member to see the exact update, linked quote, and audit status. |

---

## 📦 Core Product Capabilities (The 4 Pillars)

Baton organizes tribal engineering knowledge into an inspectable ledger covering four core pillars:

1. **Decisions Already Taken:**
   * Architectural decisions with recorded choices, alternatives considered, and confidence levels.
   * In-work decision capture: capture rationale, next actions, and source references while working.
2. **Unfinished Work & Technical Debt:**
   * Triage roadmap for the successor's first 30 days.
   * Successor adoption actions: incoming engineers can adopt open work items directly into their queue.
   * Automatically triages open pull requests imported from GitHub into unfinished work items.
3. **Ownership Matrix & Contact Routing:**
   * Clear asset ownership, proposed successors, transfer target dates, and designated escalation contacts.
   * Prevents "who owns this service" operational freezes during outages.
4. **Risk Detection & Contradiction Settlement:**
   * Disagreement *is* the discovery: surfaces contradictory facts across sources (e.g., code says AWS SQS, chat says rolled back to RabbitMQ).
   * Leads record authoritative human settlement notes and dual-scope resolutions.
5. **Gap-Driven Leaver Interview:**
   * Targeted 5-question interview based on undocumented gaps before the engineer leaves.
   * Responses update claims to `stated_by_leaver` with full audit timestamps.
6. **Successor Section Review & Sign-Off:**
   * Section-by-section acceptance with undo capability.
   * Contextual question drawer to ask the departing engineer or lead questions before sign-off.
7. **Deterministic Character-Offset Verifier:**
   * Standalone verification route (`/api/verify`) that performs exact quote substring extraction with character offsets (`charStart`, `charEnd`). No non-deterministic LLM hallucination in the evidence chain.

---

## 🛠️ Technology Architecture

* **Framework:** Next.js 14 App Router (`src/app`) with React 18 & TypeScript
* **Database:** PostgreSQL (Neon Serverless Postgres in production)
* **ORM:** Prisma Client v6 with declarative schema ([prisma/schema.prisma](./prisma/schema.prisma))
* **Authentication:** NextAuth.js v4 (GitHub OAuth + JWT session strategy + Demo Credentials)
* **Styling & UI:** Tailwind CSS, Lucide React icons, Framer Motion
* **External APIs:** GitHub REST API v3 (octokit-compatible rate limiting, pagination, and multi-tier auth)
* **Deployment:** Vercel (Edge routing, serverless lambdas in `bom1` region)

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 14 Web UI                   │
│   (Overview · Claims · Decisions · Ownership · Risks)   │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       NextAuth v4 (JWT)         REST API Routes
       GitHub OAuth / Demo       (/api/handovers/*)
                │                        │
                ▼                        ▼
┌───────────────────────┐       ┌────────────────────────┐
│  GitHub REST API v3   │       │   Server Authz Layer   │
│  (PRs, Commits, Repo) │       │ (Session→Member→Role)  │
└───────────────────────┘       └───────────┬────────────┘
                                            │
                                  Prisma Client v6
                                            │
                                            ▼
                                ┌────────────────────────┐
                                │   Neon PostgreSQL DB   │
                                │ (Handovers, Claims,    │
                                │  Updates, Activity)    │
                                └────────────────────────┘
```

---

## 💻 Quick Start (Running Locally)

### Prerequisites
* Node.js 18.17+ or 20+
* Git
* npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/26f2000861-AV/baton.git
cd baton
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
No PostgreSQL available? Local development works on SQLite — set `DATABASE_URL="file:./db/baton-dev.db"` in `.env` and use `npm run db:push` (the helper script works with plain npm; bun is optional but used when present).
Fill in the variables in `.env`:
```ini
# PostgreSQL connection string (or Neon serverless postgres)
DATABASE_URL="postgresql://user:password@localhost:5432/baton?sslmode=require"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-here"

# GitHub OAuth App credentials (optional for local demo signin)
GITHUB_ID=""
GITHUB_SECRET=""

# Optional GitHub PAT for higher import rate limits (5,000 req/h)
GITHUB_PAT=""
```

### 3. Initialize the Database
```bash
# Push schema to database and generate Prisma Client
npx prisma db push
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. You can immediately click **Judge & Demo Access** on the sign-in page to start evaluating.

---

## 🧪 Testing Suite

Baton includes automated tests for deterministic quote verification, GitHub payload mapping, TypeScript static analysis, and security authorization guards:

```bash
# Run unit test suite (Node test runner)
npm test

# Run TypeScript compilation check
npm run typecheck

# Run ESLint check
npm run lint
```

Test coverage includes 33 passing automated tests across 7 suites:
* `tests/verifier.test.mts`: Exact quote substring matching, CRLF normalization, whitespace degradation, and boundary checks.
* `tests/github-mappers.test.mts`: Pull request & commit DTO mapping, deleted author handling, claim extraction, and open PR triage into work items.
* `tests/authz.test.mts`: Authorization rules regression — role gates (403), CUID handover-id shape behind the 404 non-enumeration behavior, role-to-clearance mapping, founder-governance escape hatch for lead-less handovers, and creator protection against demotion or removal.
* `tests/crypto.test.mts`: AES-256-GCM token encryption at rest, authenticated encryption tags, idempotency, and tamper detection.
* `tests/ratelimit.test.mts`: In-memory sliding-window rate limiting per client IP with quota isolation.
* `tests/tenant.test.mts`: Multi-tenant Prisma client scoping ensuring tenant database isolation.
* `tests/utils.test.mts`: WHATWG URL parsing, allowed protocols (HTTPS/HTTP), and XSS scheme neutralization.

---

## 🗺️ Product Roadmap (Next 12 Months)

* **Phase 1 (Q1): Automated Connectors:** Linear and Jira sync for active work; Slack connector for ephemeral architecture discussions.
* **Phase 2 (Q2): Knowledge Graphs & Attestation:** Signed cryptographic handover certificates upon full successor acceptance.
* **Phase 3 (Q3): Identity Provider SCIM:** Automatic handover triggering when offboarding begins in Okta / Google Workspace.
* **Phase 4 (Q4): Enterprise Compliance:** SOC 2 Type II audit trail export and retention policies.

---

## 📄 Team & Final Submission Details

* **Hackathon:** CodersInPune 2026 (Final Round 3)
* **Team Name:** GIT LOST
* **Team Members:**
  * **Aditya Verma** (Team Leader) — Architecture, full-stack Next.js development, PostgreSQL schema, NextAuth & GitHub integrations.
  * **Manas Kapoor** — Documentation, testing protocols, and submission proposal.
* **AI Tool Disclosure:** AI coding assistants (Gemini, Antigravity CLI) were used for boilerplate acceleration, test drafting, and refactoring under full human review.
