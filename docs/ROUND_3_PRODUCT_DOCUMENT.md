# Baton — Final Product Proposal & Evaluation Dossier
**CodersInPune Hackathon 2026 — Round 3: The Final Product**  
**Team Name:** GIT LOST  
**Team Leader:** Aditya Verma (adityaverma200911@gmail.com)  
**Team Member:** Manas Kapoor  
**Live Deployed URL:** https://www.gitlostbaton.xyz  
**Source Repository:** https://github.com/26f2000861-AV/baton  

---

## 1. Executive Summary & Problem Statement

When an engineer leaves a team, tribal knowledge evaporates. The incoming engineer ("the successor") is left with fragments: Slack channels, closed pull requests, and undocumented architecture decisions. When critical services fail, the successor does not know who owned what, why specific choices were made, or where hidden technical landmines sit.

**Baton** is an accountable engineering handover platform. It replaces passive documentation with an active, evidence-backed handover workspace:
* **The Claim Ledger:** High-stakes engineering claims paired with verbatim excerpts from primary sources.
* **The 4 Core Pillars:**
  1. *Decisions Already Taken* (with rationale & alternatives considered).
  2. *Unfinished Work & Technical Debt* (first-30-days triage & adoption).
  3. *Ownership Matrix* (asset mapping, designated successors & escalation contacts).
  4. *Risk Detection & Contradiction Queue* (surfacing conflicting records for human settlement).
* **Gap-Driven Leaver Interview:** Targeted 5-question interview generated from undocumented gaps before departure.
* **Successor Sign-Off:** Section-by-section verification and formal handover acceptance.

---

## 2. What Changed Since Round 2: Delivering the Three Promised Improvements

In the Round 2 submission, our team committed to three specific improvements for Round 3. All three have been fully designed, implemented, and deployed:

| Promised in Round 2 Form | Shipped in Round 3 Product | Proof for Judges |
| :--- | :--- | :--- |
| **Improvement 1: Persistent, authenticated handover workspace**<br>Add sign-in, server-side role authorization, and persistent storage for handover records. A successor can return later and see the same state; persona-switch no longer grants access. | **Delivered:** NextAuth.js v4 (GitHub OAuth + 1-Click Demo Accounts for Judges), PostgreSQL (Neon Serverless) via Prisma ORM v6, multi-tenant handover isolation with transactional cloning, and strict server-side authorization guards (`requireSession` → `requireMembership` → `requireRole`). Client-side localStorage has been completely eliminated. | Sign in on two different devices/browsers; state persists identically across sessions.<br>Attempting a lead-only operation (e.g. `POST /api/handovers/:id/contradictions/:cid/settle`) from a successor session returns `403 Forbidden`. Non-members receive `404 Not Found` to prevent ID enumeration. |
| **Improvement 2: Evidence-backed source import**<br>Add scoped GitHub import for pull requests and commits, map imported source records to claims with verifiable excerpts and links back to origin. Show clear import errors and unsupported source types. | **Delivered:** Live GitHub REST API v3 import engine (`src/lib/github.ts`). Merged PRs map to claims with verbatim excerpts; open PRs map to unfinished work items. 3-tier auth fallback chain (`user_oauth` → `server_pat` → `public`). In-UI tracking of job statuses, failure states, and explicitly declared unsupported sources (Slack/Linear/Jira). | Navigate to the Sources panel, import any repository (e.g. `26f2000861-AV/baton`), inspect imported PRs/commits, click origin links back to GitHub, and verify character-offset quote matching. |
| **Improvement 3: Shared, verifiable work history**<br>Extend local capture prototype into a shared, dated team history. Persist entries with author identity, link to imported PRs, and render machine verification separately from author explanations. | **Delivered:** Shared Work History (`src/components/HistoryView.tsx`, `/api/handovers/:id/work-updates`). Updates record author identity from authenticated session. Deterministic substring verifier is rendered as a separate machine-verification badge distinct from human explanations. Central activity timeline captures settlements, imports, and member updates across devices. | Record a work update in one account; sign in from another device as another member to see the exact update, linked quote, and audit status in real time. |

---

## 3. Evaluator Quick Start & Demo Credentials

To ensure hackathon judges can immediately test the fully authenticated product without granting GitHub OAuth permissions or experiencing external API hiccups, **1-click verified demo accounts** are available on the website:

