import { createServerClient } from "@/lib/supabase/server"
import type { Owner, OutreachLog, OwnerStats, LinkedListing } from "./types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

function getClient(): SupabaseClient {
  return createServerClient()
}

export async function fetchOwners(params: {
  search?: string
  area?: string
  bedrooms?: string
  status?: string
  agent?: string
  dateFrom?: string
  dateTo?: string
  showHidden?: boolean
  limit?: number
  offset?: number
}): Promise<{ owners: Owner[]; total: number }> {
  const supabase = getClient()
  const view = params.showHidden ? "owners_with_counts" : "owners_active"
  let query = supabase
    .from(view)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,phone.ilike.%${params.search}%,unit_number.ilike.%${params.search}%`
    )
  }
  if (params.area) query = query.eq("area", params.area)
  if (params.bedrooms) query = query.eq("bedrooms", params.bedrooms)
  if (params.status) query = query.eq("status", params.status)
  if (params.agent) query = query.eq("assigned_agent_id", params.agent)
  if (params.dateFrom) query = query.gte("last_contacted_at", params.dateFrom)
  if (params.dateTo) query = query.lte("last_contacted_at", params.dateTo)

  const limit = params.limit || 100
  const offset = params.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) throw error
  return { owners: (data || []) as Owner[], total: count || 0 }
}

export async function fetchOwnerById(id: string): Promise<Owner | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("owners_with_counts")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as Owner
}

export async function createOwner(owner: Partial<Owner>): Promise<Owner> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("owners")
    .insert(owner)
    .select()
    .single()

  if (error) throw error
  return data as Owner
}

export async function updateOwner(id: string, updates: Partial<Owner>): Promise<Owner> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("owners")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Owner
}

export async function hideOwner(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from("owners")
    .update({ is_hidden: true, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

export async function restoreOwner(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from("owners")
    .update({ is_hidden: false, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

export async function deleteOwner(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from("owners").delete().eq("id", id)
  if (error) throw error
}

export async function bulkCreateOwners(
  owners: Array<Partial<Owner>>
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const supabase = getClient()
  let inserted = 0
  let skipped = 0
  const errors: string[] = []
  const BATCH = 100

  for (let i = 0; i < owners.length; i += BATCH) {
    const batch = owners.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from("owners")
      .upsert(batch, { onConflict: "id", ignoreDuplicates: true })
      .select("id")

    if (error) {
      errors.push(`Batch ${Math.floor(i / BATCH) + 1}: ${error.message}`)
      skipped += batch.length
    } else {
      inserted += (data || []).length
      skipped += batch.length - (data || []).length
    }
  }

  return { inserted, skipped, errors }
}

export async function fetchOutreachLogs(ownerId: string): Promise<OutreachLog[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("outreach_logs")
    .select("*")
    .eq("owner_id", ownerId)
    .order("logged_at", { ascending: false })

  if (error) throw error
  return (data || []) as OutreachLog[]
}

export async function createOutreachLog(log: Partial<OutreachLog>): Promise<OutreachLog> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("outreach_logs")
    .insert(log)
    .select()
    .single()

  if (error) throw error
  return data as OutreachLog
}

export async function fetchLinkedListings(ownerId: string): Promise<LinkedListing[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, area_name, type, price, transaction_type, status, bedrooms")
    .eq("owner_contact_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) return []
  return (data || []) as LinkedListing[]
}

export async function linkListingToOwner(listingId: string, ownerId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from("listings")
    .update({ owner_contact_id: ownerId })
    .eq("id", listingId)
  if (error) throw error
}

export async function unlinkListing(listingId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from("listings")
    .update({ owner_contact_id: null })
    .eq("id", listingId)
  if (error) throw error
}

export async function fetchOwnerStats(filters?: {
  area?: string
  status?: string
  agent?: string
}): Promise<OwnerStats> {
  const supabase = getClient()

  let ownersQuery = supabase
    .from("owners")
    .select("id, status, follow_up_at", { count: "exact" })
    .eq("is_hidden", false)
  if (filters?.area) ownersQuery = ownersQuery.eq("area", filters.area)
  if (filters?.status) ownersQuery = ownersQuery.eq("status", filters.status)
  if (filters?.agent) ownersQuery = ownersQuery.eq("assigned_agent_id", filters.agent)

  const { data: owners, count: totalOwners } = await ownersQuery

  const now = new Date().toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { count: callsLast7Days } = await supabase
    .from("outreach_logs")
    .select("id", { count: "exact", head: true })
    .eq("type", "call")
    .gte("logged_at", sevenDaysAgo)

  const { count: whatsappLast7Days } = await supabase
    .from("outreach_logs")
    .select("id", { count: "exact", head: true })
    .eq("type", "whatsapp")
    .gte("logged_at", sevenDaysAgo)

  const consideringCount = (owners || []).filter((o: { status: string }) => o.status === "considering").length
  const overdueFollowUps = (owners || []).filter(
    (o: { follow_up_at: string | null }) => o.follow_up_at && o.follow_up_at < now
  ).length

  return {
    totalOwners: totalOwners || 0,
    callsLast7Days: callsLast7Days || 0,
    whatsappLast7Days: whatsappLast7Days || 0,
    consideringCount,
    overdueFollowUps,
  }
}

export async function fetchTodoOwners(): Promise<{
  overdue: Owner[]
  dueSoon: Owner[]
}> {
  const supabase = getClient()
  const now = new Date().toISOString()
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: overdue } = await supabase
    .from("owners_active")
    .select("*")
    .lt("follow_up_at", now)
    .not("follow_up_at", "is", null)
    .order("priority", { ascending: true })
    .order("follow_up_at", { ascending: true })
    .limit(20)

  const { data: dueSoon } = await supabase
    .from("owners_active")
    .select("*")
    .gte("follow_up_at", now)
    .lte("follow_up_at", sevenDaysFromNow)
    .order("follow_up_at", { ascending: true })
    .limit(20)

  return {
    overdue: (overdue || []) as Owner[],
    dueSoon: (dueSoon || []) as Owner[],
  }
}

export async function fetchAgentPerformance(agentId?: string): Promise<
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
> {
  const supabase = getClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  let ownersQuery = supabase
    .from("owners")
    .select("assigned_agent_id, assigned_agent_name, status")
    .eq("is_hidden", false)
  if (agentId) ownersQuery = ownersQuery.eq("assigned_agent_id", agentId)

  const { data: owners } = await ownersQuery
  if (!owners || owners.length === 0) return []

  const agentMap = new Map<string, { name: string; managed: number; considering: number; listed: number }>()
  for (const o of owners) {
    const existing = agentMap.get(o.assigned_agent_id) || {
      name: o.assigned_agent_name || "Unknown",
      managed: 0,
      considering: 0,
      listed: 0,
    }
    existing.managed++
    if (o.status === "considering") existing.considering++
    if (o.status === "listed") existing.listed++
    agentMap.set(o.assigned_agent_id, existing)
  }

  const agentIds = Array.from(agentMap.keys())
  const { data: allLogs } = await supabase
    .from("outreach_logs")
    .select("agent_id, type, logged_at")
    .in("agent_id", agentIds)

  const result = agentIds.map((id) => {
    const info = agentMap.get(id)!
    const logs = (allLogs || []).filter((l: OutreachLog) => l.agent_id === id)
    const recentLogs = logs.filter((l: OutreachLog) => l.logged_at >= sevenDaysAgo)

    return {
      agent_id: id,
      agent_name: info.name,
      total_calls: logs.filter((l: OutreachLog) => l.type === "call").length,
      calls_7d: recentLogs.filter((l: OutreachLog) => l.type === "call").length,
      total_whatsapp: logs.filter((l: OutreachLog) => l.type === "whatsapp").length,
      whatsapp_7d: recentLogs.filter((l: OutreachLog) => l.type === "whatsapp").length,
      owners_managed: info.managed,
      considering_count: info.considering,
      listed_count: info.listed,
      conversion_rate: info.managed > 0 ? Math.round((info.listed / info.managed) * 100) : 0,
    }
  })

  return result.sort((a, b) => b.owners_managed - a.owners_managed)
}
