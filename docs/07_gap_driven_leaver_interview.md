# Baton Functional Specification 07: Gap-Driven Leaver Interview
> **Planning specification — aspirational, not a shipped feature list.** This note describes parts of the original target design. Those workflows are not all implemented in the Round 2 demo, and some technical or research assumptions have not been validated. For current behavior and limitations, use the top-level README, source code, and Round 2 form draft.


## 1. Problem Statement & Theoretical Foundation

Traditional employee offboarding fails at the point of knowledge elicitation due to mismatched incentives and flawed mechanisms:
- **The Empty Template Syndrome:** Departing engineers are frequently handed generic 30-page word templates or blank Confluence pages during their final two weeks. Faced with imminent departure, engineers either write superficial summaries or abandon the document entirely.
- **The Tacit Knowledge Barrier:** Robillard’s 2021 research revealed that the most valuable operational context—design trade-offs, emergency bug fixes, undocumented operational quirks—is tacit. Engineers rarely document this spontaneously because they do not realize it is non-obvious to newcomers.
- **The Inadequacy of AI Guessing:** Academic evaluations of automated rationale generation (Zhou et al.) prove that while AI models can invent plausible explanations for code patterns, their precision against the actual reasons developers had is below 0.28. Asking the human author directly is dramatically more accurate than relying on AI guesswork.
- **Competitor Flaws:** Offboarding tools like SkillPass or Sensay conduct general open-ended conversational interviews ungrounded in repository data, resulting in rambling transcripts that still omit critical technical gaps.

Baton resolves this through a **Gap-Driven Leaver Interview**—an automated interview engine that formulates targeted, high-stakes questions derived *strictly* from the factual deficits and contradictions detected in the Claim Ledger.

---

## 2. Gap Identification & Question Generation Engine

Baton does not generate generic questionnaires. The interview engine scans the compiled Claim Ledger and extracts only high-priority claims exhibiting explicit evidentiary deficits:

```
[Compiled Claim Ledger]
           |
           v
[Scan for Ledger Deficits]
- status === 'not_found'
- status === 'conflicting'
- status === 'inferred_ai' (with category === 'rationale')
           |
           v
[Priority Scoring & Consequence Ranker]
           |
           v
[Strict Cap: Top 5 to 8 High-Stakes Questions]
           |
           v
[Interactive Leaver Interview Drawer]
```

### Prioritization Scoring Algorithm
To prevent survey fatigue, questions are scored and strictly capped at **5 to 8 questions**, designed to be completed in under 10 minutes:

$$\text{Priority Score} = \text{Criticality Level (Tier 1 = 3, Tier 2 = 2)} \times \text{Deficit Weight} \times \text{Recency Factor}$$

- **Deficit Weights:** `conflicting` = 3.0; `not_found (critical)` = 2.5; `inferred_ai (rationale)` = 2.0.
- **First-Person Grounded Phrasing:** Following Kim et al.’s findings on human-AI trust and uncertainty, questions are phrased in an explicit, grounded first-person conversational voice citing exact artifacts:
  *Example:* *"In commit 8f4a1 on October 4th, you extended the mobile authentication session timeout from 15 minutes to 72 hours with the comment '// quick fix'. I could not find an associated Jira ticket. Why was this timeout extended, and is it safe to revert?"*

---

## 3. Data Schema: The Interview Entity & Claim Upgrade

```typescript
export interface LeaverInterviewQuestion {
  id: string
  associatedClaimId?: string
  priorityRank: number
  category: 'architecture_rationale' | 'unresolved_conflict' | 'missing_credential' | 'operational_recovery'
  promptText: string
  groundingContext: {
    sourceType: 'commit' | 'pull_request' | 'slack_channel'
    sourceId: string
    snippetText: string
  }
  status: 'pending_answer' | 'answered' | 'dismissed_by_leaver' | 'escalated_to_lead'
  leaverResponse?: {
    answeredBy: string
    timestamp: string
    responseText: string
  }
}
```

### The Ledger Re-hydration Flow
When the departing engineer submits an answer:
1. Baton generates a new or upgraded atomic claim in the primary ledger.
2. The claim status is stamped as `stated_by_leaver`.
3. The claim metadata permanently records:
   - Author: Departing Engineer's Full Name.
   - Attestation Timestamp: ISO-8601 string.
   - Provenance: Marked as first-person testimony rather than an immutable verified historical log.
4. The resolved gap is marked complete, automatically unblocking the associated section for manager approval.

---

## 4. Edge Cases: Sudden or Hostile Departures

A common failure mode in offboarding is an uncooperative, hostile, or sudden departure (e.g., immediate termination or emergency medical leave) where the departing employee refuses or is unable to answer questions:

- **The Fallback Escalation Protocol:** In the Baton interface, if a leaver does not complete the interview within a configurable SLA (e.g., 72 hours), or if an administrator marks the offboarding as `Emergency / Non-Cooperative`, the interview queue is automatically re-routed to the **Engineering Lead** or the closest historical co-contributor.
- **Transparency Tagging:** Questions answered by a manager rather than the leaver are stamped as `attested_by_lead`, preserving an honest record of who supplied the institutional memory.

---

## 5. User Interface: The 10-Minute Focus Drawer

In the Baton web application, the departing engineer interacts with a distraction-free, focused interface:

```
+--------------------------------------------------------------------------------+
|  BATON FOCUS INTERVIEW: 5 Questions Remaining (Estimated: 6 minutes)           |
|  Topic: Architecture & Design Rationale                                        |
+--------------------------------------------------------------------------------+
|  QUESTION 2 OF 5                                                               |
|  "In PR #189, you switched the payment queue worker from Redis to Postgres.    |
|   We found no benchmark data in the repository. Why did you make this switch?"|
|                                                                                |
|  [View PR #189 Context]  [Inspect Code Diff]                                   |
|                                                                                |
|  YOUR ANSWER:                                                                  |
|  [ Redis ran into Out-Of-Memory crashes during flash sales because worker     ]
|  [ consumers couldn't keep up. Postgres SKIP LOCKED gave us persistent storage]
|  [ with zero extra infrastructure cost.                                       ]
|                                                                                |
|  [Submit & Proceed to Question 3]                       [I Don't Remember]     |
+--------------------------------------------------------------------------------+
```

---

## 6. Judge Demonstration Proof Points

In the Round 2 live evaluation, this module highlights Baton's ability to turn AI weaknesses into product strengths:
1. **The Planted "Quick Fix" Rationale Gap:** The demo opens with an unresolved amber badge in the architecture section regarding the extended authentication session timeout.
2. **One-Click Interview Launch:** The presenter opens the Leaver Interview drawer, showing the dynamically generated question grounded in commit `8f4a1`.
3. **Live Answer Submission:** The presenter types a two-sentence answer explaining that mobile field agents were getting logged out in areas with weak cellular coverage.
4. **Immediate Ledger Mutation:** Upon clicking submit, the presenter closes the drawer and shows the primary Claim Ledger updating in real-time: the amber AI inference is replaced by a purple `stated_by_leaver (Alex Chen)` badge.
5. **Evaluator Impact:** Judges see a concrete mechanism that captures vital tribal knowledge without requiring departing staff to write exhaustive documentation from scratch.
