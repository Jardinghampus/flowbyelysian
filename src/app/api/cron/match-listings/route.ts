import { NextRequest, NextResponse } from "next/server"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { findMatches, summarizeMatchesWithOpenAI, type MatchListing } from "@/lib/listings/match-sync"

export const runtime = "nodejs"
export const maxDuration = 60

function authorizeCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== "production"
  const auth = request.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createUntypedServerClient()
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, area_name, type, status, inquiry_type, transaction_type, price, bedrooms, size, owner_id, owner_name"
    )
    .in("status", ["live", "pocket"])
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const listings = (data || []) as MatchListing[]
  const matches = findMatches(listings, 50)
  const summaries = await summarizeMatchesWithOpenAI(matches, process.env.OPENAI_API_KEY || "")

  const now = new Date().toISOString()
  let upserted = 0

  for (const match of matches) {
    const key = `${match.stock.id}:${match.request.id}`
    const { error: upErr } = await supabase.from("listing_matches").upsert(
      {
        stock_listing_id: match.stock.id,
        request_listing_id: match.request.id,
        score: match.score,
        reasons: match.reasons,
        ai_summary: summaries.get(key) || match.reasons.slice(0, 2).join(" · "),
        model: summaries.has(key) ? "gpt-4o-mini" : "heuristic",
        run_at: now,
      },
      { onConflict: "stock_listing_id,request_listing_id" }
    )
    if (!upErr) upserted += 1
  }

  return NextResponse.json({
    ok: true,
    scanned: listings.length,
    matches: matches.length,
    upserted,
    model: process.env.OPENAI_API_KEY ? "gpt-4o-mini+heuristic" : "heuristic",
    runAt: now,
  })
}
