import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth, currentUser } from "@/lib/demo-auth"

// GET /api/listings - List all listings with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    // Parse filter params
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("listings")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (area) query = query.eq("area_name", area)
    if (type) query = query.eq("type", type)
    if (status) query = query.eq("status", status)
    if (inquiryType) query = query.eq("inquiry_type", inquiryType)
    if (transactionType) query = query.eq("transaction_type", transactionType)
    if (minPrice) query = query.gte("price", parseInt(minPrice))
    if (maxPrice) query = query.lte("price", parseInt(maxPrice))
    if (bedrooms) query = query.eq("bedrooms", parseInt(bedrooms))
    if (ownerId) query = query.eq("owner_id", ownerId)

    const { data: listings, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      listings: listings || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    )
  }
}

// POST /api/listings - Create new listing
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const body = await request.json()

    const supabase = createServerClient()

    const listingData = {
      ...body,
      owner_id: userId,
      owner_name: user?.fullName || user?.firstName || "Unknown",
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

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    )
  }
}
