import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'
import type { PersonaRole } from '@/lib/types'

const ROLES: PersonaRole[] = ['lead', 'successor', 'leaver']

/** Change a member's role. Lead only; the lead cannot demote themself. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await requireSession()
    const { membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['lead'])

    const body: unknown = await req.json().catch(() => null)
    const { role } = (body ?? {}) as Record<string, unknown>
    if (!ROLES.includes(role as PersonaRole)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'role must be lead, successor or leaver.' } },
        { status: 400 }
      )
    }
    if (params.userId === session.userId && role !== 'lead') {
      return NextResponse.json(
        {
          error: {
            code: 'LAST_LEAD',
            message: 'You cannot demote yourself while you are the only lead. Invite another lead first.',
          },
        },
        { status: 409 }
      )
    }

    const target = await prisma.membership.findUnique({
      where: { handoverId_userId: { handoverId: params.id, userId: params.userId } },
    })
    if (!target) {
      return NextResponse.json(
        { error: { code: 'MEMBER_NOT_FOUND', message: 'That member was not found on this handover.' } },
        { status: 404 }
      )
    }
    await prisma.membership.update({
      where: { handoverId_userId: { handoverId: params.id, userId: params.userId } },
      data: { role: role as PersonaRole },
    })
    await logActivity({
      handoverId: params.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.memberRoleChanged,
      detail: { userId: params.userId, newRole: role },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return authzErrorResponse(error)
  }
}

/** Remove a member. Lead only; the lead cannot remove themself. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await requireSession()
    const { membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['lead'])

    if (params.userId === session.userId) {
      return NextResponse.json(
        {
          error: {
            code: 'CANNOT_REMOVE_SELF',
            message: 'You cannot remove yourself. Another lead can remove you if needed.',
          },
        },
        { status: 409 }
      )
    }
    const target = await prisma.membership.findUnique({
      where: { handoverId_userId: { handoverId: params.id, userId: params.userId } },
    })
    if (!target) {
      return NextResponse.json(
        { error: { code: 'MEMBER_NOT_FOUND', message: 'That member was not found on this handover.' } },
        { status: 404 }
      )
    }
    await prisma.membership.delete({
      where: { handoverId_userId: { handoverId: params.id, userId: params.userId } },
    })
    await logActivity({
      handoverId: params.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.memberRemoved,
      detail: { userId: params.userId },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return authzErrorResponse(error)
  }
}
