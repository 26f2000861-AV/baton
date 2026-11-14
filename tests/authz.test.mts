import test from 'node:test'
import assert from 'node:assert/strict'

import {
  AuthzError,
  canFounderGovern,
  clearanceForRole,
  isHandoverId,
  requireRole,
} from '../src/lib/authzRules.ts'

/**
 * Authorization rules regression suite.
 * The 401/403/404 route behaviors these rules produce are additionally
 * verified live against the running server (see docs/TESTING_NOTES.md):
 *   - unauthenticated request      -> 401 UNAUTHENTICATED
 *   - wrong role on a guarded call -> 403 FORBIDDEN_ROLE
 *   - non-member / junk handover   -> 404 HANDOVER_NOT_FOUND (no enumeration)
 */

test('requireRole allows a member holding the required role', () => {
  requireRole({ role: 'successor' }, ['successor'])
  requireRole({ role: 'lead' }, ['lead', 'successor'])
  requireRole({ role: 'leaver' }, ['leaver'])
})

test('requireRole throws 403 FORBIDDEN_ROLE for other roles', () => {
  for (const [role, allowed] of [
    ['successor', ['lead']],
    ['leaver', ['lead', 'successor']],
    ['lead', ['successor']],
  ] as const) {
    assert.throws(
      () => requireRole({ role }, [...allowed]),
      (err: unknown) => {
        assert.ok(err instanceof AuthzError)
        assert.equal(err.status, 403)
        assert.equal(err.code, 'FORBIDDEN_ROLE')
        return true
      }
    )
  }
})

test('isHandoverId accepts CUID-shaped ids and rejects junk/legacy ids', () => {
  assert.equal(isHandoverId('cmwfooozo000xpteb25j84li5'), true)
  assert.equal(isHandoverId('clxxx1234567890abcdefghij'), true)
  // Junk, seed-style and enumeration probes must be rejected.
  assert.equal(isHandoverId(''), false)
  assert.equal(isHandoverId('1'), false)
  assert.equal(isHandoverId('helios_v1'), false)
  assert.equal(isHandoverId('../etc/passwd'), false)
  assert.equal(isHandoverId('cshort'), false)
})

test('clearanceForRole maps roles to the Round 2 persona clearance model', () => {
  assert.equal(clearanceForRole('lead'), 'confidential_lead')
  assert.equal(clearanceForRole('successor'), 'team_internal')
  assert.equal(clearanceForRole('leaver'), 'team_internal')
})

test('canFounderGovern: the lead always governs', () => {
  const handover = { createdById: 'user-1' }
  assert.equal(
    canFounderGovern(handover, { userId: 'user-2', role: 'lead' }, false),
    true
  )
  assert.equal(
    canFounderGovern(handover, { userId: 'user-2', role: 'lead' }, true),
    true
  )
})

test('canFounderGovern: creator may govern only while no lead exists', () => {
  const handover = { createdById: 'user-1' }
  // No lead yet: the creator (in any seat) can govern.
  assert.equal(
    canFounderGovern(handover, { userId: 'user-1', role: 'successor' }, false),
    true
  )
  // A lead exists: only the lead governs.
  assert.equal(
    canFounderGovern(handover, { userId: 'user-1', role: 'successor' }, true),
    false
  )
  // Not the creator, no lead: nobody can govern through this path.
  assert.equal(
    canFounderGovern(handover, { userId: 'user-3', role: 'successor' }, false),
    false
  )
})
