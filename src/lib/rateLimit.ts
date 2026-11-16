/**
 * In-memory sliding window rate limiter — Remediation for SEC-09.
 * Protects resource-intensive endpoints (workspace creation, GitHub imports,
 * template resets, and unauthenticated verification) from DoS, brute-force,
 * and quota exhaustion.
 */

interface RateLimitEntry {
  timestamps: number[]
}

const memoryStore = new Map<string, RateLimitEntry>()
const MAX_KEYS = 10_000

let gcInterval: NodeJS.Timeout | null = null

function ensureGC() {
  if (gcInterval || typeof setInterval === 'undefined') return
  gcInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of memoryStore.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < 600_000)
      if (entry.timestamps.length === 0) {
        memoryStore.delete(key)
      }
    }
  }, 60_000)
  if (gcInterval.unref) gcInterval.unref()
}

export function resetRateLimitsForTesting(): void {
  memoryStore.clear()
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number; retryAfterSeconds: number } {
  ensureGC()
  const now = Date.now()
  let entry = memoryStore.get(key)
  if (!entry) {
    if (memoryStore.size >= MAX_KEYS) {
      const firstKey = memoryStore.keys().next().value
      if (firstKey) memoryStore.delete(firstKey)
    }
    entry = { timestamps: [] }
    memoryStore.set(key, entry)
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs)

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0]
    const reset = oldest + windowMs
    const retryAfterSeconds = Math.max(1, Math.ceil((reset - now) / 1000))
    return {
      success: false,
      remaining: 0,
      reset,
      retryAfterSeconds,
    }
  }

  entry.timestamps.push(now)
  return {
    success: true,
    remaining: limit - entry.timestamps.length,
    reset: now + windowMs,
    retryAfterSeconds: 0,
  }
}

export function rateLimitResponse(retryAfterSeconds: number, limit: number, reset: number): Response {
  return Response.json(
    {
      error: {
        code: 'RATE_LIMITED',
        message: `Too many requests. Please wait ${retryAfterSeconds} second${retryAfterSeconds === 1 ? '' : 's'} before trying again.`,
      },
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(reset),
      },
    }
  )
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return '127.0.0.1'
}
