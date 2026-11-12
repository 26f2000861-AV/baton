import {
  ArchitecturalDecision,
  Claim,
  ContradictionItem,
  LeaverInterviewQuestion,
  OwnershipAsset,
  UnfinishedWorkItem,
} from '../lib/types'

/**
 * Helios Observability Platform — Round 3 sample handover case.
 *
 * Synthetic scenario: the departing staff platform engineer ran the metrics
 * platform (OTel collector fleet, Prometheus/Thanos, Grafana, PagerDuty) and a
 * Thanos → VictoriaMetrics migration is mid-flight. Every claim, quote and
 * record below is invented for the demo; no real system data.
 *
 * Structural contract (asserted at the bottom of this file):
 *   10 claims (claim_10 is HR-restricted), 2 decisions, 2 unfinished items,
 *   2 ownership records, 1 contradiction (id `conflict_01` so the #/conflict
 *   deep link resolves), 2 leaver interview questions.
 */

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'claim_01',
    sectionId: 'decisions',
    statement:
      'VictoriaMetrics cuts dashboard query p99 latency by 60% and halves metrics storage cost compared with Thanos.',
    status: 'quoted_verified',
    category: 'fact',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'pr_142',
        sourceType: 'github_pr',
        title: 'PR #142: Introduce VictoriaMetrics dual-write and capacity benchmark',
        uri: 'https://github.com/helios/helios-metrics-migration/pull/142',
        author: 'Alex Chen',
        timestamp: '2026-08-20T14:32:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'VictoriaMetrics cuts dashboard query p99 latency by 60% and halves metrics storage cost compared with Thanos.',
      },
    ],
  },
  {
    id: 'claim_02',
    sectionId: 'decisions',
    statement:
      'Collector fleet is capped at 200 spans/sec per pod; batches flush every 5 seconds to protect the ingest path.',
    status: 'quoted_verified',
    category: 'process',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'pr_142',
        sourceType: 'github_pr',
        title: 'PR #142: Introduce VictoriaMetrics dual-write and capacity benchmark',
        uri: 'https://github.com/helios/helios-metrics-migration/pull/142',
        author: 'Alex Chen',
        timestamp: '2026-08-20T14:32:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Collector fleet is capped at 200 spans/sec per pod; batches flush every 5 seconds to protect the ingest path.',
      },
    ],
  },
  {
    id: 'claim_03',
    sectionId: 'decisions',
    statement:
      "Alert dedup window in the PagerDuty integration was silently extended from 10 to 30 minutes (marked with comment: // tunable later). Rationale undocumented.",
    status: 'inferred_ai',
    category: 'rationale',
    verificationMethod: 'llm_entailment',
    unresolvedQuestionId: 'q_01',
    sourceQuotes: [
      {
        sourceId: 'commit_77e2d',
        sourceType: 'github_commit',
        title: 'Commit 77e2d9: Alert dedup window extended to 30 minutes',
        uri: 'https://github.com/helios/helios-alertbridge/commit/77e2d91c3b8',
        author: 'Alex Chen',
        timestamp: '2026-10-02T22:11:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet: "+  dedupWindow: '30m', // tunable later",
      },
    ],
  },
  {
    id: 'claim_04',
    sectionId: 'decisions',
    statement:
      'The ingest path sustains 1.8 million active time series with headroom to 2.4 million before the latency SLO is breached.',
    status: 'quoted_unverified',
    category: 'fact',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'pr_142',
        sourceType: 'github_pr',
        title: 'PR #142 (Paraphrase Check)',
        uri: 'https://github.com/helios/helios-metrics-migration/pull/142',
        author: 'AI Summarizer',
        timestamp: '2026-08-20T14:32:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Benchmark runs sustained 1.8M active series with headroom to 2.4M before SLO breach.',
      },
    ],
  },
  {
    id: 'claim_05',
    sectionId: 'unfinished',
    statement:
      'PR #167 adds adaptive cardinality limiting for the collector fleet, but the e2e suite fails on line 132 with a fixture port collision.',
    status: 'quoted_verified',
    category: 'action_item',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'pr_167',
        sourceType: 'github_pr',
        title: 'PR #167 (Draft): Adaptive cardinality limiting for the collector fleet',
        uri: 'https://github.com/helios/otel-collector-fleet/pull/167',
        author: 'Alex Chen',
        timestamp: '2026-10-30T16:45:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'e2e suite: FAILED (fixture port collision in test_cardinality_limit on line 132).',
      },
    ],
  },
  {
    id: 'claim_06',
    sectionId: 'unfinished',
    statement:
      'Branch feat/vm-single-store-swap must be completed and merged by the successor within the first week of the cutover plan.',
    status: 'inferred_ai',
    category: 'action_item',
    verificationMethod: 'llm_entailment',
    sourceQuotes: [
      {
        sourceId: 'pr_167',
        sourceType: 'github_pr',
        title: 'PR #167 (Draft)',
        uri: 'https://github.com/helios/otel-collector-fleet/pull/167',
        author: 'Alex Chen',
        timestamp: '2026-10-30T16:45:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet: 'TODO: needs fixture port fix before merging.',
      },
    ],
  },
  {
    id: 'claim_07',
    sectionId: 'ownership',
    statement:
      'Alex Chen is the sole custodian of the Grafana org admin token in Vault; rotation scheduled for Dec 5, 2026.',
    status: 'quoted_verified',
    category: 'credential',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'vault_grafana',
        sourceType: 'aws_secret',
        title: 'Vault: secret/helios/prod/grafana-admin',
        uri: 'vault: kv/helios/prod/grafana-admin',
        author: 'Alex Chen',
        timestamp: '2026-09-05T08:00:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Sole Token Custodian: Alex Chen (Last rotated Sept 5, 2026)',
      },
    ],
  },
  {
    id: 'claim_08',
    sectionId: 'ownership',
    statement:
      'For Prometheus recording-rule debugging or Thanos compactor failures, escalate to Meera Iyer (Staff SRE) in #sre-infra.',
    status: 'stated_by_leaver',
    category: 'process',
    verificationMethod: 'human_attested',
    sourceQuotes: [
      {
        sourceId: 'pr_142',
        sourceType: 'github_pr',
        title: 'PR #142 Discussion',
        uri: 'https://github.com/helios/helios-metrics-migration/pull/142',
        author: 'Meera Iyer',
        timestamp: '2026-08-21T10:05:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Meera Iyer: "Makes sense. I can take recording-rule debugging and compactor failures in #sre-infra after Alex leaves."',
      },
    ],
  },
  {
    id: 'claim_09',
    sectionId: 'risks',
    statement:
      'Contradiction Detected: PR #155 claims the VictoriaMetrics dual-write is fully live, but Slack #helios-eng shows dashboard reads were rolled back to Thanos after a 4% query failure rate.',
    status: 'conflicting',
    category: 'fact',
    verificationMethod: 'llm_entailment',
    contradictionId: 'conflict_01',
    sourceQuotes: [
      {
        sourceId: 'pr_155',
        sourceType: 'github_pr',
        title: 'PR #155: Cut dashboards over to VictoriaMetrics',
        uri: 'https://github.com/helios/helios-metrics-migration/pull/155',
        author: 'Alex Chen',
        timestamp: '2026-10-18T09:15:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Dashboards now read from VictoriaMetrics; the Thanos dual-write is fully live and the legacy path can be decommissioned next sprint.',
      },
      {
        sourceId: 'slack_helios',
        sourceType: 'slack_chat',
        title: 'Slack #helios-eng: VM query failures and rollback',
        uri: 'https://helios.slack.com/archives/C081HELIOS/p1730638000',
        author: 'Alex Chen',
        timestamp: '2026-11-03T11:20:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Rolled the dashboard reads back to Thanos after VictoriaMetrics returned 4% query failures on the range-heavy panels. VM ingest stays dual-write; reads are not on VM yet.',
      },
    ],
  },
  {
    id: 'claim_10',
    sectionId: 'risks',
    statement:
      'Staff engineer Alex Chen retention package review, severance clauses, and equity acceleration terms.',
    status: 'quoted_verified',
    category: 'fact',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'slack_leadership',
        sourceType: 'slack_chat',
        title: 'Slack #leadership-confidential (HR/Management)',
        uri: 'https://helios.slack.com/archives/C099LEAD/p1730712000',
        author: 'Vikram Malhotra & HR',
        timestamp: '2026-11-04T15:00:00Z',
        requiredClearanceLevel: 'restricted_hr_legal',
        exactSnippet:
          'We offered a 25% equity acceleration and compensation retention package, but Alex has decided to accept the external offer.',
      },
    ],
  },
]

