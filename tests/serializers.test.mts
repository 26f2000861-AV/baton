import test from 'node:test'
import assert from 'node:assert/strict'
import {
  serializeClaim,
  serializeSectionState,
  serializeViewerIdentity,
  serializeActivity,
  compileVisibleClaims,
} from '../src/lib/serializers.ts'

/**
 * Unit tests for the serialization boundary — the only place Prisma rows are
 * converted to DTOs. Two behaviors matter for the audit story:
 *   1. Defensive parsing: a malformed (hand-edited DB) JSON cell degrades to
 *      a typed fallback instead of crashing the app.
 *   2. compileVisibleClaims: reader-scoped privacy — a member only sees
 *      claims whose every source span fits their clearance level, and the
 *      withheld block explains what was hidden and why.
 */

function fakeSpan(requiredClearanceLevel: string) {
  return {
    sourceId: 'src_pr_12',
    sourceType: 'github_pr',
    title: 'Harden retry budget',
    uri: 'https://github.com/helios/payments/pull/12',
    author: 'alex.chen',
    timestamp: '2026-09-02T10:00:00.000Z',
    requiredClearanceLevel,
    exactSnippet: 'We cap retries at 3 with jitter.',
  }
}

function fakeClaimRow(overrides: Record<string, unknown> = {}) {
  return {
    legacyId: 'claim_03',
    sectionId: 'decisions',
    statement: 'Retries are capped at 3 with jitter.',
    status: 'quoted_verified',
    category: 'decision',
    sourceQuotes: JSON.stringify([fakeSpan('public_open')]),
    verificationMethod: 'exact_match',
    history: null,
    ...overrides,
  }
}

test('serializeClaim parses sourceQuotes JSON into source spans', () => {
  const claim = serializeClaim(fakeClaimRow())
  assert.equal(claim.id, 'claim_03')
  assert.equal(claim.statement, 'Retries are capped at 3 with jitter.')
  assert.equal(claim.sourceQuotes.length, 1)
  assert.equal(claim.sourceQuotes[0].requiredClearanceLevel, 'public_open')
})

test('serializeClaim degrades malformed sourceQuotes JSON to an empty list', () => {
  const claim = serializeClaim(fakeClaimRow({ sourceQuotes: '{not json' }))
  assert.deepEqual(claim.sourceQuotes, [])
})

test('serializeClaim degrades null history to undefined', () => {
  const claim = serializeClaim(fakeClaimRow({ history: '{"nonsense"' }))
  assert.equal(claim.history, undefined)
})

test('serializeSectionState maps SQL nulls to undefined, not null', () => {
  const state = serializeSectionState({
    sectionId: 'ownership',
    isAccepted: false,
    acceptedAt: null,
    acceptedBy: null,
    queryCount: 2,
  })
  assert.equal(state.sectionId, 'ownership')
  assert.equal(state.isAccepted, false)
  assert.equal(state.acceptedAt, undefined)
  assert.equal(state.acceptedBy, undefined)
  assert.equal(state.queryCount, 2)
})

test('serializeViewerIdentity derives clearance from the server-side role', () => {
  const lead = serializeViewerIdentity(
    { id: 'u1', name: 'Vikram Malhotra', image: null, githubLogin: null },
    'lead'
  )
  const successor = serializeViewerIdentity(
    { id: 'u2', name: 'Priya Sharma', image: null, githubLogin: null },
    'successor'
  )
  assert.equal(lead.clearanceLevel, 'confidential_lead')
  assert.equal(successor.clearanceLevel, 'team_internal')
})

test('serializeViewerIdentity falls back to a friendly name when identity fields are empty', () => {
  const identity = serializeViewerIdentity(
    { id: 'u3', name: null, image: null, githubLogin: null },
    'leaver'
  )
  assert.equal(identity.name, 'Member')
})

test('serializeActivity tolerates a missing actor and malformed detail JSON', () => {
  const entry = serializeActivity({
    id: 'a1',
    action: 'contradiction.settled',
    detail: '<<<broken',
    createdAt: new Date('2026-11-16T09:30:00.000Z'),
    actor: null,
  })
  assert.equal(entry.actorName, null)
  assert.equal(entry.detail, null)
  assert.equal(entry.createdAt, '2026-11-16T09:30:00.000Z')
})

test('compileVisibleClaims shows a successor only what their clearance allows', () => {
  const rows = [
    fakeClaimRow({ legacyId: 'c_open', sourceQuotes: JSON.stringify([fakeSpan('public_open')]) }),
    fakeClaimRow({
      legacyId: 'c_confidential',
      sourceQuotes: JSON.stringify([fakeSpan('confidential_lead')]),
    }),
    fakeClaimRow({
      legacyId: 'c_mixed',
      // One public span + one restricted span: the claim must be withheld.
      sourceQuotes: JSON.stringify([fakeSpan('public_open'), fakeSpan('restricted_hr_legal')]),
    }),
  ]
  const result = compileVisibleClaims(rows, 'team_internal')
  assert.deepEqual(
    result.visibleClaims.map((claim) => claim.id),
    ['c_open']
  )
  assert.equal(result.withheldCount, 2)
  assert.equal(result.withheldDetails[0].requiredClearance, 'confidential_lead')
  assert.match(result.withheldDetails[0].reason, /management strategy|vendor legal/)
  assert.equal(result.withheldDetails[1].requiredClearance, 'restricted_hr_legal')
  assert.match(result.withheldDetails[1].reason, /human resources/)
})

test('compileVisibleClaims grants a lead the confidential tier', () => {
  const rows = [
    fakeClaimRow({ legacyId: 'c_confidential', sourceQuotes: JSON.stringify([fakeSpan('confidential_lead')]) }),
    fakeClaimRow({ legacyId: 'c_hr', sourceQuotes: JSON.stringify([fakeSpan('restricted_hr_legal')]) }),
  ]
  const result = compileVisibleClaims(rows, 'confidential_lead')
  assert.deepEqual(
    result.visibleClaims.map((claim) => claim.id),
    ['c_confidential']
  )
  assert.equal(result.withheldCount, 1)
  assert.equal(result.withheldDetails[0].requiredClearance, 'restricted_hr_legal')
})

test('compileVisibleClaims with no source spans is visible to everyone', () => {
  const rows = [fakeClaimRow({ legacyId: 'c_orphan', sourceQuotes: '[]' })]
  const result = compileVisibleClaims(rows, 'team_internal')
  assert.equal(result.visibleClaims.length, 1)
  assert.equal(result.withheldCount, 0)
})
