# Baton Functional Specification 05: Risk Detection & Contradiction Queue
> **Planning specification — aspirational, not a shipped feature list.** This note describes parts of the original target design. Those workflows are not all implemented in the Round 2 demo, and some technical or research assumptions have not been validated. For current behavior and limitations, use the top-level README, source code, and Round 2 form draft.


## 1. Problem Statement & Theoretical Foundation

When developers offboard, operational risks and contradictions between documentation and actual implementation represent the most dangerous hazards for successors.
- **The LLM Contradiction Blindspot:** Natural language processing research (WikiContradict) has revealed that standard large language models perform poorly when presented with contradictory evidence. Instead of surfacing discrepancies, generative models tend to silently hallucinate a false consensus, conflate conflicting dates, or arbitrarily choose a single source without notifying the user.
- **One-Sided Retrieval:** Benchmarks such as DeepTRACE indicate that retrieval-augmented generation (RAG) pipelines often retrieve only the most semantically prominent document, ignoring newer or dissenting sources stored in other channels.
- **The Competitive Distinction:** While developer productivity tools like Unblocked attempt to automatically settle contradictions using algorithmic weights and recency scores, a knowledge-handover system has the opposite requirement. In an offboarding scenario, **the contradiction itself is the primary operational discovery**. Silently picking a winner risks blinding the successor to an unresolved architectural debate or a critical rollback.

Baton actively identifies **Where the Risk Sits** and surfaces discrepancies through a dedicated, human-in-the-loop **Contradiction Settlement Queue**.

---

## 2. Cross-Source Contradiction Detection Engine

Baton monitors structured attributes across all connected communication channels and repositories:

```
[GitHub PRs / Commits]      [Slack Conversations]      [Linear / Jira Tickets]
           |                          |                           |
           +--------------------------+---------------------------+
                                      |
                                      v
                        [Entity & Attribute Extractor]
                     (Subject - Attribute - Value Triples)
                                      |
                                      v
                        [Pairwise Contradiction Scanner]
                     (Checks Value Disparity on Same Entity)
                                      |
                                      v
                        [Typed Contradiction Queue]
```

### Structured Attribute Matching
Rather than executing noisy, pairwise comparisons across millions of unstructured prose tokens, Baton focuses its contradiction scanner on high-stakes structured attributes:
- **Service Ownership:** (e.g., Jira states owner is *Alice*; Slack states owner is *Bob*).
- **Architecture / Active Engine:** (e.g., PR #204 states queue is *AWS SQS*; Slack states fallback is *RabbitMQ*).
- **Deployment Status:** (e.g., Linear ticket marked *Completed*; code comments state *Feature Flag Off in Prod*).
- **Target Milestones:** (e.g., Confluence page targets *Dec 1*; engineering chat targets *Q1 2027*).

---

## 3. The Three-Category Contradiction Taxonomy

Following empirical recommendations on conflict handling in automated reasoning (CONFLICTS preprint), Baton categorizes every detected discrepancy into one of three explicit types:

1. `superseded_over_time`: A chronological progression where a newer decision or code commit intentionally replaces an older document. 
   *Resolution Flow:* Baton proposes a single-click confirmation for the reviewer to mark the earlier source as superseded and archive the stale assertion.
2. `genuine_disagreement`: Two active, concurrent sources express conflicting operational realities (e.g., an Engineering Manager instructing the team in Slack to pause migrations while a Senior Engineer continues merging dual-write scripts).
   *Resolution Flow:* Requires explicit human escalation and decision-making; cannot be settled automatically.
3. `scope_difference`: The apparent contradiction arises because the two statements apply to different operational environments, geographic regions, or deployment tiers (e.g., AWS SQS in US-East vs RabbitMQ on-premise in EU).
   *Resolution Flow:* Baton prompts the user to annotate the distinct operational scopes.

---

## 4. Data Schema: The Contradiction Object

```typescript
export interface ContradictionItem {
  id: string
  entityName: string          // e.g. "Payment Event Dispatcher"
  attributeName: string       // e.g. "Active Message Queue Technology"
  type: 'superseded_over_time' | 'genuine_disagreement' | 'scope_difference'
  severity: 'critical_blocker' | 'operational_risk' | 'minor_inconsistency'
  status: 'open_unresolved' | 'settled_by_human'
  sourceA: {
    sourceType: 'github_pr'
    title: string
    url: string
    timestamp: string
    author: string
    extractedValue: string
    exactQuote: string
  }
  sourceB: {
    sourceType: 'slack_message'
    channelName: string
    timestamp: string
    author: string
    extractedValue: string
    exactQuote: string
  }
  settlement?: {
    resolvedBy: string
    resolutionTimestamp: string
    resolutionType: 'accept_source_a' | 'accept_source_b' | 'clarification_note'
    humanComment: string
  }
}
```

---

## 5. User Interface: The Side-by-Side Settlement View

In the Baton web application, unresolved contradictions are displayed on a specialized review interface designed to prevent accidental rubber-stamping:

```
+--------------------------------------------------------------------------------+
|  CONTRADICTION DETECTED: Active Queue for Payment Event Dispatching            |
|  Severity: Critical Blocker  |  Type: Disagreement / Unverified Fallback       |
+---------------------------------------+----------------------------------------+
| SOURCE A: GitHub PR #204              | SOURCE B: Slack #payment-eng           |
| Author: Alex Chen (Oct 14, 2026)      | Author: Alex Chen (Nov 02, 2026)       |
| "Successfully migrated payment        | "Heads up: SQS hit throttling latency. |
|  settlement queue to AWS SQS."        |  Temporarily routed webhook retries    |
|                                       |  back to our RabbitMQ cluster."        |
+---------------------------------------+----------------------------------------+
|                               ACTIONS                                          |
|  [Accept Source A (SQS)]  [Accept Source B (RabbitMQ)]  [Annotate Dual-Scope]  |
+--------------------------------------------------------------------------------+
```

- **Dual-Pane Diff Inspector:** Evaluators and engineers see both source snippets highlighted in their native context side-by-side with exact publication timestamps.
- **Resolution Audit Trail:** When an engineering lead clicks an action button (e.g., `Accept Source B`), Baton records who resolved the conflict, why, and generates an updated claim labeled `confirmed_by_lead`.

---

## 6. Judge Demonstration Proof Points

This module serves as the centerpiece for demonstrating Baton’s superior safety over generic generative AI:
1. **The SQS vs. RabbitMQ Trap:** The pre-seeded demo includes PR #204 (claiming full migration to AWS SQS) and a later Slack message (disclosing a silent fallback to RabbitMQ due to throttling).
2. **Generative Summarizer Failure Comparison:** Baton provides a side-by-side comparison toggle demonstrating what a standard generative LLM outputs (e.g., *"Payment events are handled by AWS SQS"*, completely missing the rollback).
3. **Baton's Contradiction Queue:** Baton displays the discrepancy clearly in the red Contradiction Queue, allowing the judge to act as the Engineering Lead and resolve the conflict in real-time.
4. **Scoring Alignment:** Evaluators immediately observe how Baton isolates hidden risks that would otherwise trigger major production incidents for a new engineer.
