# Baton Functional Specification 03: Unfinished Work & Technical Debt
> **Planning specification — aspirational, not a shipped feature list.** This note describes parts of the original target design. Those workflows are not all implemented in the Round 2 demo, and some technical or research assumptions have not been validated. For current behavior and limitations, use the top-level README, source code, and Round 2 form draft.


## 1. Problem Statement & Theoretical Foundation

When an engineer leaves an organization, unfinished projects and unmerged work often degenerate into abandoned assets.
- **The Abandoned Asset Risk:** Rigby et al. demonstrated in their study of turnover-induced knowledge loss across Avaya and Chrome that knowledge loss tail risk is more than three times expected levels, with abandoned source files serving as the primary proxy for lost technical investment.
- **Successor Friction:** Avelino et al. surveyed developers stepping into core maintainer roles and discovered that the single greatest barrier successors face is not lack of documentation, but lack of time combined with confusion over unfinished, undocumented repository state. Successors frequently waste weeks discovering that half-finished features exist on unmerged branches or that a production service relies on an unmonitored manual script.
- **The Stale Branch Dilemma:** Pull requests left open at departure typically stall because team members are unsure whether the code was abandoned due to design flaws, failed QA testing, or simply run-out of time.

Baton actively identifies, catalogs, and operationalizes **What Is Still Unfinished**, transforming stale git branches and hidden tech debt into an actionable, prioritized roadmap for the incoming engineer.

---

## 2. Ingestion Sources & Detection Vectors

Baton ingests unfinished work across multiple development layers:

```
+------------------------------------------------------------------+
|                    UNFINISHED WORK SOURCES                       |
+----------------------------------+-------------------------------+
| Source Layer                     | Detected Artifacts            |
+----------------------------------+-------------------------------+
| GitHub Pull Requests             | Open PRs, Drafts, Review-reqs |
| Git Repository Branches          | Stale branches with commits   |
| Source Code Comments             | TODO, FIXME, HACK, OPTIMIZE   |
| Issue Backlog (Jira/Linear)      | Assigned tickets in progress  |
| Feature Flag Systems             | Flags authored by leaver      |
| CI/CD Pipelines                  | Flaky tests in leaver's PRs   |
+----------------------------------+-------------------------------+
```

### Detection Heuristics
1. **Branch Staleness Score:** Calculates the delta between the leaver’s last commit on an open branch and the repository's `main` branch HEAD. Branches with merge conflicts are explicitly highlighted.
2. **Comment Attribution:** Scans the codebase for inline debt markers (`TODO`, `FIXME`, `HACK`, `WORKAROUND`) and runs `git blame` to isolate debt lines introduced or last edited by the departing engineer.
3. **In-Flight Migrations:** Detects dual-write code paths, temporary feature toggle checks, and database migration scripts that have not yet undergone backward-compatibility cleanup.

---

## 3. Data Schema: The Unfinished Work Item

Every unfinished item is stored as a structured entity with explicit operational impact:

```typescript
export interface UnfinishedWorkItem {
  id: string
  title: string
  type: 'open_pr' | 'stale_branch' | 'inline_todo' | 'unmerged_migration' | 'flaky_test'
  status: 'needs_triage' | 'ready_to_merge' | 'blocked' | 'abandon_recommended'
  urgency: 'p0_immediate' | 'p1_first_two_weeks' | 'p2_first_month'
  description: string
  location: {
    repository: string
    branchOrPath: string
    lineRange?: [number, number]
    prNumber?: number
  }
  associatedBlockers: string[]
  recommendedSuccessorAction: string
  provenance: {
    lastActivityDate: string
    commitHash: string
    author: string
    reviewState?: 'approved' | 'changes_requested' | 'unreviewed'
  }
}
```

---

## 4. The "First 30 Days" Actionable Roadmap

Baton prevents successor cognitive overload by reorganizing raw unfinished work into a structured chronological onboarding journey:

```
[All Detected Debt & PRs]
           |
           v
[Urgency & Blocker Triage Engine]
           |
           +-----------------------+-----------------------+
           |                       |                       |
           v                       v                       v
    [Days 1 to 7]           [Days 8 to 15]          [Days 16 to 30]
   Immediate Triage        PR Adoption & Merging   Debt & Cleanup
  - In-flight P0 PRs      - Approved PRs to ship  - Inline TODO backlog
  - Failing test fixes    - Feature flag cleanups - Deprecated endpoints
  - Secrets rotation      - Stale branch deletion - Architecture refactors
```

### Days 1 to 7: Urgent Stabilization
Focuses strictly on operational blockers that could cause imminent production failures:
- In-flight pull requests affecting active customer-facing bugs.
- Unmerged database migrations that might drift as colleagues deploy other features.
- Secrets or staging infrastructure credentials tied to the departing engineer’s personal account.

### Days 8 to 15: In-Flight Feature Adoption
Guides the incoming engineer through adopting high-value open branches:
- Reviewing pull requests that already received partial code reviews.
- Running automated test suites against stale branches to evaluate mergeability.
- Deciding whether to adopt, finish, or cleanly close and delete dormant branches.

### Days 16 to 30: System Hygiene & Tech Debt Retirement
Surfaces the deeper, non-critical technical debt:
- Addressing high-complexity functions flagged with `TODO` comments.
- Decommissioning stale feature flags that have reached 100% rollout.
- Removing temporary compatibility shims.

---

## 5. User Interface & Interactive Triage

In the Baton web application, the **What Is Still Unfinished** section is rendered as an interactive triage board:

- **Actionable Status Switches:** The successor can mark each item with a single click: `Adopted`, `Merged`, `Closed & Deleted`, or `Deferred to Backlog`.
- **Git Context Previews:** Clicking an item opens a code diff viewer showing the exact lines changed on the unmerged branch without requiring the successor to pull the branch locally.
- **Estimated Blast Radius:** Each item displays a calculated risk badge (Low, Medium, High) based on how many core microservices or shared packages the unfinished code touches.

---

## 6. Judge Demonstration Proof Points

In the Round 2 hackathon live walkthrough, this module delivers an immediate "aha!" moment for evaluators:
1. **The In-Flight Payment Retry PR:** The demo features open PR #214 (*"Implement exponential backoff for payment gateway webhooks"*), left in draft state 12 days ago.
2. **Automated Triage Card:** Baton displays PR #214 under the **Days 1 to 7** roadmap bucket with a warning: *"Touches Payment Core. 2 approvals received, but CI test failed on retry jitter calculation."*
3. **Clear Next Steps:** Baton explicitly generates the successor instruction: *"Pull branch `feat/webhook-backoff`, fix line 84 jitter seed, and merge before end of week to prevent dropped transaction alerts."*
4. **Impact:** Evaluators immediately see how an incoming engineer saves days of debugging and prevents production incidents without needing to chase the departing colleague.
