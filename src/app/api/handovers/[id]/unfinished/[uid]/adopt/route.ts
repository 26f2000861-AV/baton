import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { getHandoverState, logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'
import type { UnfinishedWorkItem } from '@/lib/types'

/**
 * Adopt an unfinished work item (lead or successor). Round 2 toggle semantics
 * preserved: ready_to_merge ⇄ adopted; anything else becomes ready_to_merge.
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string; uid: string } }
) {
  try {
    const session = await requireSession()
    const { handover, membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['lead', 'successor'])

    const row = await prisma.unfinishedWorkItem.findUnique({
      where: { handoverId_legacyId: { handoverId: handover.id, legacyId: params.uid } },
    })
    if (!row) {
      return NextResponse.json(
        { error: { code: 'ITEM_NOT_FOUND', message: 'That work item was not found.' } },
        { status: 404 }
      )
    }

    const item = JSON.parse(row.payload) as UnfinishedWorkItem
    item.status = item.status === 'ready_to_merge' ? 'adopted' : 'ready_to_merge'
    await prisma.unfinishedWorkItem.update({
      where: { id: row.id },
      data: { payload: JSON.stringify(item) },
    })

    await logActivity({
      handoverId: handover.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.itemAdopted,
      detail: { itemId: params.uid, newStatus: item.status },
    })
    return NextResponse.json(await getHandoverState(handover.id, session.userId))
  } catch (error) {
    return authzErrorResponse(error)
  }
}
