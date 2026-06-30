import { NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

// GET /api/listings/:id/leads
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
      .from("listing_leads")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ leads: data || [] })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    )
  }
}

// POST /api/listings/:id/leads
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: listingId } = await params
    const body = await request.json()

    const supabase = createUntypedServerClient()

    const { data, error } = await supabase
      .from("listing_leads")
      .insert({
        listing_id: listingId,
        lead_name: body.leadName,
        lead_email: body.leadEmail || null,
        lead_phone: body.leadPhone || null,
        lead_whatsapp: body.leadWhatsapp || null,
        source: body.source || "direct",
        status: body.status || "new",
        budget: body.budget || null,
        notes: body.notes || null,
        agent_id: userId,
        agent_name: body.agentName || "Agent",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ lead: data }, { status: 201 })
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    )
  }
}

// PATCH /api/listings/:id/leads
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
    const { leadId, ...updates } = body

    if (!leadId) {
      return NextResponse.json({ error: "leadId required" }, { status: 400 })
    }

    const supabase = createUntypedServerClient()

    const updateData: Record<string, unknown> = {}
    if (updates.leadName !== undefined) updateData.lead_name = updates.leadName
    if (updates.leadEmail !== undefined) updateData.lead_email = updates.leadEmail
    if (updates.leadPhone !== undefined) updateData.lead_phone = updates.leadPhone
    if (updates.leadWhatsapp !== undefined) updateData.lead_whatsapp = updates.leadWhatsapp
    if (updates.source !== undefined) updateData.source = updates.source
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.budget !== undefined) updateData.budget = updates.budget
    if (updates.notes !== undefined) updateData.notes = updates.notes
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("listing_leads")
      .update(updateData)
      .eq("id", leadId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ lead: data })
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    )
  }
}
