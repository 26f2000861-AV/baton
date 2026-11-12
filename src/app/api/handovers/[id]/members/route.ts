import { NextResponse } from 'next/server'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { inviteMemberByLogin, logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'
import type { PersonaRole } from '@/lib/types'

const ROLES: PersonaRole[] = ['lead', 'successor', 'leaver']

/**
 * Invite an existing Baton user to this handover by GitHub username.
 * Lead only. The invited user must have signed in to Baton at least once
 * (the app does not search GitHub user accounts — honest limitation, stated
 * in the UI).
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const { membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['lead'])

    const body: unknown = await req.json().catch(() => null)
    const { githubLogin, role } = (body ?? {}) as Record<string, unknown>
    if (
      typeof githubLogin !== 'string' ||
      githubLogin.trim().length === 0 ||
      githubLogin.length > 100 ||
      !ROLES.includes(role as PersonaRole)
    ) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'Provide githubLogin (string) and role (lead, successor or leaver).',
          },
        },
        { status: 400 }
      )
    }

    const result = await inviteMemberByLogin({
      handoverId: params.id,
      githubLogin,
      role: role as PersonaRole,
      invitedByMembershipId: membership.id,
    })
    if (!result.ok) {
      return NextResponse.json(
        { error: { code: result.code, message: result.message } },
        { status: result.code === 'USER_NOT_FOUND' ? 404 : 409 }
      )
    }
    await logActivity({
      handoverId: params.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.memberInvited,
      detail: { githubLogin: result.user.githubLogin, role },
    })
    return NextResponse.json(
      {
        member: {
          userId: result.user.id,
          name: result.user.name,
          githubLogin: result.user.githubLogin,
          image: result.user.image,
          role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return authzErrorResponse(error)
  }
}
