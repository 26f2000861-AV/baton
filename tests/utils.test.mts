import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeSafeUrl } from '../src/lib/utils.ts'

test('sanitizeSafeUrl allows valid HTTPS and HTTP URLs', () => {
  assert.equal(
    sanitizeSafeUrl('https://github.com/26f2000861-AV/baton'),
    'https://github.com/26f2000861-AV/baton'
  )
  assert.equal(
    sanitizeSafeUrl('http://localhost:3000/workspace'),
    'http://localhost:3000/workspace'
  )
  assert.equal(
    sanitizeSafeUrl('  https://helios.slack.com/archives/C0123/p12345  '),
    'https://helios.slack.com/archives/C0123/p12345'
  )
})

test('sanitizeSafeUrl blocks XSS vectors and malicious schemes', () => {
  // JavaScript pseudo-protocol
  assert.equal(sanitizeSafeUrl('javascript:alert(1)'), null)
  assert.equal(sanitizeSafeUrl('JAVASCRIPT:alert(document.cookie)'), null)
  assert.equal(sanitizeSafeUrl('javascript://%0aalert(1)'), null)

  // Data / VBScript pseudo-protocols
  assert.equal(sanitizeSafeUrl('data:text/html,<script>alert(1)</script>'), null)
  assert.equal(sanitizeSafeUrl('vbscript:msgbox(1)'), null)

  // Disguised or malformed URLs
  assert.equal(sanitizeSafeUrl('http:alert(1)'), null)
  assert.equal(sanitizeSafeUrl('https:alert(1)'), null)

  // Non-HTTP application schemes (like vault:, slack:) are blocked from clickable hrefs
  assert.equal(sanitizeSafeUrl('vault: kv/helios/prod/grafana-admin'), null)
})

test('sanitizeSafeUrl returns null on empty or invalid inputs', () => {
  assert.equal(sanitizeSafeUrl(''), null)
  assert.equal(sanitizeSafeUrl('   '), null)
  assert.equal(sanitizeSafeUrl(null), null)
  assert.equal(sanitizeSafeUrl(undefined), null)
  assert.equal(sanitizeSafeUrl('not a url'), null)
})