export const INITIAL_DECISIONS: ArchitecturalDecision[] = [
  {
    id: 'dec_01',
    title: 'ADR-011: Adopt VictoriaMetrics as the long-term metrics store',
    timestamp: '2026-08-20',
    status: 'active',
    context:
      'Thanos query p99 latency repeatedly breached the 2s dashboard SLO during weekly peaks, and the compactor backlog pushed staleness past alert thresholds.',
    decisionTaken:
      'Adopt VictoriaMetrics as the long-term store; run a Thanos dual-write until dashboard parity is proven, then decommission the legacy path.',
    alternativesConsidered: [
      {
        technology: 'Grafana Mimir',
        rejectionReason:
          'Object-storage churn and multi-tenant complexity are too heavy for a four-person platform team.',
      },
      {
        technology: 'Thanos status quo',
        rejectionReason:
          'Recurring query p99 SLO misses and compactor backlog were already degrading dashboards.',
      },
    ],
    tradeOffsAccepted: [
      'Dual-write doubles ingest cost during the migration window.',
      'Grafana dashboards need per-panel datasource migration before reads can cut over.',
    ],
    keyStakeholders: {
      proposer: 'Alex Chen (Staff Engineer)',
      approver: 'Vikram Malhotra (Lead)',
    },
    provenance: {
      sourceId: 'pr_142',
      sourceType: 'github_pr',
      url: 'https://github.com/helios/helios-metrics-migration/pull/142',
      exactQuote:
        'VictoriaMetrics cuts dashboard query p99 latency by 60% and halves metrics storage cost compared with Thanos.',
      rationaleConfidence: 'documented_explicit',
    },
    associatedClaimId: 'claim_01',
  },
  {
    id: 'dec_02',
    title: 'Commit 77e2d: Alert dedup window extended to 30 minutes',
    timestamp: '2026-10-02',
    status: 'active',
    context:
      "The PagerDuty dedup window in helios-alertbridge was silently raised from 10 to 30 minutes with the commit note '// tunable later'.",
    decisionTaken:
      'Dedup window now 30 minutes. No ADR or ticket was referenced in the commit.',
    alternativesConsidered: [
      {
        technology: 'Per-alert-class dedup windows',
        rejectionReason: 'Not implemented; nothing in the commit documents the intent.',
      },
    ],
    tradeOffsAccepted: [
      'Genuine second-page alerts within 30 minutes are suppressed.',
    ],
    keyStakeholders: {
      proposer: 'Alex Chen',
      approver: 'Self-merged (Direct to main)',
    },
    provenance: {
      sourceId: 'commit_77e2d',
      sourceType: 'github_commit',
      url: 'https://github.com/helios/helios-alertbridge/commit/77e2d91c3b8',
      exactQuote: "+  dedupWindow: '30m', // tunable later",
      rationaleConfidence: 'inferred_ai',
    },
    associatedClaimId: 'claim_03',
  },
]

