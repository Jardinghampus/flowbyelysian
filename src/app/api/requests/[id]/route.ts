import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

// GET /api/requests/:id - Get single request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: clientRequest, error } = await (supabase as any)
      .from("client_requests")
      .select(`
        *,
        areas (name, slug)
      `)
      .eq("id", id)
      .single()

    if (error || !clientRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    return NextResponse.json({ request: clientRequest })
  } catch (error) {
    console.error("Error fetching request:", error)
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    )
  }
}

// PATCH /api/requests/:id - Update request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = createServerClient()

    // Check ownership or admin status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("client_requests")
      .select("agent_id")
      .eq("id", id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const isAdmin = user.publicMetadata?.role === "admin"

    if (existing.agent_id !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: clientRequest, error } = await (supabase as any)
      .from("client_requests")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ request: clientRequest })
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    )
  }
}

// DELETE /api/requests/:id - Delete request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerClient()

    // Check ownership or admin status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("client_requests")
      .select("agent_id")
      .eq("id", id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const isAdmin = user.publicMetadata?.role === "admin"

    if (existing.agent_id !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("client_requests")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting request:", error)
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    )
  }
}
