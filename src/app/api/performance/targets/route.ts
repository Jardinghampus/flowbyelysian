import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { currentPeriod } from "@/lib/performance/aggregate"

function n(v: unknown, fallback = 0) {
  const x = Number(v)
  return Number.isFinite(x) ? x : fallback
}

export async function GET(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const now = currentPeriod()
  const year = Number(searchParams.get("year") || now.year)
  const month = Number(searchParams.get("month") || now.month)
  const agentId =
    guard.context.role === "admin"
      ? searchParams.get("agentId") || guard.context.userId
      : guard.context.userId

  const supabase = createUntypedServerClient()
  const [{ data: personal }, { data: company }] = await Promise.all([
    supabase
      .from("agent_kpi_targets")
      .select("*")
      .eq("agent_id", agentId)
      .eq("year", year)
      .eq("month", month)
      .maybeSingle(),
    supabase
      .from("company_kpi_standards")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .maybeSingle(),
  ])

  return NextResponse.json({ personal, company, year, month, agentId })
}

export async function PUT(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const body = await request.json()
  const scope = body.scope === "company" ? "company" : "personal"
  const now = currentPeriod()
  const year = n(body.year, now.year)
  const month = n(body.month, now.month)

  if (scope === "company" && guard.context.role !== "admin") {
    return NextResponse.json({ error: "Only admin can set company KPIs" }, { status: 403 })
  }

  const supabase = createUntypedServerClient()

  if (scope === "company") {
    const row = {
      year,
      month,
      target_deals: n(body.target_deals),
      target_sale_deals: n(body.target_sale_deals),
      target_rent_deals: n(body.target_rent_deals),
      target_commission_aed: n(body.target_commission_aed),
      target_sale_commission_aed: n(body.target_sale_commission_aed),
      target_rent_commission_aed: n(body.target_rent_commission_aed),
      target_revenue_aed: n(body.target_revenue_aed),
      target_listings: n(body.target_listings),
      target_viewings: n(body.target_viewings),
      notes: String(body.notes || ""),
      updated_by: guard.context.userId,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("company_kpi_standards")
      .upsert(row, { onConflict: "year,month" })
      .select("*")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ company: data })
  }

  const agentId =
    guard.context.role === "admin" && body.agentId ? String(body.agentId) : guard.context.userId

  const row = {
    agent_id: agentId,
    year,
    month,
    target_deals: n(body.target_deals),
    target_sale_deals: n(body.target_sale_deals),
    target_rent_deals: n(body.target_rent_deals),
    target_commission_aed: n(body.target_commission_aed),
    target_sale_commission_aed: n(body.target_sale_commission_aed),
    target_rent_commission_aed: n(body.target_rent_commission_aed),
    target_listings: n(body.target_listings),
    target_viewings: n(body.target_viewings),
    custom_kpis: body.custom_kpis || {},
    updated_by: guard.context.userId,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("agent_kpi_targets")
    .upsert(row, { onConflict: "agent_id,year,month" })
    .select("*")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ personal: data })
}
