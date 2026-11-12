import type {
  Claim as ClaimRow,
  ArchitecturalDecision as DecisionRow,
  UnfinishedWorkItem as UnfinishedRow,
  OwnershipAsset as OwnershipRow,
  Contradiction as ContradictionRow,
  LeaverInterviewQuestion as QuestionRow,
  SuccessorQuery as QueryRow,
  SectionState as SectionStateRow,
  SourceRecord as SourceRow,
  WorkUpdate as WorkUpdateRow,
  ActivityLog as ActivityRow,
  ImportJob as ImportJobRow,
  Membership as MembershipRow,
  User as UserRow,
} from '@prisma/client'
import type {
  ArchitecturalDecision,
  ActivityEntry,
  Claim,
  ContradictionItem,
  HandoverSectionState,
  ImportJobDTO,
  LeaverInterviewQuestion,
  OwnershipAsset,
  SourceMeta,
  SourceSpan,
  SuccessorQuery,
  UnfinishedWorkItem,
  ViewerIdentity,
  WorkUpdate,
  WorkUpdateVerification,
} from './types'
import { clearanceForRole } from './authz'
import type { PersonaRole } from './types'

/**
 * Prisma row → DTO serialization — the ONLY place rows are converted.
 * Payload columns are JSON strings; parsing is defensive: a malformed cell
 * (hand-edited DB) degrades to a typed fallback instead of crashing the app.
 */

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function serializeClaim(row: ClaimRow): Claim {
  return {
    id: row.legacyId,
    sectionId: row.sectionId as Claim['sectionId'],
    statement: row.statement,
    status: row.status as Claim['status'],
    category: row.category as Claim['category'],
    sourceQuotes: parseJson<SourceSpan[]>(row.sourceQuotes, []),
    verificationMethod: row.verificationMethod as Claim['verificationMethod'],
    history: parseJson<Claim['history']>(row.history, undefined),
  }
}

export function serializeDecision(row: DecisionRow): ArchitecturalDecision {
  return { ...parseJson<ArchitecturalDecision>(row.payload, {} as ArchitecturalDecision), id: row.legacyId }
}

export function serializeUnfinished(row: UnfinishedRow): UnfinishedWorkItem {
  return { ...parseJson<UnfinishedWorkItem>(row.payload, {} as UnfinishedWorkItem), id: row.legacyId }
}

export function serializeOwnership(row: OwnershipRow): OwnershipAsset {
  return { ...parseJson<OwnershipAsset>(row.payload, {} as OwnershipAsset), id: row.legacyId }
}

export function serializeContradiction(row: ContradictionRow): ContradictionItem {
  return { ...parseJson<ContradictionItem>(row.payload, {} as ContradictionItem), id: row.legacyId }
}

export function serializeQuestion(row: QuestionRow): LeaverInterviewQuestion {
  return { ...parseJson<LeaverInterviewQuestion>(row.payload, {} as LeaverInterviewQuestion), id: row.legacyId }
}

export function serializeQuery(row: QueryRow): SuccessorQuery {
  return { ...parseJson<SuccessorQuery>(row.payload, {} as SuccessorQuery), id: row.legacyId }
}

export function serializeSectionState(row: SectionStateRow): HandoverSectionState {
  return {
    sectionId: row.sectionId as HandoverSectionState['sectionId'],
    isAccepted: row.isAccepted,
    acceptedAt: row.acceptedAt ?? undefined,
    acceptedBy: row.acceptedBy ?? undefined,
    queryCount: row.queryCount,
  }
}

export function serializeSourceMeta(row: SourceRow): SourceMeta {
  return {
    legacyId: row.legacyId,
    origin: row.origin as SourceMeta['origin'],
    sourceType: row.sourceType as SourceMeta['sourceType'],
    title: row.title,
    uri: row.uri,
    author: row.author,
    timestamp: row.timestamp,
    requiredClearanceLevel: row.requiredClearanceLevel as SourceMeta['requiredClearanceLevel'],
    contentPreview: row.content.slice(0, 500),
  }
}

