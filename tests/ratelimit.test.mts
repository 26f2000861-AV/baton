import test from 'node:test'
import assert from 'node:assert/strict'
import { checkRateLimit, resetRateLimitsForTesting } from '../src/lib/rateLimit.ts'

test('checkRateLimit allows requests within limit', () => {
  resetRateLimitsForTesting()
  const key = 'test-key-allow'

  // Limit 3 per 1000ms
  const r1 = checkRateLimit(key, 3, 1000)
  assert.equal(r1.success, true)
  assert.equal(r1.remaining, 2)

  const r2 = checkRateLimit(key, 3, 1000)
  assert.equal(r2.success, true)
  assert.equal(r2.remaining, 1)

  const r3 = checkRateLimit(key, 3, 1000)
  assert.equal(r3.success, true)
  assert.equal(r3.remaining, 0)
})

test('checkRateLimit denies requests once limit is exceeded', () => {
  resetRateLimitsForTesting()
  const key = 'test-key-deny'

  // Max 2 requests
  checkRateLimit(key, 2, 5000)
  checkRateLimit(key, 2, 5000)

  // Third request should be blocked
  const r3 = checkRateLimit(key, 2, 5000)
  assert.equal(r3.success, false)
  assert.equal(r3.remaining, 0)
  assert.ok(r3.retryAfterSeconds > 0)
})

test('checkRateLimit isolates different keys', () => {
  resetRateLimitsForTesting()
  const keyA = 'user-A'
  const keyB = 'user-B'

  checkRateLimit(keyA, 1, 5000)
  const rA2 = checkRateLimit(keyA, 1, 5000)
  assert.equal(rA2.success, false)

  // user-B has not hit their limit yet
  const rB = checkRateLimit(keyB, 1, 5000)
  assert.equal(rB.success, true)
})
