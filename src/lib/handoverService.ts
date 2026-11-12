import { Prisma } from '@prisma/client'
import { prisma } from './db'
import type { HandoverState, PersonaRole } from './types'
import {
  compileVisibleClaims,
  serializeActivity,
  serializeContradiction,
  serializeDecision,
  serializeImportJob,
  serializeMember,
  serializeOwnership,
  serializeQuery,
  serializeQuestion,
  serializeSectionState,
  serializeSourceMeta,
  serializeUnfinished,
  serializeViewerIdentity,
  serializeWorkUpdate,
} from './serializers'
import { RAW_SOURCES } from '../data/rawSources'
import {
  INITIAL_CLAIMS,
  INITIAL_CONTRADICTIONS,
  INITIAL_DECISIONS,
  INITIAL_OWNERSHIP,
  INITIAL_QUESTIONS,
  INITIAL_UNFINISHED,
} from '../data/seedCase'

/**
 * Handover lifecycle service — Improvement 1 backbone.
 * Template upsert, per-user cloning, state hydration, reset, membership.
 * All writes happen inside transactions; all reads are membership-scoped
 * by the API layer (guards live in authz.ts, called before these functions).
 */

export const TEMPLATE_KEY = 'helios_v1'
const SYSTEM_USER_LOGIN = 'baton_system'
const SECTION_IDS = ['decisions', 'unfinished', 'ownership', 'risks'] as const

type Tx = Prisma.TransactionClient

/** Idempotently ensures the Helios template handover + system user exist. */
export async function ensureTemplate(): Promise<string> {
  const systemUser = await prisma.user.upsert({
    where: { githubLogin: SYSTEM_USER_LOGIN },
    update: {},
    create: { name: 'Baton Template System', githubLogin: SYSTEM_USER_LOGIN },
  })

  let template = await prisma.handover.findFirst({
    where: { isTemplate: true, templateKey: TEMPLATE_KEY },
  })
  if (template) return template.id

  template = await prisma.handover.create({
    data: {
      name: 'Helios Observability Platform — Sample Template',
      description:
        'Synthetic engineering handover case used to provision new workspaces. Not for real data.',
      isTemplate: true,
      templateKey: TEMPLATE_KEY,
      createdById: systemUser.id,
    },
  })
  await seedTemplateContent(template.id)
  return template.id
}

/** Writes the canonical seed content (from src/data) into a handover. */
async function seedTemplateContent(handoverId: string): Promise<void> {
  const sources = Object.values(RAW_SOURCES)
  if (sources.length) {
    await prisma.sourceRecord.createMany({
      data: sources.map((source) => ({
        handoverId,
        legacyId: source.id,
        origin: 'seed',
        sourceType: source.sourceType,
        title: source.title,
        uri: source.uri,
        author: source.author,
        timestamp: source.timestamp,
        requiredClearanceLevel: source.requiredClearanceLevel,
        content: source.content,
      })),
    })
  }
  if (INITIAL_CLAIMS.length) {
    await prisma.claim.createMany({
      data: INITIAL_CLAIMS.map((claim) => ({
        handoverId,
        legacyId: claim.id,
        sectionId: claim.sectionId,
        statement: claim.statement,
        status: claim.status,
        category: claim.category,
        verificationMethod: claim.verificationMethod,
        sourceQuotes: JSON.stringify(claim.sourceQuotes),
        history: claim.history ? JSON.stringify(claim.history) : null,
        origin: 'seed',
      })),
    })
  }
  const payloadRows = [
    { model: 'architecturalDecision', items: INITIAL_DECISIONS },
    { model: 'unfinishedWorkItem', items: INITIAL_UNFINISHED },
    { model: 'ownershipAsset', items: INITIAL_OWNERSHIP },
    { model: 'contradiction', items: INITIAL_CONTRADICTIONS },
    { model: 'leaverInterviewQuestion', items: INITIAL_QUESTIONS },
  ] as const
  for (const { model, items } of payloadRows) {
    if (!items.length) continue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any)[model].createMany({
      data: items.map((item: { id: string }) => ({
        handoverId,
        legacyId: item.id,
        payload: JSON.stringify(item),
      })),
    })
  }
  await prisma.sectionState.createMany({
    data: SECTION_IDS.map((sectionId) => ({
      handoverId,
      sectionId,
      isAccepted: false,
      queryCount: 0,
    })),
  })
}

/**
 * Generic content copy between handovers (template → new clone, template →
 * reset target). Copies sources, claims, payload rows, and section states.
 * Runs inside one transaction; readers use the tx client.
 */
