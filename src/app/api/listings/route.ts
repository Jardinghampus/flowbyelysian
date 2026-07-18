import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { currentUser } from "@/lib/demo-auth"
import { requireApiUser } from "@/lib/api/guards"
import { sanitizeListingsForViewer } from "@/lib/listings/privacy"
import { emitTeamFeedEvent } from "@/lib/listings/feed"
import { loadContactsForListings, syncListingContact } from "@/lib/listings/contact-sync"

function isRecoverableListingsReadError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const candidate = error as { code?: string; message?: string }
  const message = candidate.message ?? ""

  return (
    candidate.code === "42P01" ||
    candidate.code === "PGRST205" ||
    /relation .*listings.* does not exist/i.test(message) ||
    /could not find .*listings/i.test(message) ||
    /supabase/i.test(message)
  )
}

function stripContactFields(body: Record<string, unknown>) {
  const next = { ...body }
  delete next.contact_name
  delete next.contact_phone
  delete next.contactName
  delete next.contactPhone
  return next
}

async function withOwnerContacts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  listings: Record<string, unknown>[],
  viewerId: string
) {
  const contacts = await loadContactsForListings(
    supabase,
    listings as Array<{ id: string; owner_id?: string | null; owner_contact_id?: string | null }>,
    viewerId
  )
  return listings.map((row) => {
    const contact = contacts.get(String(row.id))
    if (!contact) return row
    return {
      ...row,
      owner_contact_id: contact.id,
      contact_name: contact.name,
      contact_phone: contact.phone,
    }
  })
}

// GET /api/listings - List all listings with filters
export async function GET(request: NextRequest) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const area = searchParams.get("area")
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const inquiryType = searchParams.get("inquiryType")
    const transactionType = searchParams.get("transactionType")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const bedrooms = searchParams.get("bedrooms")
    const ownerId = searchParams.get("ownerId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const mineOnly = searchParams.get("mine") === "1"
    const scope = searchParams.get("scope")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("listings")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (ownerId || mineOnly || scope === "mine") {
      query = query.eq("owner_id", ownerId || guard.context.userId)
    }

    if (area) query = query.eq("area_name", area)
    if (type) query = query.eq("type", type)
    if (status) query = query.eq("status", status)
    if (inquiryType) query = query.eq("inquiry_type", inquiryType)
    if (transactionType) query = query.eq("transaction_type", transactionType)
    if (minPrice) query = query.gte("price", parseInt(minPrice))
    if (maxPrice) query = query.lte("price", parseInt(maxPrice))
    if (bedrooms) query = query.eq("bedrooms", parseInt(bedrooms))

    const { data: listings, error, count } = await query

    if (error) {
      if (isRecoverableListingsReadError(error)) {
        console.warn("Listings API returned an empty fallback:", error)
        return NextResponse.json({
          listings: [],
          total: 0,
          limit,
          offset,
          warning: "Listings data source is not configured yet.",
        })
      }

      throw error
    }

    const sanitized = sanitizeListingsForViewer(listings || [], guard.context.userId, {
      isAdmin: guard.context.role === "admin",
    })
    const enriched = await withOwnerContacts(supabase, sanitized, guard.context.userId)

    return NextResponse.json({
      listings: enriched,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({
      listings: [],
      total: 0,
      limit: Number(new URL(request.url).searchParams.get("limit") || "50"),
      offset: Number(new URL(request.url).searchParams.get("offset") || "0"),
      warning: "Listings data source is not configured yet.",
    })
  }
}

// POST /api/listings - Create new listing
export async function POST(request: NextRequest) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const user = await currentUser()
    const body = await request.json()
    const supabase = createServerClient()

    const agentName = user?.fullName || user?.firstName || guard.context.fullName || "Unknown"
    const contactName = body.contact_name || body.contactName || null
    const contactPhone = body.contact_phone || body.contactPhone || null

    const ownerContactId = await syncListingContact(supabase, {
      agentId: guard.context.userId,
      agentName,
      contactName,
      contactPhone,
      area: body.area_name || body.area || null,
      subArea: body.sub_area || body.subArea || null,
      bedrooms: body.bedrooms ?? null,
    })

    const listingData = {
      ...stripContactFields(body),
      owner_id: guard.context.userId,
      owner_name: agentName,
      owner_contact_id: ownerContactId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listing, error } = await (supabase as any)
      .from("listings")
      .insert(listingData)
      .select()
      .single()

    if (error) throw error

    try {
      await emitTeamFeedEvent(supabase, listing)
    } catch (feedError) {
      console.warn("team feed emit failed", feedError)
    }

    const enriched = {
      ...listing,
      contact_name: contactName,
      contact_phone: contactPhone,
    }

    return NextResponse.json({ listing: enriched }, { status: 201 })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
