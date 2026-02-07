import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

// Type definitions
type AreaRow = { id: string; slug: string; name: string; description: string | null; image: string | null }
type MarketDataRow = { area_id: string; avg_price_sqft: number | null; total_transactions: number | null; avg_rent_yield: number | null }
type ListingCountRow = { area_id: string }
type AgentCountRow = { area_id: string }

// GET /api/areas - List all areas with stats
export async function GET() {
  try {
    const supabase = createServerClient()

    // Get areas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: areasRaw, error: areasError } = await (supabase as any)
      .from("areas")
      .select("*")
      .order("name")

    if (areasError) throw areasError

    const areas = (areasRaw || []) as AreaRow[]

    // Get market data for all areas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: marketDataRaw } = await (supabase as any)
      .from("area_market_data")
      .select("*")
    const marketData = (marketDataRaw || []) as MarketDataRow[]

    // Get listing counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listingCountsRaw } = await (supabase as any)
      .from("listings")
      .select("area_id")
    const listingCounts = (listingCountsRaw || []) as ListingCountRow[]

    // Get agent counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: agentCountsRaw } = await (supabase as any)
      .from("agent_area_assignments")
      .select("area_id")
    const agentCounts = (agentCountsRaw || []) as AgentCountRow[]

    // Transform data to match frontend expectations
    const transformedAreas = areas.map((area) => {
      const areaMarketData = marketData.find((m) => m.area_id === area.id)
      const listingsCount = listingCounts.filter((l) => l.area_id === area.id).length
      const agentsCount = agentCounts.filter((a) => a.area_id === area.id).length

      return {
        id: area.id,
        slug: area.slug,
        name: area.name,
        description: area.description,
        image: area.image,
        stats: {
          totalListings: listingsCount,
          activeAgents: agentsCount,
          avgPrice: areaMarketData?.avg_price_sqft || 0,
          totalDeals: areaMarketData?.total_transactions || 0,
          avgRentYield: areaMarketData?.avg_rent_yield || 0,
        },
        marketData: areaMarketData || null,
      }
    })

    return NextResponse.json({ areas: transformedAreas })
  } catch (error) {
    console.error("Error fetching areas:", error)
    return NextResponse.json(
      { error: "Failed to fetch areas" },
      { status: 500 }
    )
  }
}

// POST /api/areas - Create new area (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, image } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: areaRaw, error } = await (supabase as any)
      .from("areas")
      .insert({ name, slug, description, image })
      .select()
      .single()

    if (error) throw error

    const area = areaRaw as AreaRow

    // Create default market data entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("area_market_data").insert({
      area_id: area.id,
      avg_price_sqft: 0,
      avg_price_sqft_change: 0,
      total_transactions: 0,
      transactions_change: 0,
      avg_days_on_market: 0,
      days_on_market_change: 0,
      avg_rent_yield: 0,
    })

    return NextResponse.json({ area }, { status: 201 })
  } catch (error) {
    console.error("Error creating area:", error)
    return NextResponse.json(
      { error: "Failed to create area" },
      { status: 500 }
    )
  }
}
