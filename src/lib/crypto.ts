import crypto from 'node:crypto'

/**
 * Token encryption at rest (AES-256-GCM) — Remediation for SEC-02.
 * Encrypts sensitive OAuth access and refresh tokens before storing them in
 * the database. Uses a 32-byte key derived from NEXTAUTH_SECRET (or
 * ENCRYPTION_SECRET) via SHA-256. Format: enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>.
 *
 * Fully backward-compatible: plaintext tokens in legacy databases pass
 * through unmodified until rotated.
 */

const ALGORITHM = 'aes-256-gcm'
const PREFIX = 'enc:v1:'

function getEncryptionKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    'baton-default-token-encryption-salt-change-in-prod'
  return crypto.createHash('sha256').update(secret).digest()
}

/** Encrypts a sensitive plaintext token using AES-256-GCM. */
export function encryptToken(plainText: string | null | undefined): string | null {
  if (!plainText) return null
  // Avoid re-encrypting already encrypted ciphertext
  if (plainText.startsWith(PREFIX)) return plainText

  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(plainText, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const tag = cipher.getAuthTag()
    return `${PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('[crypto] Failed to encrypt token', error)
    throw new Error('Token encryption failed.')
  }
}

/** Decrypts an AES-256-GCM encrypted token. Safely falls back to plaintext for legacy rows. */
export function decryptToken(value: string | null | undefined): string | null {
  if (!value) return null
  // Legacy unencrypted token support
  if (!value.startsWith(PREFIX)) {
    return value
  }

  const parts = value.split(':')
  if (parts.length !== 5) {
    console.error('[crypto] Invalid encrypted token format')
    return null
  }

  const [, , ivHex, tagHex, cipherHex] = parts
  try {
    const key = getEncryptionKey()
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('[crypto] Failed to decrypt token (tampered or wrong key)', error)
    return null
  }
}
