import { generateVillaExpertContent } from "./content.js"
import { getDb } from "./db.js"
import { runEnrichListingDetails } from "./enrichListingDetails.js"
import { runImportTransactions } from "./importTransactions.js"
import { recomputeMetricsFromListings } from "./metrics.js"
import { runImportMarket } from "./runner.js"

function parseJob(argv: string[]): string {
  const idx = argv.indexOf("--job")
  if (idx >= 0 && argv[idx + 1]) return argv[idx + 1]
  return "import-market"
}

/** Claim and run jobs queued from Hampus dashboard "Update scraper". */
async function processQueuedJobs(): Promise<void> {
  const { data, error } = await getDb()
    .from("zaylo_import_runs")
    .select("id, job_type")
    .eq("status", "queued")
    .in("job_type", ["import-market", "import-transactions", "scrape-listings", "scrape-transactions"])
    .order("created_at", { ascending: true })
    .limit(10)

  if (error) throw new Error(`Failed to load queued jobs: ${error.message}`)
  const jobs = data || []
  if (!jobs.length) {
    console.log("No queued scraper jobs.")
    return
  }

  console.log(`Processing ${jobs.length} queued job(s)…`)

  for (const row of jobs) {
    const id = row.id as string
    const jobType = row.job_type as string
    await getDb()
      .from("zaylo_import_runs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", id)

    try {
      if (jobType === "import-market" || jobType === "scrape-listings") {
        await runImportMarket()
        await recomputeMetricsFromListings()
      } else if (jobType === "import-transactions" || jobType === "scrape-transactions") {
        await runImportTransactions()
      }

      // Mark the dashboard-queued row completed (inner jobs create their own runs)
      await getDb()
        .from("zaylo_import_runs")
        .update({
          status: "completed",
          finished_at: new Date().toISOString(),
          log: `Completed via process-queue (${jobType})`,
        })
        .eq("id", id)
      console.log(`Queued job ${id} (${jobType}) completed.`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await getDb()
        .from("zaylo_import_runs")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          error_count: 1,
          log: message,
        })
        .eq("id", id)
      console.error(`Queued job ${id} (${jobType}) failed:`, message)
      throw err
    }
  }
}

async function main() {
  const job = parseJob(process.argv.slice(2))
  console.log(`Zaylo import worker starting job=${job}`)

  if (job === "process-queue" || job === "update-scraper") {
    await processQueuedJobs()
    return
  }

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
    `Unknown job: ${job}. Use import-market | import-transactions | enrich-listings | generate-content | process-queue`
  )
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exitCode = 1
})
