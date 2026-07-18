import { createBrowserContext, openPage } from "./browser.js"
import { config } from "./config.js"
import {
  createImportRun,
  finishImportRun,
  insertTransactions,
  markNotSeen,
  markSourceStatus,
  upsertListing,
} from "./db.js"
import { extractDetailListing } from "./extractDetailListing.js"
import { extractSearchListings } from "./extractSearchListings.js"
import { extractTransactions } from "./extractTransactions.js"
import { resolveInputLinks } from "./sources.js"
import { ListingSchema, type Listing, type RunSummary } from "./types.js"
import { inferTransactionType, masterFromCommunity, randomDelay } from "./utils.js"

async function enrichMissingDetail(
  page: Awaited<ReturnType<typeof openPage>>,
  listing: Listing,
  summary: RunSummary,
  detailIndex?: { current: number; total: number }
): Promise<Listing> {
  const needsDetail =
    !listing.listing_number ||
    !listing.permit_number ||
    !listing.agency ||
    !listing.agent_name
  if (!needsDetail || !listing.listing_url) return listing

  const progress = detailIndex ? ` (${detailIndex.current}/${detailIndex.total})` : ""
  console.log(`Opening detail page${progress}: ${listing.listing_url}`)
  await randomDelay(config.DETAIL_PAGE_DELAY_MIN_MS, config.DETAIL_PAGE_DELAY_MAX_MS)
  await page.goto(listing.listing_url, { waitUntil: "domcontentloaded", timeout: 60000 })
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined)
  const detail = await extractDetailListing(page)

  if (detail.blocked) {
    summary.blocked_urls.push(listing.listing_url)
    return ListingSchema.parse({ ...listing, status: "blocked", notes: "Blocked while opening detail page" })
  }

  return ListingSchema.parse({
    ...listing,
    listing_number: detail.listing_number || listing.listing_number,
    permit_number: detail.permit_number || listing.permit_number,
    agency: detail.agency || listing.agency,
    agent_name: detail.agent_name || listing.agent_name,
  })
}

export async function runImportMarket(): Promise<RunSummary> {
  const inputLinks = await resolveInputLinks()
  const importRunId = await createImportRun("import-market")
  const summary: RunSummary = {
    total_search_urls: inputLinks.length,
    total_listings_found: 0,
    new_count: 0,
    updated_count: 0,
    not_seen_count: 0,
    blocked_urls: [],
    error_count: 0,
    transactions_saved: 0,
  }

  const context = await createBrowserContext()
  const page = await openPage(context)

  try {
    for (const inputLink of inputLinks) {
      const now = new Date().toISOString()
      const kind = inputLink.kind || ""
      console.log(`\nStarting: ${inputLink.community} (${kind || "listings"})`)

      if (kind.includes("transactions")) {
        const tx = await extractTransactions(page, inputLink.url)
        if (tx.blocked) {
          summary.blocked_urls.push(inputLink.url)
          await markSourceStatus(inputLink.url, "blocked")
          continue
        }
        const saved = await insertTransactions(
          tx.rows.map((row) => ({
            community: inputLink.community,
            master_community: inputLink.masterCommunity || masterFromCommunity(inputLink.community),
            bedrooms: row.bedrooms,
            property_type: row.property_type,
            transaction_type: inferTransactionType(inputLink.url),
            price_aed: row.price_aed,
            size_sqft: row.size_sqft,
            price_per_sqft_aed: row.price_per_sqft_aed,
            transaction_date: row.transaction_date,
            source_url: inputLink.url,
            raw: row.raw,
          })),
          importRunId
        )
        summary.transactions_saved += saved
        await markSourceStatus(inputLink.url, saved > 0 ? "ready" : "empty")
        continue
      }

      const seenUrls = new Set<string>()
      const searchResult = await extractSearchListings(page, inputLink.community, inputLink.url, {
        min: config.SEARCH_PAGE_DELAY_MIN_MS,
        max: config.SEARCH_PAGE_DELAY_MAX_MS,
      })

      if (searchResult.blocked) {
        summary.blocked_urls.push(inputLink.url)
        await markSourceStatus(inputLink.url, "blocked")
      }

      summary.total_listings_found += searchResult.listings.length

      for (const [index, rawListing] of searchResult.listings.entries()) {
        try {
          const listing = await enrichMissingDetail(page, rawListing, summary, {
            current: index + 1,
            total: searchResult.listings.length,
          })
          const finalListing = ListingSchema.parse({
            ...listing,
            community: inputLink.community,
            master_community: inputLink.masterCommunity || masterFromCommunity(inputLink.community),
            transaction_type: inferTransactionType(inputLink.url),
            last_seen: now,
            first_seen: now,
          })

          if (finalListing.listing_url) seenUrls.add(finalListing.listing_url)

          const result = await upsertListing(finalListing, importRunId)
          if (result === "new") summary.new_count += 1
          else summary.updated_count += 1
        } catch (error) {
          summary.error_count += 1
          console.error("Failed to process listing. Continuing.", error)
        }
      }

      if (!searchResult.blocked) {
        // Scope by rent/sale so a rent scrape cannot soft-hide sale listings (and vice versa).
        const txType = inferTransactionType(inputLink.url)
        summary.not_seen_count += await markNotSeen(
          inputLink.community,
          seenUrls,
          now,
          importRunId,
          txType
        )
        await markSourceStatus(inputLink.url, searchResult.listings.length > 0 ? "ready" : "empty")
      }
    }
  } catch (error) {
    await finishImportRun(importRunId, {
      status: "failed",
      total_sources: summary.total_search_urls,
      total_rows: summary.new_count + summary.updated_count + summary.transactions_saved,
      blocked_urls: summary.blocked_urls,
      error_count: summary.error_count + 1,
      log: error instanceof Error ? error.message : String(error),
    })
    throw error
  } finally {
    await context.close()
  }

  const status =
    summary.blocked_urls.length > 0 && summary.new_count + summary.updated_count === 0 ? "blocked" : "completed"

  await finishImportRun(importRunId, {
    status,
    total_sources: summary.total_search_urls,
    total_rows: summary.new_count + summary.updated_count + summary.transactions_saved,
    blocked_urls: summary.blocked_urls,
    error_count: summary.error_count,
    log: JSON.stringify(summary),
  })

  console.log("\nRun summary:")
  console.log(JSON.stringify(summary, null, 2))
  return summary
}
