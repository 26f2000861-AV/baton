# Baton Functional Specification 08: Successor Acceptance & Verification Protocol
> **Planning specification — aspirational, not a shipped feature list.** This note describes parts of the original target design. Those workflows are not all implemented in the Round 2 demo, and some technical or research assumptions have not been validated. For current behavior and limitations, use the top-level README, source code, and Round 2 form draft.


## 1. Problem Statement & Theoretical Foundation

In current engineering handovers, the offboarding process concludes when the departing employee stops typing, leaving the successor completely unrepresented in the workflow.
- **The Rubber-Stamp Failure:** Cognitive science research by Buçinca et al. reveals that when users are presented with simple, global "Approve All" mechanisms, they experience extreme cognitive complacency—rubber-stamping documents without reading or validating critical claims.
- **The Asymmetric Risk Dilemma:** In offboarding, risk and agency are misaligned: the departing engineer has full context but zero long-term stake, whereas the incoming successor bears all the operational risk but currently has zero voice in determining whether a handover is adequate.
- **Clinical Handoff Precedent (I-PASS):** In clinical medicine, where shift transitions directly impact patient mortality, the acclaimed I-PASS handoff protocol mandates **Synthesis by Receiver** (read-back and acceptance). Multi-center clinical studies across 10,740 admissions proved that mandating active receiver validation reduced medical transition errors by 23% and preventable adverse events by 30%.
- **The Competitive Vacuum:** A comprehensive check across 15 enterprise tools confirmed that zero products offer a documented workflow where a recipient actively accepts or queries a generated handover statement-by-statement against its evidence.

Baton establishes true operational closure through a **Successor Acceptance & Verification Protocol**, empowering incoming engineers to validate claims, raise inline queries, and block premature sign-off.

---

## 2. Section-by-Section Acceptance Workflow

Rather than requiring a binary sign-off on an entire 50-page document, Baton divides the handover into discrete review units:

```
[Reader-Scoped Handover Loaded for Successor]
                     |
                     v
+--------------------+--------------------+
|                                         |
v                                         v
[Successor Reviews Section Claims]     [Inspects Source Evidence]
|                                         |
+--------------------+--------------------+
                     |
        +------------+------------+
        |                         |
        v                         v
[Action: Accept Section]    [Action: Raise Inline Query]
        |                         |
        |                         v
        |                   [Logged to Open Questions Queue]
        |                         |
        |                         v
        |                   [Routed to Escalation Lead]
        |                         |
        +------------+------------+
                     |
                     v
        [All Sections Validated]
                     |
                     v
        [Manager Formal Attestation]
                     |
                     v
        [Handover Marked Complete]
```

---

## 3. Inline Query Resolution Engine

When a successor encounters a claim that is ambiguous, ungrounded, or missing operational credentials, they can log an inline query directly against the claim card:

```typescript
export interface SuccessorQuery {
  id: string
  claimId: string
  successorId: string
  successorName: string
  timestamp: string
  queryCategory: 'missing_credential' | 'unclear_rationale' | 'broken_runbook' | 'reproduction_failure'
  queryText: string
  status: 'open_pending_reply' | 'resolved' | 'escalated'
  assignedRespondent: {
    name: string
    role: 'leaver' | 'engineering_lead' | 'co_maintainer'
    slackHandle: string
  }
  resolution?: {
    answeredBy: string
    responseSnippet: string
    timestamp: string
    resultedInClaimUpdate: boolean
  }
}
```

### Cognitive Forcing Rules
1. **No Global "Approve All":** The application contains no global approval button. Every major domain section (Decisions, Unfinished Work, Ownership, Risks) requires an individual `Accept Section` confirmation.
2. **Blockers Gate Completion:** If any claim marked with a `Critical Blocker` or `Missing Credential` flag has an unresolved query attached, the system prevents the Engineering Lead from issuing the final handover completion certificate.

---

## 4. Formal Completion & Attestation Certificate

A handover in Baton achieves `Completed` status only when three distinct stakeholder criteria are satisfied:
1. **The Departing Engineer:** Has resolved all top-priority questions in the Gap-Driven Interview.
2. **The Incoming Successor:** Has accepted all four core domain sections and closed or acknowledged all inline queries.
3. **The Engineering Lead:** Has confirmed all administrative asset transfers (e.g., cloud access, repo permissions, third-party vendor billing) and signed the handover.

### The Immutable Handover Certificate
Upon final sign-off, Baton compiles an immutable, digitally timestamped Handover Summary Certificate. The certificate captures:
- Total atomic claims reviewed and accepted.
- Exact list of all sources audited with commit hashes and timestamps.
- Explicit log of all resolved contradictions and who decided them.
- Final sign-off signatures from both Successor and Engineering Lead.

---

## 5. User Interface: The Successor Review Console

In the Baton interface, the successor experiences a purpose-built review environment:

```
+--------------------------------------------------------------------------------+
|  SUCCESSOR REVIEW CONSOLE: Payment Core Microservices                          |
|  Reviewing as: Priya Sharma (Senior Engineer)                                  |
+--------------------------------------------------------------------------------+
|  SECTION: Decisions Already Taken (6 Claims)                     [ACCEPT SECTION]
|                                                                                |
|  [v] Claim #01: "Postgres chosen for payment events over Redis."  [Accepted]   |
|      Source: PR #189  |  Status: Stated by Leaver                              |
|                                                                                |
|  [?] Claim #02: "Staging database read-replica uses staging-db-04."            |
|      Source: Slack #eng-db  |  Status: Quoted Verified                         |
|                                                                                |
|      SUCCESSOR QUERY:                                                          |
|      "I attempted to connect with credentials in 1Password, but staging-db-04  |
|       timed out. Does this require the new Tailscale VPN mesh?"                |
|      Assigned to: Vikram Malhotra (Lead)  |  Status: Open Blocker              |
+--------------------------------------------------------------------------------+
|  OVERALL PROGRESS: 3 of 4 Sections Accepted  |  1 Open Query Pending           |
+--------------------------------------------------------------------------------+
```

---

## 6. Judge Demonstration Proof Points

In the Round 2 live evaluation, this module delivers the ultimate proof of Baton's accountable product loop:
1. **Successor Perspective:** The evaluator views the dashboard as Priya Sharma.
2. **Raising the Blocker:** The presenter demonstrates Priya flagging Claim #02 regarding staging database credentials, showing how an inline query is filed in seconds.
3. **Lead Resolution:** The presenter switches to Vikram Malhotra’s view, resolves the query by confirming the Tailscale VPN configuration, and marks the question answered.
4. **Final Acceptance & Certificate:** The presenter switches back to Priya, clicks `Accept Section`, and triggers the generation of the official, signed Handover Certificate.
5. **Evaluator Impact:** Judges see that Baton transforms knowledge handover from an unverified, forgotten text document into a legally defensible, mutually verified engineering contract.
