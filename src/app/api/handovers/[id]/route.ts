import { NextResponse } from 'next/server'
import { authzErrorResponse, requireMembership, requireSession } from '@/lib/authz'
import { getHandoverState } from '@/lib/handoverService'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const { handover } = await requireMembership(params.id, session.userId)
    const state = await getHandoverState(handover.id, session.userId)
    return NextResponse.json(state)
  } catch (error) {
    return authzErrorResponse(error)
  }
}
