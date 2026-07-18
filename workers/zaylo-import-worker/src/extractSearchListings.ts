import type { Page } from "playwright"
import { ListingSchema, type Listing } from "./types.js"
import {
  compactJson,
  compactWhitespace,
  inferTransactionType,
  looksBlocked,
  normalizeBayutUrl,
  parseBeds,
  parseNumber,
  randomDelay,
  saveDebugHtml,
  waitForManualVerification,
} from "./utils.js"

interface ExtractedCard {
  text: string
  href: string
}

function extractRentPeriod(text: string): string {
  const match = text.match(/\b(Yearly|Monthly|Weekly|Daily)\b/i)
  return match ? match[1][0].toUpperCase() + match[1].slice(1).toLowerCase() : ""
}

function extractCurrency(text: string): string {
  return /\bAED\b/i.test(text) ? "AED" : ""
}

function extractPrice(text: string): number | null {
  const match = text.match(/\bAED\s*([\d,]+)/i)
  return parseNumber(match?.[1])
}

function extractSize(text: string): number | null {
  const match = text.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet)\b/i)
  return parseNumber(match?.[1])
}

function extractBuiltUp(text: string): number | null {
  const match = text.match(
    /(?:built[\s-]?up|BUA|internal area)\s*[:\-]?\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft)?/i
  )
  return parseNumber(match?.[1]) ?? extractSize(text)
}

function extractPlot(text: string): number | null {
  const match = text.match(
    /(?:plot(?:\s*size)?|land size)\s*[:\-]?\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft)?/i
  )
  return parseNumber(match?.[1])
}

function extractBeds(text: string): number | null {
  const match = text.match(/\b(Studio|\d+(?:\.\d+)?)\s*(?:Beds?|Bedrooms?|BR)\b/i)
  return parseBeds(match?.[1])
}

function extractBaths(text: string): number | null {
  const match = text.match(/\b(\d+(?:\.\d+)?)\s*(?:Baths?|Bathrooms?)\b/i)
  return parseNumber(match?.[1])
}

function extractLocation(text: string): string {
  const lines = text.split("\n").map(compactWhitespace).filter(Boolean)
  const likely = lines.find(
    (line) =>
      /Dubai|Mudon|Arabella|Mira|Oasis|Townhouses|Ranim|Reem|Ranches/i.test(line) &&
      !/AED|bed|bath|sq/i.test(line)
  )
  return likely ?? ""
}

function extractTitle(text: string): string {
  const lines = text.split("\n").map(compactWhitespace).filter(Boolean)
  return (
    lines.find((line) => !/AED|Yearly|Monthly|Weekly|Daily|bed|bath|sq\.?\s*ft|verified|trucheck/i.test(line)) ??
    lines[0] ??
    ""
  )
}

function extractPropertyType(text: string): string {
  const match = text.match(/\b(Villa|Townhouse|Apartment|Penthouse|Duplex|Compound|Hotel Apartment)\b/i)
  return match ? match[1] : ""
}

function normalizeCard(card: ExtractedCard, community: string, pageUrl: string): Listing {
  const normalizedUrl = normalizeBayutUrl(card.href)
  const text = card.text
  const rawSummary = {
    title: extractTitle(text),
    price_text: text.match(/\bAED\s*[\d,]+(?:\s*(?:Yearly|Monthly|Weekly|Daily))?/i)?.[0] ?? "",
    location: extractLocation(text),
    beds_text: text.match(/\b(?:Studio|\d+(?:\.\d+)?)\s*(?:Beds?|Bedrooms?|BR)\b/i)?.[0] ?? "",
    baths_text: text.match(/\b\d+(?:\.\d+)?\s*(?:Baths?|Bathrooms?)\b/i)?.[0] ?? "",
    size_text: text.match(/[\d,]+\s*(?:sq\.?\s*ft|sqft|square feet)\b/i)?.[0] ?? "",
  }

  return ListingSchema.parse({
    source: "bayut",
    community,
    listing_number: "",
    permit_number: "",
    title: rawSummary.title,
    price: extractPrice(text),
    currency: extractCurrency(text),
    rent_period: extractRentPeriod(text),
    location: rawSummary.location,
    beds: extractBeds(text),
    baths: extractBaths(text),
    size_sqft: extractBuiltUp(text),
    built_up_sqft: extractBuiltUp(text),
    plot_sqft: extractPlot(text),
    sub_area: rawSummary.location || community,
    property_type: extractPropertyType(text),
    agency: "",
    agent_name: "",
    listing_url: normalizedUrl,
    page_url: pageUrl,
    transaction_type: inferTransactionType(pageUrl),
    status: "active",
    raw_summary: compactJson(rawSummary),
  })
}

