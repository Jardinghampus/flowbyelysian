"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { BulkJobStatus as JobStatus } from "@/types/owner-intelligence"
import { cn } from "@/lib/utils"

let _sb: SupabaseClient | null = null
function getSb() {
  if (!_sb) {
    _sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _sb
}

interface BulkJobData {
  id: string
  totalRows: number
  processedRows: number
  successRows: number
  failedRows: number
  status: JobStatus
}

function toJob(d: Record<string, unknown>): BulkJobData {
  return {
    id: d.id as string,
    totalRows: d.total_rows as number,
    processedRows: d.processed_rows as number,
    successRows: d.success_rows as number,
    failedRows: d.failed_rows as number,
    status: d.status as JobStatus,
  }
}

export function BulkJobStatusPanel({
  jobId,
  onComplete,
}: {
  jobId: string
  onComplete?: () => void
}) {
  const [job, setJob] = useState<BulkJobData | null>(null)
  const startTime = useRef(Date.now())
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    getSb().from("bulk_jobs")
      .select("*")
      .eq("id", jobId)
      .single()
      .then(({ data }) => {
        if (data) setJob(toJob(data as Record<string, unknown>))
      })

    const channel = getSb()
      .channel(`bulk-job-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bulk_jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const updated = toJob(payload.new as Record<string, unknown>)
          setJob(updated)
          if (updated.status === "complete" || updated.status === "failed") {
            onCompleteRef.current?.()
          }
        }
      )
      .subscribe()

    return () => {
      getSb().removeChannel(channel)
    }
  }, [jobId])

  // Polling fallback
  useEffect(() => {
    if (!job || job.status === "complete" || job.status === "failed") return

    const interval = setInterval(async () => {
      const { data } = await getSb()
        .from("bulk_jobs")
        .select("*")
        .eq("id", jobId)
        .single()

      if (data) {
        const updated = toJob(data as Record<string, unknown>)
        setJob(updated)
        if (updated.status === "complete" || updated.status === "failed") {
          onCompleteRef.current?.()
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [jobId, job?.status])

  if (!job) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Initializing...
      </div>
    )
  }

  const progress = job.totalRows > 0 ? (job.processedRows / job.totalRows) * 100 : 0
  const partialRows = job.processedRows - job.successRows - job.failedRows

  const elapsed = (Date.now() - startTime.current) / 1000
  const rate = job.processedRows > 0 ? elapsed / job.processedRows : 0
  const remaining = (job.totalRows - job.processedRows) * rate
  const etaMinutes = Math.ceil(remaining / 60)

  const isComplete = job.status === "complete"
  const isFailed = job.status === "failed"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : isFailed ? (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          ) : (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          )}
          <span className="text-sm font-medium">
            {isComplete ? "Processing complete" : isFailed ? "Processing failed" : "Processing..."}
          </span>
        </div>
        {!isComplete && !isFailed && job.processedRows > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            ~{etaMinutes}m remaining
          </span>
        )}
      </div>

      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            isComplete ? "bg-emerald-500" : isFailed ? "bg-red-500" : "bg-primary"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">
          Processing {job.processedRows}/{job.totalRows}
        </span>
        <span className="text-emerald-600 dark:text-emerald-400">
          {job.successRows} resolved
        </span>
        {partialRows > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            {partialRows} partial
          </span>
        )}
        {job.failedRows > 0 && (
          <span className="text-red-600 dark:text-red-400">
            {job.failedRows} failed
          </span>
        )}
      </div>
    </motion.div>
  )
}
