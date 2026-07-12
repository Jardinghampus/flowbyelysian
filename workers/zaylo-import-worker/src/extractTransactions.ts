import type { Page } from "playwright"
import { looksBlocked, parseBeds, parseNumber, waitForManualVerification } from "./utils.js"

export interface ExtractedTransaction {
  bedrooms: number | null
  property_type: string
  price_aed: number | null
  size_sqft: number | null
  price_per_sqft_aed: number | null
  transaction_date: string | null
  raw: Record<string, unknown>
}

function parseDate(value: string): string | null {
  const iso = value.match(/\d{4}-\d{2}-\d{2}/)?.[0]
  if (iso) return iso
  const dmy = value.match(/(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/)
  if (!dmy) return null
  const parsed = new Date(`${dmy[2]} ${dmy[1]}, ${dmy[3]}`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

/** Best-effort scrape of Bayut market-analysis transaction pages. */
export async function extractTransactions(
  page: Page,
  url: string
): Promise<{ rows: ExtractedTransaction[]; blocked: boolean }> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 })
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined)

  if (await looksBlocked(page)) {
    await waitForManualVerification(page)
    if (await looksBlocked(page)) return { rows: [], blocked: true }
  }

  const rawRows = await page.evaluate(() => {
    const text = document.body?.innerText ?? ""
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)

    const rows: Array<Record<string, string>> = []
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i]
      if (!/AED\s*[\d,]+/i.test(line)) continue
      const window = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 4)).join(" | ")
      rows.push({ window, priceLine: line })
    }
    return rows.slice(0, 80)
  })

  const rows: ExtractedTransaction[] = []
  for (const raw of rawRows) {
    const price = parseNumber(raw.priceLine.match(/AED\s*([\d,]+)/i)?.[1])
    const beds = parseBeds(raw.window.match(/\b(Studio|\d+)\s*(?:Beds?|BR|Bedrooms?)\b/i)?.[1])
    const size = parseNumber(raw.window.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft)/i)?.[1])
    const propertyType =
      raw.window.match(/\b(Villa|Townhouse|Apartment|Penthouse)\b/i)?.[1] ?? ""
    const date = parseDate(raw.window)
    const pps =
      price && size && size > 0 ? Math.round((price / size) * 100) / 100 : null

    if (!price) continue
    rows.push({
      bedrooms: beds,
      property_type: propertyType,
      price_aed: price,
      size_sqft: size,
      price_per_sqft_aed: pps,
      transaction_date: date,
      raw: raw as unknown as Record<string, unknown>,
    })
  }

  return { rows, blocked: false }
}
