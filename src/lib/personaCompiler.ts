import { Claim, ClearanceLevel, PersonaProfile, PersonaRole } from './types'

export const PERSONA_PROFILES: Record<PersonaRole, PersonaProfile> = {
  successor: {
    role: 'successor',
    name: 'Priya Sharma',
    title: 'Senior Backend Engineer (Successor)',
    clearanceLevel: 'team_internal',
    avatar: '👩🏽‍💻',
    email: 'priya.sharma@helios.internal',
  },
  leaver: {
    role: 'leaver',
    name: 'Alex Chen',
    title: 'Staff Platform Engineer (Departing)',
    clearanceLevel: 'team_internal',
    avatar: '👨🏻‍💻',
    email: 'alex.chen@helios.internal',
  },
  lead: {
    role: 'lead',
    name: 'Vikram Malhotra',
    title: 'Engineering Director / Lead',
    clearanceLevel: 'confidential_lead',
    avatar: '👨🏽‍💼',
    email: 'vikram.malhotra@helios.internal',
  },
}

const CLEARANCE_HIERARCHY: Record<ClearanceLevel, number> = {
  public_open: 1,
  team_internal: 2,
  confidential_lead: 3,
  restricted_hr_legal: 4,
}

export function hasClearance(
  userClearance: ClearanceLevel,
  requiredClearance: ClearanceLevel
): boolean {
  return CLEARANCE_HIERARCHY[userClearance] >= CLEARANCE_HIERARCHY[requiredClearance]
}

export interface CompilationResult {
  visibleClaims: Claim[]
  withheldCount: number
  withheldClaims: {
    claimId: string
    statement: string
    requiredClearance: ClearanceLevel
    reason: string
  }[]
}

/**
 * Reader-scoped compilation: Filter claims based on the reader's security clearance.
 * Completely shields confidential sources from unauthorized readers.
 */
export function compileClaimsForPersona(
  claims: Claim[],
  persona: PersonaProfile
): CompilationResult {
  const visibleClaims: Claim[] = []
  const withheldClaims: CompilationResult['withheldClaims'] = []

  for (const claim of claims) {
    // A claim is permitted only if ALL supporting quotes satisfy the user's clearance
    const isAuthorized = claim.sourceQuotes.every((quote) =>
      hasClearance(persona.clearanceLevel, quote.requiredClearanceLevel)
    )

    if (isAuthorized) {
      visibleClaims.push(claim)
    } else {
      const highestClearanceNeeded = claim.sourceQuotes.reduce((acc, q) => {
        return CLEARANCE_HIERARCHY[q.requiredClearanceLevel] > CLEARANCE_HIERARCHY[acc]
          ? q.requiredClearanceLevel
          : acc
      }, 'team_internal' as ClearanceLevel)

      withheldClaims.push({
        claimId: claim.id,
        statement: claim.statement,
        requiredClearance: highestClearanceNeeded,
        reason:
          highestClearanceNeeded === 'restricted_hr_legal'
            ? 'Contains confidential human resources / remuneration records.'
            : 'Contains restricted management strategy or vendor legal terms.',
      })
    }
  }

  return {
    visibleClaims,
    withheldCount: withheldClaims.length,
    withheldClaims,
  }
}
