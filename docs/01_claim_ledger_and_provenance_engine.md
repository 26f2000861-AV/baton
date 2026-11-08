# Baton Functional Specification 01: Claim Ledger & Provenance Engine

## 1. Problem Statement & Theoretical Foundation

Traditional documentation generators and enterprise AI summarizers present handover material as monolithic prose blocks decorated with hyperlinked citations. However, academic research reveals that citations alone do not establish trustworthiness:
- **Misgrounded Assertions:** Research by Magesh et al. demonstrated that commercial legal and retrieval systems frequently produce misgrounded outputs—generating factually accurate statements that cite sources providing zero evidential support.
- **The Citation Illusion:** Ding et al. found that human trust in AI outputs increases significantly when citations are displayed, even when the citations are completely fabricated or assigned randomly. When users actually inspect citations, trust drops precipitously.
- **Fragile Neural Extraction:** Highlighting text based on LLM token probabilities does not help developers detect errors, whereas highlighting by semantic necessity for verification significantly improves human defect-catching (Vasconcelos et al.).

Baton completely replaces the conventional summary format with an **Atomic Claim Ledger**. In Baton, a handover is not a wall of text; it is a structured database of verifiable, falsifiable claims. Every single claim is bound to an immutable provenance record, verified deterministically against raw source data, and categorized using an unambiguous truth taxonomy.

---

## 2. Evidence Status Taxonomy

Every claim within Baton carries exactly one primary status label. Percentage-based confidence scores (e.g., "94% confident") are explicitly rejected because they provide a false sense of mathematical precision without actionable interpretability.

1. `quoted_verified`: The claim is directly supported by an exact verbatim excerpt extracted from an authorized source document. The quote passes an automated exact substring match check against the raw document, and an entailment check verifies the semantic link.
2. `quoted_unverified`: The quote claimed by the AI model could not be verified by exact character matching against the source text, indicating paraphrasing, hallucinated phrasing, or out-of-context clipping. The claim is downgraded automatically.
3. `inferred_ai`: The claim represents an AI-generated deduction, synthesis, or rationale that lacks a direct verbatim quotation in historical activity. Such statements are explicitly marked as artificial inferences so that human reviewers do not mistake them for documented facts.
4. `conflicting`: The claim contradicts another documented assertion within the project corpus regarding key attributes (such as architecture, owner, date, or status). It is routed to the Contradiction Settlement Queue.
5. `not_found`: An essential domain category (e.g., credentials owner, deployment runbook, or failure recovery protocol) was searched across all connected systems but yielded zero relevant evidence.
6. `stated_by_leaver`: The claim originated directly from the departing engineer during the gap-driven exit interview. It carries the leaver’s name and submission timestamp, representing first-person testimony rather than unchallengeable documentation.
7. `confirmed_by_lead`: A high-stakes claim that has been explicitly reviewed and attested by an engineering manager or technical lead.

---

## 3. Deterministic Verification & Entailment Engine

Baton employs a hybrid verification pipeline combining deterministic code checks with structured language models:

```
[Raw Sources: PRs, Slack, Issues]
              |
              v
[Step 1: Verbatim Quote Extractor]  --> Extracts exact character spans
              |
              v
[Step 2: Substring Match Check]      --> Runs str.indexOf(snippet) in NodeJS
              |                             |
      +-------+-------+                     |
      | Matches       | Fails match         |
      v               v                     v
[LLM Entailment]  [Auto-Downgrade]     [Record char offset]
      |               |
      +-------+-------+
              |
              v
[Assign Status: Quoted / Inferred]
```

### Step 1: Fact-First Quote Extraction
Following the FRAME architecture (Kirstein et al., EMNLP 2025), Baton extracts verbatim source quotes *before* synthesizing any narrative claims. The system isolates specific excerpts containing operational commitments, system configurations, and architectural reasoning.

### Step 2: Deterministic Substring Verification
Before any claim is marked as verified, pure deterministic TypeScript code executes an exact character-by-character search across the cached source document:

```typescript
export function verifyQuoteAgainstSource(
  sourceRawText: string, 
  quoteSnippet: string
): { isExactMatch: boolean; charStart: number; charEnd: number } {
  const normalizedSource = sourceRawText.replace(/\r\n/g, '\n')
  const normalizedQuote = quoteSnippet.trim().replace(/\r\n/g, '\n')
  
  const charStart = normalizedSource.indexOf(normalizedQuote)
  if (charStart === -1) {
    return { isExactMatch: false, charStart: -1, charEnd: -1 }
  }
  
  return { 
    isExactMatch: true, 
    charStart, 
    charEnd: charStart + normalizedQuote.length 
  }
}
```
If `isExactMatch` evaluates to `false`, the claim is immediately downgraded. This completely eliminates hallucinated quotations.

### Step 3: Natural Language Entailment
If the quote passes the exact-match check, Baton submits the claim and quote pair to Gemini using structured JSON schema output to evaluate logical entailment:
- **Entailed:** The quote logically necessitates or directly substantiates the claim. Status assigned: `quoted_verified`.
- **Neutral/Contradicted:** The quote merely mentions related terms without proving the claim. Status assigned: `inferred_ai`.

---

## 4. User Experience & One-Click Source Inspector

In the Baton user interface, claims are rendered as modular cards grouped by operational domain. 

- **Status Badges:** Each claim features a distinct visual pill with high-contrast color coding:
  - Green (`quoted_verified`): Source quote verified.
  - Amber (`inferred_ai`): AI deduction—requires human validation.
  - Red (`conflicting`): Open contradiction requiring resolution.
  - Purple (`stated_by_leaver`): Leaver testimony with date stamp.
- **The Slide-Over Source Inspector:** Clicking on any claim opens an interactive right-hand drawer. The drawer loads the original raw source document (e.g., Pull Request #204 conversation or Slack thread `#backend-core`), scrolling automatically to the exact line and highlighting the supporting text in yellow.
- **Cognitive Forcing Controls:** Rather than offering a dangerous "Approve All" button that encourages rubber-stamping, Baton requires managers to explicitly acknowledge unresolved or inferred claims individually before publishing.

---

## 5. Judge Demonstration Proof Points

During the Round 2 hackathon evaluation, this module serves as Baton’s primary technical differentiator:
1. **The Exact-Match Test:** The demo features two adjacent claims. Claim A displays an exact quote from a GitHub pull request and receives a green `quoted_verified` badge. Claim B features an AI-paraphrased summary where the verifier failed an exact match; the UI clearly displays how the system downgraded it to `quoted_unverified` with an explanatory tooltip.
2. **One-Click Provenance:** Judges can click any claim to immediately inspect the authentic source passage, proving that Baton provides genuine forensic traceability rather than generic generative text.
