import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@/lib/demo-auth"
import type { Database } from "@/lib/types/database.types"

// Type definitions for query results
type AreaRow = Database["public"]["Tables"]["areas"]["Row"]
type AreaUpdate = Database["public"]["Tables"]["areas"]["Update"]
type MarketDataRow = { avg_price_sqft: number | null; total_transactions: number | null; avg_rent_yield: number | null }
type ListingRow = { id: string; owner_id: string; [key: string]: unknown }
type RequestRow = { id: string; [key: string]: unknown }
type AssignmentRow = { agent_id: string; is_primary: boolean }
type ContactRow = { clerk_user_id: string | null; name: string; role: string | null; avatar_url: string | null; phone: string | null; whatsapp: string | null; email: string | null }
type PerformanceRow = { agent_id: string; deals_count: number; commission_earned: number }

// GET /api/areas/:slug - Get area details with listings, agents, requests
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createServerClient()

    // Get area
    const { data: areaData, error: areaError } = await supabase
      .from("areas")
      .select("*")
      .eq("slug", slug)
      .single()

    if (areaError || !areaData) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 })
    }

    const area = areaData as AreaRow
    const areaId = area.id

    // Get market data for this area
    const { data: marketDataRaw } = await supabase
      .from("area_market_data")
      .select("*")
      .eq("area_id", areaId)
      .single()
    const marketData = marketDataRaw as MarketDataRow | null

    // Get listings for this area
    const { data: listingsRaw } = await supabase
      .from("listings")
      .select("*")
      .eq("area_id", areaId)
      .order("created_at", { ascending: false })
    const listings = (listingsRaw || []) as ListingRow[]

    // Get client requests for this area
    const { data: requestsRaw } = await supabase
      .from("client_requests")
      .select("*")
      .eq("area_id", areaId)
      .order("created_at", { ascending: false })
    const requests = (requestsRaw || []) as RequestRow[]

    // Get agents assigned to this area
    const { data: agentAssignmentsRaw } = await supabase
      .from("agent_area_assignments")
      .select("*")
      .eq("area_id", areaId)
    const agentAssignments = (agentAssignmentsRaw || []) as AssignmentRow[]

    // Get contacts for the assigned agents
    const agentIds = agentAssignments.map((a) => a.agent_id)

    const { data: contactsRaw } = await supabase
      .from("contacts")
      .select("*")
      .in("clerk_user_id", agentIds.length > 0 ? agentIds : [""])
    const contacts = (contactsRaw || []) as ContactRow[]

    // Get agent performance data
    const { data: performanceRaw } = await supabase
      .from("agent_performance")
      .select("*")
      .in("agent_id", agentIds.length > 0 ? agentIds : [""])
    const performance = (performanceRaw || []) as PerformanceRow[]

    // Transform agents data
    const agents = agentAssignments.map((assignment) => {
      const perf = performance.find((p) => p.agent_id === assignment.agent_id)
      const contact = contacts.find((c) => c.clerk_user_id === assignment.agent_id)
      return {
        id: assignment.agent_id,
        name: contact?.name || "Unknown",
        role: contact?.role || "Sales",
        avatar: contact?.avatar_url,
        phone: contact?.phone || contact?.whatsapp || "",
        email: contact?.email || "",
        deals: perf?.deals_count || 0,
        commission: perf?.commission_earned || 0,
        listings: listings.filter((l) => l.owner_id === assignment.agent_id).length,
      }
    })

    // Calculate stats
    const stats = {
      totalListings: listings.length,
      activeAgents: agents.length,
      avgPrice: marketData?.avg_price_sqft || 0,
      totalDeals: marketData?.total_transactions || 0,
      avgRentYield: marketData?.avg_rent_yield || 0,
    }

    return NextResponse.json({
      area: {
        id: areaId,
        slug: area.slug,
        name: area.name,
        description: area.description,
        image: area.image,
        stats,
        marketData: marketData || null,
        agents,
        listings,
        requests,
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
    const body = await request.json() as AreaUpdate
    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: areaData, error } = await (supabase as any)
      .from("areas")
      .update(body)
      .eq("slug", slug)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ area: areaData })
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("areas").delete().eq("slug", slug)

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
