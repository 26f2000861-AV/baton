import {
  ArchitecturalDecision,
  Claim,
  ContradictionItem,
  LeaverInterviewQuestion,
  OwnershipAsset,
  UnfinishedWorkItem,
} from '../lib/types'

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'claim_01',
    sectionId: 'decisions',
    statement:
      'Postgres FOR UPDATE SKIP LOCKED provides ACID-compliant persistence, ensuring zero dropped payment transactions during worker node restarts.',
    status: 'quoted_verified',
    category: 'fact',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'pr_189',
        sourceType: 'github_pr',
        title: 'PR #189: Migrate queue worker from Redis to Postgres SKIP LOCKED',
        uri: 'https://github.com/fintrack/payment-core/pull/189',
        author: 'Alex Chen',
        timestamp: '2026-08-14T14:32:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Postgres FOR UPDATE SKIP LOCKED provides ACID-compliant persistence, ensuring zero dropped payment transactions during worker node restarts.',
      },
    ],
  },
  {
    id: 'claim_02',
    sectionId: 'decisions',
    statement:
      'Worker pool concurrency is capped at 16 threads per pod to avoid connection pool exhaustion on the main database cluster.',
    status: 'quoted_verified',
    category: 'process',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'pr_189',
        sourceType: 'github_pr',
        title: 'PR #189: Migrate queue worker from Redis to Postgres SKIP LOCKED',
        uri: 'https://github.com/fintrack/payment-core/pull/189',
        author: 'Alex Chen',
        timestamp: '2026-08-14T14:32:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Worker pool concurrency is capped at 16 threads per pod to avoid connection pool exhaustion on the main database cluster.',
      },
    ],
  },
  {
    id: 'claim_03',
    sectionId: 'decisions',
    statement:
      'Authentication session token TTL was lengthened to 72 hours (marked with comment: // quick fix). Rationale undocumented.',
    status: 'inferred_ai',
    category: 'rationale',
    verificationMethod: 'llm_entailment',
    unresolvedQuestionId: 'q_01',
    sourceQuotes: [
      {
        sourceId: 'commit_8f4a1',
        sourceType: 'github_commit',
        title: 'Commit 8f4a179: Auth session token TTL extended to 72 hours',
        uri: 'https://github.com/fintrack/payment-core/commit/8f4a179c3b8',
        author: 'Alex Chen',
        timestamp: '2026-10-04T22:11:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet: "+  expiresIn: '72h', // quick fix",
      },
    ],
  },
  {
    id: 'claim_04',
    sectionId: 'decisions',
    statement:
      'Payment queue throughput was measured at 4,200 transactions per second under simulated peak load.',
    status: 'quoted_unverified',
    category: 'fact',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'pr_189',
        sourceType: 'github_pr',
        title: 'PR #189 (Paraphrase Check)',
        uri: 'https://github.com/fintrack/payment-core/pull/189',
        author: 'AI Summarizer',
        timestamp: '2026-08-14T14:32:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Payment queue throughput benchmark achieved 4,200 tx/sec with sub-50ms latency.',
      },
    ],
  },
  {
    id: 'claim_05',
    sectionId: 'unfinished',
    statement:
      'PR #214 implements randomized full-jitter exponential backoff for webhooks, but integration test line 84 fails on random seed collision.',
    status: 'quoted_verified',
    category: 'action_item',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'pr_214',
        sourceType: 'github_pr',
        title: 'PR #214 (Draft): Exponential backoff with jitter for webhook retries',
        uri: 'https://github.com/fintrack/payment-core/pull/214',
        author: 'Alex Chen',
        timestamp: '2026-10-28T16:45:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Integration tests: FAILED (AssertionError in test_retry_jitter_bounds on line 84: random seed collision).',
      },
    ],
  },
  {
    id: 'claim_06',
    sectionId: 'unfinished',
    statement:
      'Merchant webhook retry branch feat/webhook-backoff must be adopted, fixed, and merged by successor in Days 1 to 7.',
    status: 'inferred_ai',
    category: 'action_item',
    verificationMethod: 'llm_entailment',
    sourceQuotes: [
      {
        sourceId: 'pr_214',
        sourceType: 'github_pr',
        title: 'PR #214 (Draft)',
        uri: 'https://github.com/fintrack/payment-core/pull/214',
        author: 'Alex Chen',
        timestamp: '2026-10-28T16:45:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet: 'TODO: Needs seed initialization fix before merging.',
      },
    ],
  },
  {
    id: 'claim_07',
    sectionId: 'ownership',
    statement:
      'Alex Chen is the sole custodian for Stripe Webhook Signing Secret in AWS Secrets Manager; rotation scheduled for Dec 1, 2026.',
    status: 'quoted_verified',
    category: 'credential',
    verificationMethod: 'exact_substring_match',
    sourceQuotes: [
      {
        sourceId: 'aws_secrets',
        sourceType: 'aws_secret',
        title: 'AWS Secrets Manager: prod/stripe/webhook_key',
        uri: 'arn:aws:secretsmanager:ap-south-1:123456789012:secret:prod/stripe/webhook_key',
        author: 'Alex Chen',
        timestamp: '2026-09-01T08:00:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Last Rotated: Sept 1, 2026 by Alex Chen (Sole Key Custodian)',
      },
    ],
  },
  {
    id: 'claim_08',
    sectionId: 'ownership',
    statement:
      'For any Redis caching or cluster eviction queries, route escalation to Dev Patel (Staff SRE).',
    status: 'stated_by_leaver',
    category: 'process',
    verificationMethod: 'human_attested',
    sourceQuotes: [
      {
        sourceId: 'pr_189',
        sourceType: 'github_pr',
        title: 'PR #189 Discussion',
        uri: 'https://github.com/fintrack/payment-core/pull/189',
        author: 'Dev Patel',
        timestamp: '2026-08-14T14:32:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Dev Patel: "Makes sense. Redis OOM crashes during flash sales were causing orphaned transactions."',
      },
    ],
  },
  {
    id: 'claim_09',
    sectionId: 'risks',
    statement:
      'Contradiction Detected: PR #204 claims full migration to AWS SQS FIFO, but Slack #payment-eng reveals webhook retries fell back to RabbitMQ due to throttling latency.',
    status: 'conflicting',
    category: 'fact',
    verificationMethod: 'llm_entailment',
    contradictionId: 'c_01',
    sourceQuotes: [
      {
        sourceId: 'pr_204',
        sourceType: 'github_pr',
        title: 'PR #204: AWS SQS Migration',
        uri: 'https://github.com/fintrack/payment-core/pull/204',
        author: 'Alex Chen',
        timestamp: '2026-10-14T09:15:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'All batch settlement events now stream through `fintrack-settlement-fifo.fifo` with exactly-once delivery guarantees.',
      },
      {
        sourceId: 'slack_payment_eng',
        sourceType: 'slack_chat',
        title: 'Slack #payment-eng Throttling Rollback',
        uri: 'https://fintrack.slack.com/archives/C081PAY/p1730538000',
        author: 'Alex Chen',
        timestamp: '2026-11-02T11:20:00Z',
        requiredClearanceLevel: 'team_internal',
        exactSnippet:
          'Temporarily routed webhook retries back to our RabbitMQ cluster while AWS support investigates the burst quota.',
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
        uri: 'https://fintrack.slack.com/archives/C099LEAD/p1730712000',
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
    title: 'ADR-004: Migrate Payment Event Queue Worker to Postgres SKIP LOCKED',
    timestamp: '2026-08-14',
    status: 'active',
    context:
      'In-memory Redis instance experienced Out-Of-Memory termination during high-volume flash sales, dropping unacknowledged merchant settlement events.',
    decisionTaken:
      'Migrated queue persistence directly to PostgreSQL utilizing `FOR UPDATE SKIP LOCKED`. Provides full ACID compliance and zero dropped events across pod restarts.',
    alternativesConsidered: [
      {
        technology: 'Redis Sentinel / Redis Cluster',
        rejectionReason:
          'Requires managing separate persistent in-memory infra; failure recovery still lacked ACID transaction guarantees with main database.',
      },
      {
        technology: 'Kafka',
        rejectionReason:
          'Substantial operational complexity and JVM overhead for a single microservice team.',
      },
    ],
    tradeOffsAccepted: [
      'Higher write amplification on Postgres primary disk IOPS.',
      'Worker concurrency strictly capped at 16 threads per pod to avoid DB connection pool exhaustion.',
    ],
    keyStakeholders: {
      proposer: 'Alex Chen (Staff Engineer)',
      approver: 'Vikram Malhotra (Lead)',
    },
    provenance: {
      sourceId: 'pr_189',
      sourceType: 'github_pr',
      url: 'https://github.com/fintrack/payment-core/pull/189',
      exactQuote:
        'Postgres FOR UPDATE SKIP LOCKED provides ACID-compliant persistence, ensuring zero dropped payment transactions during worker node restarts.',
      rationaleConfidence: 'documented_explicit',
    },
    associatedClaimId: 'claim_01',
  },
  {
    id: 'dec_02',
    title: 'Commit 8f4a1: Mobile Auth Session Token TTL Extension to 72h',
    timestamp: '2026-10-04',
    status: 'active',
    context:
      'JWT session duration was abruptly increased from 15 minutes to 72 hours in auth service with commit note // quick fix.',
    decisionTaken:
      'Extended token expiration to 72 hours. No formal ADR or Jira ticket was referenced.',
    alternativesConsidered: [
      {
        technology: 'Silent Refresh Tokens',
        rejectionReason: 'Undocumented in commit; required client-side mobile refactor.',
      },
    ],
    tradeOffsAccepted: [
      'Stale JWT tokens remain valid for 3 days if credentials are leaked.',
    ],
    keyStakeholders: {
      proposer: 'Alex Chen',
      approver: 'Self-merged (Direct to main)',
    },
    provenance: {
      sourceId: 'commit_8f4a1',
      sourceType: 'github_commit',
      url: 'https://github.com/fintrack/payment-core/commit/8f4a179c3b8',
      exactQuote: "+  expiresIn: '72h', // quick fix",
      rationaleConfidence: 'inferred_ai',
    },
    associatedClaimId: 'claim_03',
  },
]

export const INITIAL_UNFINISHED: UnfinishedWorkItem[] = [
  {
    id: 'unf_01',
    title: 'PR #214: Exponential backoff with jitter for webhook retries',
    type: 'open_pr',
    status: 'ready_to_merge',
    urgency: 'p0_immediate',
    description:
      'Adds randomized full-jitter backoff to outbound merchant notifications to stop partner server thundering-herd outages.',
    location: {
      repository: 'fintrack/payment-core',
      branchOrPath: 'feat/webhook-backoff',
      prNumber: 214,
      lineRange: [80, 95],
    },
    associatedBlockers: [
      'CI test failure: AssertionError in test_retry_jitter_bounds on line 84 (random seed collision).',
    ],
    recommendedSuccessorAction:
      'Pull branch feat/webhook-backoff, initialize deterministic test random seed on line 84, rerun CI, and merge.',
    provenance: {
      lastActivityDate: '2026-10-28',
      commitHash: 'd7a90f1',
      author: 'Alex Chen',
      reviewState: 'approved',
    },
    associatedClaimId: 'claim_05',
  },
  {
    id: 'unf_02',
    title: 'Merchant Profile Database Dual-Write Triggers Cleanup',
    type: 'unmerged_migration',
    status: 'needs_triage',
    urgency: 'p1_first_two_weeks',
    description:
      'Legacy dual-write PostgreSQL triggers synchronizing merchant billing profiles to MongoDB analytics warehouse.',
    location: {
      repository: 'fintrack/payment-core',
      branchOrPath: 'src/db/migrations/20260710_dual_write.sql',
    },
    associatedBlockers: [
      'Analytics team still queries MongoDB cluster for Q3 historical reports.',
    ],
    recommendedSuccessorAction:
      'Coordinate with Data Engineering lead (Aditi) before dropping dual-write triggers on Dec 15.',
    provenance: {
      lastActivityDate: '2026-09-12',
      commitHash: 'b4412e8',
      author: 'Alex Chen',
    },
    associatedClaimId: 'claim_06',
  },
]

export const INITIAL_OWNERSHIP: OwnershipAsset[] = [
  {
    id: 'own_01',
    assetName: 'Stripe Webhook Gateway & Secret Custody',
    assetType: 'third_party_saas',
    criticality: 'tier_1_mission_critical',
    currentOwner: {
      name: 'Alex Chen',
      email: 'alex.chen@fintrack.internal',
      slackHandle: '@alexchen',
      status: 'leaving',
    },
    proposedSuccessor: {
      name: 'Priya Sharma',
      email: 'priya.sharma@fintrack.internal',
      approvalState: 'pending_lead_confirmation',
    },
    coMaintainers: [],
    credentialsAndAccess: {
      credentialVaultPath:
        'arn:aws:secretsmanager:ap-south-1:123456789012:secret:prod/stripe/webhook_key',
      adminAccessRequiresTransfer: true,
      transferDeadlineDate: '2026-11-10',
    },
    escalationContact: {
      role: 'Engineering Director',
      name: 'Vikram Malhotra',
      slackChannel: '#payment-eng',
    },
    ownershipIndex: 0.88,
    associatedClaimId: 'claim_07',
  },
  {
    id: 'own_02',
    assetName: 'Payment Core Event Dispatcher Service',
    assetType: 'microservice',
    criticality: 'tier_1_mission_critical',
    currentOwner: {
      name: 'Alex Chen',
      email: 'alex.chen@fintrack.internal',
      slackHandle: '@alexchen',
      status: 'leaving',
    },
    proposedSuccessor: {
      name: 'Priya Sharma',
      email: 'priya.sharma@fintrack.internal',
      approvalState: 'confirmed',
    },
    coMaintainers: [
      {
        name: 'Dev Patel',
        contributionShare: 0.28,
        lastActiveDate: '2026-11-01',
      },
    ],
    credentialsAndAccess: {
      adminAccessRequiresTransfer: false,
      transferDeadlineDate: '2026-11-11',
    },
    escalationContact: {
      role: 'Staff SRE',
      name: 'Dev Patel',
      slackChannel: '#sre-infra',
    },
    ownershipIndex: 0.65,
    associatedClaimId: 'claim_08',
  },
]

export const INITIAL_CONTRADICTIONS: ContradictionItem[] = [
  {
    id: 'c_01',
    entityName: 'Payment Settlement Event Dispatcher',
    attributeName: 'Active Delivery Engine',
    type: 'genuine_disagreement',
    severity: 'critical_blocker',
    status: 'open_unresolved',
    sourceA: {
      sourceType: 'github_pr',
      title: 'GitHub PR #204: AWS SQS Migration',
      url: 'https://github.com/fintrack/payment-core/pull/204',
      timestamp: '2026-10-14T09:15:00Z',
      author: 'Alex Chen (Staff Engineer)',
      extractedValue: 'AWS SQS FIFO Queue (fintrack-settlement-fifo.fifo)',
      exactQuote:
        'All batch settlement events now stream through `fintrack-settlement-fifo.fifo` with exactly-once delivery guarantees. Deprecates the legacy RabbitMQ cluster on ECS.',
    },
    sourceB: {
      sourceType: 'slack_chat',
      title: 'Slack #payment-eng Throttling Rollback',
      url: 'https://fintrack.slack.com/archives/C081PAY/p1730538000',
      timestamp: '2026-11-02T11:20:00Z',
      author: 'Alex Chen',
      extractedValue: 'RabbitMQ Cluster (Active Fallback for Retries)',
      exactQuote:
        'Temporarily routed webhook retries back to our RabbitMQ cluster while AWS support investigates the burst quota. RabbitMQ is currently handling live delivery fallback.',
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
      "In commit 8f4a1 on Oct 4, you extended JWT auth token TTL from 15m to 72h with the comment '// quick fix'. No Jira ticket was linked. Why was this extended, and is it safe to revert?",
    groundingContext: {
      sourceType: 'commit',
      sourceId: 'commit_8f4a1',
      snippetText: "+  expiresIn: '72h', // quick fix",
    },
    status: 'pending_answer',
  },
  {
    id: 'q_02',
    associatedClaimId: 'claim_07',
    priorityRank: 2,
    category: 'missing_credential',
    promptText:
      'AWS Secrets Manager shows you are sole custodian for Stripe Webhook Signing Secret. Who has the root 2FA backup device for the Stripe Developer Dashboard?',
    groundingContext: {
      sourceType: 'commit',
      sourceId: 'aws_secrets',
      snippetText:
        'Last Rotated: Sept 1, 2026 by Alex Chen (Sole Key Custodian)',
    },
    status: 'pending_answer',
  },
]
