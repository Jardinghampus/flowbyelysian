import { NextResponse } from "next/server"
import { auth, currentUser } from "@/lib/demo-auth"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { emitActivityEvent } from "@/lib/audit/events"

// GET /api/listings/:id/viewings
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: listingId } = await params
    const supabase = createUntypedServerClient()

    const { data, error } = await supabase
      .from("listing_viewings")
      .select("*")
      .eq("listing_id", listingId)
      .order("viewing_date", { ascending: false })

    if (error) throw error

    return NextResponse.json({ viewings: data || [] })
  } catch (error) {
    console.error("Error fetching viewings:", error)
    return NextResponse.json(
      { error: "Failed to fetch viewings" },
      { status: 500 }
    )
  }
}

// POST /api/listings/:id/viewings
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const { id: listingId } = await params
    const body = await request.json()

    const supabase = createUntypedServerClient()
    const agentName = body.agentName || user?.fullName || "Agent"

    const { data, error } = await supabase
      .from("listing_viewings")
      .insert({
        listing_id: listingId,
        viewer_name: body.viewerName,
        viewer_email: body.viewerEmail || null,
        viewer_phone: body.viewerPhone || null,
        viewing_date: body.viewingDate,
        status: body.status || "scheduled",
        feedback: body.feedback || null,
        rating: body.rating || null,
        agent_id: userId,
        agent_name: agentName,
      })
      .select()
      .single()

    if (error) throw error

    await emitActivityEvent(supabase, {
      actor: { userId, name: agentName },
      entityType: "listing",
      entityId: listingId,
      eventType: "viewing.scheduled",
      title: `Viewing: ${body.viewerName}`,
      body: String(body.viewingDate || ""),
      payload: {
        viewingId: data.id,
        status: data.status,
        viewerPhone: body.viewerPhone || null,
      },
    })

    return NextResponse.json({ viewing: data }, { status: 201 })
  } catch (error) {
    console.error("Error creating viewing:", error)
    return NextResponse.json(
      { error: "Failed to create viewing" },
      { status: 500 }
    )
  }
}

// PATCH /api/listings/:id/viewings (update a viewing by viewing_id in body)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await params
    const body = await request.json()
    const { viewingId, ...updates } = body

    if (!viewingId) {
      return NextResponse.json({ error: "viewingId required" }, { status: 400 })
    }

    const supabase = createUntypedServerClient()

    const updateData: Record<string, unknown> = {}
    if (updates.viewerName !== undefined) updateData.viewer_name = updates.viewerName
    if (updates.viewerEmail !== undefined) updateData.viewer_email = updates.viewerEmail
    if (updates.viewerPhone !== undefined) updateData.viewer_phone = updates.viewerPhone
    if (updates.viewingDate !== undefined) updateData.viewing_date = updates.viewingDate
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.feedback !== undefined) updateData.feedback = updates.feedback
    if (updates.rating !== undefined) updateData.rating = updates.rating
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("listing_viewings")
      .update(updateData)
      .eq("id", viewingId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ viewing: data })
  } catch (error) {
    console.error("Error updating viewing:", error)
    return NextResponse.json(
      { error: "Failed to update viewing" },
      { status: 500 }
    )
  }
}
