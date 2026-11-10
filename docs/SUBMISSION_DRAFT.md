# Round 2 Official Submission Draft — Team GIT LOST

> **Superseded draft — do not submit.** The feature and implementation claims below describe an earlier version. Use `docs/ROUND_2_FORM_RESPONSE_DRAFT.md` as the current factual drafting aid, then personally verify every statement and complete all TODOs before submitting.

> **Hackathon:** CodersInPune (Round 2 — The Build)  
> **Team Name:** GIT LOST  
> **Team Leader:** Aditya Verma  
> **Team Member:** Manas  
> **Project Name:** Baton  
> **Core Workflow Scored:** *"the decisions already taken, what is still unfinished, who owned what, and where the risk sits — without having to chase anyone."*

---

## 1. Working Project Link
- **Live Deployment URL:** `[To be added upon Vercel deployment: e.g. https://baton-gitlost.vercel.app]`  
- **Access Note:** Openable directly in incognito/private windows with **zero sign-in or login barrier**. Automatically loads the interactive FinTrack Payment Core handover case.

---

## 2. Source-Code Repository Link
- **Public GitHub Repository:** https://github.com/26f2000861-AV/baton  
- **Stack:** Fullstack Next.js 14 App Router, TypeScript, Tailwind CSS, Google Gemini 1.5/2.0 API.

---

## 3. Updated Project Overview & PDF Presentation
- **Project Deck / PDF Link:** `[Google Drive Incognito-tested PDF link]`  
- **Presentation Narrative:** Covers the academic evidence (Robillard 2021, Rigby et al., Mockus), the 15-product competitive gap analysis, the deterministic quote verification engine, and live walkthrough screenshots of the 4 pillars.

---

## 4. List of Completed Features

### Core Pillar 1: Decisions Already Taken (The "Why" Behind the Code)
- [x] **ADR & PR Decision Extraction:** Structured decision timeline extracting architectural choices (e.g. ADR-004: Postgres `SKIP LOCKED` replacing Redis).
- [x] **Discarded Alternatives & Trade-offs:** Explicit tracking of rejected technologies (Redis Sentinel, Kafka) to prevent successors from re-testing dead ends.
- [x] **Evidence Separation:** Green `quoted_verified` badges for documented facts vs amber `inferred_ai` badges for AI-synthesized rationale.

