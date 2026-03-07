import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { villaCommunities } from "@/lib/data/villa-communities"

// Helper: generate AI price summary by comparing to market data
function generatePriceSummary(area: string, price: number, type: string, propertyType: string, bedrooms: number) {
  // Find matching community
  const areaSlug = area.toLowerCase().replace(/\s+/g, "-")
  const community = villaCommunities.find(
    (c) => c.slug === areaSlug || c.name.toLowerCase() === area.toLowerCase()
  )

  if (!community || !price || price === 0) {
    return { summary: null, comparisonPct: null }
  }

  const marketData = community.marketData
  const avgPriceSqft = marketData.avgPriceSqft

  // Find relevant price range
  const priceRange = marketData.priceRanges.find(
    (pr) =>
      pr.type.toLowerCase() === propertyType.toLowerCase() &&
      pr.bedrooms.includes(String(bedrooms))
  )

  if (priceRange) {
    const avgMarketPrice = priceRange.avgPrice
    const diffPct = ((price - avgMarketPrice) / avgMarketPrice) * 100
    const absDiffPct = Math.abs(diffPct).toFixed(1)

    let summary = ""
    if (type === "buy" || type === "rent") {
      // Buyer: compare budget to market
      if (diffPct < -15) {
        summary = `Your budget is ${absDiffPct}% below the average market price for a ${bedrooms}BR ${propertyType} in ${area} (avg AED ${avgMarketPrice.toLocaleString()}). Consider increasing your budget for faster matching. An agent will contact you soon.`
      } else if (diffPct < -5) {
        summary = `Your budget is ${absDiffPct}% below market average for ${bedrooms}BR ${propertyType}s in ${area} (avg AED ${avgMarketPrice.toLocaleString()}). Opportunities exist but may take longer to match. An agent will contact you soon.`
      } else if (diffPct <= 10) {
        summary = `Your budget is right at market level for a ${bedrooms}BR ${propertyType} in ${area} (avg AED ${avgMarketPrice.toLocaleString()}). Great positioning — an agent will contact you soon with options.`
      } else {
        summary = `Your budget is ${absDiffPct}% above market average for ${bedrooms}BR ${propertyType}s in ${area}. You'll have excellent options available. An agent will contact you soon.`
      }
    } else {
      // Seller: compare asking price to market
      if (diffPct > 15) {
        summary = `Your asking price is ${absDiffPct}% above the average market price for a ${bedrooms}BR ${propertyType} in ${area} (avg AED ${avgMarketPrice.toLocaleString()}). Consider adjusting for faster matching. An agent will contact you soon.`
      } else if (diffPct > 5) {
        summary = `Your asking price is ${absDiffPct}% above market average for ${bedrooms}BR ${propertyType}s in ${area}. Well-positioned with premium pricing. An agent will contact you soon.`
      } else if (diffPct >= -5) {
        summary = `Your asking price aligns with market value for a ${bedrooms}BR ${propertyType} in ${area} (avg AED ${avgMarketPrice.toLocaleString()}). Strong pricing for quick interest. An agent will contact you soon.`
      } else {
        summary = `Your asking price is ${absDiffPct}% below market average for ${bedrooms}BR ${propertyType}s in ${area}. Expect fast interest from buyers. An agent will contact you soon.`
      }
    }

    return {
      summary,
      comparisonPct: Math.round(diffPct * 10) / 10,
      avgMarketPrice,
      avgPriceSqft,
      communityName: community.name,
    }
  }

  // No exact match, use general community stats
  return {
    summary: `Average price in ${community.name} is AED ${avgPriceSqft}/sqft with a ${marketData.avgRentYield}% rental yield. An agent will review your opportunity and contact you within 24 hours.`,
    comparisonPct: null,
    avgPriceSqft,
    communityName: community.name,
  }
}

// GET /api/opportunities - List opportunities with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const area = searchParams.get("area")
    const agentId = searchParams.get("agentId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("opportunities")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq("status", status)
    if (type) query = query.eq("type", type)
    if (area) query = query.eq("area", area)
    if (agentId) query = query.eq("assigned_agent_id", agentId)

    const { data: opportunities, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      opportunities: opportunities || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching opportunities:", error)
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    )
  }
}

// POST /api/opportunities - Submit a new opportunity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    // Generate AI price summary
    const effectivePrice =
      body.price_type === "range"
        ? (body.min_price + body.max_price) / 2
        : body.price

    const priceSummary = generatePriceSummary(
      body.area || "",
      effectivePrice || 0,
      body.type,
      body.property_type || "Villa",
      body.bedrooms || 3
    )

    const opportunityData = {
      type: body.type,
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      whatsapp: body.whatsapp || null,
      preferred_contact: body.preferred_contact || "whatsapp",
      area: body.area || null,
      sub_area: body.sub_area || null,
      unit_number: body.unit_number || null,
      floor: body.floor || null,
      property_type: body.property_type || null,
      bedrooms: body.bedrooms || null,
      bathrooms: body.bathrooms || null,
      size: body.size || null,
      furnished: body.furnished || null,
      parking: body.parking || null,
      year_built: body.year_built || null,
      price: body.price || null,
      price_type: body.price_type || "negotiable",
      min_price: body.min_price || null,
      max_price: body.max_price || null,
      features: body.features || [],
      availability: body.availability || null,
      notes: body.notes || null,
      ai_price_summary: priceSummary.summary,
      market_comparison_pct: priceSummary.comparisonPct,
      status: "new",
      source: "website",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: opportunity, error } = await (supabase as any)
      .from("opportunities")
      .insert(opportunityData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      {
        opportunity,
        priceSummary: priceSummary.summary,
        comparisonPct: priceSummary.comparisonPct,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating opportunity:", error)
    return NextResponse.json(
      { error: "Failed to create opportunity" },
      { status: 500 }
    )
  }
}

// PATCH /api/opportunities - Update opportunity status/assignment
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Missing opportunity ID" }, { status: 400 })
    }

    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: opportunity, error } = await (supabase as any)
      .from("opportunities")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ opportunity })
  } catch (error) {
    console.error("Error updating opportunity:", error)
    return NextResponse.json(
      { error: "Failed to update opportunity" },
      { status: 500 }
    )
  }
}
