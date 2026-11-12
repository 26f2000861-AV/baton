import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { getHandoverState, logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'

const SECTION_IDS = ['decisions', 'unfinished', 'ownership', 'risks'] as const
type SectionId = (typeof SECTION_IDS)[number]

/** Successor undoes a section sign-off. */
export async function POST(
  _req: Request,
  { params }: { params: { id: string; sid: string } }
) {
  try {
    const session = await requireSession()
    const { handover, membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['successor'])

    if (!SECTION_IDS.includes(params.sid as SectionId)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Unknown section.' } },
        { status: 400 }
      )
    }

    await prisma.sectionState.updateMany({
      where: { handoverId: handover.id, sectionId: params.sid },
      data: { isAccepted: false, acceptedAt: null, acceptedBy: null },
    })

    await logActivity({
      handoverId: handover.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.sectionUndone,
      detail: { sectionId: params.sid },
    })
    return NextResponse.json(await getHandoverState(handover.id, session.userId))
  } catch (error) {
    return authzErrorResponse(error)
  }
}
