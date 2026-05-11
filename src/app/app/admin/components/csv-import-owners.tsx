"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, X, Filter, Copy, Tag } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface ExistingOwner {
  id: string
  name: string
  area: string
  status: string
}

interface ParsedRow {
  name: string
  phone: string
  area: string
  subArea: string
  unit_number: string
  bedrooms: string
  notes: string
  price: string
  size: string
  partyType: string
  valid: boolean
}

type ImportStage = "idle" | "preview" | "importing" | "done"
type ColumnFormat = "company" | "dld" | "generic"

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

function detectFormat(row: Record<string, unknown>): ColumnFormat {
  if ("Transaction (AED)" in row || ("Community" in row && "Property Ref" in row)) return "company"
  if (row.NameEn || row["Master Project"] || row.Mobile) return "dld"
  return "generic"
}

function mapRow(row: Record<string, unknown>): ParsedRow {
  const fmt = detectFormat(row)

  if (fmt === "company") {
    // Company format: # Date Area Community Unit No Property Ref Type Beds Size (sqm) Transaction (AED) Role Transaction Type Name Phone Nationality Source
    const name = str(row.Name ?? row.name)
    const phone = normalizePhone(str(row.Phone ?? row.phone))
    const area = str(row.Area ?? row.area)
    const subArea = str(row.Community ?? row.community)
    const unit_number = str(row["Unit No"] ?? row["Unit No."] ?? row.UnitNo)
    const bedrooms = str(row.Beds ?? row.beds ?? row.Bedrooms)

    const role = str(row.Role)
    const txType = str(row["Transaction Type"])
    const propType = str(row.Type)
    const size = str(row["Size (sqm)"])
    const transaction = normalizePrice(row["Transaction (AED)"])
    const nationality = str(row.Nationality)
    const source = str(row.Source)
    const propRef = str(row["Property Ref"])
    const date = str(row.Date)

    const noteParts: string[] = []
    if (role) noteParts.push(role)
    if (txType) noteParts.push(txType)
    if (propType) noteParts.push(propType)
    if (size) noteParts.push(`${size} sqm`)
    if (transaction) noteParts.push(`AED ${Number(transaction).toLocaleString()}`)
    if (nationality) noteParts.push(nationality)
    if (propRef) noteParts.push(`Ref: ${propRef}`)
    if (date) noteParts.push(date)
    if (source) noteParts.push(`Source: ${source}`)

    return {
      name,
      phone,
      area,
      subArea,
      unit_number,
      bedrooms,
      notes: noteParts.join(" • "),
      price: transaction,
      size,
      partyType: role,
      valid: !!(name && phone && area),
    }
  }

  if (fmt === "dld") {
    // DLD format: NameEn, Mobile, Master Project, Project, UnitNumber, Size, ProcedureValue…
    const name = str(row.NameEn)
    const phone = normalizePhone(str(row.Mobile ?? row.mobile))
    const area = str(row["Master Project"])
    const subArea = str(row.Project)
    const unit_number = str(row.UnitNumber)
    const bedrooms = str(row.bedrooms ?? row.Bedrooms ?? row.BR)
    const size = str(row.Size)
    const price = normalizePrice(row.ProcedureValue)
    const partyType = str(row.ProcedurePartyTypeNameEn)
    const propType = str(row.PropertyTypeEn)
    const txType = str(row.ProcedureNameEn)
    const country = str(row.CountryNameEn)

    const noteParts: string[] = []
    if (partyType) noteParts.push(partyType)
    if (propType) noteParts.push(propType)
    if (txType) noteParts.push(txType)
    if (country) noteParts.push(country)
    if (size) noteParts.push(`${size} sqft`)
    if (price) noteParts.push(`AED ${Number(price).toLocaleString()}`)

    return {
      name,
      phone,
      area,
      subArea,
      unit_number,
      bedrooms,
      notes: noteParts.join(" • "),
      price,
      size,
      partyType,
      valid: !!(name && phone && area),
    }
  }

  // Generic format
  const name = str(row.name ?? row.Name ?? row.owner_name ?? row["Owner Name"])
  const phone = normalizePhone(str(row.phone ?? row.Phone ?? row.number))
  const area = str(row.area ?? row.Area ?? row.location ?? row.Location)
  const subArea = str(row.sub_area ?? row["Sub Area"] ?? row.subarea ?? row.Subarea)
  const unit_number = str(row.unit_number ?? row.unit ?? row.Unit ?? row["Unit Number"])
  const bedrooms = str(row.bedrooms ?? row.Bedrooms ?? row.BR ?? row.br)
  const notes = str(row.notes ?? row.Notes ?? row.remarks ?? row.Remarks)

  return {
    name, phone, area, subArea, unit_number, bedrooms, notes,
    price: "", size: "", partyType: "",
    valid: !!(name && phone && area),
  }
}

