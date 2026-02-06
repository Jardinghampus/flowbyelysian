import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

// GET /api/areas/:slug - Get area details with listings, agents, requests
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createServerClient()

    // Get area with market data
    const { data: area, error: areaError } = await supabase
      .from("areas")
      .select(`
        *,
        area_market_data (*)
      `)
      .eq("slug", slug)
      .single()

    if (areaError || !area) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 })
    }

    // Get listings for this area
    const { data: listings } = await supabase
      .from("listings")
      .select("*")
      .eq("area_id", area.id)
      .order("created_at", { ascending: false })

    // Get client requests for this area
    const { data: requests } = await supabase
      .from("client_requests")
      .select("*")
      .eq("area_id", area.id)
      .order("created_at", { ascending: false })

    // Get agents assigned to this area
    const { data: agentAssignments } = await supabase
      .from("agent_area_assignments")
      .select(`
        *,
        contacts (*)
      `)
      .eq("area_id", area.id)

    // Get agent performance data
    const agentIds = agentAssignments?.map((a) => a.agent_id) || []
    const { data: performance } = await supabase
      .from("agent_performance")
      .select("*")
      .in("agent_id", agentIds)

    // Transform agents data
    const agents = agentAssignments?.map((assignment) => {
      const perf = performance?.find((p) => p.agent_id === assignment.agent_id)
      const contact = assignment.contacts
      return {
        id: assignment.agent_id,
        name: contact?.name || "Unknown",
        role: contact?.role || "Sales",
        avatar: contact?.avatar_url,
        phone: contact?.phone || contact?.whatsapp || "",
        email: contact?.email || "",
        deals: perf?.deals_count || 0,
        commission: perf?.commission_earned || 0,
        listings: listings?.filter((l) => l.owner_id === assignment.agent_id).length || 0,
      }
    })

    // Calculate stats
    const stats = {
      totalListings: listings?.length || 0,
      activeAgents: agents?.length || 0,
      avgPrice: area.area_market_data?.[0]?.avg_price_sqft || 0,
      totalDeals: area.area_market_data?.[0]?.total_transactions || 0,
      avgRentYield: area.area_market_data?.[0]?.avg_rent_yield || 0,
    }

    return NextResponse.json({
      area: {
        id: area.id,
        slug: area.slug,
        name: area.name,
        description: area.description,
        image: area.image,
        stats,
        marketData: area.area_market_data?.[0] || null,
        agents: agents || [],
        listings: listings || [],
        requests: requests || [],
      },
    })
  } catch (error) {
    console.error("Error fetching area:", error)
    return NextResponse.json(
      { error: "Failed to fetch area" },
      { status: 500 }
    )
  }
}

// PATCH /api/areas/:slug - Update area (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const supabase = createServerClient()

    const { data: area, error } = await supabase
      .from("areas")
      .update(body)
      .eq("slug", slug)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ area })
  } catch (error) {
    console.error("Error updating area:", error)
    return NextResponse.json(
      { error: "Failed to update area" },
      { status: 500 }
    )
  }
}

// DELETE /api/areas/:slug - Delete area (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const supabase = createServerClient()

    const { error } = await supabase.from("areas").delete().eq("slug", slug)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting area:", error)
    return NextResponse.json(
      { error: "Failed to delete area" },
      { status: 500 }
    )
  }
}
