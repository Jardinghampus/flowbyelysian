import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

type ListingRow = {
  id: string
  community: string
  master_community: string | null
  sub_area: string | null
  listing_number: string
  permit_number: string
  title: string
  price: number | null
  currency: string
  rent_period: string
  location: string
  beds: number | null
  baths: number | null
  size_sqft: number | null
  built_up_sqft: number | null
  plot_sqft: number | null
  property_type: string
  agency: string | null
  agent_name: string | null
  listing_url: string
  transaction_type: string
  status: string
  last_seen: string
  first_seen: string
}

function applyFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  opts: {
    status: string
    community: string | null
    subArea: string | null
    transactionType: string | null
    beds: string | null
    propertyType: string | null
    q: string | null
  }
) {
  if (opts.status !== "all") query = query.eq("status", opts.status)
  if (opts.community && opts.community !== "all") {
    const c = opts.community.replace(/"/g, "")
    query = query.or(`community.eq."${c}",master_community.eq."${c}"`)
  }
  if (opts.subArea && opts.subArea !== "all") query = query.eq("sub_area", opts.subArea)
  if (opts.transactionType && opts.transactionType !== "all") {
    query = query.eq("transaction_type", opts.transactionType)
  }
  if (opts.propertyType && opts.propertyType !== "all") {
    query = query.eq("property_type", opts.propertyType)
  }
  if (opts.beds !== null && opts.beds !== undefined && opts.beds !== "" && opts.beds !== "all") {
    query = query.eq("beds", Number(opts.beds))
  }
  if (opts.q) {
    const safe = opts.q.replace(/[%",]/g, "")
    query = query.or(
      `title.ilike.%${safe}%,listing_number.ilike.%${safe}%,location.ilike.%${safe}%,agency.ilike.%${safe}%,permit_number.ilike.%${safe}%`
    )
  }
  return query
}

function applySort(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  sort: string | null
) {
  switch (sort) {
    case "price_asc":
      return query.order("price", { ascending: true, nullsFirst: false })
    case "price_desc":
      return query.order("price", { ascending: false, nullsFirst: false })
    case "beds_desc":
      return query.order("beds", { ascending: false, nullsFirst: false })
    case "beds_asc":
      return query.order("beds", { ascending: true, nullsFirst: false })
    case "newest":
    default:
      return query.order("last_seen", { ascending: false })
  }
}

function computeStats(rows: ListingRow[]) {
  const withPrice = rows.filter((r) => r.price != null && Number(r.price) > 0)
  const sum = withPrice.reduce((acc, r) => acc + Number(r.price), 0)
  const avgPrice = withPrice.length > 0 ? Math.round(sum / withPrice.length) : null
  const rent = rows.filter((r) => r.transaction_type === "rent")
  const sale = rows.filter((r) => r.transaction_type === "sale")
  const rentPrices = rent.filter((r) => r.price != null && Number(r.price) > 0)
  const salePrices = sale.filter((r) => r.price != null && Number(r.price) > 0)
  return {
    count: rows.length,
    avgPrice,
    rentCount: rent.length,
    saleCount: sale.length,
    avgRentPrice:
      rentPrices.length > 0
        ? Math.round(rentPrices.reduce((a, r) => a + Number(r.price), 0) / rentPrices.length)
        : null,
    avgSalePrice:
      salePrices.length > 0
        ? Math.round(salePrices.reduce((a, r) => a + Number(r.price), 0) / salePrices.length)
        : null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const { searchParams } = new URL(request.url)
    const community = searchParams.get("community")
    const subArea = searchParams.get("subArea")
    const beds = searchParams.get("beds")
    const propertyType = searchParams.get("propertyType")
    const transactionType = searchParams.get("transactionType")
    const status = searchParams.get("status") || "active"
    const q = searchParams.get("q")
    const sort = searchParams.get("sort") || "newest"
    const limit = Math.min(Number(searchParams.get("limit") || 200), 500)

    const supabase = createUntypedServerClient()
    const filters = { status, community, subArea, transactionType, beds, propertyType, q }

    let query = supabase
      .from("bayut_market_listings")
      .select(
        "id, community, master_community, sub_area, listing_number, permit_number, title, price, currency, rent_period, location, beds, baths, size_sqft, built_up_sqft, plot_sqft, property_type, agency, agent_name, listing_url, transaction_type, status, last_seen, first_seen"
      )
      .limit(limit)

    query = applyFilters(query, filters)
    query = applySort(query, sort)

    const { data, error } = await query
    if (error) {
      console.error("market-listings query failed", error)
      return NextResponse.json(
        { error: error.message, listings: [], communities: [], stats: null },
        { status: 500 }
      )
    }

    let statsQuery = supabase
      .from("bayut_market_listings")
      .select("price, transaction_type, status")
      .limit(5000)
    statsQuery = applyFilters(statsQuery, filters)
    const { data: statsRows } = await statsQuery

    const { data: communityRows } = await supabase
      .from("bayut_market_listings")
      .select("community, master_community, sub_area")
      .eq("status", "active")

    const communities = Array.from(
      new Set(
        (communityRows || [])
          .flatMap((r: { community: string; master_community: string | null }) => [
            r.master_community,
            r.community,
          ])
          .filter(Boolean)
      )
    ).sort() as string[]

    const subAreas = Array.from(
      new Set(
        (communityRows || [])
          .filter((r: { community: string; master_community: string | null }) => {
            if (!community || community === "all") return true
            return r.community === community || r.master_community === community
          })
          .map((r: { sub_area: string | null; community: string }) => r.sub_area || r.community)
          .filter(Boolean)
      )
    ).sort() as string[]

    const listings = (data || []) as ListingRow[]
    const stats = computeStats((statsRows || listings) as ListingRow[])

    return NextResponse.json({
      listings,
      communities,
      subAreas,
      count: listings.length,
      stats,
      sort,
    })
  } catch (error) {
    console.error("market-listings GET failed", error)
    return NextResponse.json({ error: "Failed to load market listings" }, { status: 500 })
  }
}
