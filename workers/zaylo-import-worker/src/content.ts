import { insertSocialPost, loadLiveMetrics } from "./db.js"

function formatAed(value: number | null | undefined): string {
  if (value == null) return "n/a"
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `AED ${Math.round(value / 1000)}K`
  return `AED ${Math.round(value).toLocaleString("en-AE")}`
}

function bedsLabel(beds: number): string {
  if (beds === 0) return "Studio"
  return `${beds}BR`
}

/** Draft Instagram posts — Dubai Land Villa Expert narrative for Hampus. */
export async function generateVillaExpertContent(): Promise<number> {
  const metrics = await loadLiveMetrics()
  let created = 0

  for (const metric of metrics.slice(0, 40)) {
    const community =
      metric.community ||
      (metric.zaylo_areas as { sub_community?: string } | null | undefined)?.sub_community ||
      "Dubai villa community"
    const beds = bedsLabel(metric.bedrooms)
    const rent = formatAed(metric.rental_avg_aed)
    const sale = formatAed(metric.sale_avg_aed)
    const sample = (metric.rent_sample_size || 0) + (metric.sale_sample_size || 0)
    if (sample < 2) continue

    const hook = `${community} — ${beds} market pulse`
    const headline = `Dubai Land Villa Expert · ${community}`
    const body =
      metric.rental_avg_aed && metric.sale_avg_aed
        ? `Active Bayut sample (${sample}): rent avg ${rent} · sale avg ${sale}.`
        : metric.rental_avg_aed
          ? `Active Bayut rental sample (${metric.rent_sample_size}): avg ${rent}.`
          : `Active Bayut sale sample (${metric.sale_sample_size}): avg ${sale}.`

    const caption = [
      `🏠 ${headline}`,
      "",
      body,
      "",
      "Data from live Bayut listings we track weekly — not a guess.",
      "",
      "#DubaiRealEstate #VillaLiving #DubaiLand #Mudon #MiraOasis #PropertyMarket",
    ].join("\n")

    await insertSocialPost({
      metric_id: metric.id,
      area_id: metric.area_id,
      hook,
      headline,
      body,
      caption,
      trust_line: `Sample size ${sample} · scraped Bayut active listings`,
      cta: "DM for a private shortlist in this community",
    })
    created += 1
  }

  console.log(`Created ${created} draft Zaylo social posts (dubai_land_villa_expert).`)
  return created
}