async function copyHandoverContent(fromId: string, toId: string, tx: Tx): Promise<void> {
  const [sources, claims, decisions, unfinished, ownership, contradictions, questions, sections] =
    await Promise.all([
      tx.sourceRecord.findMany({ where: { handoverId: fromId } }),
      tx.claim.findMany({ where: { handoverId: fromId } }),
      tx.architecturalDecision.findMany({ where: { handoverId: fromId } }),
      tx.unfinishedWorkItem.findMany({ where: { handoverId: fromId } }),
      tx.ownershipAsset.findMany({ where: { handoverId: fromId } }),
      tx.contradiction.findMany({ where: { handoverId: fromId } }),
      tx.leaverInterviewQuestion.findMany({ where: { handoverId: fromId } }),
      tx.sectionState.findMany({ where: { handoverId: fromId } }),
    ])

  if (sources.length)
    await tx.sourceRecord.createMany({
      data: sources.map(({ id: _id, createdAt: _c, updatedAt: _u, ...row }) => ({ ...row, handoverId: toId })),
    })
  if (claims.length)
    await tx.claim.createMany({
      data: claims.map(({ id: _id, createdAt: _c, updatedAt: _u, ...row }) => ({ ...row, handoverId: toId })),
    })
  if (decisions.length)
    await tx.architecturalDecision.createMany({
      data: decisions.map(({ id: _id, ...row }) => ({ ...row, handoverId: toId })),
    })
  if (unfinished.length)
    await tx.unfinishedWorkItem.createMany({
      data: unfinished.map(({ id: _id, ...row }) => ({ ...row, handoverId: toId })),
    })
  if (ownership.length)
    await tx.ownershipAsset.createMany({
      data: ownership.map(({ id: _id, ...row }) => ({ ...row, handoverId: toId })),
    })
  if (contradictions.length)
    await tx.contradiction.createMany({
      data: contradictions.map(({ id: _id, ...row }) => ({ ...row, handoverId: toId })),
    })
  if (questions.length)
    await tx.leaverInterviewQuestion.createMany({
      data: questions.map(({ id: _id, ...row }) => ({ ...row, handoverId: toId })),
    })
  if (sections.length)
    await tx.sectionState.createMany({
      data: sections.map(({ id: _id, ...row }) => ({ ...row, handoverId: toId })),
    })
}

export interface CreateHandoverInput {
  userId: string
  name?: string
  fromTemplate: boolean
  role: PersonaRole
}

/** Creates a handover (blank or a private clone of the sample template) + creator membership. */
export async function createHandover(input: CreateHandoverInput) {
  const templateId = input.fromTemplate ? await ensureTemplate() : null

  const handover = await prisma.handover.create({
    data: {
      name:
        input.name?.trim() ||
        (input.fromTemplate ? 'Helios Observability Platform — sample handover' : 'Untitled handover'),
      description: input.fromTemplate
        ? 'Your private workspace cloned from the synthetic Helios sample. Reset any time.'
        : 'A fresh handover. Import a GitHub repository to bring in real pull requests and commits.',
      createdById: input.userId,
    },
  })

  await prisma.$transaction(async (tx) => {
    if (templateId) {
      await copyHandoverContent(templateId, handover.id, tx)
    } else {
      await tx.sectionState.createMany({
        data: SECTION_IDS.map((sectionId) => ({
          handoverId: handover.id,
          sectionId,
          isAccepted: false,
          queryCount: 0,
        })),
      })
    }
  })

  const membership = await prisma.membership.create({
    data: { handoverId: handover.id, userId: input.userId, role: input.role },
  })
  return { handover, membership }
}

/** Lists handovers the user belongs to (newest first). */
export async function listHandoversForUser(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { handover: true },
    orderBy: { createdAt: 'desc' },
  })
  return memberships
    .filter((membership) => !membership.handover.isTemplate)
    .map((membership) => ({
      id: membership.handover.id,
      name: membership.handover.name,
      role: membership.role as PersonaRole,
      isTemplate: membership.handover.isTemplate,
      createdAt: membership.handover.createdAt.toISOString(),
    }))
}

/**
 * Full state hydration for one member. Claims are clearance-filtered on the
 * server (Round 2's personaCompiler, now authoritative). Never called without
 * a prior membership check.
 */
