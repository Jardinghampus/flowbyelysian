import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth, currentUser } from "@/lib/demo-auth"

// GET /api/requests - List all client requests
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get("status")
    const areaId = searchParams.get("areaId")
    const agentId = searchParams.get("agentId")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("client_requests")
      .select(`
        *,
        areas (name, slug)
      `)
      .order("created_at", { ascending: false })

    if (status) query = query.eq("status", status)
    if (areaId) query = query.eq("area_id", areaId)
    if (agentId) query = query.eq("agent_id", agentId)

    const { data: requests, error } = await query

    if (error) throw error

    return NextResponse.json({ requests: requests || [] })
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    )
  }
}

// POST /api/requests - Create new client request
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const body = await request.json()
    const supabase = createServerClient()

    const requestData = {
      ...body,
      agent_id: userId,
      agent_name: user?.fullName || user?.firstName || "Unknown",
      status: body.status || "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: clientRequest, error } = await (supabase as any)
      .from("client_requests")
      .insert(requestData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ request: clientRequest }, { status: 201 })
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    )
  }
}
