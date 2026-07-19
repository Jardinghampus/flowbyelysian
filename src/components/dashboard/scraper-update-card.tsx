"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw, Database } from "lucide-react"
import { toast } from "sonner"
import { useRole } from "@/contexts/role-context"
import { isHampusEmail } from "@/lib/hampus-access"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ScraperStatus = {
  lastUpdateAt: string | null
  daysSinceLastUpdate: number | null
  listings: { lastSeenAt: string | null; daysSince: number | null }
  transactions: { lastImportedAt: string | null; daysSince: number | null }
  queued: Array<{ id: string; job_type: string; status: string }>
  workerConfigured: boolean
  lastRun: { jobType: string; finishedAt: string | null; totalRows: number } | null
}

function daysLabel(days: number | null): string {
  if (days == null) return "Never"
  if (days === 0) return "Today"
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

export function ScraperUpdateCard() {
  const { userEmail, isLoaded } = useRole()
  const [status, setStatus] = useState<ScraperStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/zaylo/scraper/status", { cache: "no-store" })
      if (!res.ok) throw new Error("status failed")
      setStatus((await res.json()) as ScraperStatus)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !isHampusEmail(userEmail)) return
    void load()
  }, [isLoaded, userEmail, load])

  if (!isLoaded || !isHampusEmail(userEmail)) return null

  const days = status?.daysSinceLastUpdate ?? null
  const stale = days != null && days >= 3
  const queuedCount = status?.queued?.length ?? 0

  const onUpdate = async () => {
    setUpdating(true)
    try {
      const res = await fetch("/api/zaylo/scraper/update", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Update failed")
      toast.success(data.message || "Scraper update queued")
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not queue scraper")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-card",
        stale ? "border-amber-500/40" : "border-border/50"
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Database className="h-3.5 w-3.5 text-[#2d5082]" />
          <span className="text-xs font-semibold">Bayut Scraper</span>
          <span className="text-[10px] text-muted-foreground">Hampus only</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[10px]"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
        </Button>
      </div>

      <div className="p-3 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              Days since last update
            </p>
            <p
              className={cn(
                "text-2xl font-bold font-mono tabular-nums",
                stale ? "text-amber-400" : "text-foreground"
              )}
            >
              {loading && !status ? "—" : days == null ? "—" : days}
            </p>
            <p className="text-[10px] text-muted-foreground">{daysLabel(days)}</p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => void onUpdate()}
            disabled={updating}
            className="shrink-0"
          >
            {updating ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Update scraper
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="rounded-md border border-border/40 px-2 py-1.5">
            <p className="text-muted-foreground">Listings</p>
            <p className="font-medium">{daysLabel(status?.listings.daysSince ?? null)}</p>
          </div>
          <div className="rounded-md border border-border/40 px-2 py-1.5">
            <p className="text-muted-foreground">Transactions</p>
            <p className="font-medium">{daysLabel(status?.transactions.daysSince ?? null)}</p>
          </div>
        </div>

        {queuedCount > 0 ? (
          <p className="text-[10px] text-amber-400">
            {queuedCount} job{queuedCount === 1 ? "" : "s"} queued — worker will pick them up
          </p>
        ) : null}

        {!status?.workerConfigured ? (
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Queues listings + TX scrapes. Run worker to execute:{" "}
            <code className="text-[9px]">pnpm zaylo:worker -- --job process-queue</code>
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground">Worker webhook configured — Update will trigger it.</p>
        )}
      </div>
    </div>
  )
}
