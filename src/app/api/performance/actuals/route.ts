import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { currentPeriod } from "@/lib/performance/aggregate"

function n(v: unknown, fallback = 0) {
  const x = Number(v)
  return Number.isFinite(x) ? x : fallback
}

/** Admin enters/adjusts monthly performance actuals per agent. */
export async function GET(request: NextRequest) {
  const guard = await requireApiUser({ roles: ["admin"] })
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const now = currentPeriod()
  const year = Number(searchParams.get("year") || now.year)
  const month = Number(searchParams.get("month") || now.month)

  const supabase = createUntypedServerClient()
  const { data, error } = await supabase
    .from("agent_monthly_actuals")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .order("agent_name")

  if (error) return NextResponse.json({ error: error.message, actuals: [] }, { status: 500 })
  return NextResponse.json({ actuals: data || [], year, month })
}

export async function PUT(request: NextRequest) {
  const guard = await requireApiUser({ roles: ["admin"] })
  if (!guard.ok) return guard.response

  const body = await request.json()
  const now = currentPeriod()
  const year = n(body.year, now.year)
  const month = n(body.month, now.month)
  const agentId = String(body.agentId || "").trim()
  if (!agentId) return NextResponse.json({ error: "agentId required" }, { status: 400 })

  const supabase = createUntypedServerClient()
  const row = {
    agent_id: agentId,
    agent_name: String(body.agentName || ""),
    year,
    month,
    sale_deals: n(body.sale_deals),
    rent_deals: n(body.rent_deals),
    sale_commission_aed: n(body.sale_commission_aed),
    rent_commission_aed: n(body.rent_commission_aed),
    sale_revenue_aed: n(body.sale_revenue_aed),
    rent_revenue_aed: n(body.rent_revenue_aed),
    listings: n(body.listings),
    viewings: n(body.viewings),
    notes: String(body.notes || ""),
    include_deals_rollup: body.include_deals_rollup !== false,
    updated_by: guard.context.userId,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("agent_monthly_actuals")
    .upsert(row, { onConflict: "agent_id,year,month" })
    .select("*")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ actual: data })
}
