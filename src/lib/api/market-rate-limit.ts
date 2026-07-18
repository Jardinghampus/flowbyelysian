/** Per-user sliding window rate limit for market read APIs. */
const WINDOW_MS = 60_000
const MAX_REQUESTS = 120

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

export function checkMarketRateLimit(userId: string): {
  allowed: boolean
  remaining: number
  retryAfterSec: number
} {
  const now = Date.now()
  const entry = store.get(userId)

  if (!entry || now > entry.resetAt) {
    store.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfterSec: 0 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  entry.count += 1
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, retryAfterSec: 0 }
}
