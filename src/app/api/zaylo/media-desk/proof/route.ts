import { NextResponse } from "next/server"
import { requireHampusUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

const TARGET_AED = 10_000_000

/** Hampus proof dashboard: volume vs AED 10M + funnel counts. */
export async function GET() {
  try {
    const guard = await requireHampusUser()
    if (!guard.ok) return guard.response

    const supabase = createUntypedServerClient()
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const iso = monthStart.toISOString()

    const [ops, shortlists, posted, deals] = await Promise.all([
      supabase
        .from("opportunities")
        .select("id, source, status, created_at, qualify_budget_aed")
        .gte("created_at", iso)
        .limit(500),
      supabase.from("media_shortlists").select("id, sent_at, created_at").gte("created_at", iso).limit(200),
      supabase
        .from("zaylo_social_posts")
        .select("id, posted_ig_at, posted_li_at, desk_status")
        .or(`posted_ig_at.gte.${iso},posted_li_at.gte.${iso}`)
        .limit(100),
      supabase
        .from("opportunities")
        .select("id, status, qualify_budget_aed, notes")
        .in("status", ["matched", "closed", "won"])
        .gte("created_at", iso)
        .limit(100),
    ])

    const inbound = (ops.data || []).filter((o) =>
      ["instagram_dm", "linkedin", "instagram_organic", "website"].includes(String(o.source || ""))
    )
    const volume = (deals.data || []).reduce((sum, d) => sum + (Number(d.qualify_budget_aed) || 0), 0)

    return NextResponse.json({
      targetAed: TARGET_AED,
      monthVolumeAed: volume,
      progressPct: Math.min(100, Math.round((volume / TARGET_AED) * 100)),
      inboundLeads: inbound.length,
      shortlistsCreated: (shortlists.data || []).length,
      shortlistsSent: (shortlists.data || []).filter((s) => s.sent_at).length,
      postsIg: (posted.data || []).filter((p) => p.posted_ig_at).length,
      postsLi: (posted.data || []).filter((p) => p.posted_li_at).length,
      closedDeals: (deals.data || []).length,
      monthStart: iso,
    })
  } catch (error) {
    console.error("proof dashboard failed:", error)
    return NextResponse.json({
      targetAed: TARGET_AED,
      monthVolumeAed: 0,
      progressPct: 0,
      inboundLeads: 0,
      shortlistsCreated: 0,
      shortlistsSent: 0,
      postsIg: 0,
      postsLi: 0,
      closedDeals: 0,
    })
  }
}
