import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { getHandoverState, logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'

const SECTION_IDS = ['decisions', 'unfinished', 'ownership', 'risks'] as const
type SectionId = (typeof SECTION_IDS)[number]

/**
 * Successor accepts (signs off) a handover section — I-PASS inspired,
 * section by section (Improvement 1: successor-only, enforced server-side).
 */
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

    await prisma.sectionState.upsert({
      where: { handoverId_sectionId: { handoverId: handover.id, sectionId: params.sid } },
      update: {
        isAccepted: true,
        acceptedAt: new Date().toISOString(),
        acceptedBy: session.name ?? session.githubLogin ?? 'Successor',
      },
      create: {
        handoverId: handover.id,
        sectionId: params.sid,
        isAccepted: true,
        acceptedAt: new Date().toISOString(),
        acceptedBy: session.name ?? session.githubLogin ?? 'Successor',
        queryCount: 0,
      },
    })

    await logActivity({
      handoverId: handover.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.sectionAccepted,
      detail: { sectionId: params.sid },
    })
    return NextResponse.json(await getHandoverState(handover.id, session.userId))
  } catch (error) {
    return authzErrorResponse(error)
  }
}