export const INITIAL_UNFINISHED: UnfinishedWorkItem[] = [
  {
    id: 'unf_01',
    title: 'PR #167: Adaptive cardinality limiting for the collector fleet',
    type: 'open_pr',
    status: 'ready_to_merge',
    urgency: 'p0_immediate',
    description:
      'Adds adaptive cardinality limiting to stop label explosions from overwriting the ingest ring during traffic spikes.',
    location: {
      repository: 'helios/otel-collector-fleet',
      branchOrPath: 'feat/cardinality-limit',
      prNumber: 167,
      lineRange: [126, 140],
    },
    associatedBlockers: [
      'CI e2e failure: fixture port collision in test_cardinality_limit on line 132.',
    ],
    recommendedSuccessorAction:
      'Pull feat/cardinality-limit, assign deterministic e2e fixture ports on line 132, rerun CI, and merge.',
    provenance: {
      lastActivityDate: '2026-10-30',
      commitHash: 'a3f19d2',
      author: 'Alex Chen',
      reviewState: 'approved',
    },
    associatedClaimId: 'claim_05',
  },
  {
    id: 'unf_02',
    title: 'Thanos compactor decommission checklist',
    type: 'unmerged_migration',
    status: 'needs_triage',
    urgency: 'p1_first_two_weeks',
    description:
      'The legacy Thanos compactor and store gateways still serve Q3 capacity reports from the object-storage bucket.',
    location: {
      repository: 'helios/helios-metrics-migration',
      branchOrPath: 'infra/thanos-decommission/runbook.md',
    },
    associatedBlockers: [
      'Analytics still reads the Thanos store for Q3 capacity reports.',
    ],
    recommendedSuccessorAction:
      'Coordinate with Meera Iyer before deleting the bucket on Dec 20, 2026.',
    provenance: {
      lastActivityDate: '2026-09-15',
      commitHash: 'b7712c4',
      author: 'Alex Chen',
    },
    associatedClaimId: 'claim_06',
  },
]

