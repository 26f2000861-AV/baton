# Baton Functional Specification 00: Overview & End-to-End Workflow Architecture
> **Planning specification — aspirational, not a shipped feature list.** This note describes parts of the original target design. Those workflows are not all implemented in the Round 2 demo, and some technical or research assumptions have not been validated. For current behavior and limitations, use the top-level README, source code, and Round 2 form draft.


## 1. System Vision & Purpose

Baton is an accountable knowledge-handover platform engineered for software engineering teams undergoing transitions. When an engineer departs, transfers, or steps off a project, the tacit knowledge underpinning architectural decisions, deferred technical debt, undocumented ownership boundaries, and operational risks typically evaporates. Successors are forced to reconstruct project context by combing through years of fragmented commits, pull requests, Slack threads, and issue tracker tickets.

Standard enterprise search tools (Glean, Copilot) provide live conversational query interfaces with access filtering, but they do not produce a persisted, accountable, and mutually agreed handover artifact. Conversely, legacy offboarding software relies almost exclusively on exit interviews and manual forms, which fail to capture the actual technical history recorded in repository activity. Baton bridges this gap by turning scattered project activity into an accountable **Claim Ledger**—a verifiable collection of discrete, atomic claims labeled with strict provenance status, compiled to the reader's security clearance, and validated through a recipient acceptance protocol.

This document outlines the overarching architecture, operational workflow, and interconnections between all core functional modules designed for the CodersInPune Round 2 build.

```
                                  +----------------------------+
                                  | Authorised Project Sources |
                                  | (GitHub, Slack, Jira/Docs) |
                                  +--------------+-------------+
                                                 |
                                                 v
                                  +----------------------------+
                                  | Ingestion & Quote Engine   |
                                  | (Verbatim snippet cache)   |
                                  +--------------+-------------+
                                                 |
                                                 v
                                  +----------------------------+
                                  | Deterministic Verifier     |
                                  | (Exact substring match)    |
                                  +--------------+-------------+
                                                 |
                                                 v
                                  +----------------------------+
                                  |    Atomic Claim Ledger     |
                                  | (Quoted/Inferred/Conflict) |
                                  +-------+--------------+-----+
                                          |              |
                      +-------------------+              +-------------------+
                      |                                                      |
                      v                                                      v
        +----------------------------+                         +----------------------------+
        | Contradiction Queue        |                         | Gap-Driven Interview       |
        | (Human settlement flow)    |                         | (Leaver answers rationale) |
        +-------------+--------------+                         +-------------+--------------+
                      |                                                      |
                      +-------------------+              +-------------------+
                                          |              |
                                          v              v
                                  +----------------------------+
                                  | Reader-Scoped Compiler     |
                                  | (Permissions & Redactions) |
                                  +--------------+-------------+
                                                 |
                                                 v
                                  +----------------------------+
                                  | Successor Acceptance Flow  |
                                  | (Section Accept / Query)   |
                                  +----------------------------+
```

---

## 2. The Four Knowledge Pillars

In direct alignment with the official CodersInPune hackathon mandate, Baton structures the handover into four central operational pillars:

1. **Decisions Already Taken:** Reconstructs the architectural and design rationale behind critical technical paths. It extracts Architectural Decision Records (ADRs), pull request debates, and migration justifications, distinguishing quoted historical facts from AI-inferred deductions.
2. **What Is Still Unfinished:** Gathers open pull requests, incomplete service migrations, deferred refactors, temporary workarounds (such as hardcoded timeouts or authentication bypasses), and converts them into an actionable first-30-days roadmap for the successor.
3. **Who Owned What:** Maps repository modules, cloud infrastructure, third-party vendor relationships, and operational escalation paths to specific contributors. It detects truck-factor vulnerabilities and routes incoming successors to the exact people who know the systems.
4. **Where the Risk Sits:** Identifies operational hazards, single points of failure, pending credential expirations, and active discrepancies between documentation and actual implementation through a structured contradiction resolution queue.

