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
        <p className="text-sm text-white/40">
          Upload a CSV with unit numbers and building names to find owner contacts.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadCsv(generateOwnersTemplate(), "owners-template.csv")}
          className="text-[#C8922A] hover:text-[#C8922A] hover:bg-[#C8922A]/10 font-mono text-xs"
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
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
            isDragOver
              ? "border-[#C8922A]/50 bg-[#C8922A]/5"
              : "border-white/[0.07] hover:border-white/[0.15] bg-[#111111]"
          )}
        >
          <Upload className="h-8 w-8 mx-auto mb-3 text-white/15" />
          <p className="text-sm text-white/40 mb-1">
            Drop CSV file here or click to browse
          </p>
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-wider">
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
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
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
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-white/30" />
              <span className="text-sm text-white/60 font-mono">{fileName}</span>
              <span className="text-xs font-mono text-white/30">{rows.length} units</span>
              <button onClick={reset} className="p-0.5 rounded hover:bg-white/[0.06]">
                <X className="h-3.5 w-3.5 text-white/30" />
              </button>
            </div>

            {/* Preview table */}
            <div className="rounded-lg border border-white/[0.07] bg-[#111111] overflow-hidden">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-white/25">#</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-white/25">Unit</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-white/25">Building</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-white/25">Size</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-white/25">Zone</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className="px-4 py-2 text-white/25">{i + 1}</td>
                      <td className="px-4 py-2 text-[#C8922A]">{row.unitNumber}</td>
                      <td className="px-4 py-2 text-white/60">{row.buildingName}</td>
                      <td className="px-4 py-2 text-white/40">{row.propertySize || "—"}</td>
                      <td className="px-4 py-2 text-white/40">{row.zone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 5 && (
                <div className="px-4 py-2 text-[10px] font-mono text-white/20 border-t border-white/[0.03]">
                  + {rows.length - 5} more rows
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || rows.length === 0}
              className="w-full h-11 bg-[#C8922A] hover:bg-[#B8821A] text-black font-semibold text-sm tracking-wide disabled:opacity-30"
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

      {/* Job progress */}
      {jobId && <BulkJobStatusPanel jobId={jobId} onComplete={onComplete} />}
    </div>
  )
}
