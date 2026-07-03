import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

function toNumber(value: string | null, fallback: number, max: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(parsed, max)
}

export async function GET(request: NextRequest) {
  const guard = await requireApiUser({ roles: ["admin", "manager", "operator"] })
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const limit = toNumber(searchParams.get("limit"), 50, 200)
  const offset = toNumber(searchParams.get("offset"), 0, 10000)
  const feature = searchParams.get("feature")
  const status = searchParams.get("status")
  const entityType = searchParams.get("entityType")
  const entityId = searchParams.get("entityId")

  const supabase = createUntypedServerClient()
  let query = supabase
    .from("ai_runs")
    .select("*, ai_cost_ledger(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (feature) query = query.eq("feature", feature)
  if (status) query = query.eq("status", status)
  if (entityType) query = query.eq("entity_type", entityType)
  if (entityId) query = query.eq("entity_id", entityId)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ runs: data || [], total: count || 0, limit, offset })
}

