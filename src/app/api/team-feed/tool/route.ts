import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { isHampusEmail } from "@/lib/hampus-access"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { emitToolFeedEvent, type FeedEventType } from "@/lib/listings/feed"

const TOOL_TYPES = new Set<FeedEventType>([
  "tool_description",
  "tool_deal",
  "tool_training",
  "tool_areas",
  "tool_lookup",
  "tool_performance",
])

export async function POST(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  if (!isHampusEmail(guard.context.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const eventType = body.eventType as FeedEventType
  const title = String(body.title || "").trim()
  const areaName = String(body.areaName || "").trim()

  if (!TOOL_TYPES.has(eventType) || !title) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const supabase = createUntypedServerClient()
  await emitToolFeedEvent(supabase, {
    actorId: guard.context.userId,
    actorName: guard.context.fullName || "Hampus",
    eventType: eventType as Extract<FeedEventType, `tool_${string}`>,
    title,
    areaName,
  })

  return NextResponse.json({ ok: true })
}
