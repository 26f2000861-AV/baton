# Baton Functional Specification 06: Reader-Scoped Compilation & Privacy Guard

## 1. Problem Statement & Theoretical Foundation

A pervasive yet neglected security vulnerability in automated offboarding is the **Leaver Privilege Leak**.
- **Accumulated Privilege Overhang:** Over a multi-year tenure, senior software engineers accumulate extensive read access across sensitive organizational systems—including private HR channels, executive leadership strategy threads, performance evaluation archives, and confidential legal discussions.
- **The Saved Snapshot Failure:** Enterprise search engines (such as Glean or Microsoft 365 Copilot) apply access-control list (ACL) filtering at live query time. However, a knowledge handover is a **persisted, saved document** designed to be read weeks or months later by a junior or external successor, a team lead, or new hires. If a generative system synthesizes a handover using the departing engineer’s credentials, it bakes confidential data directly into a static document, permanently bypassing enterprise ACLs.
- **Enterprise Breach Realities:** Documented incidents involving Microsoft Copilot demonstrated that generative summarizers regularly expose executive compensation details, confidential employee grievances, and unannounced acquisition targets to unauthorized employees simply because the AI summarized documents the author had access to.
- **Purpose Limitation:** Under global privacy standards (GDPR, SOC2, ISO 27001), personal data must adhere to purpose limitation. Even if an engineer possessed legitimate access to a colleague’s medical leave thread or equity compensation debate, that data has zero legitimate purpose in a software project handover.

Baton resolves this vulnerability through **Reader-Scoped Compilation**—never compiling a single monolithic document, but dynamically rendering handover versions strictly bounded by the recipient’s security clearance.

---

## 2. Multi-Persona Security Architecture

Baton governs access through an immutable persona and clearance model:

```
                                  [Raw Project Knowledge Base]
                                                |
                                                v
                              [Claim Extraction & Source Tagging]
                                (Each quote tagged with Clearance)
                                                |
                                                v
                                  [Reader Clearance Gate]
                                                |
             +----------------------------------+----------------------------------+
             |                                  |                                  |
             v                                  v                                  v
     [Successor Persona]                [Engineering Lead]                  [Leaver Persona]
     Clearance: Team Internal           Clearance: Lead / Admin            Clearance: Author
     - Technical claims visible         - All technical claims visible      - Full authoring view
     - Unfinished work visible          - Management audit logs visible     - Gaps & questions highlighted
     - HR / Salary claims REDACTED      - Exposure preview diff active      - Draft review controls
```

### Security Clearance Levels
Every source document ingested into Baton is assigned an explicit clearance classification:
1. `public_open`: Public documentation, open-source repositories, and public team channels.
2. `team_internal`: Standard engineering repositories, team Slack channels, and sprint boards. Accessible to incoming successors.
3. `confidential_lead`: Management discussions, peer review feedback, and internal budget estimates. Accessible only to Engineering Managers.
4. `restricted_hr_legal`: Personal compensation records, HR investigations, medical notifications, and severance agreements. Strictly restricted.

---

## 3. Dynamic Compilation & Redaction Rules

When Baton renders a handover for a specific reader, the compiler evaluates every atomic claim against that reader’s verified clearance profile:

```typescript
export interface ReaderProfile {
  userId: string
  name: string
  role: 'successor' | 'engineering_lead' | 'departing_engineer' | 'executive'
  clearanceLevel: 'public_open' | 'team_internal' | 'confidential_lead' | 'restricted_hr_legal'
  accessibleProjectIds: string[]
}

export function compileHandoverForReader(
  claims: Claim[], 
  reader: ReaderProfile
): { visibleClaims: Claim[]; withheldCount: number; withheldCategories: string[] } {
  const visibleClaims: Claim[] = []
  let withheldCount = 0
  const withheldCategoriesSet = new Set<string>()

  for (const claim of claims) {
    // A claim is visible ONLY if ALL supporting quotes satisfy the reader's clearance
    const isAuthorized = claim.sourceQuotes.every(quote => 
      hasClearance(reader.clearanceLevel, quote.requiredClearanceLevel)
    )

    if (isAuthorized) {
      visibleClaims.push(claim)
    } else {
      withheldCount++
      claim.sourceQuotes.forEach(q => withheldCategoriesSet.add(q.requiredClearanceLevel))
    }
  }

  return {
    visibleClaims,
    withheldCount,
    withheldCategories: Array.from(withheldCategoriesSet)
  }
}
```

### The Invisible Shielding Rule
To prevent "inference leakage"—where seeing a placeholder like *"[Redacted Confidential Claim]"* informs the successor that an investigation or secret deal exists—sensitive category claims (HR, personal compensation) are **entirely omitted** from the successor's view. No placeholder or redacted bar is shown to the unauthorized reader.

---

## 4. User Interface: The Side-by-Side Exposure Diff Preview

Prior to publishing a handover to the incoming engineer, Baton provides the Engineering Lead with an **Exposure Diff Preview**:

```
+--------------------------------------------------------------------------------+
|  EXPOSURE PREVIEW & ACCESS AUDIT                                               |
|  Target Recipient: Priya Sharma (Role: Successor | Clearance: Team Internal)   |
+--------------------------------------------------------------------------------+
|  TOTAL EXTRACTED CLAIMS: 48                                                    |
|  [v] 45 Technical & Architecture Claims: CLEARED FOR SUCCESSOR                 |
|  [!]  3 Restricted Claims: WITHHELD & SHIELDED                                 |
+--------------------------------------------------------------------------------+
|  SHIELDED ITEMS AUDIT LOG (Visible to Manager Only):                           |
|  1. Claim #19: "Alex Chen Q3 equity refresh and compensation adjustment"       |
|     Source: Slack #leadership-confidential (Clearance: restricted_hr_legal)    |
|     Reason: Contains sensitive individual remuneration data.                   |
|                                                                                |
|  2. Claim #24: "Vendor NDA renegotiation penalty terms for Payment Gateway"    |
|     Source: Google Drive / Legal / Addendum_v2.pdf (Clearance: conf_lead)      |
|     Reason: Successor lacks vendor legal signing authorization.                |
+--------------------------------------------------------------------------------+
|  [Confirm Publication & Publish to Priya]       [Modify Recipient Clearance]   |
+--------------------------------------------------------------------------------+
```

---

## 5. Judge Demonstration Proof Points

In the Round 2 hackathon live demo, this module offers a compelling visual proof of enterprise readiness:
1. **The Instant Persona Switcher:** The top navigation bar includes an interactive role dropdown: `Viewing as: Successor (Priya Sharma)` vs. `Viewing as: Engineering Lead (Vikram Malhotra)`.
2. **The Incognito / Incidental Leak Trap:** In the Lead view, judges observe Claim #19 detailing a private compensation discussion in Slack `#leadership-confidential`.
3. **Flawless Redaction Proof:** With a single click, the presenter toggles the role dropdown to `Successor (Priya Sharma)`. Claim #19 vanishes instantly from the ledger and table of contents without leaving a clue, demonstrating true purpose limitation.
4. **Scoring Impact:** Evaluators see that Baton is an enterprise-grade platform capable of operating in high-security, regulated environments (fintech, healthcare, defense) where unvetted AI summaries would constitute major data compliance violations.
