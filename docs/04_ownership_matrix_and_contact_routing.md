# Baton Functional Specification 04: Ownership Matrix & Contact Routing

## 1. Problem Statement & Theoretical Foundation

When an experienced engineer departs an engineering organization, the organizational chart rarely tells incoming engineers who actually understands specific systems.
- **The "Who to Ask" Knowledge Deficit:** Robillard’s 2021 investigation confirmed that along with design rationale, "knowing who to ask" is the most severe knowledge loss category experienced by successors. Documentation frequently lists outdated maintainers, and successors waste hours asking irrelevant colleagues in public channels.
- **The Truck-Factor Threat:** Rigby et al. and Avelino et al. demonstrated that software organizations harbor severe hidden dependencies on individual "truck-factor" developers. In their study across thousands of repositories, 16% to 89% of projects had modules maintained by a single engineer with zero secondary knowledge redundancy.
- **Orphaned Infrastructure:** Beyond source code, engineers often accumulate sole ownership over critical cloud resources, third-party vendor relationships, API billing accounts, and monitoring alert channels. When they leave, access keys expire or alerts trigger in silent, abandoned Slack channels.

Baton actively analyzes repository history, operational metadata, and commit activity to map **Who Owned What**, identify critical single points of failure, and construct an authoritative **Who to Ask** escalation directory.

---

## 2. Multi-Layer Ownership Ingestion

Baton aggregates ownership signals across four technical layers to construct a 360-degree ownership graph:

```
+------------------------------------------------------------------+
|                    OWNERSHIP INGESTION LAYERS                    |
+----------------------------------+-------------------------------+
| Layer                            | Extracted Data Signals        |
+----------------------------------+-------------------------------+
| Code Repository Metadata         | CODEOWNERS file, commit count,|
|                                  | PR reviews, blame recency     |
| Cloud Infrastructure (IaC)       | Terraform state, AWS tags,    |
|                                  | Dockerfile maintainer labels  |
| Incident & Observability         | PagerDuty on-call escalation, |
|                                  | Sentry alerts, Datadog monitors|
| Vendor & SaaS Subscriptions      | Third-party API keys, billing |
|                                  | contacts, domain registars    |
+----------------------------------+-------------------------------+
```

### Truck-Factor Calculation Algorithm
For each repository module, directory, and microservice, Baton computes an **Ownership Concentration Index (OCI)**:

$$\text{OCI} = \frac{\text{Commits by Leaver in last 12 months}}{\text{Total Commits in last 12 months}}$$

- **OCI > 0.75:** Flagged as `High Truck-Factor Risk`. The departing engineer is the effective sole maintainer. Secondary contributors have under 25% exposure.
- **OCI between 0.40 and 0.75:** Flagged as `Shared Ownership`. Identifies active co-maintainers to whom primary ownership can be cleanly transitioned.
- **OCI < 0.40:** Flagged as `Broad Team Ownership`. Low offboarding risk.

---

## 3. Data Schema: Ownership Record & Contact Card

Every asset under management is represented as an explicit ownership node:

```typescript
export interface OwnershipAsset {
  id: string
  assetName: string
  assetType: 'microservice' | 'database' | 'cloud_infrastructure' | 'third_party_saas' | 'code_directory'
  criticality: 'tier_1_mission_critical' | 'tier_2_business_ops' | 'tier_3_internal_tool'
  currentOwner: {
    name: string
    email: string
    slackHandle: string
    status: 'leaving' | 'active'
  }
  proposedSuccessor: {
    name: string
    email: string
    approvalState: 'pending_lead_confirmation' | 'confirmed'
  }
  coMaintainers: {
    name: string
    contributionShare: number // e.g. 0.22 (22%)
    lastActiveDate: string
  }[]
  credentialsAndAccess: {
    credentialVaultPath?: string
    adminAccessRequiresTransfer: boolean
    transferDeadlineDate: string
  }
  escalationContact: {
    role: string
    name: string
    slackChannel: string
  }
}
```

---

## 4. The "Who to Ask" Dynamic Routing Directory

Baton constructs an interactive, queryable directory specifically designed to orient the incoming engineer:

```
[Successor Question: "Who understands the Redis Cache eviction policy?"]
                                   |
                                   v
                      [Baton Contact Router]
                                   |
        +--------------------------+--------------------------+
        |                                                     |
        v                                                     v
[Former Primary Owner]                                [Active Secondary Expert]
Alex Chen (Departing)                                 Dev Patel (Staff SRE)
Status: Offboarded Nov 11                             Status: Active
Note: Wrote original eviction logic                   Note: Reconfigured cluster in August
Action: Reference Handover ADR-004                    Action: Ping on #sre-infra
```

### Key Routing Features
1. **Fallback Routing:** If the successor clicks on an asset previously owned solely by the departing engineer, Baton automatically routes them to the confirmed Engineering Lead or the most statistically relevant co-contributor, preventing dead-end inquiries.
2. **Access Transfer Checkpoints:** Flags critical third-party systems (e.g., Stripe Dashboard Admin, AWS Root IAM, Datadog Org Admin) where the departing engineer is the sole organization administrator. These are categorized as mandatory transfer checkpoints that must be confirmed by the Engineering Lead before the handover can be marked complete.

---

## 5. User Interface: The Interactive Ownership Matrix

Within the Baton dashboard, the **Who Owned What** view is rendered as a clean, filterable matrix:

- **Filter by Risk:** A toggle allows leads to instantly filter for `Orphaned Assets` (assets owned by the leaver with no secondary maintainer assigned).
- **One-Click Reassignment:** The engineering lead can click on any orphaned service, select a team member from an auto-suggested list based on git proximity, and assign the new owner.
- **Direct Slack Deep-Links:** Contact cards feature direct `slack://user?team=...` links, enabling the incoming engineer to initiate conversations with subject matter experts in a single click.

---

## 6. Judge Demonstration Proof Points

In the Round 2 hackathon presentation, this module proves Baton’s immediate enterprise utility:
1. **The Stripe Webhook Secret Orphan:** Baton flags the `Payment Webhook Gateway` microservice with a flashing red badge: `High Truck-Factor Risk (OCI: 88%)`.
2. **Access Transfer Alert:** Baton highlights that Alex Chen is the sole holder of the Stripe Webhook Signing Secret rotation keys in AWS Secrets Manager.
3. **Automated Reassignment:** Baton displays the proposed transition: *"Reassign primary ownership to Priya Sharma (Successor); Secondary escalation to Vikram Malhotra (Lead)."*
4. **Judge Value:** Evaluators see how Baton prevents high-severity operational blindness and security access lockouts that typically occur weeks after an employee departs.