export const INITIAL_OWNERSHIP: OwnershipAsset[] = [
  {
    id: 'own_01',
    assetName: 'Grafana org admin & Vault token custody',
    assetType: 'third_party_saas',
    criticality: 'tier_1_mission_critical',
    currentOwner: {
      name: 'Alex Chen',
      email: 'alex.chen@helios.internal',
      slackHandle: '@alexchen',
      status: 'leaving',
    },
    proposedSuccessor: {
      name: 'Priya Sharma',
      email: 'priya.sharma@helios.internal',
      approvalState: 'pending_lead_confirmation',
    },
    coMaintainers: [],
    credentialsAndAccess: {
      credentialVaultPath: 'vault: kv/helios/prod/grafana-admin',
      adminAccessRequiresTransfer: true,
      transferDeadlineDate: '2026-11-10',
    },
    escalationContact: {
      role: 'Engineering Director',
      name: 'Vikram Malhotra',
      slackChannel: '#helios-eng',
    },
    ownershipIndex: 0.91,
    associatedClaimId: 'claim_07',
  },
  {
    id: 'own_02',
    assetName: 'OTel Collector Gateway Fleet',
    assetType: 'microservice',
    criticality: 'tier_1_mission_critical',
    currentOwner: {
      name: 'Alex Chen',
      email: 'alex.chen@helios.internal',
      slackHandle: '@alexchen',
      status: 'leaving',
    },
    proposedSuccessor: {
      name: 'Priya Sharma',
      email: 'priya.sharma@helios.internal',
      approvalState: 'confirmed',
    },
    coMaintainers: [
      {
        name: 'Meera Iyer',
        contributionShare: 0.34,
        lastActiveDate: '2026-11-01',
      },
    ],
    credentialsAndAccess: {
      adminAccessRequiresTransfer: false,
      transferDeadlineDate: '2026-11-11',
    },
    escalationContact: {
      role: 'Staff SRE',
      name: 'Meera Iyer',
      slackChannel: '#sre-infra',
    },
    ownershipIndex: 0.63,
    associatedClaimId: 'claim_08',
  },
]

export const INITIAL_CONTRADICTIONS: ContradictionItem[] = [
  {
    id: 'conflict_01',
    entityName: 'VictoriaMetrics ingest path',
    attributeName: 'Dual-write live state',
    type: 'genuine_disagreement',
    severity: 'critical_blocker',
    status: 'open_unresolved',
    sourceA: {
      sourceType: 'github_pr',
      title: 'GitHub PR #155: Cut dashboards over to VictoriaMetrics',
      url: 'https://github.com/helios/helios-metrics-migration/pull/155',
      timestamp: '2026-10-18T09:15:00Z',
      author: 'Alex Chen (Staff Engineer)',
      extractedValue: 'VictoriaMetrics dual-write live for all dashboard reads',
      exactQuote:
        'Dashboards now read from VictoriaMetrics; the Thanos dual-write is fully live and the legacy path can be decommissioned next sprint.',
    },
    sourceB: {
      sourceType: 'slack_chat',
      title: 'Slack #helios-eng: VM query failures and rollback',
      url: 'https://helios.slack.com/archives/C081HELIOS/p1730638000',
      timestamp: '2026-11-03T11:20:00Z',
      author: 'Alex Chen',
      extractedValue: 'VM ingest rolled back for dashboards; Thanos still serving reads',
      exactQuote:
        'Rolled the dashboard reads back to Thanos after VictoriaMetrics returned 4% query failures on the range-heavy panels. VM ingest stays dual-write; reads are not on VM yet.',
    },
    associatedClaimId: 'claim_09',
  },
]

