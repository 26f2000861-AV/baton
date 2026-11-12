import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { getHandoverState, logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'
import type { ContradictionItem } from '@/lib/types'

const RESOLUTION_TYPES = ['accept_source_a', 'accept_source_b', 'accept_dual_scope', 'clarification_note'] as const
type ResolutionType = (typeof RESOLUTION_TYPES)[number]

/**
 * Lead settles a contradiction (Improvement 1: lead-only, enforced server-side).
 * Round 2 semantics preserved: settlement recorded on the contradiction, the
 * associated claim status updated (confirmed_by_lead / conflicting), history
 * appended. Actor = the REAL signed-in lead.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string; cid: string } }
) {
  try {
    const session = await requireSession()
    const { handover, membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['lead'])

    const body: unknown = await req.json().catch(() => null)
    const { resolutionType, humanComment } = (body ?? {}) as Record<string, unknown>
    const comment = typeof humanComment === 'string' ? humanComment.trim() : ''
    if (!RESOLUTION_TYPES.includes(resolutionType as ResolutionType) || !comment || comment.length > 8000) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message:
              'Provide resolutionType (accept_source_a, accept_source_b, accept_dual_scope or clarification_note) and a non-empty decision note (max 8000 characters).',
          },
        },
        { status: 400 }
      )
    }

    const row = await prisma.contradiction.findUnique({
      where: { handoverId_legacyId: { handoverId: handover.id, legacyId: params.cid } },
    })
    if (!row) {
      return NextResponse.json(
        { error: { code: 'CONTRADICTION_NOT_FOUND', message: 'That contradiction was not found.' } },
        { status: 404 }
      )
    }

    const item = JSON.parse(row.payload) as ContradictionItem
    const actorName = session.name ?? session.githubLogin ?? 'Lead'
    const now = new Date().toISOString()
    const resolution = resolutionType as ResolutionType

    item.status = resolution === 'clarification_note' ? 'open_unresolved' : 'settled_by_human'
    item.settlement = {
      resolvedBy: actorName,
      resolutionTimestamp: now,
      resolutionType: resolution,
      humanComment: comment,
    }
    await prisma.contradiction.update({
      where: { id: row.id },
      data: { payload: JSON.stringify(item) },
    })

    if (item.associatedClaimId) {
      const settledSource =
        resolution === 'accept_source_b'
          ? 'Accepted Source B: Thanos still serves dashboard reads; VM ingest remains dual-write.'
          : resolution === 'accept_source_a'
            ? 'Accepted Source A: the VictoriaMetrics dual-write is fully live for dashboards.'
            : resolution === 'accept_dual_scope'
              ? 'Resolved scope: VM stays dual-write for ingest; Thanos keeps serving dashboard reads until the cutover completes.'
              : 'Lead clarification recorded; source precedence remains explicitly unresolved.'
      const claimRow = await prisma.claim.findUnique({
        where: { handoverId_legacyId: { handoverId: handover.id, legacyId: item.associatedClaimId } },
      })
      if (claimRow) {
        const history = claimRow.history ? JSON.parse(claimRow.history) : []
        await prisma.claim.update({
          where: { id: claimRow.id },
          data: {
            status: resolution === 'clarification_note' ? 'conflicting' : 'confirmed_by_lead',
            verificationMethod: 'human_attested',
            history: JSON.stringify([
              ...history,
              { action: `${settledSource} Note: ${comment}`, actor: actorName, timestamp: now },
            ]),
          },
        })
      }
    }

    await logActivity({
      handoverId: handover.id,
      actorId: session.userId,
      action:
        resolution === 'clarification_note'
          ? ACTIVITY_ACTIONS.contradictionClarified
          : ACTIVITY_ACTIONS.contradictionSettled,
      detail: { contradictionId: params.cid, resolutionType: resolution, claimId: item.associatedClaimId },
    })
    return NextResponse.json(await getHandoverState(handover.id, session.userId))
  } catch (error) {
    return authzErrorResponse(error)
  }
}
