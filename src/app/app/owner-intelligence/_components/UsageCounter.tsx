"use client"

import { useState, useEffect, useCallback } from "react"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface UsageData {
  used: number
  limit: number
  remaining: number
}

export function UsageCounter() {
  const [usage, setUsage] = useState<UsageData | null>(null)

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/owner-intelligence/usage")
      if (res.ok) {
        setUsage(await res.json())
      }
    } catch {
      // silent fail
    }
  }, [])

  useEffect(() => {
    fetchUsage()
    // Refresh every 30s to stay current after lookups
    const interval = setInterval(fetchUsage, 30000)
    return () => clearInterval(interval)
  }, [fetchUsage])

  if (!usage) return null

  const pct = (usage.used / usage.limit) * 100
  const isLow = usage.remaining <= 10
  const isOut = usage.remaining === 0

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
        isOut
          ? "border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
          : isLow
          ? "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "border-border bg-card text-muted-foreground"
      )}
    >
      <Zap
        className={cn(
          "h-3.5 w-3.5",
          isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-primary"
        )}
      />
      <span className="tabular-nums">
        <span className={cn("font-semibold", !isOut && !isLow && "text-foreground")}>
          {usage.used}
        </span>
        /{usage.limit}
      </span>
      {/* Mini progress bar */}
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isOut
              ? "bg-red-500"
              : isLow
              ? "bg-amber-500"
              : "bg-primary"
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-[10px] uppercase tracking-wider opacity-60">today</span>
    </div>
  )
}
