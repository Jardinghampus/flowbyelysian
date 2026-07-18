import { createBrowserContext, openPage } from "./browser.js"
import { config } from "./config.js"
import {
  createImportRun,
  finishImportRun,
  markSourceStatus,
  upsertTransactions,
} from "./db.js"
import { extractTransactions } from "./extractTransactions.js"
import type { RunSummary } from "./types.js"
import { inferTransactionType, masterFromCommunity, randomDelay } from "./utils.js"

async function resolveTransactionLinks() {
  // Always use curated 3m sale+rent for target pockets (DB links are incomplete for rent).
  const bases = [
    ["Mudon", "mudon"],
    ["DAMAC Hills", "damac-hills"],
    ["Town Square", "town-square"],
    ["Villanova", "dubailand/villanova"],
    ["Arabian Ranches", "arabian-ranches"],
    ["Arabian Ranches 2", "arabian-ranches-2"],
    ["Arabian Ranches 3", "arabian-ranches-3"],
  ] as const

  const curated = bases.flatMap(([name, path]) => [
    {
      community: name,
      masterCommunity: name,
      kind: "bayut_sale_transactions",
      url: `https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/${path}/?time_since_creation=3m`,
    },
    {
      community: name,
      masterCommunity: name,
      kind: "bayut_rent_transactions",
      url: `https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/${path}/?time_since_creation=3m`,
    },
  ])

  return prioritizeLinks(curated)
}

/** Prefer Mudon / blocked communities first when DB links exist. */
function prioritizeLinks<T extends { community: string; url: string }>(links: T[]): T[] {
  const rank = (c: string, url: string) => {
    if (/mudon/i.test(c) || /mudon/i.test(url)) return 0
    if (/villanova/i.test(c) || /villanova/i.test(url)) return 1
    return 2
  }
  return [...links].sort((a, b) => rank(a.community, a.url) - rank(b.community, b.url))
}

export async function runImportTransactions(): Promise<RunSummary> {
  const only = (process.env.TX_ONLY || "").trim().toLowerCase()
  const kindFilter = (process.env.TX_KIND || "").trim().toLowerCase() // sale | rent
  let inputLinks = await resolveTransactionLinks()
  if (only) {
    inputLinks = inputLinks.filter(
      (l) => l.community.toLowerCase().includes(only) || l.url.toLowerCase().includes(only)
    )
    console.log(`TX_ONLY=${only} → ${inputLinks.length} source URL(s)`)
  }
  if (kindFilter === "sale" || kindFilter === "rent") {
    inputLinks = inputLinks.filter((l) => l.kind.includes(kindFilter))
    console.log(`TX_KIND=${kindFilter} → ${inputLinks.length} source URL(s)`)
  }
  const importRunId = await createImportRun("import-transactions")
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

  async function ensurePage() {
    try {
      if (page.isClosed()) page = await openPage(context)
      return page
    } catch {
      page = await openPage(await createBrowserContext())
      return page
    }
  }

  try {
    for (const inputLink of inputLinks) {
      console.log(`\nStarting transactions: ${inputLink.community} (${inputLink.kind})`)
      try {
        page = await ensurePage()
        await randomDelay(config.SEARCH_PAGE_DELAY_MIN_MS, config.SEARCH_PAGE_DELAY_MAX_MS)
        const tx = await extractTransactions(page, inputLink.url, inputLink.community)
        if (tx.blocked) {
          summary.blocked_urls.push(inputLink.url)
          await markSourceStatus(inputLink.url, "blocked")
          continue
        }

        const saved = await upsertTransactions(
          tx.rows.map((row) => ({
            community: row.community || inputLink.community,
            master_community:
              row.master_community || inputLink.masterCommunity || masterFromCommunity(inputLink.community),
            sub_area: row.sub_area,
            location: row.location,
            bedrooms: row.bedrooms,
            property_type: row.property_type,
            transaction_type: inferTransactionType(inputLink.url),
            price_aed: row.price_aed,
            size_sqft: row.size_sqft,
            built_up_sqft: row.built_up_sqft,
            plot_sqft: row.plot_sqft,
            price_per_sqft_aed: row.price_per_sqft_aed,
            transaction_date: row.transaction_date,
            history: row.history,
            detail_url: row.detail_url,
            fingerprint: String(row.raw.fingerprint || ""),
            source_url: inputLink.url,
            raw: row.raw,
          })),
          importRunId
        )
        summary.transactions_saved += saved
        summary.total_listings_found += tx.rows.length
        await markSourceStatus(inputLink.url, saved > 0 ? "ready" : "empty")
        console.log(`Saved ${saved}/${tx.rows.length} transactions for ${inputLink.community}`)
      } catch (error) {
        summary.error_count += 1
        console.error(`Transaction source failed (${inputLink.community}):`, error)
        await markSourceStatus(inputLink.url, "error").catch(() => undefined)
      }
    }
  } finally {
    await context.close().catch(() => undefined)
  }

  await finishImportRun(importRunId, {
    status: summary.blocked_urls.length && !summary.transactions_saved ? "blocked" : "completed",
    total_sources: summary.total_search_urls,
    total_rows: summary.transactions_saved,
    blocked_urls: summary.blocked_urls,
    error_count: summary.error_count,
    log: JSON.stringify(summary),
  })

  console.log("\nTransaction run summary:")
  console.log(JSON.stringify(summary, null, 2))
  return summary
}
