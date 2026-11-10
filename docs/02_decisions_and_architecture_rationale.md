# Baton Functional Specification 02: Decisions & Architectural Rationale
> **Planning specification — aspirational, not a shipped feature list.** This note describes parts of the original target design. Those workflows are not all implemented in the Round 2 demo, and some technical or research assumptions have not been validated. For current behavior and limitations, use the top-level README, source code, and Round 2 form draft.


## 1. Problem Statement & Theoretical Foundation

In software engineering offboarding, the most critical and frequently lost knowledge is not *what* code was written, but *why* it was written that way.
- **The Robillard Finding:** Robillard’s landmark 2021 study across 41 software departure situations revealed that incoming engineers can easily read existing codebases, but they struggle acutely to understand *intent*, *design rationale*, *deliberate trade-offs*, and *discarded alternatives*. Without this context, successors unwittingly re-introduce bugs that predecessors spent months solving.
- **Deferred Rationale Inquiries:** Ko et al. demonstrated that developers repeatedly defer architectural questions because the only authoritative source is an unavailable former team member.
- **The Limits of AI Rationale Mining:** Studies on automated design rationale extraction (DRMiner) show maximum F1 scores around 65%. Furthermore, Zhou et al. proved that while large language models can generate plausible-sounding explanations for code structures, their precision against the original engineers' actual rationale is under 0.28. Generative models frequently fabricate elegant justifications for what was actually an emergency hack or temporary stopgap.

To prevent generative fabrication, Baton strictly separates **Documented Historical Decisions** from **AI-Inferred Rationale**, ensuring that architectural history is preserved with forensic accuracy.

---

## 2. Ingestion & Structured Decision Schema

Baton actively extracts architectural decisions from four distinct historical artifacts:
1. **Architectural Decision Records (ADRs):** Markdown files stored in repository paths like `/docs/adr/` or `/architecture/`.
2. **Pull Request Descriptions & Review Discussions:** PR threads where technical debates, trade-offs, and reviewer pushback occurred prior to merging.
3. **Issue Tracker RFCs & Design Tickets:** Linear, Jira, or GitHub Issues tagged with `architecture`, `rfc`, or `proposal`.
4. **Code Comments & Commit Messages:** Commit bodies containing explicit change rationale or deprecation notices.

### The Decision Object Schema
Every captured architectural decision is modeled as a structured record:

```typescript
export interface ArchitecturalDecision {
  id: string
  title: string
  timestamp: string
  status: 'active' | 'superseded' | 'deprecated' | 'proposed'
  context: string            // What problem prompted this decision?
  decisionTaken: string      // What specific solution was adopted?
  alternativesConsidered: {
    technology: string
    rejectionReason: string
    sourceSnippet?: string
  }[]
  tradeOffsAccepted: string[] // Documented technical debt or performance concessions
  keyStakeholders: {
    proposer: string
    approver: string
  }
  provenance: {
    sourceId: string
    sourceType: 'pr_review' | 'adr' | 'slack_thread' | 'issue'
    url: string
    exactQuote: string
    rationaleConfidence: 'documented_explicit' | 'inferred_ai' | 'stated_by_leaver'
  }
}
```

---

## 3. Core Processing Pipeline: Differentiating Fact from Inference

Baton processes decisions through a four-stage rationale pipeline:

```
[Ingest Pull Requests & RFCs]
              |
              v
[Extract Problem / Solution Pairs]
              |
              v
[Check for Documented 'Why']
      |               |
      | Found         | Missing or Vague
      v               v
[Status: Quoted]   [LLM Hypothesis Generation]
                      |
                      v
                   [Status: Inferred Rationale]
                      |
                      v
                   [Push to Gap Interview Queue]
```

### Stage 1: Decision Extraction
Using pattern recognition and structured model prompts, Baton identifies deliberate technology choices (e.g., database transitions, protocol choices, caching layers, and third-party API adoptions).

### Stage 2: Rationale Grounding Check
The engine scans the source text for explicit causal connectors (*"because"*, *"migrated due to"*, *"in order to prevent"*, *"benchmarking showed"*). 
- If an explicit justification is present in the source text, it is extracted verbatim, verified against the source, and labeled `quoted_verified` under `documented_explicit`.
- If a technical choice occurred without recorded rationale (such as a commit titled *"change queue worker to Postgres"* accompanied by zero explanation), Baton does **not** invent a definitive reason. Instead, the model creates a cautious hypothesis labeled `inferred_ai`.

### Stage 3: The Gap Interview Escalation
Every architectural decision carrying an `inferred_ai` rationale is automatically registered as an active knowledge gap. It is queued into the Gap-Driven Leaver Interview module (Specification 07). Baton prompts the departing engineer:
> *"PR #189 shows switching the payment processing queue from Redis to PostgreSQL, but no performance benchmarks or rationale were recorded. Why was this switch made?"*

When the departing engineer responds, the rationale is updated to `stated_by_leaver`, capturing the authentic human institutional memory before they depart.

---

## 4. User Interface: Architectural Decision Timeline

In the Baton interface, the **Decisions Already Taken** section is presented as an interactive visual timeline:

- **Chronological Flow:** Displays the evolution of the technical stack over the leaver’s tenure.
- **Superseded Badging:** When a newer decision replaces an older one (e.g., migrating from REST to gRPC in Q3 after building REST in Q1), the earlier card is automatically stamped with a strikethrough badge labeled `Superseded by ADR-008`, preventing incoming engineers from referencing obsolete patterns.
- **Discarded Alternatives Matrix:** An expandable tray reveals options that were considered and rejected. This directly solves a notorious developer pain point: a new hire suggesting an architecture that the previous team already tested and abandoned.

---

## 5. Judge Demonstration Proof Points

In the Round 2 hackathon presentation, this module demonstrates Baton’s depth and fidelity:
1. **The Planted "Silent Hack" Scenario:** The demo environment includes a code commit where authentication token expiration was abruptly increased from 15 minutes to 72 hours with the commit message `// quick fix`.
2. **AI Inference vs. Human Attestation:** Baton shows the decision card with an amber badge: `Rationale: Inferred AI (Potential mobile sync workaround)`. 
3. **Interactive Closure:** The presenter shows how one click from the leaver replaces the amber AI inference with a purple `Stated by Alex Chen (Leaver)` badge explaining the actual production incident that forced the change. This clearly proves to judges that Baton captures genuine tribal knowledge.
