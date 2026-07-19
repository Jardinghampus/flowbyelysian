import { NextResponse } from "next/server"
import { requireHampusUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return null
  const ms = Date.now() - then
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)))
}

export async function GET() {
  try {
    const guard = await requireHampusUser()
    if (!guard.ok) return guard.response

    const supabase = createUntypedServerClient()

    const [listingsRes, txRes, runsRes, queuedRes] = await Promise.all([
      supabase
        .from("bayut_market_listings")
        .select("last_seen")
        .order("last_seen", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("bayut_transactions")
        .select("created_at, transaction_date")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("zaylo_import_runs")
        .select("id, job_type, status, finished_at, started_at, created_at, total_rows, log")
        .eq("status", "completed")
        .order("finished_at", { ascending: false })
        .limit(5),
      supabase
        .from("zaylo_import_runs")
        .select("id, job_type, status, created_at")
        .eq("status", "queued")
        .order("created_at", { ascending: false })
        .limit(5),
    ])

    const lastListingSeen = listingsRes.data?.last_seen ?? null
    const lastTxCreated = txRes.data?.created_at ?? null
    const lastTxDate = txRes.data?.transaction_date ?? null
    const lastCompleted = runsRes.data?.[0] ?? null
    const lastCompletedAt =
      lastCompleted?.finished_at || lastCompleted?.started_at || lastCompleted?.created_at || null

    const candidates = [lastListingSeen, lastTxCreated, lastCompletedAt].filter(Boolean) as string[]
    const lastUpdateAt =
      candidates.length > 0
        ? candidates.reduce((a, b) => (new Date(a) > new Date(b) ? a : b))
        : null

    return NextResponse.json({
      lastUpdateAt,
      daysSinceLastUpdate: daysSince(lastUpdateAt),
      listings: {
        lastSeenAt: lastListingSeen,
        daysSince: daysSince(lastListingSeen),
      },
      transactions: {
        lastImportedAt: lastTxCreated,
        latestTransactionDate: lastTxDate,
        daysSince: daysSince(lastTxCreated),
      },
      lastRun: lastCompleted
        ? {
            id: lastCompleted.id,
            jobType: lastCompleted.job_type,
            status: lastCompleted.status,
            finishedAt: lastCompleted.finished_at,
            totalRows: lastCompleted.total_rows,
          }
        : null,
      queued: queuedRes.data || [],
      workerConfigured: Boolean(process.env.ZAYLO_WORKER_TRIGGER_URL),
    })
  } catch (error) {
    console.error("scraper status failed:", error)
    return NextResponse.json({ error: "Failed to load scraper status" }, { status: 500 })
  }
}
