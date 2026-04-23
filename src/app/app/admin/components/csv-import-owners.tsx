"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, X, Filter } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface ParsedRow {
  name: string
  phone: string
  area: string
  unit_number: string
  bedrooms: string
  notes: string
  price: string
  size: string
  partyType: string
  valid: boolean
}

type ImportStage = "idle" | "preview" | "importing" | "done"

const BATCH_SIZE = 200

function str(v: unknown): string {
  return String(v ?? "").trim()
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "")
}

function normalizePrice(v: unknown): string {
  return String(v ?? "").replace(/,/g, "").trim()
}

function mapRow(row: Record<string, unknown>): ParsedRow {
  // Generic columns
  const genericName = str(row.name ?? row.Name ?? row.owner_name ?? row["Owner Name"])
  const genericPhone = normalizePhone(str(row.phone ?? row.Phone ?? row.number))
  const genericArea = str(row.area ?? row.Area ?? row.location ?? row.Location)

  // DLD columns
  const dldName = str(row.NameEn)
  const dldPhone = normalizePhone(str(row.Mobile ?? row.mobile))
  const dldArea = str(row["Master Project"])
  const dldProject = str(row.Project)
  const dldUnit = str(row.UnitNumber)
  const dldSize = str(row.Size)
  const dldPrice = normalizePrice(row.ProcedureValue)
  const dldPartyType = str(row.ProcedurePartyTypeNameEn)
  const dldPropType = str(row.PropertyTypeEn)
  const dldTxType = str(row.ProcedureNameEn)
  const dldCountry = str(row.CountryNameEn)

  const name = dldName || genericName
  const phone = dldPhone || genericPhone
  const area = dldArea || genericArea
  const unit_number = dldUnit || str(row.unit_number ?? row.unit ?? row.Unit ?? row["Unit Number"])
  const bedrooms = str(row.bedrooms ?? row.Bedrooms ?? row.BR ?? row.br)

  // Compose notes: DLD fields → concise bullet string
  const noteParts: string[] = []
  if (dldProject) noteParts.push(dldProject)
  if (dldPartyType) noteParts.push(dldPartyType)
  if (dldPropType) noteParts.push(dldPropType)
  if (dldTxType) noteParts.push(dldTxType)
  if (dldCountry) noteParts.push(dldCountry)
  if (dldSize) noteParts.push(`${dldSize} sqft`)
  if (dldPrice) noteParts.push(`AED ${Number(dldPrice).toLocaleString()}`)
  const notes = noteParts.length > 0
    ? noteParts.join(" • ")
    : str(row.notes ?? row.Notes ?? row.remarks ?? row.Remarks)

  return {
    name,
    phone,
    area,
    unit_number,
    bedrooms,
    notes,
    price: dldPrice,
    size: dldSize,
    partyType: dldPartyType,
    valid: !!(name && phone && area),
  }
}

