import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { getHandoverState, logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'
import type { PersonaRole, SuccessorQuery } from '@/lib/types'

const CATEGORIES = ['missing_credential', 'unclear_rationale', 'broken_runbook', 'reproduction_failure'] as const

/**
 * Successor submits a claim-linked question (Improvement 1: successor-only).
 * The respondent is resolved to a real lead member of this handover when one
 * exists (replacing Round 2's hardcoded persona).
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const { handover, membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['successor'])

    const body: unknown = await req.json().catch(() => null)
    const { claimId, category, queryText } = (body ?? {}) as Record<string, unknown>
    const text = typeof queryText === 'string' ? queryText.trim() : ''
    if (
      typeof claimId !== 'string' ||
      !claimId ||
      !CATEGORIES.includes(category as (typeof CATEGORIES)[number]) ||
      !text ||
      text.length > 4000
    ) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'Provide claimId, a known category and a non-empty question (max 4000 characters).',
          },
        },
        { status: 400 }
      )
    }

    const claimRow = await prisma.claim.findUnique({
      where: { handoverId_legacyId: { handoverId: handover.id, legacyId: claimId } },
    })
    if (!claimRow) {
      return NextResponse.json(
        { error: { code: 'CLAIM_NOT_FOUND', message: 'That claim was not found in this handover.' } },
        { status: 404 }
      )
    }

    // Route the question to a real lead on this handover when possible.
    const leadMembership = await prisma.membership.findFirst({
      where: { handoverId: handover.id, role: 'lead' },
      include: { user: true },
    })
    const respondentName = leadMembership?.user.name ?? 'Handover lead'
    const respondentHandle = leadMembership?.user.githubLogin
      ? `@${leadMembership.user.githubLogin}`
      : 'this handover\'s lead'

    const query: SuccessorQuery = {
      id: `query_${crypto.randomUUID()}`,
      claimId,
      successorId: session.userId,
      successorName: `${session.name ?? session.githubLogin ?? 'Successor'} (Successor)`,
      timestamp: new Date().toISOString(),
      queryCategory: category as SuccessorQuery['queryCategory'],
      queryText: text,
      status: 'open_pending_reply',
      assignedRespondent: {
        name: respondentName,
        role: 'engineering_lead',
        slackHandle: respondentHandle,
      },
    }
    await prisma.successorQuery.create({
      data: {
        handoverId: handover.id,
        legacyId: query.id,
        payload: JSON.stringify(query),
      },
    })

    await prisma.sectionState.updateMany({
      where: { handoverId: handover.id, sectionId: claimRow.sectionId },
      data: { queryCount: { increment: 1 } },
    })

    await logActivity({
      handoverId: handover.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.querySubmitted,
      detail: { claimId, category },
    })
    return NextResponse.json(await getHandoverState(handover.id, session.userId))
  } catch (error) {
    return authzErrorResponse(error)
  }
}
