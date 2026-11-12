import { NextResponse } from 'next/server'
import { authzErrorResponse, requireMembership, requireSession } from '@/lib/authz'
import { resetHandoverToTemplate, logActivity, getHandoverState } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'

/**
 * Reset a handover to the sample baseline. Creator only. Wipes all mutable
 * rows including imports and shared history (stated in the confirmation modal),
 * then re-copies template content. Memberships are preserved.
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const { handover } = await requireMembership(params.id, session.userId)
    if (handover.createdById !== session.userId) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN_CREATOR',
            message: 'Only the person who created this handover can reset it.',
          },
        },
        { status: 403 }
      )
    }
    await resetHandoverToTemplate(handover.id)
    await logActivity({
      handoverId: handover.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.handoverReset,
    })
    return NextResponse.json(await getHandoverState(handover.id, session.userId))
  } catch (error) {
    return authzErrorResponse(error)
  }
}
