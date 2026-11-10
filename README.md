# Baton — Accountable Engineering Handover Platform

> **CodersInPune Hackathon (Round 2 — The Build)**  
> **Team Name:** GIT LOST  
> **Team Leader:** Aditya Verma  
> **Team Member:** Manas  
> **Core Evaluated Workflow:** *"the decisions already taken, what is still unfinished, who owned what, and where the risk sits — without having to chase anyone."*

---

## Overview

When software engineers leave an organization, tribal knowledge evaporates. Successors are forced to dig through old pull requests, chat logs, and issue trackers to recover the "why" behind decisions.

**Baton** transforms scattered project activity into an **Accountable Claim Ledger**—a verifiable database of atomic claims labeled with strict evidence provenance, reader-scoped permissions, and gap-driven leaver interviews.

### The Five Core Capabilities
1. **Atomic Claim Ledger with Deterministic Verification:** Pure TypeScript substring checking (`verifyQuoteAgainstSource`) verifies quotes character-by-character against raw source documents before validating claims. Unverified quotes are automatically downgraded.
2. **Contradiction Settlement Queue:** Disagreement *is* the product discovery. Cross-source contradictions (e.g. PR #204 claiming AWS SQS vs Slack #payment-eng revealing rollback to RabbitMQ) are surfaced side-by-side for human settlement.
3. **Gap-Driven Leaver Focus Interview:** Generates 5 targeted questions derived strictly from detected gaps (`not_found`, `inferred_ai` rationale). Submitting answers immediately stamps claims as `stated_by_leaver`.
4. **Reader-Scoped Demo Views:** Filters the sample claim ledger by the selected demo persona. This is a UI demonstration only: personas are selectable and are not authenticated identities or a security boundary. Do not use real confidential data with this zero-login build. A production deployment must authenticate users and enforce authorization on the server before returning claims or sources.
5. **I-PASS-Inspired Receiver Acceptance:** Successor reviews sections individually, records acceptance, and can raise claim-linked questions. The current workspace does not issue a downloadable or signed certificate.

---

## Live Demo & Zero-Sign-in Access

The application opens with **zero login barrier** in incognito/private windows, directly loading a **synthetic FinTrack Payment Core Handover** case. All names, records, conversations, and credentials are fabricated for demonstration; do not treat this app as a secure handover system:
- **Alex Chen** (Staff Platform Engineer — Departing)
- **Priya Sharma** (Senior Backend Engineer — Successor)
- **Vikram Malhotra** (Engineering Director — Lead)

---

## Quick Start (Local Run)

```bash
# Clone the repository
git clone https://github.com/26f2000861-AV/baton.git
cd baton

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
baton/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with Tailwind CSS & typography
│   │   ├── page.tsx                  # Landing page & interactive ink ledger hero
│   │   ├── workspace/
│   │   │   ├── layout.tsx            # Workspace layout wrapper
│   │   │   └── page.tsx              # Main Handover Dashboard (The 4 Pillars & Persona Switcher)
│   │   └── api/verify/route.ts       # Substring exact-match & Gemini entailment API
│   ├── components/
│   │   ├── HomeHero.tsx              # Landing page hero component
│   │   ├── PillarDecisions.tsx       # Decisions Already Taken timeline
│   │   ├── PillarUnfinished.tsx      # First 30 Days triage roadmap
│   │   ├── PillarOwnership.tsx       # Ownership matrix & "Who to Ask" cards
│   │   ├── PillarRisks.tsx           # Contradiction queue & active hazards
│   │   ├── SourceInspectorDrawer.tsx # Slide-over raw source viewer
│   │   ├── LeaverInterviewModal.tsx  # Focused 5-question interview drawer
│   │   ├── ContradictionModal.tsx    # Side-by-side source diff resolution
│   │   ├── ExposureDiffModal.tsx     # Lead compliance audit modal
│   │   └── SuccessorSignoffBar.tsx   # Section-by-section accept/query console
│   ├── lib/
│   │   ├── types.ts                  # Shared TypeScript domain models
│   │   ├── verifier.ts               # Deterministic exact substring matching engine
│   │   ├── personaCompiler.ts        # Reader-clearance filter & exposure diff
│   │   ├── gemini.ts                 # Structured Gemini API client with offline fallback
│   │   └── store.tsx                 # Reactive state store with mutation handlers
│   └── data/
│       ├── rawSources.ts             # Raw synthetic GitHub PRs, Slack threads, Linear tickets
│       └── seedCase.ts               # FinTrack Payment Core pre-seeded claim ledger
└── docs/                             # Functional specifications & submission deliverables
```

---

## Submission & Documentation

Complete functional specifications and the 7 mandatory Round 2 submission deliverables are available in [`docs/`](./docs/):
- `docs/00_overview_and_workflow_architecture.md`
- `docs/01_claim_ledger_and_provenance_engine.md`
- `docs/02_decisions_and_architecture_rationale.md`
- `docs/03_unfinished_work_and_technical_debt.md`
- `docs/04_ownership_matrix_and_contact_routing.md`
- `docs/05_risk_detection_and_contradiction_queue.md`
- `docs/06_reader_scoped_compilation_and_privacy.md`
- `docs/07_gap_driven_leaver_interview.md`
- `docs/08_successor_acceptance_and_verification.md`
- `docs/09_why_baton_stands_out_and_differentiation.md`
- `docs/SUBMISSION_DRAFT.md`
