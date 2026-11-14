import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import type { Membership, Handover } from '@prisma/client'
import { authOptions } from './auth'
import { prisma } from './db'
import type { ClearanceLevel } from './types'
import {
  AuthzError,
  canFounderGovern,
  clearanceForRole,
  isHandoverId,
  requireRole,
  type Role,
} from './authzRules'

/**
 * Server-side authorization for Baton — Improvement 1.
 * THE CLIENT IS UNTRUSTED. Every route handler must pass through these guards
 * in order: requireSession → requireMembership → requireRole (or
 * requireGovernance), before any DB read or write. Client-side role gating is
 * a UX affordance only.
 *
 * Non-members receive 404 (not 403) so handover ids are not enumerable.
 *
 * The pure decision rules (roles, clearance, id shape, founder governance)
 * live in authzRules.ts and are unit-tested in tests/authz.test.mts.
 */

export { AuthzError, canFounderGovern, clearanceForRole, isHandoverId, requireRole }
export type { Role }

export interface SessionUser {
  userId: string
  githubLogin: string | null
  name: string | null
  image: string | null
}

/** Returns the signed-in user or throws 401. */
export async function requireSession(): Promise<SessionUser> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new AuthzError(401, 'UNAUTHENTICATED', 'Sign in to continue.')
  }
  return {
    userId: session.user.id,
    githubLogin: session.user.githubLogin ?? null,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  }
}

/** Loads the handover + the caller's membership or throws 404 (never 403). */
export async function requireMembership(
  handoverId: string,
  userId: string
): Promise<{ handover: Handover; membership: Membership }> {
  const membership = await prisma.membership.findUnique({
    where: { handoverId_userId: { handoverId, userId } },
    include: { handover: true },
  })
  if (!membership || !isHandoverId(handoverId)) {
    // Also verify the handover actually exists — membership presence implies it,
    // but a forged membership row is impossible via the API; keep the check cheap.
    throw new AuthzError(404, 'HANDOVER_NOT_FOUND', 'Handover not found.')
  }
  return { handover: membership.handover, membership }
}

/**
 * Governance gate: the lead role governs invites, role changes and
 * settlements. One escape hatch exists so a handover can never deadlock:
 * when the handover has NO lead at all, the member who created it may
 * exercise governance (in practice: invite members, or claim the lead seat).
 */
export async function requireGovernance(
  handover: Handover,
  membership: Membership
): Promise<void> {
  const hasLead = await prisma.membership.findFirst({
    where: { handoverId: handover.id, role: 'lead' },
    select: { id: true },
  })
  if (!canFounderGovern(handover, membership, Boolean(hasLead))) {
    throw new AuthzError(
      403,
      'FORBIDDEN_ROLE',
      'This action requires the lead role on this handover.'
    )
  }
}

/** Maps any thrown AuthzError to a clean JSON response. Used by every route. */
export function authzErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthzError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    )
  }
  // Allow Next.js internal control-flow exceptions (e.g. dynamic bail-out during static prerendering) to bubble up
  if (
    error &&
    typeof error === 'object' &&
    'digest' in error &&
    (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE'
  ) {
    throw error
  }
  console.error('[api] unexpected error', error)
  return NextResponse.json(
    { error: { code: 'INTERNAL', message: 'Something went wrong. Please try again.' } },
    { status: 500 }
  )
}
