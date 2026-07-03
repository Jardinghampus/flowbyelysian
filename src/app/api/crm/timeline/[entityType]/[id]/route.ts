import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

function toNumber(value: string | null, fallback: number, max: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(parsed, max)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; id: string }> }
) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { entityType, id } = await params
  const { searchParams } = new URL(request.url)
  const limit = toNumber(searchParams.get("limit"), 100, 300)

  const supabase = createUntypedServerClient()
  const { data, error } = await supabase
    .from("crm_activity_events")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", id)
    .order("occurred_at", { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entityType, entityId: id, events: data || [], limit })
}

