import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

type TxRow = {
  id: string
  community: string
  master_community: string | null
  sub_area: string | null
  location: string | null
  bedrooms: number | null
  property_type: string
  transaction_type: string
  price_aed: number | null
  size_sqft: number | null
  built_up_sqft: number | null
  plot_sqft: number | null
  price_per_sqft_aed: number | null
  transaction_date: string | null
  history: string | null
  detail_url: string | null
  source_url: string
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid]
}

function buildAnalysisLabel(opts: {
  community: string | null
  subArea: string | null
  beds: string | null
  propertyType: string | null
  transactionType: string | null
}): string {
  const bedPart =
    opts.beds && opts.beds !== "all" ? (opts.beds === "0" ? "studio" : `${opts.beds} beds`) : null
  const typePart =
    opts.propertyType && opts.propertyType !== "all" ? opts.propertyType.toLowerCase() + "s" : null
  const place = [opts.subArea !== "all" ? opts.subArea : null, opts.community !== "all" ? opts.community : null]
    .filter(Boolean)
    .join(", ")
  const deal =
    opts.transactionType === "sale" ? "sales" : opts.transactionType === "rent" ? "rentals" : "transactions"

  const subject = [bedPart, typePart].filter(Boolean).join(" ") || null
  if (subject && place) return `All ${subject} in ${place}`
  if (subject) return `All ${subject} ${deal}`
  if (place) return `All ${deal} in ${place}`
  return "All transactions (last 3 months)"
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
    const sort = searchParams.get("sort") || "newest"
    const limit = Math.min(Number(searchParams.get("limit") || 500), 1000)

    const supabase = createUntypedServerClient()
    let query = supabase
      .from("bayut_transactions")
      .select(
        "id, community, master_community, sub_area, location, bedrooms, property_type, transaction_type, price_aed, size_sqft, built_up_sqft, plot_sqft, price_per_sqft_aed, transaction_date, history, detail_url, source_url"
      )
      .limit(limit)

    if (community && community !== "all") {
      const c = community.replace(/"/g, "")
      query = query.or(`community.eq."${c}",master_community.eq."${c}"`)
    }
    if (subArea && subArea !== "all") query = query.eq("sub_area", subArea)
    if (transactionType && transactionType !== "all") query = query.eq("transaction_type", transactionType)
    if (propertyType && propertyType !== "all") query = query.eq("property_type", propertyType)
    if (beds && beds !== "all") query = query.eq("bedrooms", Number(beds))

    if (sort === "price_asc") query = query.order("price_aed", { ascending: true, nullsFirst: false })
    else if (sort === "price_desc") query = query.order("price_aed", { ascending: false, nullsFirst: false })
    else if (sort === "beds_desc") query = query.order("bedrooms", { ascending: false, nullsFirst: false })
    else query = query.order("transaction_date", { ascending: false })

    const { data, error } = await query
    if (error) {
      console.error("market-transactions query failed", error)
      return NextResponse.json({ error: error.message, transactions: [], analysis: null }, { status: 500 })
    }

    const rows = (data || []) as TxRow[]

    const { data: metaRows } = await supabase
      .from("bayut_transactions")
      .select("community, master_community, sub_area, bedrooms, property_type")
      .limit(5000)

    const communities = Array.from(
      new Set(
        (metaRows || [])
          .flatMap((r: { community: string; master_community: string | null }) => [
            r.master_community,
            r.community,
          ])
          .filter(Boolean)
      )
    ).sort() as string[]

    const subAreas = Array.from(
      new Set(
        (metaRows || [])
          .filter((r: { community: string; master_community: string | null; sub_area: string | null }) => {
            if (!community || community === "all") return true
            return r.community === community || r.master_community === community
          })
          .map((r: { sub_area: string | null }) => r.sub_area)
          .filter(Boolean)
      )
    ).sort() as string[]

    const prices = rows.map((r) => Number(r.price_aed)).filter((n) => n > 0)
    const built = rows.map((r) => Number(r.built_up_sqft ?? r.size_sqft)).filter((n) => n > 0)
    const plots = rows.map((r) => Number(r.plot_sqft)).filter((n) => n > 0)
    const pps = rows.map((r) => Number(r.price_per_sqft_aed)).filter((n) => n > 0)
    const bedValues = rows.map((r) => r.bedrooms).filter((n): n is number => n != null)

    const analysis = {
      label: buildAnalysisLabel({ community, subArea, beds, propertyType, transactionType }),
      count: rows.length,
      avgPrice: avg(prices),
      medianPrice: median(prices),
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      avgBuiltUp: avg(built),
      avgPlot: avg(plots),
      avgPricePerSqft: avg(pps),
      avgBeds: bedValues.length
        ? Math.round((bedValues.reduce((a, b) => a + b, 0) / bedValues.length) * 10) / 10
        : null,
    }

    return NextResponse.json({
      transactions: rows,
      communities,
      subAreas,
      analysis,
      count: rows.length,
      sort,
    })
  } catch (error) {
    console.error("market-transactions GET failed", error)
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 })
  }
}
