# Baton Functional Specification 09: Why Baton Stands Out of the Box & Competitive Differentiation

## 1. The Hackathon Field Landscape: What the Other 131 Teams Will Build

In a hackathon with 132 qualifying teams tackling offboarding and knowledge transfer, historical precedent and developer patterns show that 95% of submissions converge into three predictable archetypes:

```
+-----------------------------------------------------------------------------------------+
|                              WHAT 95% OF TEAMS WILL BUILD                               |
+-----------------------------------------------------------------------------------------+
| Archetype 1: The Generic RAG Chatbot ("Chat with your Repo / Docs")                    |
| - A basic LangChain/LlamaIndex wrapper with an OpenAI/Gemini chat input.                |
| - Why it fails: Passive. An incoming engineer doesn't know what they don't know, so     |
|   they cannot ask the right questions. Produces zero persisted, accountable records.    |
|                                                                                         |
| Archetype 2: The Monolithic Generative Summarizer                                       |
| - Prompt: "Summarize this engineer's last 6 months of commits into a handbook."         |
| - Why it fails: Outputs an unverified 10-page wall of prose. Engineers don't trust     |
|   generative text, and LLMs hallucinate code rationale with precision under 0.28.       |
|                                                                                         |
| Archetype 3: The Exhaustive Empty Questionnaire Form                                    |
| - A 30-page static form or conversational bot asking "What did you work on?"            |
| - Why it fails: Departing engineers on notice have zero incentive to write long essays.  |
|   Captures zero ground-truth activity from git, issues, or messaging channels.          |
+-----------------------------------------------------------------------------------------+
```

When judges open links from these teams, they will encounter either a chat box requiring them to prompt the AI, an empty dashboard, or a wall of generic ungrounded prose.

---

## 2. The Five Reasons Baton Stands Out of the Box

Baton (Team GIT LOST) approaches the problem from a fundamentally different paradigm. We do not build an AI summarizer; we build an **Accountable Knowledge Compiler**.

```
                       TRADITIONAL AI HACK                   BATON'S ARCHITECTURE
                   +-------------------------+           +--------------------------+
Structure          | Monolithic text blocks  |   ---->   | Atomic Claim Ledger      |
Verification       | Hallucinated citations  |   ---->   | Deterministic substring  |
Contradictions     | Silent averaging / bias |   ---->   | Human settlement queue   |
Elicitation        | Generic blank forms     |   ---->   | Gap-driven 5-min drawer  |
Security           | Single leaked snapshot  |   ---->   | Reader-scoped ACL gates  |
Sign-off           | Rubber-stamp Approve All|   ---->   | Statement query protocol |
                   +-------------------------+           +--------------------------+
```

### 1. Atomic Claim Ledger with Deterministic Substring Verification
- **What Others Do:** Generate flowing summaries with hyperlinked citations. Academic research (Magesh et al., Ding et al.) proves that citations often point to documents that don't support the text, creating a false illusion of credibility.
- **What Baton Does:** Breaks knowledge into discrete, falsifiable **Claims**. Every claim carries an unambiguous status (`quoted_verified`, `inferred_ai`, `conflicting`, `not_found`, `stated_by_leaver`).
- **The Out-of-the-Box Moat:** Baton runs a deterministic, character-by-character substring matching algorithm in raw TypeScript code. If a quote doesn't match the original source text character-for-character, the system automatically downgrades it to `quoted_unverified`. Judges can click any claim to inspect the raw source text highlighted in real-time.

### 2. Contradiction Surfacing (Disagreement IS the Product Discovery)
- **What Others Do:** Generic models either silently pick a winner or blend contradictory statements into an artificial compromise (WikiContradict). Even commercial developer tools like Unblocked claim to resolve conflicts automatically behind proprietary weights.
- **What Baton Does:** In an engineering offboarding, **the contradiction itself is the vital finding**. When a GitHub pull request says the team migrated to AWS SQS, but a Slack message three weeks later reveals a rollback to RabbitMQ due to throttling, Baton isolates the conflict on structured fields.
- **The Out-of-the-Box Moat:** Baton puts discrepancies into a dedicated **Contradiction Settlement Queue** with side-by-side evidence diffs, categorizing them as `superseded_over_time`, `genuine_disagreement`, or `scope_difference`. A human engineering lead makes the final binding decision.

