import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireApiUser } from "@/lib/api/guards"
import { getDefaultTeamId } from "@/lib/api/team"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

const createActivitySchema = z.object({
  entityType: z.string().min(1).max(80),
  entityId: z.string().min(1).max(160),
  eventType: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  body: z.string().max(4000).optional(),
  source: z.string().min(1).max(80).default("api"),
  visibility: z.enum(["private", "team", "admin"]).default("team"),
  payload: z.record(z.string(), z.unknown()).default({}),
})

function toNumber(value: string | null, fallback: number, max: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(parsed, max)
}

export async function GET(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const supabase = createUntypedServerClient()
  const { searchParams } = new URL(request.url)
  const limit = toNumber(searchParams.get("limit"), 50, 200)
  const offset = toNumber(searchParams.get("offset"), 0, 10000)
  const entityType = searchParams.get("entityType")
  const entityId = searchParams.get("entityId")
  const eventType = searchParams.get("eventType")

  let query = supabase
    .from("crm_activity_events")
    .select("*", { count: "exact" })
    .order("occurred_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (entityType) query = query.eq("entity_type", entityType)
  if (entityId) query = query.eq("entity_id", entityId)
  if (eventType) query = query.eq("event_type", eventType)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events: data || [], total: count || 0, limit, offset })
}

export async function POST(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const parsed = createActivitySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid activity payload", issues: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createUntypedServerClient()
  const teamId = await getDefaultTeamId(supabase)

  const { data, error } = await supabase
    .from("crm_activity_events")
    .insert({
      team_id: teamId,
      actor_user_id: guard.context.userId,
      actor_name: guard.context.isDemo ? "Demo User" : null,
      entity_type: parsed.data.entityType,
      entity_id: parsed.data.entityId,
      event_type: parsed.data.eventType,
      title: parsed.data.title,
      body: parsed.data.body || null,
      source: parsed.data.source,
      visibility: parsed.data.visibility,
      payload: parsed.data.payload,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ event: data }, { status: 201 })
}

