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
import {
  cleanContactName,
  compactWhitespace,
  inferTransactionType,
  masterFromCommunity,
  normalizeSubAreaLeaf,
  parseBayutLocation,
  randomDelay,
  TARGET_POCKETS,
} from "./utils.js"

async function enrichMissingDetail(
  page: Awaited<ReturnType<typeof openPage>>,
  listing: Listing,
  summary: RunSummary,
  detailIndex?: { current: number; total: number }
): Promise<Listing> {
  if (config.SKIP_DETAIL_ENRICH) return listing

  // Regulatory Information lives on the detail page.
  const needsDetail = !listing.permit_number || !listing.agency
  if (!needsDetail || !listing.listing_url) return listing

  const progress = detailIndex ? ` (${detailIndex.current}/${detailIndex.total})` : ""
  console.log(`Opening detail for permit/agency${progress}: ${listing.listing_url}`)
  await randomDelay(config.DETAIL_PAGE_DELAY_MIN_MS, config.DETAIL_PAGE_DELAY_MAX_MS)
  await page.goto(listing.listing_url, { waitUntil: "domcontentloaded", timeout: 60000 })
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => undefined)
  const detail = await extractDetailListing(page)

  if (detail.blocked) {
    summary.blocked_urls.push(listing.listing_url)
    return ListingSchema.parse({ ...listing, notes: "Blocked while opening detail page" })
  }

  return ListingSchema.parse({
    ...listing,
    listing_number: detail.listing_number || listing.listing_number,
    permit_number: detail.permit_number || listing.permit_number,
    // Registered Agency from Regulatory Information — prefer over card/broker text
    agency: cleanContactName(detail.agency) || listing.agency,
    // Ignore broker / agent name
    agent_name: listing.agent_name || "",
    property_type: detail.property_type || listing.property_type,
    beds: detail.beds ?? listing.beds,
  })
}

function finalizeListing(raw: Listing, inputFallback: string, txType: "rent" | "sale", now: string): Listing | null {
  const seedMaster = masterFromCommunity(inputFallback)
  const parsed = parseBayutLocation(raw.location || raw.sub_area || "", inputFallback)
  const inTarget =
    parsed.inTarget || (TARGET_POCKETS as readonly string[]).includes(seedMaster)
  if (!inTarget) return null

  const master = parsed.inTarget ? parsed.masterCommunity : seedMaster
  let subArea = parsed.inTarget ? parsed.subArea : normalizeSubAreaLeaf(inputFallback, seedMaster)

  // When Bayut only gives master in the breadcrumb, recover leaf from title / seed name
  // e.g. title "Mudon Al Ranim 6" → sub_area "Al Ranim 6"
  if (!subArea || subArea === master) {
    const fromTitle =
      raw.title.match(/\bAl Ranim\s*\d+\b/i)?.[0] ||
      raw.title.match(/\bArabella\s*\d+\b/i)?.[0] ||
      raw.title.match(/\bArabella\b/i)?.[0] ||
      raw.title.match(/\bRahat\b/i)?.[0] ||
      raw.title.match(/\bNaseem\b/i)?.[0] ||
      raw.title.match(/\bAl Salam\b/i)?.[0] ||
      ""
    if (fromTitle) {
      subArea = normalizeSubAreaLeaf(
        compactWhitespace(fromTitle.replace(/^Mudon\s+/i, "")),
        master
      )
    } else if (/arabella|ranim|salam|rahat|naseem/i.test(inputFallback)) {
      subArea = normalizeSubAreaLeaf(inputFallback, master)
    }
  }

  return ListingSchema.parse({
    ...raw,
    community: master,
    master_community: master,
    sub_area: subArea || master,
    agency: cleanContactName(raw.agency),
    agent_name: cleanContactName(raw.agent_name),
    transaction_type: txType,
    last_seen: now,
    first_seen: now,
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
  let page = await openPage(context)
  let browserContext = context

  async function ensurePage() {
    try {
      if (page.isClosed()) {
        console.warn("Page was closed — opening a new tab.")
        page = await openPage(browserContext)
      }
      return page
    } catch {
      console.warn("Browser context lost — relaunching Chrome.")
      browserContext = await createBrowserContext()
      page = await openPage(browserContext)
      return page
    }
  }

  try {
    for (const inputLink of inputLinks) {
      const now = new Date().toISOString()
      const kind = inputLink.kind || ""
      console.log(`\nStarting: ${inputLink.community} (${kind || "listings"})`)

      try {
        page = await ensurePage()

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
        const seenByCommunity = new Map<string, Set<string>>()
        const txType = inferTransactionType(inputLink.url)
        let skippedOffTarget = 0

        const searchResult = await extractSearchListings(
          page,
          inputLink.community,
          inputLink.url,
          {
            min: config.SEARCH_PAGE_DELAY_MIN_MS,
            max: config.SEARCH_PAGE_DELAY_MAX_MS,
          },
          async (fresh) => {
            let i = 0
            for (const rawListing of fresh) {
              try {
                i += 1
                page = await ensurePage()
                const listing = await enrichMissingDetail(page, rawListing, summary, {
                  current: i,
                  total: fresh.length,
                })

                const finalListing = finalizeListing(
                  listing,
                  inputLink.masterCommunity || inputLink.community,
                  txType,
                  now
                )
                if (!finalListing) {
                  skippedOffTarget += 1
                  continue
                }

                summary.total_listings_found += 1
                if (finalListing.listing_url) {
                  seenUrls.add(finalListing.listing_url)
                  const set = seenByCommunity.get(finalListing.community) ?? new Set<string>()
                  set.add(finalListing.listing_url)
                  seenByCommunity.set(finalListing.community, set)
                }

                const result = await upsertListing(finalListing, importRunId)
                if (result === "new") summary.new_count += 1
                else summary.updated_count += 1
              } catch (error) {
                summary.error_count += 1
                console.error("Failed to process listing. Continuing.", error)
              }
            }
            console.log(
              `Saved so far: new=${summary.new_count} updated=${summary.updated_count} skipped_off_target=${skippedOffTarget}`
            )
          }
        )

        if (searchResult.blocked) {
          summary.blocked_urls.push(inputLink.url)
          await markSourceStatus(inputLink.url, "blocked")
        } else {
          if (seenByCommunity.size > 0 && !process.env.SOURCE_URL_INCLUDES) {
            for (const [community, urls] of seenByCommunity) {
              summary.not_seen_count += await markNotSeen(community, urls, now, importRunId, txType)
            }
          } else if (process.env.SOURCE_URL_INCLUDES) {
            console.log("Skipping markNotSeen (partial SOURCE_URL_INCLUDES scrape)")
          }
          await markSourceStatus(
            inputLink.url,
            summary.new_count + summary.updated_count > 0 ? "ready" : "empty"
          )
        }

        console.log(
          `Source done. kept=${seenUrls.size} skipped_off_target=${skippedOffTarget} (of ${searchResult.listings.length} raw cards)`
        )
      } catch (error) {
        summary.error_count += 1
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Source failed (${inputLink.community}): ${message}. Continuing to next URL.`)
        await markSourceStatus(inputLink.url, "error").catch(() => undefined)
        if (/closed|Target page|browser has been closed/i.test(message)) {
          console.warn("Browser/page closed — relaunching and continuing.")
          try {
            page = await ensurePage()
          } catch {
            console.error("Could not reopen browser — stopping scrape.")
            break
          }
        }
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
    await browserContext.close().catch(() => undefined)
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