### 3. Gap-Driven Elicitation (Turning AI Limits into Product Strengths)
- **What Others Do:** Rely on generative models to "guess" why an engineer wrote code. Zhou et al. showed that LLM-generated rationale precision against actual developer intent is below 0.28—models invent plausible lies for emergency hacks.
- **What Baton Does:** When Baton detects a decision without recorded rationale (such as extending an auth token TTL with comment `// quick fix`), it refuses to fabricate a reason. Instead, it marks the rationale as `not_found` or `inferred_ai`.
- **The Out-of-the-Box Moat:** These specific deficits feed directly into a **Gap-Driven Leaver Interview**. The departing engineer receives 5 to 8 laser-targeted questions that take under 8 minutes to answer. The answers flow back into the ledger as dated, attested testimony (`stated_by_leaver`).

### 4. Reader-Scoped Access & The Invisible Privacy Shield
- **What Others Do:** Generate one shared document using the senior engineer's extensive permissions, leaking confidential HR, compensation, or legal threads to the junior successor.
- **What Baton Does:** A handover is a persisted artifact read later by different stakeholders. Baton dynamically compiles views based on the reader’s clearance.
- **The Out-of-the-Box Moat:** In the live demo, judges can toggle between `Engineering Lead (Vikram)` and `Successor (Priya)`. Confidential executive and HR threads are completely shielded in Priya's view without leaving an awkward placeholder that invites curiosity.

### 5. Mutual Accountability via the I-PASS Clinical Protocol
- **What Others Do:** End the flow when the leaver finishes, or place a meaningless "Approve All" button that promotes cognitive rubber-stamping (Buçinca et al.).
- **What Baton Does:** Adopts the evidence-based medical handoff framework (I-PASS), which reduced medical transition errors by 23% to 30% through **Synthesis by Receiver**.
- **The Out-of-the-Box Moat:** Successor Priya reviews the handover section by section. She can `Accept Section` or `Raise Inline Query` on ambiguous claims (e.g., missing staging credentials). The handover concludes with a verified, mutually signed digital certificate.

---

## 3. The 30-Second Elevator Pitch for Judges

> *"Most teams use AI to generate another unverified summary or another passive chatbot that forces successors to guess what questions to ask. Baton is fundamentally different: it turns scattered project activity into an accountable **Claim Ledger**.*
>
> *Baton proves every quote with deterministic string matching, surfaces dangerous contradictions instead of hiding them, interviews the leaver only on the gaps AI cannot know, and compiles versions strictly to the reader's security clearance. In Baton, offboarding is not an unread Word document—it is a mutually verified, legally defensible engineering contract."*

---

## 4. Scoring Alignment Matrix

| Evaluation Criteria | Typical Hackathon Project | Baton (Team GIT LOST) |
|---|---|---|
| **Core Workflow Execution** | Empty dashboard or generic LLM chat box. | Complete end-to-end ledger populated with the 4 pillars (Decisions, Unfinished Work, Ownership, Risks). |
| **Originality & Moat** | Standard RAG pipeline wrapper. | Deterministic quote verification, typed contradiction queue, and reader-scoped ACL compilation. |
| **Practical Utility** | Generates text nobody trusts or reads. | Produces an actionable First 30 Days roadmap and routes successors to exact colleagues. |
| **Security & Governance** | Leaks leaver permissions to successor. | Purpose-limited compilation with side-by-side exposure diff. |
| **User Experience** | Monolithic text wall or chatbot prompt. | Clean interactive cards, one-click source slide-overs, and multi-persona switching. |
