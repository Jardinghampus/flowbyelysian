import { generateVillaExpertContent } from "./content.js"
import { runEnrichListingDetails } from "./enrichListingDetails.js"
import { runImportTransactions } from "./importTransactions.js"
import { recomputeMetricsFromListings } from "./metrics.js"
import { runImportMarket } from "./runner.js"

function parseJob(argv: string[]): string {
  const idx = argv.indexOf("--job")
  if (idx >= 0 && argv[idx + 1]) return argv[idx + 1]
  return "import-market"
}

async function main() {
  const job = parseJob(process.argv.slice(2))
  console.log(`Zaylo import worker starting job=${job}`)

  if (job === "import-market" || job === "scrape-listings") {
    await runImportMarket()
    await recomputeMetricsFromListings()
    return
  }

  if (job === "import-transactions" || job === "scrape-transactions") {
    await runImportTransactions()
    return
  }

  if (job === "enrich-listings" || job === "enrich-permits") {
    await runEnrichListingDetails()
    return
  }

  if (job === "generate-content" || job === "generate-week") {
    await recomputeMetricsFromListings()
    await generateVillaExpertContent()
    return
  }

  throw new Error(
    `Unknown job: ${job}. Use import-market | import-transactions | enrich-listings | generate-content`
  )
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exitCode = 1
})
