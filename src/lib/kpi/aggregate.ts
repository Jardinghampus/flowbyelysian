import type { SupabaseClient } from "@supabase/supabase-js"
import {
  formatWeekLabel,
  resolveKpiRange,
  weekStartMonday,
  weekStartsInRange,
  type KpiPeriodKey,
} from "./periods"
import { buildPerformanceOverview, currentPeriod, previousPeriod } from "@/lib/performance/aggregate"

export type WeeklyKpiRow = {
  agent_id: string
  agent_name: string
  week_start: string
  total_listings: number
  new_listings: number
  offers: number
  viewings: number
  notes?: string
}

export type AgentKpiTotals = {
  agentId: string
  agentName: string
  totalListings: number
  newListings: number
  offers: number
  viewings: number
}

function num(v: unknown) {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

export function emptyKpi(agentId: string, agentName: string): AgentKpiTotals {
  return {
    agentId,
    agentName,
    totalListings: 0,
    newListings: 0,
    offers: 0,
    viewings: 0,
  }
}

export function summarizeKpis(agents: AgentKpiTotals[]) {
  return agents.reduce(
    (acc, a) => {
      acc.totalListings += a.totalListings
      acc.newListings += a.newListings
      acc.offers += a.offers
      acc.viewings += a.viewings
      return acc
    },
    { totalListings: 0, newListings: 0, offers: 0, viewings: 0 }
  )
}

export async function loadActiveAgents(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("app_users")
    .select("id, email, full_name, role, status")
    .eq("status", "active")
    .in("role", ["admin", "agent"])
    .order("full_name")

  if (error) throw new Error(error.message)
  return data || []
}

export async function buildKpiBoard(
  supabase: SupabaseClient,
  periodKey: KpiPeriodKey,
  now = new Date()
) {
  const range = resolveKpiRange(periodKey, now)
  const weekStarts = weekStartsInRange(range.from, range.to)

  const [{ data: rows }, users] = await Promise.all([
    supabase
      .from("agent_weekly_kpis")
      .select("*")
      .gte("week_start", weekStarts[0] || range.from)
      .lte("week_start", weekStarts[weekStarts.length - 1] || range.to),
    loadActiveAgents(supabase),
  ])

  const map = new Map<string, AgentKpiTotals>()
  for (const user of users) {
    map.set(user.id, emptyKpi(user.id, user.full_name || user.email))
  }

  for (const row of (rows || []) as WeeklyKpiRow[]) {
    if (!map.has(row.agent_id)) {
      map.set(row.agent_id, emptyKpi(row.agent_id, row.agent_name || "Agent"))
    }
    const b = map.get(row.agent_id)!
    if (row.agent_name) b.agentName = row.agent_name
    b.totalListings += num(row.total_listings)
    b.newListings += num(row.new_listings)
    b.offers += num(row.offers)
    b.viewings += num(row.viewings)
  }

  const agents = Array.from(map.values()).sort(
    (a, b) => b.newListings + b.offers + b.viewings - (a.newListings + a.offers + a.viewings)
  )

  const monday = weekStartMonday(now)
  const mondayIso = monday.toISOString().slice(0, 10)

  return {
    period: range,
    weekStart: mondayIso,
    weekLabel: formatWeekLabel(monday),
    totals: summarizeKpis(agents),
    agents,
  }
}

/** KPI board + commission this month / last month for live TV. */
export async function buildLiveBoard(supabase: SupabaseClient, periodKey: KpiPeriodKey = "week") {
  const month = currentPeriod()
  const [kpi, commission] = await Promise.all([
    buildKpiBoard(supabase, periodKey),
    buildPerformanceOverview(supabase, month),
  ])

  return {
    kpi,
    commission: {
      period: commission.period,
      previousPeriod: previousPeriod(month),
      thisMonth: commission.company.thisMonth,
      lastMonth: commission.company.lastMonth,
      delta: commission.company.delta,
      agents: commission.agents.map((a) => ({
        agentId: a.agentId,
        agentName: a.agentName,
        saleCommission: a.saleCommission,
        rentCommission: a.rentCommission,
        commission: a.commission,
        saleDeals: a.saleDeals,
        rentDeals: a.rentDeals,
        rank: a.rank,
      })),
    },
  }
}