async function extractVisibleCards(page: Page, community: string): Promise<Listing[]> {
  const cards = await page.evaluate(() => {
    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("a[href*='/property/details-'], a[href*='/to-rent/'], a[href*='/for-sale/']")
    )
    const results: ExtractedCard[] = []
    const seen = new Set<string>()

    for (const anchor of anchors) {
      const href = anchor.getAttribute("href") ?? ""
      if (!/\/property\/details-\d+\.html/i.test(href)) continue

      const semanticContainer = anchor.closest("article, li, [role='article'], [data-testid]") as HTMLElement | null
      const fallbackContainer = anchor.parentElement?.parentElement?.parentElement as HTMLElement | null
      const container = semanticContainer ?? fallbackContainer
      const text = (container?.innerText || anchor.innerText || "").trim()
      if (!text || seen.has(href)) continue

      seen.add(href)
      results.push({ href, text })
    }

    return results
  })

  const pageUrl = page.url()
  const listings: Listing[] = []
  for (const card of cards) {
    try {
      listings.push(normalizeCard(card, community, pageUrl))
    } catch (error) {
      console.error(`Failed to normalize listing card on ${pageUrl}:`, error)
    }
  }

  return listings
}

async function scrollUntilStable(page: Page, community: string): Promise<Listing[]> {
  const allByUrl = new Map<string, Listing>()
  let stableRounds = 0
  let previousCount = 0

  while (stableRounds < 3) {
    const listings = await extractVisibleCards(page, community)
    for (const listing of listings) {
      if (listing.listing_url) allByUrl.set(listing.listing_url, listing)
    }

    if (allByUrl.size === previousCount) {
      stableRounds += 1
    } else {
      stableRounds = 0
      previousCount = allByUrl.size
    }

    await page.mouse.wheel(0, 1800)
    await page.waitForTimeout(900)
  }

  return Array.from(allByUrl.values())
}

async function findNextPageUrl(page: Page): Promise<string> {
  return page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
    const next = anchors.find((anchor) => {
      const label = `${anchor.getAttribute("aria-label") ?? ""} ${anchor.textContent ?? ""}`.trim()
      return /next/i.test(label) && !anchor.hasAttribute("disabled") && anchor.getAttribute("aria-disabled") !== "true"
    })
    return next?.href ?? ""
  })
}

function getSequentialPageUrl(startUrl: string, pageNumber: number): string {
  const url = new URL(startUrl)
  url.pathname = url.pathname.replace(/\/page-\d+\/?$/i, "/")
  if (!url.pathname.endsWith("/")) url.pathname += "/"
  if (pageNumber > 1) url.pathname += `page-${pageNumber}/`
  return url.toString()
}

export async function extractSearchListings(
  page: Page,
  community: string,
  url: string,
  delayRange: { min: number; max: number }
): Promise<{ listings: Listing[]; blocked: boolean }> {
  const listingsByUrl = new Map<string, Listing>()
  const visitedSearchPages = new Set<string>()
  const firstPageUrl = getSequentialPageUrl(url, 1)
  let currentUrl = firstPageUrl
  let pageIndex = 1

  while (currentUrl) {
    if (visitedSearchPages.has(currentUrl)) break
    visitedSearchPages.add(currentUrl)

    console.log(`Opening ${community} search page ${pageIndex}: ${currentUrl}`)
    await page.goto(currentUrl, { waitUntil: "domcontentloaded", timeout: 60000 })
    await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined)

    if (await looksBlocked(page)) {
      await waitForManualVerification(page)
      if (await looksBlocked(page)) {
        console.warn(`Blocked after manual verification attempt: ${currentUrl}`)
        return { listings: Array.from(listingsByUrl.values()), blocked: true }
      }
    }

    const pageListings = await scrollUntilStable(page, community)
    if (pageListings.length === 0) {
      const debugPath = await saveDebugHtml(page, community, `page-${pageIndex}`)
      console.log(`No listing cards found. Saved debug HTML to ${debugPath}`)
      break
    }

    let newListingsOnPage = 0
    for (const listing of pageListings) {
      if (!listingsByUrl.has(listing.listing_url)) {
        newListingsOnPage += 1
        listingsByUrl.set(listing.listing_url, listing)
      }
    }
    console.log(
      `Found ${pageListings.length} visible listings on ${community} page ${pageIndex}; ${newListingsOnPage} new for this search.`
    )

    const nextUrl = await findNextPageUrl(page)
    const sequentialNextUrl = getSequentialPageUrl(firstPageUrl, pageIndex + 1)
    const candidateNextUrl = nextUrl && nextUrl !== currentUrl ? nextUrl : sequentialNextUrl

    if (newListingsOnPage === 0 && !nextUrl) break

    pageIndex += 1
    currentUrl = candidateNextUrl
    await randomDelay(delayRange.min, delayRange.max)
  }

  return { listings: Array.from(listingsByUrl.values()), blocked: false }
}
