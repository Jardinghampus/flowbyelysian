import type { Page } from "playwright"
import { config } from "./config.js"
import { ListingSchema, type Listing } from "./types.js"
import {
  cleanContactName,
  compactJson,
  compactWhitespace,
  extractBedsFromText,
  extractPropertyType,
  inferTransactionType,
  looksBlocked,
  looksNotFound,
  normalizeBayutUrl,
  parseNumber,
  randomDelay,
  saveDebugHtml,
  waitForManualVerification,
} from "./utils.js"

interface ExtractedCard {
  text: string
  href: string
  agency: string
  agentName: string
  propertyTypeHint: string
  bedsHint: string
  locationHint: string
}

function extractAgencyFromText(text: string): string {
  const lines = text.split("\n").map(compactWhitespace).filter(Boolean)
  const skip =
    /AED|Yearly|Monthly|Weekly|Daily|bed|bath|sq\.?\s*ft|verified|trucheck|call|email|whatsapp|listed|superagent|premium|studio|\d+\s*BR|find my agent/i
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i]
    if (line.length < 3 || line.length > 80) continue
    if (skip.test(line)) continue
    if (/^dubai$/i.test(line)) continue
    if (/Mudon|Ranches|Hills|Lagoons|Villanova|Town Square|Oasis|Arabella|Ranim/i.test(line) && /,/.test(line)) {
      continue
    }
    if (/realty|properties|estate|broker|group|homes|living|partners|agency|real estate/i.test(line)) {
      return cleanContactName(line)
    }
  }
  return ""
}

function extractAgentFromText(text: string): string {
  const match = text.match(
    /(?:Agent|Listed by)\s*[:\-]?\s*([A-Z][A-Za-z.'\-]+(?:\s+[A-Z][A-Za-z.'\-]+){0,3})/
  )
  return cleanContactName(match?.[1] || "")
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

function extractBaths(text: string): number | null {
  const match = text.match(/\b(\d+(?:\.\d+)?)\s*[\n\r\t ]*(?:Baths?|Bathrooms?)\b/i)
  return parseNumber(match?.[1])
}

function extractLocation(text: string, hint = ""): string {
  if (hint && /,/.test(hint)) return compactWhitespace(hint)
  const lines = text.split("\n").map(compactWhitespace).filter(Boolean)
  const likely = lines.find(
    (line) =>
      /,/.test(line) &&
      /Dubai|Mudon|Arabella|Town Square|Ranches|DAMAC|Villanova|Lagoons|Hills/i.test(line) &&
      !/AED|bed|bath|sq|agent|agency|call|whatsapp/i.test(line)
  )
  return likely ?? hint ?? ""
}

function extractTitle(text: string): string {
  const skip =
    /AED|Yearly|Monthly|Weekly|Daily|beds?|baths?|sq\.?\s*ft|verified|trucheck|find my agent|^checked$|^on\b|trubroker|premium|superagent|whatsapp|email|call|listed by/i
  const lines = text.split("\n").map(compactWhitespace).filter(Boolean)
  return (
    lines.find((line) => line.length >= 20 && !skip.test(line) && !/^[\d.,\s]+$/.test(line)) ??
    lines.find((line) => line.length >= 12 && !skip.test(line) && /[a-zA-Z]/.test(line)) ??
    ""
  )
}

