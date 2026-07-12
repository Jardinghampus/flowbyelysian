import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

/**
 * Calendar feed: upcoming listing viewings across the team (or mine).
 * GET /api/calendar/viewings?from=&to=&mine=1
 */
export async function GET(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const mine = searchParams.get("mine") === "1"
  const supabase = createUntypedServerClient()

  let query = supabase
    .from("listing_viewings")
    .select("*, listings(id, title, area_name, status, owner_name)")
    .order("viewing_date", { ascending: true })
    .limit(200)

  if (mine || guard.context.role === "agent") {
    query = query.eq("agent_id", guard.context.userId)
  }
  if (from) query = query.gte("viewing_date", from)
  if (to) query = query.lte("viewing_date", to)

  const { data, error } = await query
  if (error) {
    console.error("calendar viewings", error)
    return NextResponse.json({ events: [], warning: error.message })
  }

  const events = (data || []).map((row: Record<string, unknown>) => {
    const listing = row.listings as Record<string, unknown> | null
    return {
      id: row.id,
      type: "viewing" as const,
      title: `Viewing: ${listing?.title || row.viewer_name}`,
      date: row.viewing_date,
      status: row.status,
      viewerName: row.viewer_name,
      listingId: row.listing_id,
      listingTitle: listing?.title || null,
      area: listing?.area_name || null,
      agentName: row.agent_name,
      feedback: row.feedback,
      rating: row.rating,
    }
  })

  return NextResponse.json({ events })
}