export function CsvImportOwners() {
  const [stage, setStage] = useState<ImportStage>("idle")
  const [fileName, setFileName] = useState("")
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([])
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ inserted: number; skipped: number; invalid: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [areaFilter, setAreaFilter] = useState<string>("__all__")

  const handleRows = useCallback((rows: Record<string, unknown>[], name: string) => {
    setFileName(name)
    setRawRows(rows)
    setParsedRows(rows.map(mapRow))
    setAreaFilter("__all__")
    setStage("preview")
  }, [])

  const parseExcel = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" })
        handleRows(rows, file.name)
      } catch {
        toast.error("Failed to parse Excel file")
      }
    }
    reader.readAsArrayBuffer(file)
  }, [handleRows])

  const parseCsv = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        handleRows(results.data as Record<string, unknown>[], file.name)
      },
      error: () => toast.error("Failed to parse CSV file"),
    })
  }, [handleRows])

  const parseFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext === "xlsx" || ext === "xls") {
      parseExcel(file)
    } else {
      parseCsv(file)
    }
  }, [parseExcel, parseCsv])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }, [parseFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const handleImport = async () => {
    const validRaw = rawRows.filter((_row, idx) => {
      const p = parsedRows[idx]
      if (!p?.valid) return false
      if (areaFilter !== "__all__" && p.area !== areaFilter) return false
      return true
    })
    if (validRaw.length === 0) {
      toast.error("No valid rows to import")
      return
    }

    setStage("importing")
    setProgress(0)
    let totalInserted = 0
    let totalSkipped = 0
    const allErrors: string[] = []

    const batches = Math.ceil(validRaw.length / BATCH_SIZE)
    for (let i = 0; i < batches; i++) {
      const batch = validRaw.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
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

    const skippedInvalid = filteredRows.filter((r) => !r.valid).length
    setResult({ inserted: totalInserted, skipped: totalSkipped, invalid: skippedInvalid, errors: allErrors })
    setStage("done")
    if (totalInserted > 0) toast.success(`Imported ${totalInserted} owners`)
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

  const isDld = rawRows.length > 0 && Boolean(rawRows[0].NameEn ?? rawRows[0]["Master Project"] ?? rawRows[0].Mobile)

  // Unique areas for filter dropdown
  const uniqueAreas = useMemo(() => {
    const areas = new Set<string>()
    for (const r of parsedRows) {
      if (r.area) areas.add(r.area)
    }
    return Array.from(areas).sort()
  }, [parsedRows])

  // Filtered view
  const filteredRows = useMemo(() => {
    if (areaFilter === "__all__") return parsedRows
    return parsedRows.filter((r) => r.area === areaFilter)
  }, [parsedRows, areaFilter])

  const validCount = filteredRows.filter((r) => r.valid).length
  const invalidCount = filteredRows.filter((r) => !r.valid).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import — Owners & DLD Transactions
        </CardTitle>
        <CardDescription>
          CSV or Excel (.xlsx / .xls). Auto-detects DLD format (NameEn, Mobile, Master Project…) and generic format (name, phone, area).
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
              <p className="text-sm font-medium">Drop file here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">CSV, XLS, XLSX — processed in batches of {BATCH_SIZE}</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {stage === "preview" && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <FileSpreadsheet className="h-4 w-4 text-[#C9A84C]" />
                <span className="text-sm font-medium">{fileName}</span>
                <Badge variant="outline">{parsedRows.length} rows</Badge>
                {isDld && (
                  <Badge className="bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 text-xs">
                    DLD Format
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{validCount} valid</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span>{invalidCount} invalid (missing name / phone / area)</span>
                  </div>
                )}
              </div>

              {uniqueAreas.length > 1 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <Select value={areaFilter} onValueChange={setAreaFilter}>
                    <SelectTrigger className="h-8 w-[220px] text-xs">
                      <SelectValue placeholder="All project areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All project areas ({parsedRows.length})</SelectItem>
                      {uniqueAreas.map((area) => {
                        const count = parsedRows.filter((r) => r.area === area).length
                        return (
                          <SelectItem key={area} value={area}>
                            {area} ({count})
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="rounded-md border max-h-[360px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Project Area</TableHead>
                    <TableHead>Unit</TableHead>
                    {isDld && <TableHead>Size (sqft)</TableHead>}
                    {isDld && <TableHead>Price (AED)</TableHead>}
                    {isDld && <TableHead>Party</TableHead>}
                    <TableHead className="w-12">OK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.slice(0, 100).map((row, idx) => (
                    <TableRow key={idx} className={row.valid ? "" : "bg-red-500/5"}>
                      <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="text-sm">{row.name || "—"}</TableCell>
                      <TableCell className="text-sm font-mono text-xs">{row.phone || "—"}</TableCell>
                      <TableCell className="text-sm">{row.area || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.unit_number || "—"}</TableCell>
                      {isDld && (
                        <TableCell className="text-sm text-muted-foreground">{row.size || "—"}</TableCell>
                      )}
                      {isDld && (
                        <TableCell className="text-sm text-muted-foreground">
                          {row.price ? Number(row.price).toLocaleString() : "—"}
                        </TableCell>
                      )}
                      {isDld && (
                        <TableCell className="text-sm text-muted-foreground">{row.partyType || "—"}</TableCell>
                      )}
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
              {filteredRows.length > 100 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Showing first 100 of {filteredRows.length} rows
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
                {areaFilter !== "__all__" && ` from ${areaFilter}`}
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
