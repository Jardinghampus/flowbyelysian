import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

// GET /api/areas - List all areas with stats
export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: areas, error } = await supabase
      .from("areas")
      .select(`
        *,
        area_market_data (*),
        listings (count),
        client_requests (count),
        agent_area_assignments (count)
      `)
      .order("name")

    if (error) throw error

    // Transform data to match frontend expectations
    const transformedAreas = areas?.map((area) => ({
      id: area.id,
      slug: area.slug,
      name: area.name,
      description: area.description,
      image: area.image,
      stats: {
        totalListings: area.listings?.[0]?.count || 0,
        activeAgents: area.agent_area_assignments?.[0]?.count || 0,
        avgPrice: area.area_market_data?.[0]?.avg_price_sqft || 0,
        totalDeals: area.area_market_data?.[0]?.total_transactions || 0,
        avgRentYield: area.area_market_data?.[0]?.avg_rent_yield || 0,
      },
      marketData: area.area_market_data?.[0] || null,
    }))

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

    const { data: area, error } = await supabase
      .from("areas")
      .insert({ name, slug, description, image })
      .select()
      .single()

    if (error) throw error

    // Create default market data entry
    await supabase.from("area_market_data").insert({
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
