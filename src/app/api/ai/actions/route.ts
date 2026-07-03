import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

const updateActionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected", "cancelled"]),
  error: z.string().max(2000).optional(),
})

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
  const status = searchParams.get("status")
  const riskLevel = searchParams.get("riskLevel")

  const supabase = createUntypedServerClient()
  let query = supabase
    .from("ai_actions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq("status", status)
  if (riskLevel) query = query.eq("risk_level", riskLevel)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ actions: data || [], total: count || 0, limit, offset })
}

export async function PATCH(request: NextRequest) {
  const guard = await requireApiUser({ roles: ["admin", "manager"] })
  if (!guard.ok) return guard.response

  const parsed = updateActionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid AI action payload", issues: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createUntypedServerClient()
  const { data, error } = await supabase
    .from("ai_actions")
    .update({
      status: parsed.data.status,
      approved_by: parsed.data.status === "approved" ? guard.context.userId : null,
      error: parsed.data.error || null,
    })
    .eq("id", parsed.data.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ action: data })
}