export function CsvImportOwners() {
  const [stage, setStage] = useState<ImportStage>("idle")
  const [fileName, setFileName] = useState("")
  const [datasetName, setDatasetName] = useState("")
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([])
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ inserted: number; skipped: number; invalid: number; duplicatesSkipped: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [areaFilter, setAreaFilter] = useState<string>("__all__")
  const [duplicates, setDuplicates] = useState<Record<string, ExistingOwner>>({})
  const [dupCheckLoading, setDupCheckLoading] = useState(false)
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  const checkDuplicates = useCallback(async (rows: ParsedRow[]) => {
    const phones = [...new Set(rows.filter((r) => r.phone).map((r) => r.phone))]
    if (phones.length === 0) return
    setDupCheckLoading(true)
    try {
      const res = await fetch("/api/owners/check-duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phones }),
      })
      const data = await res.json()
      setDuplicates(data.duplicates || {})
    } catch {
      // silently fail
    } finally {
      setDupCheckLoading(false)
    }
  }, [])

  const handleRows = useCallback((rows: Record<string, unknown>[], name: string) => {
    setFileName(name)
    setRawRows(rows)
    const mapped = rows.map(mapRow)
    setParsedRows(mapped)
    setAreaFilter("__all__")
    setDuplicates({})
    setSkipDuplicates(true)
    setStage("preview")
    checkDuplicates(mapped)
  }, [checkDuplicates])

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

  const columnFormat: ColumnFormat = rawRows.length > 0 ? detectFormat(rawRows[0]) : "generic"

  const uniqueAreas = useMemo(() => {
    const areas = new Set<string>()
    for (const r of parsedRows) {
      if (r.area) areas.add(r.area)
    }
    return Array.from(areas).sort()
  }, [parsedRows])

  const filteredRows = useMemo(() => {
    if (areaFilter === "__all__") return parsedRows
    return parsedRows.filter((r) => r.area === areaFilter)
  }, [parsedRows, areaFilter])

  const dupCount = filteredRows.filter((r) => r.valid && r.phone && duplicates[r.phone]).length
  const validCount = filteredRows.filter((r) => r.valid).length - (skipDuplicates ? dupCount : 0)
  const invalidCount = filteredRows.filter((r) => !r.valid).length

  const handleImport = async () => {
    if (!datasetName.trim()) {
      toast.error("Enter a dataset name before importing")
      return
    }

    const validRaw = rawRows.filter((_row, idx) => {
      const p = parsedRows[idx]
      if (!p?.valid) return false
      if (areaFilter !== "__all__" && p.area !== areaFilter) return false
      if (skipDuplicates && p.phone && duplicates[p.phone]) return false
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
          body: JSON.stringify({ rows: batch, datasetName: datasetName.trim() }),
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
    const skippedDups = skipDuplicates ? dupCount : 0
    setResult({ inserted: totalInserted, skipped: totalSkipped, invalid: skippedInvalid, duplicatesSkipped: skippedDups, errors: allErrors })
    setStage("done")
    if (totalInserted > 0) toast.success(`Imported ${totalInserted} owners into "${datasetName.trim()}"`)
  }

  const handleReset = () => {
    setStage("idle")
    setFileName("")
    setDatasetName("")
    setRawRows([])
    setParsedRows([])
    setProgress(0)
    setResult(null)
    setDuplicates({})
    setSkipDuplicates(true)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import Owners
        </CardTitle>
        <CardDescription>
          CSV or Excel (.xlsx / .xls). Supports company format (Name, Phone, Area, Community, Beds…), DLD format, and generic format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {stage === "idle" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer ${
              dragActive ? "border-[#4B8EDB] bg-[#4B8EDB]/5" : "border-muted-foreground/20 hover:border-muted-foreground/40"
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
                <FileSpreadsheet className="h-4 w-4 text-[#4B8EDB]" />
                <span className="text-sm font-medium">{fileName}</span>
                <Badge variant="outline">{parsedRows.length} rows</Badge>
                <Badge className={`text-xs border ${
                  columnFormat === "company"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : columnFormat === "dld"
                      ? "bg-[#4B8EDB]/10 text-[#4B8EDB] border-[#4B8EDB]/30"
                      : "bg-muted text-muted-foreground border-border"
                }`}>
                  {columnFormat === "company" ? "Company Format" : columnFormat === "dld" ? "DLD Format" : "Generic"}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Dataset name — required before import */}
            <div className="rounded-lg border border-[#4B8EDB]/20 bg-[#4B8EDB]/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#4B8EDB]" />
                <span className="text-sm font-medium">Dataset name</span>
                <span className="text-xs text-red-400">required</span>
              </div>
              <Input
                placeholder="e.g. Mudon, JVC Q2 2026, Palm Jumeirah Buyers…"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="h-9 text-sm bg-background"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Labels this import so admins can control which agents have access to it.
              </p>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-3 text-sm flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{validCount} to import</span>
                </div>
                {dupCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Copy className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-500">{dupCount} duplicate{dupCount !== 1 ? "s" : ""}</span>
                    <button
                      type="button"
                      onClick={() => setSkipDuplicates(!skipDuplicates)}
                      className="text-xs underline text-muted-foreground hover:text-foreground"
                    >
                      {skipDuplicates ? "Include anyway" : "Skip duplicates"}
                    </button>
                  </div>
                )}
                {dupCheckLoading && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="text-xs">Checking duplicates…</span>
                  </div>
                )}
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
                    <TableHead>Area</TableHead>
                    <TableHead>Community / Sub-area</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>BR</TableHead>
                    {columnFormat !== "generic" && <TableHead>Size</TableHead>}
                    {columnFormat !== "generic" && <TableHead>Transaction</TableHead>}
                    {columnFormat !== "generic" && <TableHead>Role / Party</TableHead>}
                    <TableHead className="w-12">OK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.slice(0, 100).map((row, idx) => {
                    const isDup = row.valid && row.phone && duplicates[row.phone]
                    const dupOwner = isDup ? duplicates[row.phone] : null
                    return (
                      <TableRow key={idx} className={!row.valid ? "bg-red-500/5" : isDup ? "bg-amber-500/5" : ""}>
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="text-sm">{row.name || "—"}</TableCell>
                        <TableCell className="text-sm font-mono text-xs">
                          {row.phone || "—"}
                          {dupOwner && (
                            <span className="block text-[10px] text-amber-500 mt-0.5" title={`Exists: ${dupOwner.name} (${dupOwner.area})`}>
                              ↳ {dupOwner.name} · {dupOwner.area}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{row.area || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{row.subArea || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{row.unit_number || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{row.bedrooms || "—"}</TableCell>
                        {columnFormat !== "generic" && (
                          <TableCell className="text-sm text-muted-foreground">{row.size || "—"}</TableCell>
                        )}
                        {columnFormat !== "generic" && (
                          <TableCell className="text-sm text-muted-foreground">
                            {row.price ? Number(row.price).toLocaleString() : "—"}
                          </TableCell>
                        )}
                        {columnFormat !== "generic" && (
                          <TableCell className="text-sm text-muted-foreground">{row.partyType || "—"}</TableCell>
                        )}
                        <TableCell>
                          {isDup ? (
                            <Copy className="h-3.5 w-3.5 text-amber-500" />
                          ) : row.valid ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
                disabled={validCount === 0 || !datasetName.trim()}
                className="bg-[#4B8EDB] hover:bg-[#3A7DCB] text-white"
              >
                Import {validCount} Owners
                {datasetName.trim() && ` → "${datasetName.trim()}"`}
                {areaFilter !== "__all__" && ` from ${areaFilter}`}
              </Button>
            </div>
          </>
        )}

        {stage === "importing" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#4B8EDB]" />
              <span className="text-sm font-medium">Importing into &ldquo;{datasetName}&rdquo;…</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        {stage === "done" && result && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Import complete — dataset &ldquo;{datasetName}&rdquo;</span>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-emerald-500">{result.inserted}</p>
                <p className="text-xs text-muted-foreground">Inserted</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-amber-500">{result.duplicatesSkipped}</p>
                <p className="text-xs text-muted-foreground">Duplicates</p>
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
