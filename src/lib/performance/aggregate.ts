import type { SupabaseClient } from "@supabase/supabase-js"

export type Period = { year: number; month: number }

export type DealRow = {
  agent_id: string
  agent_name: string | null
  deal_type: "sale" | "rent"
  status: string
  agreed_amount: number | null
  gross_commission: number | null
  closed_at: string | null
  created_at: string
}

export type AgentBucket = {
  agentId: string
  agentName: string
  saleDeals: number
  rentDeals: number
  saleCommission: number
  rentCommission: number
  saleRevenue: number
  rentRevenue: number
  listings: number
  viewings: number
  fromDeals: boolean
  fromManual: boolean
}

export function currentPeriod(date = new Date()): Period {
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

export function previousPeriod(period: Period): Period {
  if (period.month === 1) return { year: period.year - 1, month: 12 }
  return { year: period.year, month: period.month - 1 }
}

export function periodBounds(period: Period) {
  const start = new Date(Date.UTC(period.year, period.month - 1, 1, 0, 0, 0))
  const end = new Date(Date.UTC(period.year, period.month, 1, 0, 0, 0))
  return { start: start.toISOString(), end: end.toISOString() }
}

export function daysInMonth(period: Period) {
  return new Date(period.year, period.month, 0).getDate()
}

export function dayOfMonthSoFar(period: Period, now = new Date()) {
  if (now.getFullYear() === period.year && now.getMonth() + 1 === period.month) {
    return now.getDate()
  }
  // Past month → full month; future → 0
  if (
    now.getFullYear() > period.year ||
    (now.getFullYear() === period.year && now.getMonth() + 1 > period.month)
  ) {
    return daysInMonth(period)
  }
  return 0
}

export function forecastMonthEnd(actualSoFar: number, period: Period, now = new Date()) {
  const dim = daysInMonth(period)
  const day = Math.max(1, dayOfMonthSoFar(period, now))
  const projected = (actualSoFar / day) * dim
  return {
    projected: Math.round(projected),
    dayOfMonth: day,
    daysInMonth: dim,
    pacePct: dim > 0 ? Math.round((day / dim) * 100) : 0,
  }
}

function num(v: unknown) {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

export function emptyBucket(agentId: string, agentName: string): AgentBucket {
  return {
    agentId,
    agentName,
    saleDeals: 0,
    rentDeals: 0,
    saleCommission: 0,
    rentCommission: 0,
    saleRevenue: 0,
    rentRevenue: 0,
    listings: 0,
    viewings: 0,
    fromDeals: false,
    fromManual: false,
  }
}

export function rollupDeals(deals: DealRow[], period: Period): Map<string, AgentBucket> {
  const { start, end } = periodBounds(period)
  const map = new Map<string, AgentBucket>()

  for (const deal of deals) {
    if (deal.status !== "closed_won") continue
    const closed = deal.closed_at || deal.created_at
    if (!closed || closed < start || closed >= end) continue

    const id = deal.agent_id || "unknown"
    const name = deal.agent_name || "Unknown agent"
    if (!map.has(id)) map.set(id, emptyBucket(id, name))
    const b = map.get(id)!
    b.fromDeals = true
    if (deal.agent_name) b.agentName = deal.agent_name

    const commission = num(deal.gross_commission)
    const revenue = num(deal.agreed_amount)
    if (deal.deal_type === "rent") {
      b.rentDeals += 1
      b.rentCommission += commission
      b.rentRevenue += revenue
    } else {
      b.saleDeals += 1
      b.saleCommission += commission
      b.saleRevenue += revenue
    }
  }

  return map
}

export function mergeManual(
  map: Map<string, AgentBucket>,
  manual: Array<{
    agent_id: string
    agent_name: string
    sale_deals: number
    rent_deals: number
    sale_commission_aed: number
    rent_commission_aed: number
    sale_revenue_aed: number
    rent_revenue_aed: number
    listings: number
    viewings: number
    include_deals_rollup: boolean
  }>
) {
  for (const row of manual) {
    const existing = map.get(row.agent_id)
    if (!row.include_deals_rollup || !existing) {
      const b = emptyBucket(row.agent_id, row.agent_name || existing?.agentName || "Agent")
      b.saleDeals = num(row.sale_deals)
      b.rentDeals = num(row.rent_deals)
      b.saleCommission = num(row.sale_commission_aed)
      b.rentCommission = num(row.rent_commission_aed)
      b.saleRevenue = num(row.sale_revenue_aed)
      b.rentRevenue = num(row.rent_revenue_aed)
      b.listings = num(row.listings)
      b.viewings = num(row.viewings)
      b.fromManual = true
      b.fromDeals = false
      map.set(row.agent_id, b)
      continue
    }

    existing.fromManual = true
    existing.agentName = row.agent_name || existing.agentName
    existing.saleDeals += num(row.sale_deals)
    existing.rentDeals += num(row.rent_deals)
    existing.saleCommission += num(row.sale_commission_aed)
    existing.rentCommission += num(row.rent_commission_aed)
    existing.saleRevenue += num(row.sale_revenue_aed)
    existing.rentRevenue += num(row.rent_revenue_aed)
    existing.listings += num(row.listings)
    existing.viewings += num(row.viewings)
  }
}

export function summarizeBuckets(agents: AgentBucket[]) {
  return agents.reduce(
    (acc, a) => {
      acc.saleDeals += a.saleDeals
      acc.rentDeals += a.rentDeals
      acc.deals += a.saleDeals + a.rentDeals
      acc.saleCommission += a.saleCommission
      acc.rentCommission += a.rentCommission
      acc.commission += a.saleCommission + a.rentCommission
      acc.saleRevenue += a.saleRevenue
      acc.rentRevenue += a.rentRevenue
      acc.revenue += a.saleRevenue + a.rentRevenue
      return acc
    },
    {
      deals: 0,
      saleDeals: 0,
      rentDeals: 0,
      commission: 0,
      saleCommission: 0,
      rentCommission: 0,
      revenue: 0,
      saleRevenue: 0,
      rentRevenue: 0,
    }
  )
}

export async function loadAppUsers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("app_users")
    .select("id, email, full_name, role, status")
    .eq("status", "active")
    .order("full_name")

  if (error) throw new Error(error.message)
  return data || []
}

export async function buildPerformanceOverview(
  supabase: SupabaseClient,
  period: Period
) {
  const prev = previousPeriod(period)
  const [{ data: deals }, { data: manual }, { data: company }, { data: targets }, users] =
    await Promise.all([
      supabase.from("deals").select("agent_id, agent_name, deal_type, status, agreed_amount, gross_commission, closed_at, created_at"),
      supabase
        .from("agent_monthly_actuals")
        .select("*")
        .eq("year", period.year)
        .eq("month", period.month),
      supabase
        .from("company_kpi_standards")
        .select("*")
        .eq("year", period.year)
        .eq("month", period.month)
        .maybeSingle(),
      supabase
        .from("agent_kpi_targets")
        .select("*")
        .eq("year", period.year)
        .eq("month", period.month),
      loadAppUsers(supabase).catch(() => []),
    ])

  const { data: prevManual } = await supabase
    .from("agent_monthly_actuals")
    .select("*")
    .eq("year", prev.year)
    .eq("month", prev.month)

  const thisMap = rollupDeals((deals || []) as DealRow[], period)
  mergeManual(thisMap, (manual || []) as never[])

  const prevMap = rollupDeals((deals || []) as DealRow[], prev)
  mergeManual(prevMap, (prevManual || []) as never[])

  // Ensure every active agent appears
  for (const user of users) {
    if (user.role !== "admin" && user.role !== "agent") continue
    if (!thisMap.has(user.id)) {
      thisMap.set(user.id, emptyBucket(user.id, user.full_name || user.email))
    } else {
      const b = thisMap.get(user.id)!
      b.agentName = user.full_name || b.agentName
    }
  }

  const targetByAgent = new Map((targets || []).map((t) => [t.agent_id as string, t]))

  const agents = Array.from(thisMap.values())
    .map((a) => {
      const t = targetByAgent.get(a.agentId)
      const commission = a.saleCommission + a.rentCommission
      const dealsCount = a.saleDeals + a.rentDeals
      const personalTarget = num(t?.target_commission_aed)
      const companyShare = company ? num(company.target_commission_aed) / Math.max(1, users.filter((u) => u.role === "agent" || u.role === "admin").length) : 0
      const effectiveTarget = personalTarget > 0 ? personalTarget : companyShare
      return {
        ...a,
        deals: dealsCount,
        commission,
        revenue: a.saleRevenue + a.rentRevenue,
        personalTargets: t || null,
        targetCommission: effectiveTarget,
        targetPercent: effectiveTarget > 0 ? Math.round((commission / effectiveTarget) * 100) : 0,
      }
    })
    .sort((a, b) => b.commission - a.commission)
    .map((a, idx) => ({ ...a, rank: idx + 1 }))

  const thisSummary = summarizeBuckets(agents)
  const prevSummary = summarizeBuckets(Array.from(prevMap.values()))
  const revenueForecast = forecastMonthEnd(thisSummary.revenue, period)
  const commissionForecast = forecastMonthEnd(thisSummary.commission, period)

  return {
    period,
    previousPeriod: prev,
    companyStandards: company || null,
    company: {
      thisMonth: thisSummary,
      lastMonth: prevSummary,
      delta: {
        revenue: thisSummary.revenue - prevSummary.revenue,
        commission: thisSummary.commission - prevSummary.commission,
        deals: thisSummary.deals - prevSummary.deals,
        saleDeals: thisSummary.saleDeals - prevSummary.saleDeals,
        rentDeals: thisSummary.rentDeals - prevSummary.rentDeals,
      },
      forecast: {
        revenue: revenueForecast,
        commission: commissionForecast,
      },
      vsCompanyTarget: company
        ? {
            revenuePct:
              num(company.target_revenue_aed) > 0
                ? Math.round((thisSummary.revenue / num(company.target_revenue_aed)) * 100)
                : null,
            commissionPct:
              num(company.target_commission_aed) > 0
                ? Math.round((thisSummary.commission / num(company.target_commission_aed)) * 100)
                : null,
            dealsPct:
              num(company.target_deals) > 0
                ? Math.round((thisSummary.deals / num(company.target_deals)) * 100)
                : null,
          }
        : null,
    },
    agents,
  }
}
