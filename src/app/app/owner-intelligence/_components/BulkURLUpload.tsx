"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Download, FileText, X, AlertCircle, Loader2 } from "lucide-react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { detectPortal } from "../_lib/detectPortal"
import { generateUrlTemplate, downloadCsv } from "../_lib/csvTemplates"
import { PortalBadge } from "./PortalBadge"
import { BulkJobStatusPanel } from "./BulkJobStatus"
import { cn } from "@/lib/utils"
import type { PortalType } from "@/types/owner-intelligence"

interface ParsedRow {
  url: string
  portal: PortalType | null
  valid: boolean
}

export function BulkURLUpload({ onComplete }: { onComplete?: () => void }) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed: ParsedRow[] = []
        let hasUrlCol = false

        for (const row of result.data as Record<string, string>[]) {
          const url = row.property_url || row.url || row.URL || row.property_URL || ""
          if (!url) continue
          hasUrlCol = true
          const portal = detectPortal(url)
          parsed.push({ url, portal, valid: portal !== null })
        }

        if (!hasUrlCol || parsed.length === 0) {
          setError("CSV must have a 'property_url' column with valid URLs.")
          setRows([])
          return
        }

        setRows(parsed)
      },
      error: () => {
        setError("Failed to parse CSV file.")
      },
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
        handleFile(file)
      } else {
        setError("Please upload a CSV file.")
      }
    },
    [handleFile]
  )

  const handleSubmit = async () => {
    const validRows = rows.filter((r) => r.valid)
    if (validRows.length === 0) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/owner-intelligence/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: validRows.map((r) => ({ url: r.url })),
          sourceType: "url_list",
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      setJobId(json.jobId)
      toast.success("Bulk job started")
    } catch {
      toast.error("Failed to start bulk job")
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setRows([])
    setFileName("")
    setError(null)
    setJobId(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.filter((r) => !r.valid).length
  const portalBreakdown = rows.reduce<Record<string, number>>((acc, r) => {
    if (r.portal) acc[r.portal] = (acc[r.portal] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Template download */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Upload a CSV with property URLs from Bayut, PropertyFinder, or Dubizzle.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadCsv(generateUrlTemplate(), "url-template.csv")}
          className="text-primary text-xs"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Template
        </Button>
      </div>

      {/* Drop zone */}
      {rows.length === 0 && !jobId && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
            isDragOver
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-muted-foreground/30 bg-card"
          )}
        >
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground mb-1">
            Drop CSV file here or click to browse
          </p>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            Required column: property_url
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Preview */}
      <AnimatePresence>
        {rows.length > 0 && !jobId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* File info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{fileName}</span>
                <button onClick={reset} className="p-0.5 rounded hover:bg-muted">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="text-muted-foreground">{validCount} valid URLs</span>
              {invalidCount > 0 && (
                <span className="text-red-600 dark:text-red-400">{invalidCount} invalid</span>
              )}
              {Object.entries(portalBreakdown).map(([p, count]) => (
                <span key={p} className="flex items-center gap-1">
                  <PortalBadge portal={p as PortalType} />
                  <span className="text-muted-foreground">{count}</span>
                </span>
              ))}
            </div>

            {/* Preview table */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">#</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">URL</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Portal</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-2 text-foreground/70 truncate max-w-[400px]">{row.url}</td>
                      <td className="px-4 py-2">
                        {row.portal ? (
                          <PortalBadge portal={row.portal} />
                        ) : (
                          <span className="text-red-600 dark:text-red-400 text-[10px]">Invalid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 5 && (
                <div className="px-4 py-2 text-[10px] text-muted-foreground border-t">
                  + {rows.length - 5} more rows
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || validCount === 0}
              className="w-full h-11"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                `Start Bulk Lookup — ${validCount} URLs`
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job progress */}
      {jobId && <BulkJobStatusPanel jobId={jobId} onComplete={onComplete} />}
    </div>
  )
}
