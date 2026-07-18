/**
 * Bayut external URL field map (CRM + scraper contract)
 *
 * bayut_market_listings.listing_url  → live ad page (weekly re-scrape → status not_seen)
 * bayut_transactions.detail_url      → per-row View / property link when Bayut exposes it
 * bayut_transactions.source_url      → search/analysis page the row was scraped from
 *
 * UI: src/components/zaylo/bayut-link.tsx + src/lib/zaylo/bayut-links.ts
 */

export function normalizeBayutUrl(raw: string | null | undefined): string {
  const value = (raw || "").trim()
  if (!value) return ""
  try {
    const url = new URL(value)
    url.hash = ""
    return url.href
  } catch {
    return ""
  }
}

export function pickDetailUrl(links: string[]): string {
  const scored = links
    .map((href) => normalizeBayutUrl(href))
    .filter(Boolean)
    .filter((href) => /bayut\.com/i.test(href))
    .filter((href) => !/[?&]page=\d+/i.test(href))
    .filter((href) => !/time_since_creation=/i.test(href) || /\/transaction/i.test(href))

  const preferred = scored.find(
    (href) =>
      /\/property\//i.test(href) ||
      /\/transactions?\//i.test(href) ||
      /trakheesi|permit|details/i.test(href)
  )
  return preferred || scored[0] || ""
}
