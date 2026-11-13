import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import type { Membership, Handover } from '@prisma/client'
import { authOptions } from './auth'
import { prisma } from './db'
import type { ClearanceLevel, PersonaRole } from './types'

/**
 * Server-side authorization for Baton — Improvement 1.
 * THE CLIENT IS UNTRUSTED. Every route handler must pass through these guards
 * in order: requireSession → requireMembership → requireRole, before any DB
 * read or write. Client-side role gating is a UX affordance only.
 *
 * Non-members receive 404 (not 403) so handover ids are not enumerable.
 */

export type Role = PersonaRole // 'lead' | 'successor' | 'leaver'

export interface SessionUser {
  userId: string
  githubLogin: string | null
  name: string | null
  image: string | null
}

export class AuthzError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
  }
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

/** Throws 403 unless the member holds one of the allowed roles. */
export function requireRole(membership: Membership, roles: Role[]): void {
  if (!roles.includes(membership.role as Role)) {
    throw new AuthzError(
      403,
      'FORBIDDEN_ROLE',
      `This action requires the ${roles.join(' or ')} role on this handover.`
    )
  }
}

/** Maps a membership role to its clearance — mirrors the Round 2 persona model. */
export function clearanceForRole(role: string): ClearanceLevel {
  if (role === 'lead') return 'confidential_lead'
  return 'team_internal' // successor + leaver
}

function isHandoverId(id: string): boolean {
  // CUID-shaped ids only; rejects legacy/seed ids and junk early.
  return /^c[a-z0-9]{20,}$/i.test(id)
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
