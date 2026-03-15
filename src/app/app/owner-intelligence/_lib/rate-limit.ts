export const DAILY_LIMIT = 50
const WINDOW_MS = 24 * 60 * 60 * 1000

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number; used: number; limit: number } {
  const now = Date.now()
  const entry = store.get(userId)

  if (!entry || now > entry.resetAt) {
    store.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: DAILY_LIMIT - 1, used: 1, limit: DAILY_LIMIT }
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, used: entry.count, limit: DAILY_LIMIT }
  }

  entry.count++
  return { allowed: true, remaining: DAILY_LIMIT - entry.count, used: entry.count, limit: DAILY_LIMIT }
}

export function getRateLimitStatus(userId: string): { used: number; limit: number; remaining: number } {
  const now = Date.now()
  const entry = store.get(userId)

  if (!entry || now > entry.resetAt) {
    return { used: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT }
  }

  return { used: entry.count, limit: DAILY_LIMIT, remaining: DAILY_LIMIT - entry.count }
}
