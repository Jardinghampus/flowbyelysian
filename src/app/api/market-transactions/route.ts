import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { checkMarketRateLimit } from "@/lib/api/market-rate-limit"
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

function applyFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  opts: {
    community: string | null
    subArea: string | null
    beds: string | null
    propertyType: string | null
    transactionType: string | null
    q: string | null
  }
) {
  if (opts.community && opts.community !== "all") {
    const c = opts.community.replace(/["\\,()]/g, "").trim()
    if (c) query = query.or(`community.eq."${c}",master_community.eq."${c}"`)
  }
  if (opts.subArea && opts.subArea !== "all") query = query.eq("sub_area", opts.subArea)
  if (opts.transactionType && opts.transactionType !== "all") {
    query = query.eq("transaction_type", opts.transactionType)
  }
  if (opts.propertyType && opts.propertyType !== "all") query = query.eq("property_type", opts.propertyType)
  if (opts.beds && opts.beds !== "all") query = query.eq("bedrooms", Number(opts.beds))
  if (opts.q) {
    const safe = opts.q.replace(/[%",]/g, "")
    query = query.or(
      `location.ilike.%${safe}%,sub_area.ilike.%${safe}%,community.ilike.%${safe}%,history.ilike.%${safe}%`
    )
  }
  return query
}

function applySort(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  sort: string | null
) {
  if (sort === "price_asc") return query.order("price_aed", { ascending: true, nullsFirst: false })
  if (sort === "price_desc") return query.order("price_aed", { ascending: false, nullsFirst: false })
  if (sort === "beds_desc") return query.order("bedrooms", { ascending: false, nullsFirst: false })
  return query.order("transaction_date", { ascending: false })
}

function computeAnalysis(rows: TxRow[], label: string) {
  const prices = rows.map((r) => Number(r.price_aed)).filter((n) => n > 0)
  const built = rows.map((r) => Number(r.built_up_sqft ?? r.size_sqft)).filter((n) => n > 0)
  const plots = rows.map((r) => Number(r.plot_sqft)).filter((n) => n > 0)
  const pps = rows.map((r) => Number(r.price_per_sqft_aed)).filter((n) => n > 0)
  const bedValues = rows.map((r) => r.bedrooms).filter((n): n is number => n != null)

  return {
    label,
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
}

export async function GET(request: NextRequest) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const rate = checkMarketRateLimit(guard.context.userId)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      )
    }

    const { searchParams } = new URL(request.url)
    const community = searchParams.get("community")
    const subArea = searchParams.get("subArea")
    const beds = searchParams.get("beds")
    const propertyType = searchParams.get("propertyType")
    const transactionType = searchParams.get("transactionType")
    const q = searchParams.get("q")
    const sort = searchParams.get("sort") || "newest"
    const limit = Math.min(Number(searchParams.get("limit") || 500), 1000)
    const offset = Math.max(Number(searchParams.get("offset") || 0), 0)

    const supabase = createUntypedServerClient()
    const filters = { community, subArea, beds, propertyType, transactionType, q }
    const analysisLabel = buildAnalysisLabel({ community, subArea, beds, propertyType, transactionType })

    let countQuery = supabase.from("bayut_transactions").select("id", { count: "exact", head: true })
    countQuery = applyFilters(countQuery, filters)
    const { count: totalCount, error: countError } = await countQuery
    if (countError) {
      console.error("market-transactions count failed", countError)
      return NextResponse.json({ error: countError.message, transactions: [], analysis: null }, { status: 500 })
    }

    let query = supabase
      .from("bayut_transactions")
      .select(
        "id, community, master_community, sub_area, location, bedrooms, property_type, transaction_type, price_aed, size_sqft, built_up_sqft, plot_sqft, price_per_sqft_aed, transaction_date, history, detail_url, source_url"
      )
      .range(offset, offset + limit - 1)

    query = applyFilters(query, filters)
    query = applySort(query, sort)

    const { data, error } = await query
    if (error) {
      console.error("market-transactions query failed", error)
      return NextResponse.json({ error: error.message, transactions: [], analysis: null }, { status: 500 })
    }

    const rows = (data || []) as TxRow[]

    let analysisQuery = supabase
      .from("bayut_transactions")
      .select(
        "price_aed, built_up_sqft, size_sqft, plot_sqft, price_per_sqft_aed, bedrooms"
      )
      .limit(10000)
    analysisQuery = applyFilters(analysisQuery, filters)
    const { data: analysisRows, count: analysisCount } = await analysisQuery

    const analysis = computeAnalysis((analysisRows || rows) as TxRow[], analysisLabel)
    if (analysisCount != null && analysisCount > (analysisRows?.length || 0)) {
      analysis.count = analysisCount
    } else if (totalCount != null) {
      analysis.count = totalCount
    }

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

    return NextResponse.json({
      transactions: rows,
      communities,
      subAreas,
      analysis,
      count: totalCount ?? rows.length,
      offset,
      limit,
      hasMore: (totalCount ?? 0) > offset + rows.length,
      sort,
    })
  } catch (error) {
    console.error("market-transactions GET failed", error)
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 })
  }
}
