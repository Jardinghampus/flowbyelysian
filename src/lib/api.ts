import { DEMO_USER_ID } from "@/lib/demo-auth"

export interface ActiveUserSummary {
  userId: string
  totalListings: number
  totalLeads: number
  totalOwners: number
  overdueFollowUps: number
  todayActivity: { calls: number; leads: number; viewings: number }
  unreadNotifications: number
  pipelineHealth: { stale: number; unassigned: number; total: number }
}

export interface UnifiedStats {
  listings: { total: number; live: number; pocket: number; unofficial: number }
  leads: { total: number; new: number; contacted: number; inProgress: number; matched: number }
  owners: { total: number; considering: number; listed: number; overdueFollowUps: number }
  activity: { callsToday: number; leadsToday: number; viewingsToday: number }
  agents: { total: number; activeToday: number }
}

const cache = new Map<string, { data: unknown; ts: number }>()
const CACHE_TTL = 30_000

async function cachedFetch<T>(url: string, ttl = CACHE_TTL): Promise<T> {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.ts < ttl) return cached.data as T

  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  cache.set(url, { data, ts: Date.now() })
  return data as T
}

export function invalidateCache(pattern?: string) {
  if (!pattern) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key)
  }
}

export const api = {
  listings: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "?limit=500"
      return cachedFetch<{ listings: unknown[]; total: number }>(`/api/listings${qs}`)
    },
    get: (id: string) => cachedFetch<{ listing: unknown }>(`/api/listings/${id}`, 10_000),
    getLeads: (id: string) => cachedFetch<{ leads: unknown[] }>(`/api/listings/${id}/leads`),
  },

  leads: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "?limit=200"
      return cachedFetch<{ opportunities: unknown[]; total: number }>(`/api/opportunities${qs}`)
    },
  },

  owners: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "?limit=200"
      return cachedFetch<{ owners: unknown[]; total: number }>(`/api/owners${qs}`)
    },
    stats: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : ""
      return cachedFetch<{ totalOwners: number; callsLast7Days: number; whatsappLast7Days: number; consideringCount: number; overdueFollowUps: number }>(`/api/owners/stats${qs}`)
    },
    todos: () => cachedFetch<{ overdue: unknown[]; dueSoon: unknown[] }>("/api/owners/todos"),
    performance: () => cachedFetch<unknown[]>("/api/owners/performance"),
  },

  activity: {
    today: (agentId = DEMO_USER_ID) => {
      const date = new Date().toISOString().split("T")[0]
      return cachedFetch<{ data: Array<{ calls_wa: number; leads: number; viewings: number }> }>(
        `/api/daily-activity?date=${date}&agent_id=${agentId}`,
        15_000
      )
    },
    range: (from: string, to: string, agentId?: string) => {
      let url = `/api/daily-activity?from=${from}&to=${to}`
      if (agentId) url += `&agent_id=${agentId}`
      return cachedFetch<{ data: unknown[] }>(url)
    },
  },

  notifications: {
    list: () => cachedFetch<{ notifications: Array<{ read: boolean }> }>("/api/notifications"),
  },

  areas: {
    list: () => cachedFetch<{ areas: Array<{ id: string; name: string; slug: string }> }>("/api/areas"),
  },

  contacts: {
    list: () => cachedFetch<{ contacts: unknown[] }>("/api/contacts"),
  },
}
