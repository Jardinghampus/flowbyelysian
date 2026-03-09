const DAILY_LIMIT = 100
const WINDOW_MS = 24 * 60 * 60 * 1000

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(userId)

  if (!entry || now > entry.resetAt) {
    store.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: DAILY_LIMIT - 1 }
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: DAILY_LIMIT - entry.count }
}
