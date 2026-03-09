"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { BulkJobStatus as JobStatus } from "@/types/owner-intelligence"
import { cn } from "@/lib/utils"

interface BulkJobData {
  id: string
  totalRows: number
  processedRows: number
  successRows: number
  failedRows: number
  status: JobStatus
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
    // Initial fetch
    supabase
      .from("bulk_jobs")
      .select("*")
      .eq("id", jobId)
      .single()
      .then(({ data }) => {
        if (data) {
          setJob({
            id: data.id,
            totalRows: data.total_rows,
            processedRows: data.processed_rows,
            successRows: data.success_rows,
            failedRows: data.failed_rows,
            status: data.status as JobStatus,
          })
        }
      })

    // Subscribe to realtime updates
    const channel = supabase
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
          const d = payload.new as Record<string, unknown>
          const updated: BulkJobData = {
            id: d.id as string,
            totalRows: d.total_rows as number,
            processedRows: d.processed_rows as number,
            successRows: d.success_rows as number,
            failedRows: d.failed_rows as number,
            status: d.status as JobStatus,
          }
          setJob(updated)
          if (updated.status === "complete" || updated.status === "failed") {
            onCompleteRef.current?.()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobId])

  // Polling fallback (if realtime isn't available)
  useEffect(() => {
    if (!job || job.status === "complete" || job.status === "failed") return

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("bulk_jobs")
        .select("*")
        .eq("id", jobId)
        .single()

      if (data) {
        const updated: BulkJobData = {
          id: data.id,
          totalRows: data.total_rows,
          processedRows: data.processed_rows,
          successRows: data.success_rows,
          failedRows: data.failed_rows,
          status: data.status as JobStatus,
        }
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
      <div className="flex items-center gap-2 py-4 text-sm text-white/40">
        <Loader2 className="h-4 w-4 animate-spin" /> Initializing...
      </div>
    )
  }

  const progress = job.totalRows > 0 ? (job.processedRows / job.totalRows) * 100 : 0
  const partialRows = job.processedRows - job.successRows - job.failedRows

  // ETA calculation
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
      className="rounded-lg border border-white/[0.07] bg-[#111111] p-5 space-y-4"
    >
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : isFailed ? (
            <AlertCircle className="h-4 w-4 text-red-400" />
          ) : (
            <Loader2 className="h-4 w-4 text-[#C8922A] animate-spin" />
          )}
          <span className="text-sm font-medium text-white">
            {isComplete ? "Processing complete" : isFailed ? "Processing failed" : "Processing..."}
          </span>
        </div>
        {!isComplete && !isFailed && job.processedRows > 0 && (
          <span className="flex items-center gap-1 text-xs font-mono text-white/30">
            <Clock className="h-3 w-3" />
            ~{etaMinutes}m remaining
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-white/[0.04] overflow-hidden">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            isComplete ? "bg-green-500" : isFailed ? "bg-red-500" : "bg-[#C8922A]"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <span className="text-white/50">
          Processing {job.processedRows}/{job.totalRows}
        </span>
        <span className="text-green-400/70">
          {job.successRows} resolved
        </span>
        {partialRows > 0 && (
          <span className="text-amber-400/70">
            {partialRows} partial
          </span>
        )}
        {job.failedRows > 0 && (
          <span className="text-red-400/70">
            {job.failedRows} failed
          </span>
        )}
      </div>
    </motion.div>
  )
}
