---
target: Baton workspace
total_score: 23
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\adity\\OneDrive\\Desktop\\CodersInPune Hackathon Research\\baton-app\\src\\app\\workspace\\page.tsx"
target_fingerprint: "sha256:e7f3652333d7c85725a4d19f61c387295a9987242a1704e16fcce3bc1b9840eb"
target_path: "C:\\Users\\adity\\OneDrive\\Desktop\\CodersInPune Hackathon Research\\baton-app\\src\\app\\workspace\\page.tsx"
timestamp: 2026-11-10T17-31-28Z
slug: src-app-workspace-page-tsx
---
# Baton Workspace — Design Critique

Method: dual-agent (A: design review · B: detector/browser evidence)

Target: `src/app/workspace/page.tsx` — the handover workspace.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 2/4 | Review status is visible; the next action is not singular enough. |
| 2 | Match System / Real World | 3/4 | Handover concepts fit; terms like “claim” and “exposure diff” assume domain knowledge. |
| 3 | User Control and Freedom | 3/4 | Navigation, persona preview, and reset are available; changes reset on refresh. |
| 4 | Consistency and Standards | 3/4 | Navigation and cards use consistent patterns. |
| 5 | Error Prevention | 2/4 | Acceptance consequences and reversibility are unclear. |
| 6 | Recognition Rather Than Recall | 3/4 | Statuses, quotes, and source IDs are visible, but claim previews truncate. |
| 7 | Flexibility and Efficiency | 2/4 | Search and filters help; the overview repeats progress and actions. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Four metrics and six similarly weighted cards compete for attention. |
| 9 | Error Recovery | 2/4 | Reset exists; no undo or persisted state. |
| 10 | Help and Documentation | 1/4 | Sample-data note exists, but there is little contextual guidance. |
| **Total** | | **23/40** | **Acceptable; several significant hierarchy and clarity improvements remain.** |

## Design Specificity Verdict

The workspace is strongly authored for engineering handovers. Provenance statuses, dated source conflicts, ownership transfer, leaver questions, and successor acceptance reflect the product's central task rather than a generic dashboard. Its deep charcoal engineering shell fits the subject, though striping and uniform metric/card scaffolding make parts of the experience feel more generic than the evidence-led premise.

### Detector and browser evidence

The bundled markup detector returned zero findings (`[]`). It did not identify the responsive defect. In a browser at tablet width, the three-column overview extended beyond the visible content and clipped the risk card and persona controls. The primary agent reproduced the issue and measured the rendered layout at 987px, then verified the fix at 987px, 390px, and 1440px. No detector overlay was injected: the available browser evaluation was read-only, so script injection was unavailable. Screenshots and DOM snapshots provided visual and structural evidence instead.

## Overall Impression

The product's central differentiator is visible: show what the evidence supports and keep disagreement open for human review. The main opportunity is to make the next successor action unmistakable while keeping evidence one click away. The highest-impact layout and hierarchy issues identified in the baseline have now been fixed.

## What's Working

1. The contradiction view shows competing records with authors, dates, and excerpts instead of silently selecting a source.
2. Claim statuses distinguish exact text matches from inference and other evidence states.
3. Decisions, unfinished work, ownership, and risk are all represented in one handover workspace.

## Priority Issues

- **[P1] Tablet-width clipping — fixed.** At approximately 987px, the overview content and persona selector were clipped. The grid now switches to two columns through 1280px; live local rendering at 987px showed all content within the viewport.
- **[P1] Competing overview actions and repeated sign-off progress — fixed.** “Review handover” competed with the conflict action, and acceptance progress appeared twice. The generic action and duplicate count were removed; the active conflict now sits beside the claim evidence.
- **[P1] Claim previews lacked an obvious evidence affordance — fixed.** The overview rows were clickable but their compact state hid the arrow. Rows now show “Open evidence,” including at mobile width.
- **[P2] Acceptance meaning remains unclear.** The successor can record acceptance, but the UI does not say whether that means the section was reviewed or its contents were confirmed correct. There is also no undo. Define the meaning and recovery behavior before expanding sign-off.
- **[P2] First-time readers may not understand the terminology.** “Claim,” “exposure diff,” and the status labels have little contextual explanation. Add short, task-focused help near the claim ledger and exposure preview.

## Persona Red Flags

- **Incoming successor:** Before the fix, several actions and duplicated progress competed on the overview; tablet clipping hid context. The single conflict action and direct “Open evidence” cue now improve the first step. Synthetic sample data remains illustrative, not an actionable real handover.
- **Engineering lead:** Both conflicting sources are inspectable, but the interface does not explain what is changed when the lead records a decision. The role switcher is only a preview, not authorization.
- **Departing engineer:** The interview is visible and focused, but there is no indication that a submitted answer will be lost on refresh. This follows from the intentional in-memory demo state and should be disclosed before entering sample answers.

## Minor Observations

Secondary labels are small; source IDs are technical; and the six overview cards still carry similar visual weight. The sample-workspace note was updated to clarify that records are synthetic, changes reset on refresh, and persona switching is only a preview, not access control.

## Questions to Consider

- Should “accepted” mean the successor reviewed a section, or that they endorse its correctness?
- What one-sentence explanation would help a new successor interpret verified, inferred, and conflicting claims?
- Can the overview make its most important action clear within five seconds without hiding ownership or unfinished work?
