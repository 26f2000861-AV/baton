import type { ClearanceLevel, PersonaRole } from './types'

/**
 * Pure authorization rules — no I/O, no session, no database.
 * Extracted from authz.ts so they are unit-testable (tests/authz.test.mts)
 * and reusable by the route guard layer. The async guards that need the
 * session and database live in authz.ts and call into these decisions.
 */

export type Role = PersonaRole // 'lead' | 'successor' | 'leaver'

export class AuthzError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

/** Throws 403 unless the member holds one of the allowed roles. */
export function requireRole(
  membership: { role: string },
  roles: Role[]
): void {
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

/** CUID-shaped ids only; rejects legacy/seed ids and junk early. */
export function isHandoverId(id: string): boolean {
  return /^c[a-z0-9]{20,}$/i.test(id)
}

/**
 * Governance decision (deadlock escape hatch): the lead role governs a
 * handover. When the handover has NO lead at all, its creator may exercise
 * governance so a handover can never end up ungovernable.
 */
export function canFounderGovern(
  handover: { createdById: string },
  membership: { userId: string; role: string },
  handoverHasLead: boolean
): boolean {
  if (membership.role === 'lead') return true
  return !handoverHasLead && handover.createdById === membership.userId
}

/**
 * Governance protection (Remediation for SEC-06):
 * The creator of a handover cannot be removed or demoted by other leads.
 */
export function canMutateMember(
  handover: { createdById: string },
  actorUserId: string,
  targetUserId: string,
  action: 'modify_role' | 'remove'
): { allowed: boolean; code?: string; message?: string } {
  if (action === 'remove' && targetUserId === handover.createdById) {
    return {
      allowed: false,
      code: 'FORBIDDEN_CREATOR_REMOVAL',
      message: 'The creator of this handover cannot be removed from their own handover.',
    }
  }

  if (action === 'modify_role' && targetUserId === handover.createdById && actorUserId !== handover.createdById) {
    return {
      allowed: false,
      code: 'FORBIDDEN_CREATOR_MODIFICATION',
      message: 'The creator of this handover cannot be demoted or modified by other members.',
    }
  }

  return { allowed: true }
}
