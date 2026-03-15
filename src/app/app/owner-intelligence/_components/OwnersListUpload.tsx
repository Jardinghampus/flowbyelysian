"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Download, FileText, X, AlertCircle, Loader2 } from "lucide-react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { generateOwnersTemplate, downloadCsv } from "../_lib/csvTemplates"
import { BulkJobStatusPanel } from "./BulkJobStatus"
import { cn } from "@/lib/utils"

interface ParsedRow {
  unitNumber: string
  buildingName: string
  propertySize?: string
  zone?: string
}

export function OwnersListUpload({ onComplete }: { onComplete?: () => void }) {
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
        const errors: string[] = []

        for (let i = 0; i < result.data.length; i++) {
          const row = result.data[i] as Record<string, string>
          const unitNumber = row.unit_number || row.unitNumber || row.Unit || ""
          const buildingName = row.building_name || row.buildingName || row.Building || ""

          if (!unitNumber.trim()) {
            errors.push(`Row ${i + 2}: missing unit_number`)
            continue
          }
          if (!buildingName.trim()) {
            errors.push(`Row ${i + 2}: missing building_name`)
            continue
          }

          parsed.push({
            unitNumber: unitNumber.trim(),
            buildingName: buildingName.trim(),
            propertySize: (row.property_size || row.propertySize || row.Size || "").trim() || undefined,
            zone: (row.zone || row.Zone || row.area || "").trim() || undefined,
          })
        }

        if (parsed.length === 0) {
          setError(
            errors.length > 0
              ? `Validation errors: ${errors.slice(0, 3).join("; ")}${errors.length > 3 ? ` and ${errors.length - 3} more` : ""}`
              : "CSV must have 'unit_number' and 'building_name' columns."
          )
          setRows([])
          return
        }

        setRows(parsed)
        if (errors.length > 0) {
          toast.warning(`${errors.length} rows skipped due to missing data`)
        }
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
    if (rows.length === 0) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/owner-intelligence/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: rows.map((r) => ({
            unitNumber: r.unitNumber,
            buildingName: r.buildingName,
            propertySize: r.propertySize,
            zone: r.zone,
          })),
          sourceType: "owners_list",
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      setJobId(json.jobId)
      toast.success("Enrichment started")
    } catch {
      toast.error("Failed to start enrichment")
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

  return (
    <div className="space-y-6">
      {/* Template download */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Upload a CSV with unit numbers and building names to find owner contacts.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadCsv(generateOwnersTemplate(), "owners-template.csv")}
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
            Required: unit_number, building_name · Optional: property_size, zone
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
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{fileName}</span>
              <span className="text-xs text-muted-foreground">{rows.length} units</span>
              <button onClick={reset} className="p-0.5 rounded hover:bg-muted">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Preview table */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">#</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Unit</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Building</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Size</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Zone</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-primary">{row.unitNumber}</td>
                      <td className="px-4 py-2 text-foreground/70">{row.buildingName}</td>
                      <td className="px-4 py-2 text-muted-foreground">{row.propertySize || "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{row.zone || "—"}</td>
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

            <Button
              onClick={handleSubmit}
              disabled={submitting || rows.length === 0}
              className="w-full h-11"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                `Enrich All — ${rows.length} Units`
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {jobId && <BulkJobStatusPanel jobId={jobId} onComplete={onComplete} />}
    </div>
  )
}