export async function getHandoverState(handoverId: string, userId: string): Promise<HandoverState> {
  const [membership, handover] = await Promise.all([
    prisma.membership.findUniqueOrThrow({
      where: { handoverId_userId: { handoverId, userId } },
      include: { user: true },
    }),
    prisma.handover.findUniqueOrThrow({ where: { id: handoverId } }),
  ])

  const [
    claims,
    decisions,
    unfinished,
    ownership,
    contradictions,
    questions,
    queries,
    sectionStates,
    workUpdates,
    activity,
    sources,
    imports,
    memberships,
  ] = await Promise.all([
    prisma.claim.findMany({ where: { handoverId }, orderBy: { legacyId: 'asc' } }),
    prisma.architecturalDecision.findMany({ where: { handoverId }, orderBy: { legacyId: 'asc' } }),
    prisma.unfinishedWorkItem.findMany({ where: { handoverId }, orderBy: { legacyId: 'asc' } }),
    prisma.ownershipAsset.findMany({ where: { handoverId }, orderBy: { legacyId: 'asc' } }),
    prisma.contradiction.findMany({ where: { handoverId }, orderBy: { legacyId: 'asc' } }),
    prisma.leaverInterviewQuestion.findMany({ where: { handoverId }, orderBy: { legacyId: 'asc' } }),
    prisma.successorQuery.findMany({ where: { handoverId }, orderBy: { legacyId: 'desc' } }),
    prisma.sectionState.findMany({ where: { handoverId } }),
    prisma.workUpdate.findMany({
      where: { handoverId },
      include: { author: true, linkedSource: true },
      orderBy: { capturedAt: 'desc' },
      take: 200,
    }),
    prisma.activityLog.findMany({
      where: { handoverId },
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.sourceRecord.findMany({ where: { handoverId }, orderBy: { createdAt: 'asc' } }),
    prisma.importJob.findMany({
      where: { handoverId },
      include: { startedBy: true },
      orderBy: { startedAt: 'desc' },
      take: 10,
    }),
    prisma.membership.findMany({
      where: { handoverId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const identity = serializeViewerIdentity(membership.user, membership.role)
  const { visibleClaims, withheldDetails, withheldCount } = compileVisibleClaims(
    claims,
    identity.clearanceLevel
  )

  return {
    handover: {
      id: handover.id,
      name: handover.name,
      description: handover.description,
      isTemplate: handover.isTemplate,
      createdAt: handover.createdAt.toISOString(),
      isCreator: handover.createdById === userId,
    },
    me: identity,
    members: memberships.map(serializeMember),
    visibleClaims,
    withheldCount,
    withheldDetails,
    decisions: decisions.map(serializeDecision),
    unfinished: unfinished.map(serializeUnfinished),
    ownership: ownership.map(serializeOwnership),
    contradictions: contradictions.map(serializeContradiction),
    questions: questions.map(serializeQuestion),
    queries: queries.map(serializeQuery),
    sectionStates: Object.fromEntries(
      sectionStates.map((row) => [row.sectionId, serializeSectionState(row)])
    ),
    workUpdates: workUpdates.map(serializeWorkUpdate),
    activity: activity.map(serializeActivity),
    sources: sources.map(serializeSourceMeta),
    imports: imports.map(serializeImportJob),
  }
}

/**
 * Reset: wipes every mutable row (including imports and history — a clean
 * slate demo, as the confirmation modal states) and re-copies template
 * content. Memberships are preserved. Caller verifies the requester created
 * this handover.
 */
export async function resetHandoverToTemplate(handoverId: string): Promise<void> {
  const templateId = await ensureTemplate()
  await prisma.$transaction(async (tx) => {
    await tx.workUpdate.deleteMany({ where: { handoverId } })
    await tx.activityLog.deleteMany({ where: { handoverId } })
    await tx.importJob.deleteMany({ where: { handoverId } })
    await tx.successorQuery.deleteMany({ where: { handoverId } })
    await tx.leaverInterviewQuestion.deleteMany({ where: { handoverId } })
    await tx.contradiction.deleteMany({ where: { handoverId } })
    await tx.ownershipAsset.deleteMany({ where: { handoverId } })
    await tx.unfinishedWorkItem.deleteMany({ where: { handoverId } })
    await tx.architecturalDecision.deleteMany({ where: { handoverId } })
    await tx.claim.deleteMany({ where: { handoverId } })
    await tx.sectionState.deleteMany({ where: { handoverId } })
    await tx.sourceRecord.deleteMany({ where: { handoverId } })
    await copyHandoverContent(templateId, handoverId, tx)
  })
}

/** Invites an existing Baton user (resolved by GitHub username) to a handover. */
export async function inviteMemberByLogin(params: {
  handoverId: string
  githubLogin: string
  role: PersonaRole
  invitedByMembershipId: string
}) {
  const login = params.githubLogin.trim().replace(/^@/, '').toLowerCase()
  const user = await prisma.user.findUnique({ where: { githubLogin: login } })
  if (!user) {
    return {
      ok: false as const,
      code: 'USER_NOT_FOUND',
      message:
        'No Baton account with that GitHub username yet. Ask them to sign in to Baton once, then invite them.',
    }
  }
  const existing = await prisma.membership.findUnique({
    where: { handoverId_userId: { handoverId: params.handoverId, userId: user.id } },
  })
  if (existing) {
    return {
      ok: false as const,
      code: 'ALREADY_MEMBER',
      message: 'That person is already a member of this handover.',
    }
  }
  const membership = await prisma.membership.create({
    data: {
      handoverId: params.handoverId,
      userId: user.id,
      role: params.role,
      invitedBy: params.invitedByMembershipId,
    },
  })
  return { ok: true as const, membership, user }
}

/** Records an activity entry (Improvement 3 shared trail). Actions enumerated in lib/activity.ts. */
export async function logActivity(params: {
  handoverId: string
  actorId: string
  action: string
  detail?: Record<string, unknown>
}) {
  await prisma.activityLog.create({
    data: {
      handoverId: params.handoverId,
      actorId: params.actorId,
      action: params.action,
      detail: params.detail ? JSON.stringify(params.detail) : null,
    },
  })
}
