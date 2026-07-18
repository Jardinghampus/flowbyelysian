import { createBrowserContext, openPage } from "./browser.js"
import { config } from "./config.js"
import { createImportRun, finishImportRun, getDb } from "./db.js"
import { extractDetailListing } from "./extractDetailListing.js"
import type { RunSummary } from "./types.js"
import { cleanContactName, randomDelay } from "./utils.js"

/**
 * Re-open Bayut detail pages for active listings missing Permit Number
 * and/or Registered Agency (Regulatory Information block).
 */
export async function runEnrichListingDetails(): Promise<RunSummary> {
  const limit = Math.min(Number(process.env.ENRICH_LIMIT || 80), 300)
  const importRunId = await createImportRun("enrich-listing-details")
  const summary: RunSummary = {
    total_search_urls: 0,
    total_listings_found: 0,
    new_count: 0,
    updated_count: 0,
    not_seen_count: 0,
    blocked_urls: [],
    error_count: 0,
    transactions_saved: 0,
  }

  const { data, error } = await getDb()
    .from("bayut_market_listings")
    .select("id, listing_url, permit_number, agency, title")
    .eq("status", "active")
    .or("permit_number.is.null,permit_number.eq.,agency.is.null,agency.eq.")
    .not("listing_url", "eq", "")
    .limit(limit)

  if (error) throw new Error(`Failed to load listings for enrich: ${error.message}`)
  const rows = data || []
  summary.total_listings_found = rows.length
  console.log(`Enriching ${rows.length} listings missing permit and/or agency (limit=${limit})`)

  const context = await createBrowserContext()
  let page = await openPage(context)

  try {
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]
      try {
        if (page.isClosed()) page = await openPage(context)
        console.log(`Detail ${i + 1}/${rows.length}: ${row.listing_url}`)
        await randomDelay(config.DETAIL_PAGE_DELAY_MIN_MS, config.DETAIL_PAGE_DELAY_MAX_MS)
        await page.goto(row.listing_url, { waitUntil: "domcontentloaded", timeout: 60000 })
        await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => undefined)

        const detail = await extractDetailListing(page)
        if (detail.blocked) {
          summary.blocked_urls.push(row.listing_url)
          continue
        }

        const permit = detail.permit_number || row.permit_number || ""
        const agency = cleanContactName(detail.agency) || row.agency || ""
        if (!permit && !agency) {
          console.log(`  no regulatory fields found`)
          continue
        }

        const { error: upErr } = await getDb()
          .from("bayut_market_listings")
          .update({
            permit_number: permit,
            agency,
            listing_number: detail.listing_number || undefined,
            property_type: detail.property_type || undefined,
            beds: detail.beds ?? undefined,
            import_run_id: importRunId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id)

        if (upErr) {
          summary.error_count += 1
          console.error(`  update failed: ${upErr.message}`)
        } else {
          summary.updated_count += 1
          console.log(`  permit=${permit || "—"} agency=${agency || "—"}`)
        }
      } catch (err) {
        summary.error_count += 1
        console.error(`Detail enrich failed for ${row.listing_url}:`, err)
      }
    }
  } finally {
    await context.close().catch(() => undefined)
  }

  await finishImportRun(importRunId, {
    status: summary.blocked_urls.length && !summary.updated_count ? "blocked" : "completed",
    total_sources: rows.length,
    total_rows: summary.updated_count,
    blocked_urls: summary.blocked_urls,
    error_count: summary.error_count,
    log: JSON.stringify(summary),
  })

  console.log("Enrich summary:", JSON.stringify(summary, null, 2))
  return summary
}
