import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { getHandoverState, logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'
import type { SuccessorQuery } from '@/lib/types'

/** Lead or leaver resolves a successor question. */
export async function POST(
  req: Request,
  { params }: { params: { id: string; qid: string } }
) {
  try {
    const session = await requireSession()
    const { handover, membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['lead', 'leaver'])

    const body: unknown = await req.json().catch(() => null)
    const { responseText } = (body ?? {}) as Record<string, unknown>
    const response = typeof responseText === 'string' ? responseText.trim() : ''
    if (!response || response.length > 8000) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Provide a non-empty reply (max 8000 characters).' } },
        { status: 400 }
      )
    }

    const row = await prisma.successorQuery.findUnique({
      where: { handoverId_legacyId: { handoverId: handover.id, legacyId: params.qid } },
    })
    if (!row) {
      return NextResponse.json(
        { error: { code: 'QUERY_NOT_FOUND', message: 'That question was not found.' } },
        { status: 404 }
      )
    }

    const query = JSON.parse(row.payload) as SuccessorQuery
    if (query.status === 'resolved') {
      return NextResponse.json(
        { error: { code: 'ALREADY_RESOLVED', message: 'That question is already resolved.' } },
        { status: 409 }
      )
    }

    query.status = 'resolved'
    query.resolution = {
      answeredBy: session.name ?? session.githubLogin ?? 'Lead',
      responseSnippet: response,
      timestamp: new Date().toISOString(),
    }
    await prisma.successorQuery.update({
      where: { id: row.id },
      data: { payload: JSON.stringify(query) },
    })

    await logActivity({
      handoverId: handover.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.queryResolved,
      detail: { queryId: params.qid },
    })
    return NextResponse.json(await getHandoverState(handover.id, session.userId))
  } catch (error) {
    return authzErrorResponse(error)
  }
}
