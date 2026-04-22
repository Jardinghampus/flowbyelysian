"use client"

import { useState, useEffect, useCallback } from "react"

export interface UnifiedStats {
  listings: { total: number; live: number; pocket: number; unofficial: number }
  leads: { total: number; new: number; contacted: number; inProgress: number; matched: number }
  owners: { total: number; considering: number; listed: number; overdueFollowUps: number }
  activity: { callsToday: number; leadsToday: number; viewingsToday: number }
  agents: { total: number; activeToday: number }
  pipeline: { stale: number; unassigned: number; total: number }
  unreadNotifications: number
}

const EMPTY_STATS: UnifiedStats = {
  listings: { total: 0, live: 0, pocket: 0, unofficial: 0 },
  leads: { total: 0, new: 0, contacted: 0, inProgress: 0, matched: 0 },
  owners: { total: 0, considering: 0, listed: 0, overdueFollowUps: 0 },
  activity: { callsToday: 0, leadsToday: 0, viewingsToday: 0 },
  agents: { total: 0, activeToday: 0 },
  pipeline: { stale: 0, unassigned: 0, total: 0 },
  unreadNotifications: 0,
}

export function useUnifiedStats(refreshInterval = 60_000) {
  const [stats, setStats] = useState<UnifiedStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats")
      if (!res.ok) return
      const data = await res.json()
      setStats(data)
    } catch {
      // silently fail — dashboard still renders with zeros
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchStats, refreshInterval])

  return { stats, loading, refetch: fetchStats }
}
