import assert from 'node:assert/strict'
import test from 'node:test'
import { verifyQuoteAgainstSource } from '../src/lib/verifier.ts'

test('accepts an exact quote and returns its source span', () => {
  const result = verifyQuoteAgainstSource('alpha beta gamma', 'beta gamma')

  assert.equal(result.isExactMatch, true)
  assert.equal(result.charStart, 6)
  assert.equal(result.charEnd, 16)
  assert.equal(result.suggestedStatus, 'quoted_verified')
})

test('normalizes CRLF and trims quote boundaries', () => {
  const result = verifyQuoteAgainstSource('first\r\nsecond', '  first\nsecond  ')

  assert.equal(result.isExactMatch, true)
  assert.equal(result.charStart, 0)
  assert.equal(result.charEnd, 12)
})

test('downgrades whitespace-only near matches', () => {
  const result = verifyQuoteAgainstSource('alpha\n\nbeta', 'alpha beta')

  assert.equal(result.isExactMatch, false)
  assert.equal(result.suggestedStatus, 'quoted_unverified')
  assert.match(result.explanation, /formatting or whitespace alteration/)
})

test('rejects absent and empty quotes', () => {
  const absent = verifyQuoteAgainstSource('alpha beta', 'gamma')
  const empty = verifyQuoteAgainstSource('alpha beta', '   ')

  assert.equal(absent.isExactMatch, false)
  assert.equal(empty.isExactMatch, false)
  assert.equal(empty.charStart, -1)
})
