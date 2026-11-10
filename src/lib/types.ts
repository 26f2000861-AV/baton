export type ClaimStatus =
  | 'quoted_verified'   // Exact substring match in source + entailed
  | 'quoted_unverified' // Quote altered, paraphrased or unverified
  | 'inferred_ai'       // AI deduction/synthesis without verbatim quote
  | 'conflicting'       // Contradicted by another source document
  | 'not_found'         // Missing critical piece of knowledge
  | 'stated_by_leaver'  // Attested directly by departing engineer
  | 'confirmed_by_lead' // Manually confirmed/settled by engineering lead

export type ClaimCategory =
  | 'fact'
  | 'rationale'
  | 'credential'
  | 'process'
  | 'action_item'

export type ClearanceLevel =
  | 'public_open'
  | 'team_internal'
  | 'confidential_lead'
  | 'restricted_hr_legal'

export type PersonaRole = 'successor' | 'leaver' | 'lead'

export interface PersonaProfile {
  role: PersonaRole
  name: string
  title: string
  clearanceLevel: ClearanceLevel
  avatar: string
  email: string
}

export interface SourceSpan {
  sourceId: string
  sourceType: 'github_pr' | 'github_commit' | 'slack_chat' | 'jira_ticket' | 'aws_secret' | 'notion_doc'
  title: string
  uri: string
  author: string
  timestamp: string
  requiredClearanceLevel: ClearanceLevel
  exactSnippet: string
  charOffsetStart?: number
  charOffsetEnd?: number
}

export interface Claim {
  id: string
  sectionId: 'decisions' | 'unfinished' | 'ownership' | 'risks'
  statement: string
  status: ClaimStatus
  category: ClaimCategory
  sourceQuotes: SourceSpan[]
  verificationMethod: 'exact_substring_match' | 'llm_entailment' | 'human_attested'
  unresolvedQuestionId?: string
  contradictionId?: string
  history?: {
    action: string
    actor: string
    timestamp: string
  }[]
}

export interface ArchitecturalDecision {
  id: string
  title: string
  timestamp: string
  status: 'active' | 'superseded' | 'deprecated' | 'proposed'
  context: string
  decisionTaken: string
  alternativesConsidered: {
    technology: string
    rejectionReason: string
  }[]
  tradeOffsAccepted: string[]
  keyStakeholders: {
    proposer: string
    approver: string
  }
  provenance: {
    sourceId: string
    sourceType: 'github_pr' | 'github_commit' | 'slack_chat' | 'adr'
    url: string
    exactQuote: string
    rationaleConfidence: 'documented_explicit' | 'inferred_ai' | 'stated_by_leaver'
  }
  associatedClaimId: string
}

export interface WorkUpdate {
  id: string
  decisionText: string
  rationale: string
  nextAction: string
  sourceReference: string
  capturedBy: string
  capturedAt: string
}

export interface UnfinishedWorkItem {
  id: string
  title: string
  type: 'open_pr' | 'stale_branch' | 'inline_todo' | 'unmerged_migration' | 'flaky_test'
  status: 'needs_triage' | 'ready_to_merge' | 'blocked' | 'adopted'
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
  associatedClaimId: string
}

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
    contributionShare: number
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
  ownershipIndex: number // e.g. 0.88 (88% truck factor)
  associatedClaimId: string
}

export interface ContradictionItem {
  id: string
  entityName: string
  attributeName: string
  type: 'superseded_over_time' | 'genuine_disagreement' | 'scope_difference'
  severity: 'critical_blocker' | 'operational_risk' | 'minor_inconsistency'
  status: 'open_unresolved' | 'settled_by_human'
  sourceA: {
    sourceType: 'github_pr' | 'github_commit'
    title: string
    url: string
    timestamp: string
    author: string
    extractedValue: string
    exactQuote: string
  }
  sourceB: {
    sourceType: 'slack_chat' | 'jira_ticket'
    title: string
    url: string
    timestamp: string
    author: string
    extractedValue: string
    exactQuote: string
  }
  settlement?: {
    resolvedBy: string
    resolutionTimestamp: string
    resolutionType: 'accept_source_a' | 'accept_source_b' | 'clarification_note'
    humanComment: string
  }
  associatedClaimId: string
}

export interface LeaverInterviewQuestion {
  id: string
  associatedClaimId: string
  priorityRank: number
  category: 'architecture_rationale' | 'unresolved_conflict' | 'missing_credential' | 'operational_recovery'
  promptText: string
  groundingContext: {
    sourceType: 'commit' | 'pull_request' | 'slack_channel'
    sourceId: string
    snippetText: string
  }
  status: 'pending_answer' | 'answered' | 'escalated_to_lead'
  leaverResponse?: {
    answeredBy: string
    timestamp: string
    responseText: string
  }
}

export interface SuccessorQuery {
  id: string
  claimId: string
  successorId: string
  successorName: string
  timestamp: string
  queryCategory: 'missing_credential' | 'unclear_rationale' | 'broken_runbook' | 'reproduction_failure'
  queryText: string
  status: 'open_pending_reply' | 'resolved'
  assignedRespondent: {
    name: string
    role: 'leaver' | 'engineering_lead' | 'co_maintainer'
    slackHandle: string
  }
  resolution?: {
    answeredBy: string
    responseSnippet: string
    timestamp: string
  }
}

export interface HandoverSectionState {
  sectionId: 'decisions' | 'unfinished' | 'ownership' | 'risks'
  isAccepted: boolean
  acceptedAt?: string
  acceptedBy?: string
  queryCount: number
}
