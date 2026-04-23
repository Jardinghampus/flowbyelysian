import { useState, useEffect, useCallback, useRef } from "react"
import type { Owner, OwnerFiltersState, OwnerStats, LinkedListing } from "../_lib/types"

export function useAgentAreas(isAdmin: boolean) {
  const [areas, setAreas] = useState<string[]>([])
  const [loading, setLoading] = useState(!isAdmin)

  useEffect(() => {
    if (isAdmin) {
      setAreas([])
      setLoading(false)
      return
    }

    fetch("/api/areas/assignments?agentId=demo-user-001")
      .then((r) => r.json())
      .then((data) => {
        const names = (data.assignments || [])
          .map((a: { areas?: { name: string } }) => a.areas?.name)
          .filter(Boolean) as string[]
        setAreas(names)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAdmin])

  return { areas, loading }
}

export function useOwners(filters: OwnerFiltersState, showHidden = false) {
  const [owners, setOwners] = useState<Owner[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set("search", filters.search)
      if (filters.area) params.set("area", filters.area)
      if (filters.bedrooms) params.set("bedrooms", filters.bedrooms)
      if (filters.status) params.set("status", filters.status)
      if (filters.agent) params.set("agent", filters.agent)
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
      if (filters.dateTo) params.set("dateTo", filters.dateTo)
      if (showHidden) params.set("showHidden", "true")

      const res = await fetch(`/api/owners?${params.toString()}`, {
        signal: controller.signal,
      })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setOwners(data.owners)
      setTotal(data.total)
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error("Error fetching owners:", e)
      }
    } finally {
      setLoading(false)
    }
  }, [filters.search, filters.area, filters.bedrooms, filters.status, filters.agent, filters.dateFrom, filters.dateTo, showHidden])

  useEffect(() => {
    fetchData()
    return () => abortRef.current?.abort()
  }, [fetchData])

  return { owners, total, loading, refetch: fetchData }
}

export function useOwnerStats(filters: OwnerFiltersState) {
  const [stats, setStats] = useState<OwnerStats>({
    totalOwners: 0,
    callsLast7Days: 0,
    whatsappLast7Days: 0,
    consideringCount: 0,
    overdueFollowUps: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.area) params.set("area", filters.area)
      if (filters.status) params.set("status", filters.status)
      if (filters.agent) params.set("agent", filters.agent)

      const res = await fetch(`/api/owners/stats?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setStats(data)
    } catch (e) {
      console.error("Error fetching stats:", e)
    } finally {
      setLoading(false)
    }
  }, [filters.area, filters.status, filters.agent])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}

export function useOwnerDetail(ownerId: string | null) {
  const [owner, setOwner] = useState<Owner | null>(null)
  const [logs, setLogs] = useState<import("../_lib/types").OutreachLog[]>([])
  const [linkedListings, setLinkedListings] = useState<LinkedListing[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!ownerId) {
      setOwner(null)
      setLogs([])
      setLinkedListings([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/owners/${ownerId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setOwner(data.owner)
      setLogs(data.logs)
      setLinkedListings(data.linkedListings || [])
    } catch (e) {
      console.error("Error fetching owner detail:", e)
    } finally {
      setLoading(false)
    }
  }, [ownerId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { owner, logs, linkedListings, loading, refetch: fetchDetail }
}

export function useTodos() {
  const [overdue, setOverdue] = useState<Owner[]>([])
  const [dueSoon, setDueSoon] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/owners/todos")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setOverdue(data.overdue)
      setDueSoon(data.dueSoon)
    } catch (e) {
      console.error("Error fetching todos:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodos()
    const interval = setInterval(fetchTodos, 60000)
    return () => clearInterval(interval)
  }, [fetchTodos])

  return { overdue, dueSoon, loading, refetch: fetchTodos }
}

export function useAgentPerformance(agentId?: string) {
  const [performance, setPerformance] = useState<
    Array<{
      agent_id: string
      agent_name: string
      total_calls: number
      calls_7d: number
      total_whatsapp: number
      whatsapp_7d: number
      owners_managed: number
      considering_count: number
      listed_count: number
      conversion_rate: number
    }>
  >([])
  const [loading, setLoading] = useState(true)

  const fetchPerf = useCallback(async () => {
    try {
      const params = agentId ? `?agentId=${agentId}` : ""
      const res = await fetch(`/api/owners/performance${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setPerformance(data)
    } catch (e) {
      console.error("Error fetching performance:", e)
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    fetchPerf()
  }, [fetchPerf])

  return { performance, loading, refetch: fetchPerf }
}