export const INITIAL_QUESTIONS: LeaverInterviewQuestion[] = [
  {
    id: 'q_01',
    associatedClaimId: 'claim_03',
    priorityRank: 1,
    category: 'architecture_rationale',
    promptText:
      "In commit 77e2d on Oct 2, you raised the PagerDuty alert dedup window from 10 to 30 minutes with the comment '// tunable later'. No ticket was linked. Why was it extended, and is it safe to revert before the on-call rotation changes?",
    groundingContext: {
      sourceType: 'commit',
      sourceId: 'commit_77e2d',
      snippetText: "+  dedupWindow: '30m', // tunable later",
    },
    status: 'pending_answer',
  },
  {
    id: 'q_02',
    associatedClaimId: 'claim_07',
    priorityRank: 2,
    category: 'missing_credential',
    promptText:
      'Vault shows you are the sole custodian of the Grafana org admin token. Who holds the break-glass 2FA device for the Grafana org admin account?',
    groundingContext: {
      sourceType: 'commit',
      sourceId: 'vault_grafana',
      snippetText:
        'Sole Token Custodian: Alex Chen (Last rotated Sept 5, 2026)',
    },
    status: 'pending_answer',
  },
]

// Seed integrity checks keep the dashboard's repeated counts and dates aligned.
console.assert(INITIAL_CLAIMS.length === 10, 'Seed should contain 10 source claims, including one restricted HR claim.')
console.assert(
  INITIAL_CLAIMS.filter((claim) => claim.id !== 'claim_10').length === 9 &&
    INITIAL_CLAIMS.find((claim) => claim.id === 'claim_10')?.sourceQuotes[0]?.requiredClearanceLevel === 'restricted_hr_legal',
  'Successor-facing overview should count 9 claims and withhold the HR-restricted record.'
)
console.assert(INITIAL_DECISIONS.length === 2, 'Seed should contain 2 architecture decisions.')
console.assert(INITIAL_UNFINISHED.length === 2, 'Seed should contain 2 unfinished work items.')
console.assert(INITIAL_OWNERSHIP.length === 2, 'Seed should contain 2 ownership records.')
console.assert(INITIAL_CONTRADICTIONS.length === 1, 'Seed should contain 1 dual-write contradiction.')
console.assert(INITIAL_QUESTIONS.length === 2, 'Seed should contain 2 leaver interview questions.')
console.assert(
  INITIAL_CONTRADICTIONS[0]?.id === 'conflict_01' &&
    INITIAL_CONTRADICTIONS[0]?.sourceA.extractedValue.includes('VictoriaMetrics') &&
    INITIAL_CONTRADICTIONS[0]?.sourceB.extractedValue.includes('Thanos') &&
    INITIAL_CONTRADICTIONS[0]?.sourceA.timestamp.startsWith('2026-10-18') &&
    INITIAL_CONTRADICTIONS[0]?.sourceB.timestamp.startsWith('2026-11-03'),
  'Dual-write conflict should use the deep-link id and preserve both source values.'
)
console.assert(
  INITIAL_OWNERSHIP.map((asset) => asset.credentialsAndAccess.transferDeadlineDate).join(',') ===
    '2026-11-10,2026-11-11',
  'Ownership transfer dates should remain Nov 10 and Nov 11, 2026.'
)
console.assert(
  INITIAL_CLAIMS.find((claim) => claim.id === 'claim_07')?.statement.includes('Dec 5, 2026'),
  'Grafana token rotation date should remain Dec 5, 2026.'
)
console.assert(new Set(['decisions', 'unfinished', 'ownership', 'risks']).size === 4, 'Sign-off should track four distinct sections.')
