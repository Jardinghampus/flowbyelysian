"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import Papa from "papaparse"

interface ParsedRow {
  name: string
  phone: string
  area: string
  unit_number: string
  bedrooms: string
  notes: string
  valid: boolean
}

type ImportStage = "idle" | "preview" | "importing" | "done"

const BATCH_SIZE = 200

export function CsvImportOwners() {
  const [stage, setStage] = useState<ImportStage>("idle")
  const [fileName, setFileName] = useState("")
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ inserted: number; skipped: number; invalid: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const parseFile = useCallback((file: File) => {
    setFileName(file.name)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[]
        setRawRows(rows)

        const parsed: ParsedRow[] = rows.map((row) => {
          const name = (row.name || row.Name || row.owner_name || row["Owner Name"] || "").trim()
          const phone = (row.phone || row.Phone || row.mobile || row.Mobile || row.number || "").trim()
          const area = (row.area || row.Area || row.location || row.Location || "").trim()
          const unit_number = (row.unit_number || row.unit || row.Unit || row["Unit Number"] || "").trim()
          const bedrooms = (row.bedrooms || row.Bedrooms || row.BR || row.br || "").trim()
          const notes = (row.notes || row.Notes || row.remarks || row.Remarks || "").trim()
          return { name, phone, area, unit_number, bedrooms, notes, valid: !!(name && phone && area) }
        })

        setParsedRows(parsed)
        setStage("preview")
      },
      error: () => {
        toast.error("Failed to parse CSV file")
      },
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
        parseFile(file)
      } else {
        toast.error("Please drop a .csv file")
      }
    },
    [parseFile]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const handleImport = async () => {
    const validRows = rawRows.filter((_row, idx) => parsedRows[idx]?.valid)
    if (validRows.length === 0) {
      toast.error("No valid rows to import")
      return
    }

    setStage("importing")
    setProgress(0)
    let totalInserted = 0
    let totalSkipped = 0
    const allErrors: string[] = []

    const batches = Math.ceil(validRows.length / BATCH_SIZE)
    for (let i = 0; i < batches; i++) {
      const batch = validRows.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
      try {
        const res = await fetch("/api/owners/bulk-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: batch }),
        })
        const data = await res.json()
        if (!res.ok) {
          allErrors.push(data.error || `Batch ${i + 1} failed`)
        } else {
          totalInserted += data.inserted || 0
          totalSkipped += data.skipped || 0
          if (data.errors?.length) allErrors.push(...data.errors)
        }
      } catch {
        allErrors.push(`Batch ${i + 1}: Network error`)
      }
      setProgress(Math.round(((i + 1) / batches) * 100))
    }

    const invalidCount = parsedRows.filter((r) => !r.valid).length
    setResult({ inserted: totalInserted, skipped: totalSkipped, invalid: invalidCount, errors: allErrors })
    setStage("done")
    if (totalInserted > 0) {
      toast.success(`Imported ${totalInserted} owners`)
    }
  }

  const handleReset = () => {
    setStage("idle")
    setFileName("")
    setRawRows([])
    setParsedRows([])
    setProgress(0)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const validCount = parsedRows.filter((r) => r.valid).length
  const invalidCount = parsedRows.filter((r) => !r.valid).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          CSV Import — Owners
        </CardTitle>
        <CardDescription>
          Import owners from CSV. Required columns: name, phone, area. Optional: unit_number, bedrooms, notes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stage === "idle" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer ${
              dragActive ? "border-[#C9A84C] bg-[#C9A84C]/5" : "border-muted-foreground/20 hover:border-muted-foreground/40"
            }`}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Drop CSV file here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Supports any CSV size — processed in batches</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {stage === "preview" && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-[#C9A84C]" />
                <span className="text-sm font-medium">{fileName}</span>
                <Badge variant="outline">{parsedRows.length} rows</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{validCount} valid</span>
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>{invalidCount} invalid (missing name/phone/area)</span>
                </div>
              )}
            </div>

            <div className="rounded-md border max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>BR</TableHead>
                    <TableHead className="w-12">OK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.slice(0, 50).map((row, idx) => (
                    <TableRow key={idx} className={row.valid ? "" : "bg-red-500/5"}>
                      <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="text-sm">{row.name || "—"}</TableCell>
                      <TableCell className="text-sm">{row.phone || "—"}</TableCell>
                      <TableCell className="text-sm">{row.area || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.unit_number || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.bedrooms || "—"}</TableCell>
                      <TableCell>
                        {row.valid ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedRows.length > 50 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Showing first 50 of {parsedRows.length} rows
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset}>Cancel</Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0}
                className="bg-[#C9A84C] hover:bg-[#B8973B] text-black"
              >
                Import {validCount} Owners
              </Button>
            </div>
          </>
        )}

        {stage === "importing" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#C9A84C]" />
              <span className="text-sm font-medium">Importing owners...</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        {stage === "done" && result && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Import Complete</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-emerald-500">{result.inserted}</p>
                <p className="text-xs text-muted-foreground">Inserted</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-amber-500">{result.skipped}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{result.invalid}</p>
                <p className="text-xs text-muted-foreground">Invalid</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs font-medium text-red-400 mb-1">Errors:</p>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-400/80">{err}</p>
                ))}
              </div>
            )}
            <Button onClick={handleReset} variant="outline">Import Another File</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
