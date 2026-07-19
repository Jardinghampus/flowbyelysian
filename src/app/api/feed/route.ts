import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { getAgentProfilesByUserIds } from "@/lib/user-profile"

export async function GET(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100)

  const supabase = createUntypedServerClient()
  const { data, error } = await supabase
    .from("team_feed_events")
    .select(
      `
      *,
      listings (
        bathrooms,
        size,
        notes,
        owner_name,
        sub_area,
        availability
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message, events: [] }, { status: 500 })
  }

  const events = data || []
  const profiles = await getAgentProfilesByUserIds(events.map((event) => String(event.actor_id)))

  return NextResponse.json({
    events: events.map((event) => ({
      ...event,
      agent_profile: profiles.get(String(event.actor_id)) || null,
    })),
  })
}
