import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireApiUser } from "@/lib/api/guards"
import { sanitizeListingForViewer } from "@/lib/listings/privacy"
import { emitTeamFeedEvent } from "@/lib/listings/feed"
import { loadContactsForListings, syncListingContact } from "@/lib/listings/contact-sync"

function stripContactFields(body: Record<string, unknown>) {
  const next = { ...body }
  delete next.contact_name
  delete next.contact_phone
  delete next.contactName
  delete next.contactPhone
  return next
}

// GET /api/listings/:id - Get single listing (team can view)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const { id } = await params
    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listing, error } = await (supabase as any)
      .from("listings")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const sanitized = sanitizeListingForViewer(listing, guard.context.userId, {
      isAdmin: guard.context.role === "admin",
    })

    const contacts = await loadContactsForListings(supabase, [listing], guard.context.userId)
    const contact = contacts.get(String(listing.id))
    const enriched = contact
      ? {
          ...sanitized,
          owner_contact_id: contact.id,
          contact_name: contact.name,
          contact_phone: contact.phone,
        }
      : sanitized

    return NextResponse.json({ listing: enriched })
  } catch (error) {
    console.error("Error fetching listing:", error)
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 })
  }
}

// PATCH /api/listings/:id - Update listing (owner or admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const { id } = await params
    const body = await request.json()
    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("listings")
      .select("owner_id, owner_contact_id, area_name, sub_area, bedrooms")
      .eq("id", id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const isOwner = existing.owner_id === guard.context.userId
    const isAdmin = guard.context.role === "admin"
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only the listing agent or an admin can edit this listing" },
        { status: 403 }
      )
    }

    const contactName = body.contact_name || body.contactName
    const contactPhone = body.contact_phone || body.contactPhone
    let ownerContactId = existing.owner_contact_id as string | null

    if (contactName !== undefined || contactPhone !== undefined) {
      ownerContactId = await syncListingContact(supabase, {
        agentId: existing.owner_id,
        agentName: guard.context.fullName || "Agent",
        contactName: contactName ?? null,
        contactPhone: contactPhone ?? null,
        area: body.area_name || existing.area_name || null,
        subArea: body.sub_area ?? existing.sub_area ?? null,
        bedrooms: body.bedrooms ?? existing.bedrooms ?? null,
        existingOwnerId: existing.owner_contact_id,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listing, error } = await (supabase as any)
      .from("listings")
      .update({
        ...stripContactFields(body),
        owner_id: existing.owner_id,
        owner_contact_id: ownerContactId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    if (body.status || body.inquiry_type || body.title || body.price) {
      try {
        await emitTeamFeedEvent(supabase, listing, "listing_updated")
      } catch (feedError) {
        console.warn("team feed emit failed", feedError)
      }
    }

    const sanitized = sanitizeListingForViewer(listing, guard.context.userId, {
      isAdmin: guard.context.role === "admin",
    })
    // Load against listing owner so editors (incl. admin) get contact fields back after save
    const contacts = await loadContactsForListings(supabase, [listing], String(listing.owner_id))
    const contact = contacts.get(String(listing.id))

    return NextResponse.json({
      listing: contact
        ? {
            ...sanitized,
            owner_contact_id: contact.id,
            contact_name: contact.name,
            contact_phone: contact.phone,
          }
        : sanitized,
    })
  } catch (error) {
    console.error("Error updating listing:", error)
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 })
  }
}

// DELETE /api/listings/:id - Delete listing (owner or admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const { id } = await params
    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("listings")
      .select("owner_id")
      .eq("id", id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const isOwner = existing.owner_id === guard.context.userId
    const isAdmin = guard.context.role === "admin"
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only the listing agent or an admin can delete this listing" },
        { status: 403 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("listings").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting listing:", error)
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 })
  }
}