---

## 3. End-to-End Operational Lifecycle

The Baton operational lifecycle moves across six chronological stages, establishing an unbroken chain of custody:

### Stage 1: Multi-Source Ingestion & Verbatim Caching
Baton connects to authorized project repositories and communication channels. Raw artifacts—commit diffs, PR comments, issue descriptions, and message logs—are parsed and stored with cryptographic hashes, author identities, timestamps, and access-control tags. Crucially, Baton extracts exact verbatim quotes before drafting any claims, ensuring claims are tied to immutable source records.

### Stage 2: Claim Ledger Compilation & Deterministic Verification
The core engine parses the extracted evidence into atomic claims. Each claim undergoes a two-step validation: first, an exact string-matching check verifying that the referenced quote exists character-for-character within the source payload; second, an LLM entailment check ensuring the quote genuinely supports the claim. Any failure downgrades the claim from `quoted_verified` to `quoted_unverified` or `inferred_ai`.

### Stage 3: Gap Detection & Targeted Leaver Elicitation
The system identifies information deficits—claims categorized as `not_found`, `inferred_ai` (rationale gaps), or `conflicting`. Rather than presenting an exhaustive questionnaire, Baton formulates 5 to 8 focused, high-stakes questions for the departing engineer (e.g., *"Why was the authentication timeout extended in commit 8f4a1?"*). The leaver’s responses are stored as `stated_by_leaver`, signed with their identity and timestamp.

### Stage 4: Contradiction Reconciliation
When disparate sources provide conflicting data regarding owners, deadlines, or technology choices, Baton does not silently average or pick a winner. Discrepancies are queued in a human-in-the-loop settlement screen with source contexts displayed side-by-side. Authorized engineers categorize each contradiction as superseded over time, genuine disagreement, or differing operational scope.

### Stage 5: Reader-Scoped Version Compilation
Baton enforces purpose limitation and access control. Rather than saving a single master document that leaks the departing engineer's accumulated privileges, Baton compiles custom versions tailored to the viewer's security clearance (Successor, Engineering Lead, or Executive). Sensitive sources (such as private human resources communications or confidential compensation threads) are excluded from the successor's view. A side-by-side exposure diff allows managers to inspect withheld items prior to release.

### Stage 6: Recipient Acceptance & Query Protocol
The incoming engineer opens the handover and conducts a statement-level review. Successors can accept individual sections or log inline queries against specific claims. A handover is only deemed completed once all high-priority claims are either accepted or answered, replacing superficial "Approve All" rubber-stamping with true mutual accountability.

---

## 4. Module Specifications Directory

The detailed functional specifications for each component of the Baton platform are documented in the accompanying files within this directory:

- **Spec 01: Claim Ledger & Provenance Engine** (`01_claim_ledger_and_provenance_engine.md`)
- **Spec 02: Decisions & Architectural Rationale** (`02_decisions_and_architecture_rationale.md`)
- **Spec 03: Unfinished Work & Technical Debt** (`03_unfinished_work_and_technical_debt.md`)
- **Spec 04: Ownership Matrix & Contact Routing** (`04_ownership_matrix_and_contact_routing.md`)
- **Spec 05: Risk Detection & Contradiction Settlement** (`05_risk_detection_and_contradiction_queue.md`)
- **Spec 06: Reader-Scoped Compilation & Privacy Guard** (`06_reader_scoped_compilation_and_privacy.md`)
- **Spec 07: Gap-Driven Leaver Interview** (`07_gap_driven_leaver_interview.md`)
- **Spec 08: Successor Acceptance & Verification Protocol** (`08_successor_acceptance_and_verification.md`)

Together, these eight specifications provide the blueprint for the Round 2 build of Baton, ensuring strict alignment with academic research, competitive differentiation, and the hackathon judging rubric.
