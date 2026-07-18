import type { Page } from "playwright"
import { pickDetailUrl } from "./bayutLinks.js"
import {
  looksBlocked,
  normalizeSubAreaLeaf,
  parseNumber,
  waitForManualVerification,
} from "./utils.js"

export interface ExtractedTransaction {
  location: string
  sub_area: string
  community: string
  master_community: string
  bedrooms: number | null
  property_type: string
  price_aed: number | null
  size_sqft: number | null
  built_up_sqft: number | null
  plot_sqft: number | null
  price_per_sqft_aed: number | null
  transaction_date: string | null
  history: string
  detail_url: string
  raw: Record<string, unknown>
}

function parseDate(value: string): string | null {
  const cleaned = value.replace(/\s+/g, " ").trim()
  const dmy = cleaned.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/)
  if (!dmy) return null
  const parsed = new Date(`${dmy[2]} ${dmy[1]}, ${dmy[3]}`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

function parseMoney(text: string): number | null {
  const aed = text.match(/AED\s*([\d,]+)/i)?.[1]
  if (aed) return parseNumber(aed)
  const comma = text.match(/(\d{1,3}(?:,\d{3})+)/)?.[1]
  if (comma) {
    const n = parseNumber(comma)
    // Sale deals are usually >= 100k; rents (annual) often 30k–200k; allow lower for rent rows
    if (n != null && n >= 5_000) return n
  }
  return null
}

function communityFromTxUrl(url: string, fallback: string): string {
  if (/arabian-ranches-3/i.test(url)) return "Arabian Ranches 3"
  if (/arabian-ranches-2/i.test(url)) return "Arabian Ranches 2"
  if (/arabian-ranches/i.test(url)) return "Arabian Ranches"
  if (/damac-hills/i.test(url)) return "DAMAC Hills"
  if (/damac-lagoons|lagoons/i.test(url)) return "DAMAC Lagoons"
  if (/town-square/i.test(url)) return "Town Square"
  if (/villanova/i.test(url)) return "Villanova"
  if (/mudon/i.test(url)) return "Mudon"
  return fallback
}

/** Bayut glues location tokens: "Al SalamMudon" → "Al Salam, Mudon". */
function demashLocation(text: string): string {
  let s = text.replace(/Off-?Plan/gi, ", Off-Plan, ")
  const tokens = [
    "Arabian Ranches 3",
    "Arabian Ranches 2",
    "Arabian Ranches",
    "DAMAC Lagoons",
    "DAMAC Hills",
    "Town Square",
    "Villanova",
    "Mudon Al Ranim",
    "Arabella Townhouses",
    "Arabella 3",
    "Arabella 2",
    "Arabella 1",
    "Arabella",
    "Al Salam",
    "Mudon",
  ]
  for (const token of tokens) {
    const re = new RegExp(`(${token.replace(/\s+/g, "\\s+")})`, "ig")
    s = s.replace(re, ", $1, ")
  }
  return s
    .replace(/,\s*,+/g, ", ")
    .replace(/^[\s,]+|[\s,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function fingerprintOf(row: {
  transaction_date: string | null
  price_aed: number | null
  bedrooms: number | null
  built_up_sqft: number | null
  plot_sqft: number | null
  location: string
}): string {
  return [
    row.transaction_date || "",
    row.price_aed ?? "",
    row.bedrooms ?? "",
    row.built_up_sqft ?? "",
    row.plot_sqft ?? "",
    row.location.toLowerCase(),
  ].join("|")
}

const HISTORY_RE =
  /(Vacant at time of sale|Rented at time of sale|Tenanted at time of sale|Mortgage|Cash|Off-?Plan sale|New(?:\s+contract)?|Renewal|Resale)/i

/** Pull sale-status text from price cell / VIEW — never from location. */
function extractHistory(priceCell: string, viewCell: string): string {
  const fromPrice = priceCell.match(HISTORY_RE)?.[1]
  if (fromPrice) return fromPrice.replace(/\s+/g, " ").trim()
  const fromView = viewCell.match(HISTORY_RE)?.[1]
  if (fromView) return fromView.replace(/\s+/g, " ").trim()
  return ""
}

type TableRow = { cells: string[]; links: string[]; transactionId: string }

function isRentTable(cells: string[]): boolean {
  // Rent: DATE | LOCATION | DURATION | RENT | TYPE | BEDS | ...
  // Sale: DATE | LOCATION | PRICE | TYPE | BEDS | ...
  const c2 = cells[2] || ""
  const c3 = cells[3] || ""
  if (/\d+\s*months?/i.test(c2) || /renewal|new contract/i.test(c2)) return true
  if (/^\d{1,3}(?:,\d{3})+$/.test(c3.replace(/\s/g, "")) && /\b(Villa|Townhouse|Apartment)\b/i.test(cells[4] || "")) {
    return true
  }
  return false
}

function buildDetailUrl(pageUrl: string, transactionId: string, links: string[]): string {
  const fromDom = pickDetailUrl(links)
  if (fromDom) return fromDom
  if (!transactionId) return ""
  try {
    const u = new URL(pageUrl)
    u.searchParams.delete("transaction_id_in_view")
    u.searchParams.set("transaction_id_in_view", transactionId)
    return u.href
  } catch {
    return ""
  }
}

function parseTableRows(
  tableRows: TableRow[],
  pageCommunity: string,
  pageUrl: string,
  seen: Set<string>
): ExtractedTransaction[] {
  const rows: ExtractedTransaction[] = []
  const preferRent = /\/transactions\/rent\//i.test(pageUrl)

  for (const { cells, links, transactionId } of tableRows) {
    if (cells.length < 6) continue

    const rentLayout = preferRent || isRentTable(cells)
    const date = parseDate(cells[0] || "")
    const locationRaw = demashLocation(cells[1] || pageCommunity)

    let priceCell = ""
    let history = ""
    let propertyType = ""
    let bedsCell = ""
    let builtCell = ""
    let plotCell = ""

    if (rentLayout) {
      // START DATE | LOCATION | DURATION(+status) | RENT | TYPE | BEDS | BUILT-UP | PLOT | VIEW
      const durationCell = cells[2] || ""
      priceCell = cells[3] || ""
      history =
        durationCell.match(/(Renewal|New(?:\s+contract)?|Fresh)/i)?.[1] ||
        extractHistory(durationCell, cells[cells.length - 1] || "") ||
        compactDuration(durationCell)
      propertyType = cells[4] || ""
      bedsCell = cells[5] || ""
      builtCell = cells[6] || ""
      plotCell = cells[7] || ""
    } else {
      // DATE | LOCATION | PRICE(+history) | TYPE | BEDS | BUILT-UP | PLOT | VIEW
      priceCell = cells[2] || ""
      history = extractHistory(priceCell, cells[cells.length - 1] || "")
      propertyType = cells[3] || ""
      bedsCell = cells[4] || ""
      builtCell = cells[5] || ""
      plotCell = cells[6] || ""
    }

    const price = parseMoney(priceCell)
    const typeMatch = propertyType.match(/\b(Villa|Townhouse|Apartment|Penthouse)\b/i)
    let normalizedType = typeMatch?.[1] || ""
    // Arabella is a Mudon townhouse community — Bayut often mislabels TYPE as Villa
    if (/arabella/i.test(locationRaw) && (!normalizedType || /^villa$/i.test(normalizedType))) {
      normalizedType = "Townhouse"
    }
    if (/^penthouse$/i.test(normalizedType)) normalizedType = "Apartment"
    const bedsNum = Number(bedsCell)
    const beds = Number.isFinite(bedsNum) && bedsNum >= 0 && bedsNum <= 8 ? bedsNum : null
    const builtUp = parseNumber(builtCell)
    const plot = parseNumber(plotCell)
    const detailUrl = buildDetailUrl(pageUrl, transactionId, links)

    if (!date || !price) continue

    const location = locationRaw || pageCommunity
    const leaf = location.split(",")[0]?.trim() || location
    const subArea = normalizeSubAreaLeaf(leaf.replace(/Off-Plan/gi, "").trim() || leaf, pageCommunity)
    const size = builtUp
    const pps = price && size && size > 0 ? Math.round((price / size) * 100) / 100 : null
    const fp = fingerprintOf({
      transaction_date: date,
      price_aed: price,
      bedrooms: beds,
      built_up_sqft: builtUp,
      plot_sqft: plot,
      location,
    })
    if (seen.has(fp)) continue
    seen.add(fp)

    rows.push({
      location,
      sub_area: subArea,
      community: pageCommunity,
      master_community: pageCommunity,
      bedrooms: beds,
      property_type: normalizedType,
      price_aed: price,
      size_sqft: size,
      built_up_sqft: builtUp,
      plot_sqft: plot,
      price_per_sqft_aed: pps,
      transaction_date: date,
      history,
      detail_url: detailUrl,
      raw: { cells, links, transactionId, rentLayout, fingerprint: fp },
    })
  }

  return rows
}

function compactDuration(value: string): string {
  const months = value.match(/(\d+)\s*months?/i)?.[0]
  return months || ""
}

async function readTable(page: Page): Promise<TableRow[]> {
  for (let i = 0; i < 6; i += 1) {
    await page.mouse.wheel(0, 1400)
    await page.waitForTimeout(400).catch(() => undefined)
  }
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("table tbody tr")).map((tr) => {
      const cells = Array.from(tr.querySelectorAll("td")).map((td) =>
        (td.textContent || "").replace(/\s+/g, " ").trim()
      )
      const linkSet = new Set<string>()
      for (const a of Array.from(tr.querySelectorAll("a[href]"))) {
        const href = (a as HTMLAnchorElement).href
        if (href && !href.startsWith("javascript:")) linkSet.add(href)
      }
      for (const el of Array.from(tr.querySelectorAll("[data-url], [data-href], [data-link], [href]"))) {
        for (const attr of ["data-url", "data-href", "data-link", "href"]) {
          const raw = el.getAttribute(attr)
          if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) continue
          try {
            linkSet.add(new URL(raw, location.href).href)
          } catch {
            /* ignore */
          }
        }
      }
      return {
        cells,
        links: Array.from(linkSet),
        transactionId: tr.getAttribute("data-transaction-id") || "",
      }
    })
  )
}

async function findNextPageHref(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a"))
    for (const a of anchors) {
      const label = `${a.getAttribute("aria-label") || ""} ${a.textContent || ""}`.toLowerCase()
      const href = a.getAttribute("href") || ""
      if (!href) continue
      if (/next/i.test(label) || a.getAttribute("title")?.toLowerCase() === "next") {
        try {
          return new URL(href, location.href).href
        } catch {
          return null
        }
      }
    }
    // Fallback: numbered pagination — current + 1
    const current = Number(new URLSearchParams(location.search).get("page") || "1")
    const next = anchors.find((a) => {
      const href = a.getAttribute("href") || ""
      return new RegExp(`[?&]page=${current + 1}(?:&|$)`).test(href) || href.endsWith(`/page-${current + 1}/`)
    })
    if (next) {
      try {
        return new URL(next.getAttribute("href")!, location.href).href
      } catch {
        return null
      }
    }
    return null
  })
}

