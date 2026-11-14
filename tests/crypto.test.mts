import test from 'node:test'
import assert from 'node:assert/strict'
import { encryptToken, decryptToken } from '../src/lib/crypto.ts'

test('encryptToken encrypts plaintext using AES-256-GCM', () => {
  const secretToken = 'gho_secretToken1234567890abcdef'
  const encrypted = encryptToken(secretToken)
  assert.ok(encrypted)
  assert.ok(encrypted.startsWith('enc:v1:'))
  assert.notEqual(encrypted, secretToken)
  assert.ok(!encrypted.includes(secretToken))

  // Decryption recovers the exact original token
  const decrypted = decryptToken(encrypted)
  assert.equal(decrypted, secretToken)
})

test('encryptToken is idempotent and does not double-encrypt', () => {
  const secretToken = 'gho_secretToken1234567890abcdef'
  const encrypted1 = encryptToken(secretToken)
  const encrypted2 = encryptToken(encrypted1)
  assert.equal(encrypted1, encrypted2)
})

test('decryptToken gracefully supports legacy unencrypted tokens', () => {
  const legacyToken = 'ghp_legacyPlaintextToken12345'
  const result = decryptToken(legacyToken)
  assert.equal(result, legacyToken)
})

test('decryptToken returns null on tampered ciphertext or invalid structure', () => {
  assert.equal(decryptToken(null), null)
  assert.equal(decryptToken(undefined), null)
  assert.equal(decryptToken('enc:v1:malformed'), null)

  // Valid format but corrupted tag / ciphertext
  const corrupted = 'enc:v1:0123456789abcdef01234567:0123456789abcdef0123456789abcdef:deadbeef'
  assert.equal(decryptToken(corrupted), null)
})
