import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { buildKpiBoard, loadActiveAgents } from "@/lib/kpi/aggregate"
import { weekStartMonday, type KpiPeriodKey } from "@/lib/kpi/periods"

const PERIODS = new Set<KpiPeriodKey>(["week", "30d", "60d", "90d", "ytd"])

function n(v: unknown, fallback = 0) {
  const x = Number(v)
  return Number.isFinite(x) && x >= 0 ? x : fallback
}

function toMondayIso(input?: string | null) {
  if (input) {
    const d = new Date(input + "T12:00:00")
    if (!Number.isNaN(d.getTime())) {
      return weekStartMonday(d).toISOString().slice(0, 10)
    }
  }
  return weekStartMonday().toISOString().slice(0, 10)
}

/** Team KPI board for office dashboard. */
export async function GET(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const period = (searchParams.get("period") || "week") as KpiPeriodKey
  if (!PERIODS.has(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 })
  }

  try {
    const supabase = createUntypedServerClient()
    const board = await buildKpiBoard(supabase, period)

    const weekStart = searchParams.get("week_start")
      ? toMondayIso(searchParams.get("week_start"))
      : board.weekStart

    const { data: myWeek } = await supabase
      .from("agent_weekly_kpis")
      .select("*")
      .eq("agent_id", guard.context.userId)
      .eq("week_start", weekStart)
      .maybeSingle()

    return NextResponse.json({
      ...board,
      myWeek: myWeek || {
        agent_id: guard.context.userId,
        agent_name: guard.context.fullName || "",
        week_start: weekStart,
        total_listings: 0,
        new_listings: 0,
        offers: 0,
        viewings: 0,
        notes: "",
      },
      editWeekStart: weekStart,
    })
  } catch (error) {
    console.error("kpi board", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load KPI" },
      { status: 500 }
    )
  }
}

/** Agent (or admin) upserts weekly KPI for Mon–Sun week. */
export async function PUT(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const body = await request.json()
  const weekStart = toMondayIso(body.week_start || body.weekStart)
  let agentId = String(body.agent_id || body.agentId || guard.context.userId).trim()
  let agentName = String(body.agent_name || body.agentName || guard.context.fullName || "").trim()

  if (agentId !== guard.context.userId && guard.context.role !== "admin") {
    return NextResponse.json({ error: "Only admins can edit other agents" }, { status: 403 })
  }

  try {
    const supabase = createUntypedServerClient()

    if (guard.context.role === "admin" && agentId !== guard.context.userId) {
      const users = await loadActiveAgents(supabase)
      const match = users.find((u) => u.id === agentId)
      if (!match) return NextResponse.json({ error: "Unknown agent" }, { status: 404 })
      agentName = match.full_name || match.email
    }

    const row = {
      agent_id: agentId,
      agent_name: agentName || "Agent",
      week_start: weekStart,
      total_listings: n(body.total_listings ?? body.totalListings),
      new_listings: n(body.new_listings ?? body.newListings),
      offers: n(body.offers),
      viewings: n(body.viewings),
      notes: String(body.notes || ""),
      updated_by: guard.context.userId,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("agent_weekly_kpis")
      .upsert(row, { onConflict: "agent_id,week_start" })
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json({ entry: data })
  } catch (error) {
    console.error("kpi upsert", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save KPI" },
      { status: 500 }
    )
  }
}