* **Sign-in URL:** [https://www.gitlostbaton.xyz/signin](https://www.gitlostbaton.xyz/signin)
* **Demo Accounts (1-Click Passwordless Access):**
  * **`demo_successor` (Priya Sharma - Senior Backend Engineer)**: *Recommended for Judges*. Test the primary evaluation workflow: review claims, inspect provenance, adopt open work items, ask questions, and accept sections.
  * **`demo_lead` (Vikram Malhotra - Engineering Director)**: Test contradiction settlement, review exposure audit diffs, and manage team memberships.
  * **`demo_leaver` (Alex Chen - Staff Platform Engineer)**: Test the gap-driven exit interview and attest knowledge before offboarding.
* **Real GitHub Authentication:** Available via the **Continue with GitHub** button for users who wish to connect their real GitHub profile and import private/public repositories.

---

## 4. End-to-End Handover Workflow

1. **Authentication & Seat Provisioning:** User authenticates via GitHub OAuth or 1-click Demo Account. On first sign-in, the user chooses between provisioning a private clone of the Helios synthetic case or importing a live GitHub repository, and selects their role.
2. **Reviewing the Evidence:** The successor reviews the 4 pillars. Each claim displays its verification status (`exact_match`, `inferred`, `stated_by_leaver`, `contradiction_pending`). Clicking any claim opens the Source Inspector drawer showing the raw document with exact character highlights.
3. **In-Work Decision Capture:** When engineers make tactical choices during the transition, they record what changed, the rationale, and next steps. The entry is timestamped, attributed to their session user, and added to the team's shared history.
4. **Contradiction Settlement:** Conflicting evidence (e.g., code commits claiming AWS SQS vs Slack chats confirming RabbitMQ rollback) is queued in Pillar 4. The Engineering Lead records an authoritative decision note to resolve ambiguity.
5. **Gap-Driven Leaver Interview:** The departing engineer answers 5 focused questions targeting undocumented areas. Answers immediately upgrade claim statuses to `stated_by_leaver`.
6. **Successor Sign-Off:** The successor marks individual sections as accepted (with full undo capability) and submits contextual questions to the lead/leaver.

---

## 5. Technical Architecture & Security Model

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

### Security & Authorization Guardrails:
* **Untrusted Client:** Client-side role badges and disabled buttons are UX conveniences only. Every API endpoint enforces three layers:
  1. `requireSession()`: Validates cryptographic JWT signature. Returns `401 Unauthorized` if invalid.
  2. `requireMembership(handoverId)`: Confirms caller holds a row in `Membership` for that specific handover. Returns `404 Not Found` (never 403) so non-members cannot enumerate valid handover IDs.
  3. `requireRole(role)`: Validates role permissions (e.g., only `lead` can settle contradictions; only `successor` can sign off sections). Returns `403 Forbidden` if unauthorized.
* **Deterministic Quote Verification:** The `/api/verify` engine performs exact substring matching with CRLF normalization, whitespace degradation, and boundary checks. No generative LLM is placed in the evidence verification path, preventing synthetic hallucinations.

---

## 6. Testing & Quality Assurance

Baton has undergone rigorous automated and manual validation:
* **Automated Unit Tests:** 33 unit tests running on Node's native test runner across 7 targeted test suites: quote verification edge cases, GitHub DTO mapping, deleted author handling, open PR triage, authorization regression rules (role gates, id-shape non-enumeration, founder governance, lead-mutation protection), AES-256-GCM token encryption at rest, sliding-window rate limiting, multi-tenant Prisma client scoping, and WHATWG URL sanitization.
* **Type Safety:** Full TypeScript strict compilation (`tsc --noEmit`) passes with zero errors.
* **Security & Authz Regression:** Verified 401 unauthenticated, 403 forbidden, and 404 obscure-id behaviors; demo-seat takeover attempt rejected with 401.
* **Cross-Browser Verification:** Tested across Chrome, Safari, and Firefox.

---

## 7. Product Roadmap (12-Month Outlook)

* **Q1 (Connectors):** Linear and Jira two-way sync for active tasks; Slack bot to capture architecture decisions from threads.
* **Q2 (Attestation):** Cryptographically signed handover certificates upon complete sign-off; dependency knowledge graphs.
* **Q3 (Enterprise Identity):** SCIM 2.0 integration with Okta and Google Workspace to automatically trigger handover provisioning upon HR notice.
* **Q4 (Compliance):** SOC 2 Type II audit report exports and configurable data retention policies.

---

## 8. Team Contributions & Disclosures

* **Aditya Verma (Team Leader):** Full-stack architecture, Next.js App Router implementation, PostgreSQL schema & Prisma ORM, NextAuth integration, GitHub REST engine, and Vercel cloud deployment.
* **Manas Kapoor:** System documentation, testing protocols, user journey specifications, and final submission dossier.
* **AI Tool Disclosure:** AI coding assistants (Gemini, Antigravity CLI) were used for boilerplate acceleration, test drafting, and refactoring under full human review.