### Core Pillar 2: What Is Still Unfinished (First 30 Days Roadmap)
- [x] **Triaged Roadmap:** Organizes open PRs, stale branches, and technical debt into **Days 1–7** (Urgent Triage), **Days 8–15** (PR Adoption), and **Days 16–30** (System Hygiene).
- [x] **Interactive PR Adoption:** Successor can review blocker context (e.g., PR #214 webhook exponential backoff jitter failure on line 84) and click "Adopt PR" to take over the branch.

### Core Pillar 3: Who Owned What (Ownership with a Fallback)
- [x] **Multi-Layer Ownership Mapping:** Tracks code modules, cloud infrastructure, and third-party SaaS credentials.
- [x] **Ownership Concentration Index (OCI):** Flags high truck-factor risks (e.g., OCI 88% on Stripe Webhook Signing Secret Key where Alex Chen was sole custodian).
- [x] **Who to Ask Dynamic Routing:** Direct escalation paths routing successors to designated active experts (Dev Patel, Vikram Malhotra).

### Core Pillar 4: Where the Risk Sits (Contradiction Settlement Queue)
- [x] **Cross-Source Contradiction Detection:** Surfaces active discrepancies across disparate sources rather than silently picking a winner (e.g., PR #204 claiming AWS SQS vs Slack #payment-eng revealing rollback to RabbitMQ).
- [x] **Side-by-Side Settlement Interface:** Human-in-the-loop modal allowing Engineering Leads to inspect evidence side-by-side and record binding settlement notes into the audit trail.

### Pillar 5: Security & Governance (Reader-Scoped Access)
- [x] **Persona Clearance Filter:** Instant switching between `Successor (Priya)`, `Leaver (Alex)`, and `Lead (Vikram)`.
- [x] **Persona-Scoped Demo View:** The synthetic sample ledger demonstrates filtering by selected persona. Personas are not authenticated identities; the zero-login demo does not provide production access control and must not contain real confidential data.
- [x] **Lead Exposure Preview Diff:** Dedicated audit modal for managers showing exactly what claims were shielded and why.

### Pillar 6: Elicitation & Mutual Accountability
- [x] **Gap-Driven 5-Question Leaver Focus Drawer:** Asks only high-priority questions on detected gaps (`not_found`, `inferred_ai` rationale). Submitting answers immediately updates claims to `stated_by_leaver`.
- [x] **I-PASS-Inspired Receiver Acceptance:** Successor reviews sections individually, records acceptance, and can raise claim-linked questions. The current workspace does not issue a downloadable or signed certificate.

---

## 5. Technology and Implementation Details

- **Frontend & Fullstack Framework:** Next.js 14.2 (App Router, Server Components + Client interactivity).
- **Language & Type Safety:** Strict TypeScript 5 with comprehensive shared domain interfaces (`Claim`, `SourceSpan`, `ArchitecturalDecision`, `OwnershipAsset`, `ContradictionItem`).
- **Styling & Components:** Tailwind CSS, Lucide React icons, dark-mode native palette.
- **Deterministic Verification Engine:** Pure TypeScript character-by-character substring matching algorithm (`verifyQuoteAgainstSource`) that deterministically checks quotes against raw source text before validating claims. Automatically downgrades paraphrased or altered quotes to `quoted_unverified`.
- **Inference & Entailment Engine:** Google Gemini 1.5 Flash API with structured JSON schemas (`checkClaimEntailmentWithGemini`) evaluating logical entailment, with zero-latency pre-computed fallbacks ensuring 100% demo uptime.
- **Data Architecture:** Self-contained reactive state store (`store.tsx`) pre-seeded with the realistic **FinTrack Payment Core** microservices dataset ("The Robillard Dataset").

---

## 6. Explanation of Changes Made to the Original Plan

1. **Prioritized Deterministic Substring Verification over Heavy Vector Embeddings:**
   - *Original Plan:* Planned PostgreSQL with `pgvector` for broad semantic retrieval.
   - *Change:* We discovered through academic research (Magesh et al., Ding et al.) that vector search often retrieves irrelevant chunks that generative models hallucinate citations for. We pivoted to a **Quote-First Deterministic Verifier** that exact-matches substrings directly against raw source payloads. This eliminated retrieval latency, removed complex database infrastructure requirements, and provided 100% verifiable ground truth for the judges.
2. **Explicit Contradiction Settlement over Silent Reconciliations:**
   - *Original Plan:* Standard conflict detection.
   - *Change:* Expanded into a dedicated **Contradiction Settlement Queue** inspired by WikiContradict and CONFLICTS research, categorizing discrepancies into `superseded_over_time`, `genuine_disagreement`, and `scope_difference` with side-by-side evidence inspection.
3. **Clinical Handover Protocol (I-PASS) Integration:**
   - *Original Plan:* Simple manager approval button.
   - *Change:* Replaced the dangerous single "Approve All" button with section-by-section successor acceptance and inline query tracking, eliminating cognitive rubber-stamping.

---

## 7. Three Major Improvements for Round 3 (Non-Cosmetic)

1. **Bi-Directional Enterprise Webhook Listeners & Live Ingest Connectors:**
   - Implement production GitHub App webhooks and Slack Enterprise Grid event listeners that continuously extract atomic claims as PRs are merged and threads are resolved, keeping the handover evergreen before notice is even given.
2. **Automated Cross-Repository AST & Code-Graph Drift Tracking:**
   - Integrate Tree-sitter / TypeScript compiler API AST analysis to detect silent architectural drift—automatically flagging when a newly committed function violates an existing ADR or bypasses an approved service boundary.
3. **Multi-Tenant SOC2 / ISO 27001 Offboarding Compliance Exporter:**
   - Build cryptographic signing and tamper-evident audit log export (PDF/JSON with Merkle tree proofs) certifying that all cloud access, secret rotation, and knowledge transfers were completed before HR deactivates employee identity accounts.