/**
 * Bayut transaction table columns:
 * DATE | LOCATION | PRICE(+history) | TYPE | BEDS | BUILT-UP | PLOT | HISTORY/VIEW
 */
export async function extractTransactions(
  page: Page,
  url: string,
  fallbackCommunity = "Unknown"
): Promise<{ rows: ExtractedTransaction[]; blocked: boolean }> {
  const pageCommunity = communityFromTxUrl(url, fallbackCommunity)
  const seen = new Set<string>()
  const rows: ExtractedTransaction[] = []
  const maxPages = 25
  let currentUrl = url

  for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
    await page.goto(currentUrl, { waitUntil: "domcontentloaded", timeout: 60000 })
    await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => undefined)
    await page.waitForTimeout(pageNo === 1 ? 3500 : 2000).catch(() => undefined)

    if (await looksBlocked(page)) {
      const cleared = await waitForManualVerification(page)
      if (!cleared || (await looksBlocked(page))) {
        if (pageNo === 1) return { rows: [], blocked: true }
        break
      }
    }

    const tableRows = await readTable(page)
    const batch = parseTableRows(tableRows, pageCommunity, page.url(), seen)
    rows.push(...batch)
    console.log(`Extracted ${batch.length} rows (page ${pageNo}) from ${currentUrl}`)

    if (batch.length === 0) break

    const nextHref = await findNextPageHref(page)
    if (!nextHref || nextHref === currentUrl) break
    currentUrl = nextHref
    await page.waitForTimeout(1200).catch(() => undefined)
  }

  console.log(`Extracted ${rows.length} transaction rows total for ${pageCommunity}`)
  return { rows, blocked: false }
}
