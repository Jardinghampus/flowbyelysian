import { loadActiveListingsForMetrics, upsertMetric } from "./db.js"

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

export async function recomputeMetricsFromListings(): Promise<number> {
  const rows = await loadActiveListingsForMetrics()
  const groups = new Map<
    string,
    {
      community: string
      bedrooms: number
      property_type: string
      rentPrices: number[]
      salePrices: number[]
      pps: number[]
    }
  >()

  for (const row of rows) {
    if (row.beds === null || row.beds === undefined) continue
    const propertyType = row.property_type || "Villa"
    const key = `${row.community}::${row.beds}::${propertyType}`
    if (!groups.has(key)) {
      groups.set(key, {
        community: row.community,
        bedrooms: row.beds,
        property_type: propertyType,
        rentPrices: [],
        salePrices: [],
        pps: [],
      })
    }
    const g = groups.get(key)!
    if (typeof row.price === "number") {
      if (row.transaction_type === "sale") g.salePrices.push(row.price)
      else g.rentPrices.push(row.price)
    }
    if (typeof row.price === "number" && typeof row.size_sqft === "number" && row.size_sqft > 0) {
      g.pps.push(row.price / row.size_sqft)
    }
  }

  let count = 0
  for (const g of groups.values()) {
    await upsertMetric({
      community: g.community,
      bedrooms: g.bedrooms,
      property_type: g.property_type,
      rental_avg_aed: avg(g.rentPrices),
      sale_avg_aed: avg(g.salePrices),
      rent_sample_size: g.rentPrices.length,
      sale_sample_size: g.salePrices.length,
      price_per_sqft_aed: avg(g.pps.map((n) => Math.round(n))),
    })
    count += 1
  }

  console.log(`Recomputed ${count} market metric rows from active Bayut listings.`)
  return count
}