export function serializeWorkUpdate(
  row: WorkUpdateRow & { author: UserRow; linkedSource: SourceRow | null }
): WorkUpdate {
  return {
    id: row.id,
    decisionText: row.decisionText,
    rationale: row.rationale,
    nextAction: row.nextAction,
    sourceReference: row.sourceReference,
    capturedAt: row.capturedAt.toISOString(),
    author: {
      userId: row.author.id,
      name: row.author.name ?? row.author.githubLogin ?? 'Former member',
      githubLogin: row.author.githubLogin,
      image: row.author.image,
    },
    linkedSource: row.linkedSource
      ? {
          legacyId: row.linkedSource.legacyId,
          sourceType: row.linkedSource.sourceType as SourceMeta['sourceType'],
          title: row.linkedSource.title,
          uri: row.linkedSource.uri,
        }
      : null,
    verification: parseJson<WorkUpdateVerification | undefined>(row.verification, undefined),
  }
}

export function serializeActivity(row: ActivityRow & { actor: UserRow | null }): ActivityEntry {
  return {
    id: row.id,
    action: row.action,
    actorName: row.actor?.name ?? row.actor?.githubLogin ?? null,
    actorImage: row.actor?.image ?? null,
    detail: parseJson<Record<string, unknown> | null>(row.detail, null),
    createdAt: row.createdAt.toISOString(),
  }
}

export function serializeImportJob(
  row: ImportJobRow & { startedBy?: UserRow | null }
): ImportJobDTO {
  return {
    id: row.id,
    repoOwner: row.repoOwner,
    repoName: row.repoName,
    status: row.status as ImportJobDTO['status'],
    prCount: row.prCount,
    commitCount: row.commitCount,
    claimCount: row.claimCount,
    error: row.error,
    startedByName: row.startedBy?.name ?? row.startedBy?.githubLogin ?? null,
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
  }
}

export function serializeViewerIdentity(
  user: { id: string; name: string | null; image: string | null; githubLogin: string | null },
  membershipRole: string
): ViewerIdentity {
  return {
    userId: user.id,
    name: user.name ?? user.githubLogin ?? 'Member',
    githubLogin: user.githubLogin,
    image: user.image,
    role: membershipRole as PersonaRole,
    clearanceLevel: clearanceForRole(membershipRole),
  }
}

export function serializeMember(row: MembershipRow & { user: UserRow }) {
  return {
    userId: row.user.id,
    name: row.user.name ?? row.user.githubLogin ?? 'Member',
    githubLogin: row.user.githubLogin,
    image: row.user.image,
    role: row.role as PersonaRole,
    createdAt: row.createdAt.toISOString(),
  }
}

/**
 * Server-side reader-scoped compilation — the Round 2 personaCompiler logic,
 * now running on the server against the member's real clearance. Returns
 * visible claims plus the transparency block (what was withheld and why),
 * which every member can see (matching Round 2's access-visibility panel).
 */
export function compileVisibleClaims(claims: ClaimRow[], clearance: string) {
  const hierarchy: Record<string, number> = {
    public_open: 1,
    team_internal: 2,
    confidential_lead: 3,
    restricted_hr_legal: 4,
  }
  const visible: Claim[] = []
  const withheld: {
    claimId: string
    statement: string
    requiredClearance: string
    reason: string
  }[] = []

  for (const row of claims) {
    const spans = parseJson<SourceSpan[]>(row.sourceQuotes, [])
    const isAuthorized = spans.every(
      (span) =>
        (hierarchy[clearance] ?? 0) >=
        (hierarchy[span.requiredClearanceLevel] ?? 0)
    )
    if (isAuthorized) {
      visible.push(serializeClaim(row))
    } else {
      const highest = spans.reduce(
        (acc, span) =>
          (hierarchy[span.requiredClearanceLevel] ?? 0) > (hierarchy[acc] ?? 0)
            ? span.requiredClearanceLevel
            : acc,
        'team_internal' as string
      )
      withheld.push({
        claimId: row.legacyId,
        statement: row.statement,
        requiredClearance: highest,
        reason:
          highest === 'restricted_hr_legal'
            ? 'Contains confidential human resources / remuneration records.'
            : 'Contains restricted management strategy or vendor legal terms.',
      })
    }
  }
  return { visibleClaims: visible, withheldDetails: withheld, withheldCount: withheld.length }
}