function normalizeCard(card: ExtractedCard, community: string, pageUrl: string): Listing {
  const normalizedUrl = normalizeBayutUrl(card.href)
  const text = `${card.bedsHint}\n${card.locationHint}\n${card.text}`
  const title = extractTitle(card.text)
  const propertyType = extractPropertyType(
    `${card.propertyTypeHint}\n${title}\n${card.text}`,
    normalizedUrl || card.href
  )
  const location = extractLocation(card.text, card.locationHint)
  const agency = cleanContactName(card.agency) || extractAgencyFromText(card.text)
  const agentName = cleanContactName(card.agentName) || extractAgentFromText(card.text)
  const beds = extractBedsFromText(`${card.bedsHint}\n${card.text}`)

  const rawSummary = {
    title,
    location,
    beds,
    agency,
    agent_name: agentName,
    property_type: propertyType,
  }

  return ListingSchema.parse({
    source: "bayut",
    community,
    listing_number: "",
    permit_number: "",
    title,
    price: extractPrice(card.text),
    currency: extractCurrency(card.text),
    rent_period: extractRentPeriod(card.text),
    location,
    beds,
    baths: extractBaths(card.text),
    size_sqft: extractBuiltUp(card.text),
    built_up_sqft: extractBuiltUp(card.text),
    plot_sqft: extractPlot(card.text),
    sub_area: location || community,
    property_type: propertyType,
    agency,
    agent_name: agentName,
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
      document.querySelectorAll<HTMLAnchorElement>("a[href*='/property/details-']")
    )
    const results: Array<{
      text: string
      href: string
      agency: string
      agentName: string
      propertyTypeHint: string
      bedsHint: string
      locationHint: string
    }> = []
    const seen = new Set<string>()

    for (const anchor of anchors) {
      const href = anchor.getAttribute("href") ?? ""
      if (!/\/property\/details-\d+\.html/i.test(href)) continue

      const semanticContainer = anchor.closest(
        "article, li, [role='article'], [data-testid*='listing'], [data-testid*='property']"
      ) as HTMLElement | null
      const fallbackContainer = anchor.parentElement?.parentElement?.parentElement as HTMLElement | null
      const container = semanticContainer ?? fallbackContainer
      if (!container) continue

      // Skip tiny footer/recommendation chips
      const text = (container.innerText || "").trim()
      if (!text || text.length < 40 || seen.has(href)) continue
      if (!/\bAED\b/i.test(text)) continue

      const agencyFromLink =
        container
          .querySelector<HTMLAnchorElement>("a[href*='/companies/'], a[href*='/brokers/'], a[href*='/agency/']")
          ?.textContent?.trim() || ""
      const agencyFromImg =
        container.querySelector<HTMLImageElement>("img[alt*='Properties'], img[alt*='Realty'], img[alt*='Estate'], img[alt*='Homes']")
          ?.getAttribute("alt")
          ?.trim() || ""
      const agency = agencyFromLink || agencyFromImg || ""

      const agentEl = container.querySelector<HTMLElement>(
        "a[href*='/agents/'], [data-testid*='agent-name'], [class*='agent-name']"
      )
      const agentName = agentEl?.textContent?.trim() || ""

      const typeNode = container.querySelector<HTMLElement>(
        "[aria-label*='Villa'], [aria-label*='Townhouse'], [aria-label*='Apartment'], [aria-label*='Penthouse']"
      )
      const propertyTypeHint =
        typeNode?.getAttribute("aria-label") || typeNode?.textContent?.trim() || ""

      const bedsWrap = container.querySelector<HTMLElement>(
        "[aria-label*='Bed'], [aria-label*='bed'], [aria-label*='Studio'], [aria-label*='studio']"
      )
      let bedsHint =
        `${bedsWrap?.getAttribute("aria-label") || ""} ${bedsWrap?.textContent || ""}`.trim()

      if (!bedsHint) {
        const html = container.innerHTML
        const fromAria = html.match(/aria-label\s*=\s*["'](\d+)\s*Beds?["']/i)
        const fromPair = html.match(/>(\d{1,2})<\/(?:span|div)>\s*<[^>]*>\s*Beds?/i)
        const fromTitle = (container.textContent || "").match(/\b(\d{1,2})\s*(?:BR|Bedrooms?)\b/i)
        bedsHint = fromAria?.[0] || fromPair?.[0] || fromTitle?.[0] || ""
      }

      // Stats chips: number immediately before a "Beds" label
      if (!/\d/.test(bedsHint)) {
        const nodes = Array.from(container.querySelectorAll("span, div, p"))
        for (let i = 1; i < nodes.length; i += 1) {
          const label = (nodes[i].textContent || "").trim()
          const prev = (nodes[i - 1].textContent || "").trim()
          if (/^Beds?$/i.test(label) && /^(Studio|\d{1,2})$/i.test(prev)) {
            bedsHint = `${prev} Beds`
            break
          }
        }
      }

      const locationNode = Array.from(container.querySelectorAll<HTMLElement>("span, div, p")).find((el) => {
        const t = (el.textContent || "").trim()
        return t.length > 8 && t.length < 120 && /,/.test(t) && /Dubai/i.test(t) && !/AED|Beds?|Baths?/i.test(t)
      })
      const locationHint = locationNode?.textContent?.trim() || ""

      seen.add(href)
      results.push({
        href,
        text,
        agency,
        agentName,
        propertyTypeHint,
        bedsHint,
        locationHint,
      })
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
    try {
      await page.waitForTimeout(900)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (/closed|Target page|browser has been closed/i.test(message)) {
        console.warn("Browser closed during scroll — returning listings collected so far.")
        break
      }
      throw error
    }
  }

  return Array.from(allByUrl.values())
}

async function findNextPageUrl(page: Page): Promise<string> {
  return page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
    const nextByLabel = anchors.find((anchor) => {
      const label = `${anchor.getAttribute("aria-label") ?? ""} ${anchor.textContent ?? ""}`.trim()
      return /^(next|>|›)$/i.test(label) || /^next\b/i.test(label)
    })
    if (
      nextByLabel?.href &&
      !nextByLabel.hasAttribute("disabled") &&
      nextByLabel.getAttribute("aria-disabled") !== "true"
    ) {
      return nextByLabel.href
    }

    const current = window.location.href
    const currentPage = Number(current.match(/\/page-(\d+)\//i)?.[1] || "1")
    const pageLinks = anchors
      .map((a) => a.href)
      .filter((href) => /\/page-\d+\//i.test(href))
      .map((href) => ({ href, n: Number(href.match(/\/page-(\d+)\//i)?.[1] || "0") }))
      .filter((x) => x.n === currentPage + 1)
      .sort((a, b) => a.n - b.n)

    return pageLinks[0]?.href ?? ""
  })
}

export type SearchPageHandler = (pageListings: Listing[], meta: { pageIndex: number; url: string }) => Promise<void>

export async function extractSearchListings(
  page: Page,
  community: string,
  url: string,
  delayRange: { min: number; max: number },
  onPage?: SearchPageHandler
): Promise<{ listings: Listing[]; blocked: boolean }> {
  const listingsByUrl = new Map<string, Listing>()
  const visitedSearchPages = new Set<string>()
  const firstPageUrl = url
  const isMultiLocation = new URL(url).searchParams.has("locations")
  let currentUrl = firstPageUrl
  let pageIndex = 1

  while (currentUrl) {
    if (visitedSearchPages.has(currentUrl)) break
    visitedSearchPages.add(currentUrl)

    console.log(`Opening ${community} search page ${pageIndex}: ${currentUrl}`)
    await page.goto(currentUrl, { waitUntil: "domcontentloaded", timeout: 60000 })
    await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined)

    if (await looksBlocked(page)) {
      const cleared = await waitForManualVerification(page)
      if (!cleared || (await looksBlocked(page))) {
        console.warn(`Blocked after verification attempt: ${currentUrl}`)
        return { listings: Array.from(listingsByUrl.values()), blocked: true }
      }
    }

    if (await looksNotFound(page)) {
      console.warn(`Search page not found (404) — stopping pagination: ${currentUrl}`)
      break
    }

    const landedUrl = page.url()
    if (
      isMultiLocation &&
      /dubai-islands?|palm-jumeirah|downtown-dubai/i.test(landedUrl) &&
      !/locations=/i.test(landedUrl)
    ) {
      console.warn(`Landed on unrelated area (${landedUrl}) — stopping pagination.`)
      break
    }

    const pageListings = await scrollUntilStable(page, community)
    if (pageListings.length === 0) {
      const debugPath = await saveDebugHtml(page, community, `page-${pageIndex}`)
      console.log(`No listing cards found. Saved debug HTML to ${debugPath}`)
      break
    }

    const fresh: Listing[] = []
    for (const listing of pageListings) {
      if (!listingsByUrl.has(listing.listing_url)) {
        listingsByUrl.set(listing.listing_url, listing)
        fresh.push(listing)
      }
    }
    console.log(
      `Found ${pageListings.length} visible listings on ${community} page ${pageIndex}; ${fresh.length} new for this search.`
    )

    if (onPage && fresh.length > 0) {
      await onPage(fresh, { pageIndex, url: currentUrl })
    }

    if (fresh.length === 0) {
      console.log("No new listings on this page — stopping pagination.")
      break
    }

    if (config.MAX_SEARCH_PAGES > 0 && pageIndex >= config.MAX_SEARCH_PAGES) {
      console.log(`MAX_SEARCH_PAGES=${config.MAX_SEARCH_PAGES} — stopping pagination.`)
      break
    }

    const nextUrl = await findNextPageUrl(page)
    if (!nextUrl || nextUrl === currentUrl || visitedSearchPages.has(nextUrl)) {
      console.log("No further Bayut pagination link — done with this search.")
      break
    }
    if (/dubai-islands?/i.test(nextUrl) && !/locations=/i.test(nextUrl)) {
      console.warn(`Skipping suspicious next link: ${nextUrl}`)
      break
    }

    pageIndex += 1
    currentUrl = nextUrl
    await randomDelay(delayRange.min, delayRange.max)
  }

  return { listings: Array.from(listingsByUrl.values()), blocked: false }
}
