import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@/lib/demo-auth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SC = any

// GET /api/areas/assignments - Get all agent-area assignments
export async function GET(request: NextRequest) {
  try {
    const supabase: SC = createServerClient()
    const { searchParams } = new URL(request.url)
    const areaId = searchParams.get("areaId")
    const agentId = searchParams.get("agentId")

    let query = supabase
      .from("agent_area_assignments")
      .select("*, areas(id, name, slug)")
      .order("created_at", { ascending: false })

    if (areaId) query = query.eq("area_id", areaId)
    if (agentId) query = query.eq("agent_id", agentId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ assignments: data || [] })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

// POST /api/areas/assignments - Assign agent to area
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase: SC = createServerClient()
    const body = await request.json()
    const { agent_id, area_id, is_primary } = body

    if (!agent_id || !area_id) {
      return NextResponse.json({ error: "agent_id and area_id are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("agent_area_assignments")
      .upsert({ agent_id, area_id, is_primary: is_primary || false }, { onConflict: "agent_id,area_id" })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ assignment: data }, { status: 201 })
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}

// DELETE /api/areas/assignments - Remove agent from area
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase: SC = createServerClient()
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")
    const areaId = searchParams.get("areaId")

    if (!agentId || !areaId) {
      return NextResponse.json({ error: "agentId and areaId are required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("agent_area_assignments")
      .delete()
      .eq("agent_id", agentId)
      .eq("area_id", areaId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 })
  }
}
