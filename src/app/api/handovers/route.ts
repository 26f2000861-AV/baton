import { NextResponse } from 'next/server'
import { authzErrorResponse, requireSession } from '@/lib/authz'
import { createHandover, listHandoversForUser, logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import type { PersonaRole } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireSession()
    return NextResponse.json({ handovers: await listHandoversForUser(session.userId) })
  } catch (error) {
    return authzErrorResponse(error)
  }
}

const ROLES: PersonaRole[] = ['lead', 'successor', 'leaver']

export async function POST(req: Request) {
  try {
    const session = await requireSession()
    const rl = checkRateLimit(`handover-create:${session.userId}`, 10, 60_000)
    if (!rl.success) {
      return rateLimitResponse(rl.retryAfterSeconds, 10, rl.reset)
    }

    const body: unknown = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Expected a JSON object.' } },
        { status: 400 }
      )
    }
    const { fromTemplate, role, name } = body as Record<string, unknown>
    if (typeof fromTemplate !== 'boolean' || !ROLES.includes(role as PersonaRole)) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'Provide fromTemplate (boolean) and role (lead, successor or leaver).',
          },
        },
        { status: 400 }
      )
    }
    if (name !== undefined && (typeof name !== 'string' || name.length > 120)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Name must be a string of at most 120 characters.' } },
        { status: 400 }
      )
    }

    const { handover, membership } = await createHandover({
      userId: session.userId,
      fromTemplate,
      role: role as PersonaRole,
      name: typeof name === 'string' ? name : undefined,
    })
    await logActivity({
      handoverId: handover.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.handoverCreated,
      detail: { handoverName: handover.name, role: role as PersonaRole, fromTemplate },
    })
    return NextResponse.json(
      { handover: { id: handover.id, name: handover.name }, membershipId: membership.id },
      { status: 201 }
    )
  } catch (error) {
    return authzErrorResponse(error)
  }
}
