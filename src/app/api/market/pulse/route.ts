import { NextResponse } from "next/server"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { FOCUS_COMMUNITIES, formatAedCompact } from "@/lib/zaylo/social-focus"

/** Public lead magnet: community → rent/sale band → CTA. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const communityId = url.searchParams.get("community") || "mudon"
    const focus = FOCUS_COMMUNITIES.find((c) => c.id === communityId) || FOCUS_COMMUNITIES[2]!

    const supabase = createUntypedServerClient()
    const { data } = await supabase
      .from("bayut_transactions")
      .select("community, master_community, price_aed, transaction_type, property_type")
      .order("transaction_date", { ascending: false })
      .limit(3000)

    const rows = (data || []).filter((r) => {
      const c = `${r.community || ""} ${r.master_community || ""}`.toLowerCase()
      return focus.communities.some((name) => c.includes(name.toLowerCase()))
    })

    const rents = rows
      .filter((r) => r.transaction_type === "rent")
      .map((r) => Number(r.price_aed))
      .filter((n) => n > 0)
    const sales = rows
      .filter((r) => r.transaction_type === "sale")
      .map((r) => Number(r.price_aed))
      .filter((n) => n > 0)

    const avg = (nums: number[]) =>
      nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null

    return NextResponse.json({
      community: focus,
      communities: FOCUS_COMMUNITIES.map((c) => ({ id: c.id, label: c.label, tagline: c.tagline })),
      rentAvg: formatAedCompact(avg(rents)),
      saleAvg: formatAedCompact(avg(sales)),
      rentCount: rents.length,
      saleCount: sales.length,
      cta: 'DM "Market" on Instagram or message Hampus for a private shortlist.',
    })
  } catch (error) {
    console.error("market magnet failed:", error)
    return NextResponse.json({ error: "Unavailable" }, { status: 500 })
  }
}
