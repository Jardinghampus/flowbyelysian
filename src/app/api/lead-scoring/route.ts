import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createServerClient } from "@/lib/supabase/server"
import { scoreLeadConversion, rankLeads, type LeadScoreInput } from "@/lib/lead-scoring"

/**
 * GET /api/lead-scoring
 * Score and rank all active opportunities by conversion likelihood.
 *
 * Query params:
 *   - agentId: filter by assigned agent
 *   - tier: filter by score tier (hot, warm, cold)
 *   - limit: max results (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const agentId = searchParams.get("agentId")
    const tierFilter = searchParams.get("tier")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Fetch active opportunities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("opportunities")
      .select("*")
      .not("status", "in", '("closed","cancelled")')
      .order("created_at", { ascending: false })
      .limit(200)

    if (agentId) query = query.eq("assigned_agent_id", agentId)

    const { data: opportunities, error } = await query

    if (error) throw error

    if (!opportunities || opportunities.length === 0) {
      return NextResponse.json({ leads: [], summary: { total: 0, hot: 0, warm: 0, cold: 0 } })
    }

    // Convert to scoring format
    const inputs: LeadScoreInput[] = opportunities.map((opp: Record<string, unknown>) => ({
      type: opp.type as LeadScoreInput["type"],
      status: opp.status as string,
      fullName: opp.full_name as string,
      email: opp.email as string | null,
      phone: opp.phone as string | null,
      whatsapp: opp.whatsapp as string | null,
      preferredContact: opp.preferred_contact as string | null,
      area: opp.area as string | null,
      propertyType: opp.property_type as string | null,
      bedrooms: opp.bedrooms as number | null,
      size: opp.size as number | null,
      price: opp.price as number | null,
      minPrice: opp.min_price as number | null,
      maxPrice: opp.max_price as number | null,
      features: (opp.features as string[]) || [],
      notes: opp.notes as string | null,
      marketComparisonPct: opp.market_comparison_pct as number | null,
      createdAt: opp.created_at as string,
      updatedAt: opp.updated_at as string,
    }))

    // Score and rank
    let scored = rankLeads(inputs)

    // Filter by tier if requested
    if (tierFilter) {
      scored = scored.filter(s => s.leadScore.tier === tierFilter)
    }

    // Apply limit
    const limited = scored.slice(0, limit)

    // Summary stats
    const summary = {
      total: scored.length,
      hot: scored.filter(s => s.leadScore.tier === "hot").length,
      warm: scored.filter(s => s.leadScore.tier === "warm").length,
      cold: scored.filter(s => s.leadScore.tier === "cold").length,
      avgScore: Math.round(scored.reduce((sum, s) => sum + s.leadScore.score, 0) / scored.length),
    }

    return NextResponse.json({
      leads: limited.map(s => ({
        fullName: s.fullName,
        area: s.area,
        propertyType: s.propertyType,
        type: s.type,
        status: s.status,
        score: s.leadScore.score,
        tier: s.leadScore.tier,
        breakdown: s.leadScore.breakdown,
        insights: s.leadScore.insights,
      })),
      summary,
    })
  } catch (error) {
    console.error("Error scoring leads:", error)
    return NextResponse.json({ error: "Failed to score leads" }, { status: 500 })
  }
}

/**
 * POST /api/lead-scoring
 * Score a single opportunity on-the-fly (e.g. when a new lead is submitted).
 */
export async function POST(request: NextRequest) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const body = await request.json()

    const input: LeadScoreInput = {
      type: body.type || "buy",
      status: body.status || "new",
      fullName: body.full_name || body.fullName || "",
      email: body.email || null,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      preferredContact: body.preferred_contact || body.preferredContact || null,
      area: body.area || null,
      propertyType: body.property_type || body.propertyType || null,
      bedrooms: body.bedrooms || null,
      size: body.size || null,
      price: body.price || null,
      minPrice: body.min_price || body.minPrice || null,
      maxPrice: body.max_price || body.maxPrice || null,
      features: body.features || [],
      notes: body.notes || null,
      marketComparisonPct: body.market_comparison_pct || body.marketComparisonPct || null,
      createdAt: body.created_at || body.createdAt || new Date().toISOString(),
      updatedAt: body.updated_at || body.updatedAt || new Date().toISOString(),
    }

    const result = scoreLeadConversion(input)

    return NextResponse.json({ leadScore: result })
  } catch (error) {
    console.error("Error scoring lead:", error)
    return NextResponse.json({ error: "Failed to score lead" }, { status: 500 })
  }
}
