import type { ClaimStatus } from './types'

export const CLAIM_STATUS_COPY: Record<ClaimStatus, { label: string; description: string }> = {
  quoted_verified: {
    label: 'Quote found',
    description: 'An exact text match appears in the source. Check whether it supports the full claim.',
  },
  quoted_unverified: {
    label: 'Unverified',
    description: 'The wording was not confirmed as an exact source match.',
  },
  inferred_ai: {
    label: 'Inferred',
    description: 'This was synthesized from context and needs human review.',
  },
  conflicting: {
    label: 'Conflict',
    description: 'Sources disagree. Compare them in Risks before relying on this claim.',
  },
  not_found: {
    label: 'Missing',
    description: 'No supporting information was found yet.',
  },
  stated_by_leaver: {
    label: 'Leaver stated',
    description: 'The departing engineer provided this; it has not been independently source-verified.',
  },
  confirmed_by_lead: {
    label: 'Lead confirmed',
    description: 'An engineering lead recorded a human confirmation.',
  },
}
