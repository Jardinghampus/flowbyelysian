import { NextResponse } from "next/server"
import { requireHampusUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

/**
 * Hampus-only: queue listing + transaction scrapes.
 * On Vercel the browser scrape cannot run — we queue DB jobs and optionally
 * ping ZAYLO_WORKER_TRIGGER_URL so a local/VPS worker picks them up.
 */
export async function POST() {
  try {
    const guard = await requireHampusUser()
    if (!guard.ok) return guard.response

    const supabase = createUntypedServerClient()
    const requestedBy = guard.context.email || "hampus@zaylo.com"
    const now = new Date().toISOString()

    // Avoid stacking identical queued jobs
    const { data: existing } = await supabase
      .from("zaylo_import_runs")
      .select("id, job_type")
      .eq("status", "queued")
      .in("job_type", ["import-market", "import-transactions", "scrape-all"])

    const alreadyQueued = new Set((existing || []).map((r) => r.job_type as string))
    const toInsert: Array<{ job_type: string; status: string; log: string }> = []

    if (!alreadyQueued.has("import-market")) {
      toInsert.push({
        job_type: "import-market",
        status: "queued",
        log: `Requested by ${requestedBy} at ${now} (listings)`,
      })
    }
    if (!alreadyQueued.has("import-transactions")) {
      toInsert.push({
        job_type: "import-transactions",
        status: "queued",
        log: `Requested by ${requestedBy} at ${now} (transactions)`,
      })
    }

    let queuedIds: string[] = (existing || []).map((r) => r.id as string)
    if (toInsert.length) {
      const { data: inserted, error } = await supabase
        .from("zaylo_import_runs")
        .insert(toInsert)
        .select("id, job_type")
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      queuedIds = [...queuedIds, ...(inserted || []).map((r) => r.id as string)]
    }

    let workerTriggered = false
    let workerMessage: string | null = null
    const triggerUrl = process.env.ZAYLO_WORKER_TRIGGER_URL?.trim()
    const triggerSecret = process.env.ZAYLO_WORKER_TRIGGER_SECRET?.trim()

    if (triggerUrl) {
      try {
        const res = await fetch(triggerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(triggerSecret ? { Authorization: `Bearer ${triggerSecret}` } : {}),
          },
          body: JSON.stringify({
            job: "process-queue",
            requestedBy,
            queuedIds,
          }),
        })
        workerTriggered = res.ok
        workerMessage = workerTriggered
          ? "Worker triggered — scrape starting on the dedicated machine."
          : `Worker trigger failed (${res.status}). Jobs are still queued.`
      } catch (err) {
        workerMessage = `Worker unreachable — jobs queued. Run locally: pnpm zaylo:worker -- --job process-queue`
        console.error("Worker trigger failed:", err)
      }
    } else if (process.env.VERCEL === "1") {
      workerMessage =
        "Jobs queued. Scrapes cannot run on Vercel — start the worker: pnpm zaylo:worker -- --job process-queue"
    } else {
      // Local / non-Vercel: try spawning process-queue in background via existing control if available
      workerMessage =
        "Jobs queued. Run: pnpm zaylo:worker -- --job process-queue (or set ZAYLO_WORKER_TRIGGER_URL)."
    }

    return NextResponse.json({
      ok: true,
      queuedIds,
      newlyQueued: toInsert.map((j) => j.job_type),
      alreadyQueued: [...alreadyQueued],
      workerTriggered,
      message: workerMessage,
    })
  } catch (error) {
    console.error("scraper update failed:", error)
    return NextResponse.json({ error: "Failed to queue scraper update" }, { status: 500 })
  }
}
