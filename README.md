# Baton — Accountable Engineering Handover Platform

> **CodersInPune Hackathon (Round 2 — The Build)**  
> **Team Name:** GIT LOST  
> **Team Leader:** Aditya Verma  
> **Team Member:** Manas  
> **Core Evaluated Workflow:** *"the decisions already taken, what is still unfinished, who owned what, and where the risk sits — without having to chase anyone."*

---

## Overview

When software engineers leave an organization, tribal knowledge evaporates. Successors are forced to dig through old pull requests, chat logs, and issue trackers to recover the "why" behind decisions.

**Baton** is a handover workspace demonstrated with a synthetic case. It groups seeded claims, source excerpts, decisions, unfinished work, ownership, and conflicts so an incoming engineer can review what needs attention. It is not a database or a production access-control system.

### The Five Core Capabilities
1. **Seeded claim ledger with quote checking:** A reviewer can check whether edited text appears in the app’s synthetic source corpus. A match confirms text presence only; it does not prove the full claim or change the pre-seeded claim status. There is no live source ingestion.
2. **Contradiction Settlement Queue:** Disagreement *is* the product discovery. Cross-source contradictions (e.g. PR #204 claiming AWS SQS vs Slack #payment-eng revealing rollback to RabbitMQ) are surfaced side-by-side for human settlement.
3. **Leaver interview demo:** Five questions are seeded from sample gaps. Submitting an answer updates a related sample claim to `stated_by_leaver` and records a timestamp in browser memory.
4. **Reader-Scoped Demo Views:** Filters the sample claim ledger by the selected demo persona. This is a UI demonstration only: personas are selectable and are not authenticated identities or a security boundary. Do not use real confidential data with this zero-login build. A production deployment must authenticate users and enforce authorization on the server before returning claims or sources.
5. **Successor review and questions:** A successor can mark sections reviewed, undo a review, and submit claim-linked questions. In the same browser session, the lead persona can record a reply. Nothing is sent to another person, changes reset on refresh, and no certificate is issued.

The public verifier route performs deterministic text-presence checks only. Model-based entailment is not exposed in the demo.

---

## Live Demo & Zero-Sign-in Access

Open the [deployed workspace](https://gitlostbaton.xyz/workspace#/) to view a **synthetic FinTrack Payment Core Handover** case. The app has no login. All names, records, conversations, and credentials are fabricated for demonstration; do not treat this app as a secure handover system:
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
│   │   └── api/verify/route.ts       # Deterministic quote check over synthetic sources
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
│   ├── lib/
│   │   ├── types.ts                  # Shared TypeScript domain models
│   │   ├── verifier.ts               # Deterministic exact substring matching engine
│   │   ├── personaCompiler.ts        # Reader-clearance filter & exposure diff
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
