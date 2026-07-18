import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

export async function GET(request: NextRequest) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const { searchParams } = new URL(request.url)
    const community = searchParams.get("community")
    const beds = searchParams.get("beds")
    const transactionType = searchParams.get("transactionType")
    const status = searchParams.get("status") || "active"
    const q = searchParams.get("q")
    const limit = Math.min(Number(searchParams.get("limit") || 200), 500)

    const supabase = createUntypedServerClient()
    let query = supabase
      .from("bayut_market_listings")
      .select(
        "id, community, master_community, sub_area, listing_number, permit_number, title, price, currency, rent_period, location, beds, baths, size_sqft, built_up_sqft, plot_sqft, property_type, agency, listing_url, transaction_type, status, last_seen, first_seen"
      )
      .order("last_seen", { ascending: false })
      .limit(limit)

    if (status !== "all") query = query.eq("status", status)
    if (community && community !== "all") query = query.eq("community", community)
    if (transactionType && transactionType !== "all") query = query.eq("transaction_type", transactionType)
    if (beds !== null && beds !== undefined && beds !== "" && beds !== "all") {
      query = query.eq("beds", Number(beds))
    }
    if (q) {
      query = query.or(`title.ilike.%${q}%,listing_number.ilike.%${q}%,location.ilike.%${q}%`)
    }

    const { data, error } = await query
    if (error) {
      console.error("market-listings query failed", error)
      return NextResponse.json({ error: error.message, listings: [], communities: [] }, { status: 500 })
    }

    const { data: communityRows } = await supabase
      .from("bayut_market_listings")
      .select("community")
      .eq("status", "active")

    const communities = Array.from(
      new Set((communityRows || []).map((r: { community: string }) => r.community).filter(Boolean))
    ).sort()

    return NextResponse.json({
      listings: data || [],
      communities,
      count: (data || []).length,
    })
  } catch (error) {
    console.error("market-listings GET failed", error)
    return NextResponse.json({ error: "Failed to load market listings" }, { status: 500 })
  }
}
