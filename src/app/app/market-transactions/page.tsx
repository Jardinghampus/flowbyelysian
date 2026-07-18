"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BayutLink, BayutTitleLink } from "@/components/zaylo/bayut-link"
import { transactionLink } from "@/lib/zaylo/bayut-links"

type Tx = {
  id: string
  community: string
  master_community: string | null
  sub_area: string | null
  location: string | null
  bedrooms: number | null
  property_type: string
  transaction_type: string
  price_aed: number | null
  size_sqft: number | null
  built_up_sqft: number | null
  plot_sqft: number | null
  price_per_sqft_aed: number | null
  transaction_date: string | null
  history: string | null
  detail_url: string | null
}

type Analysis = {
  label: string
  count: number
  avgPrice: number | null
  medianPrice: number | null
  minPrice: number | null
  maxPrice: number | null
  avgBuiltUp: number | null
  avgPlot: number | null
  avgPricePerSqft: number | null
  avgBeds: number | null
}

const BED_OPTIONS = [
  { value: "all", label: "All beds" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
]

function formatPrice(price: number | null) {
  if (price == null) return "—"
  return `AED ${Math.round(price).toLocaleString("en-AE")}`
}

function formatSqft(value: number | null | undefined) {
  if (value == null) return "—"
  return Math.round(Number(value)).toLocaleString("en-AE")
}

function formatDate(value: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function bedsLabel(beds: number | null) {
  if (beds === null || beds === undefined) return "—"
  if (beds === 0) return "Studio"
  return String(beds)
}

export default function MarketTransactionsPage() {
  const [rows, setRows] = useState<Tx[]>([])
  const [communities, setCommunities] = useState<string[]>([])
  const [subAreas, setSubAreas] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [community, setCommunity] = useState("all")
  const [subArea, setSubArea] = useState("all")
  const [beds, setBeds] = useState("all")
  const [propertyType, setPropertyType] = useState("all")
  const [transactionType, setTransactionType] = useState("sale")
  const [sort, setSort] = useState("newest")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "500", sort })
      if (community !== "all") params.set("community", community)
      if (subArea !== "all") params.set("subArea", subArea)
      if (beds !== "all") params.set("beds", beds)
      if (propertyType !== "all") params.set("propertyType", propertyType)
      if (transactionType !== "all") params.set("transactionType", transactionType)

      const res = await fetch(`/api/market-transactions?${params.toString()}`)
      const data = await res.json()
      setRows(data.transactions || [])
      setCommunities(data.communities || [])
      setSubAreas(data.subAreas || [])
      setAnalysis(data.analysis || null)
    } catch (error) {
      console.error(error)
      setRows([])
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }, [community, subArea, beds, propertyType, transactionType, sort])

  useEffect(() => {
    const t = setTimeout(() => {
      void load()
    }, 150)
    return () => clearTimeout(t)
  }, [load])

  useEffect(() => {
    setSubArea("all")
  }, [community])

  const filteredSubAreas = useMemo(() => subAreas, [subAreas])

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Bayut completed deals · last 3 months · Mudon, DAMAC Hills, Town Square, Villanova, Arabian Ranches 1–3
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {analysis && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight">{analysis.label}</h2>
            <Badge variant="secondary">{analysis.count} deals</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Averages update live when you change area, sub-area, beds, type, or sale/rent.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg price</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{formatPrice(analysis.avgPrice)}</p>
              <p className="text-xs text-muted-foreground">
                median {formatPrice(analysis.medianPrice)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Range</p>
              <p className="mt-1 text-sm font-medium tabular-nums">
                {formatPrice(analysis.minPrice)} – {formatPrice(analysis.maxPrice)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg built-up</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {analysis.avgBuiltUp != null ? `${formatSqft(analysis.avgBuiltUp)} sqft` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                avg plot {analysis.avgPlot != null ? `${formatSqft(analysis.avgPlot)} sqft` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg AED / sqft</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {analysis.avgPricePerSqft != null
                  ? Math.round(analysis.avgPricePerSqft).toLocaleString("en-AE")
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                avg beds {analysis.avgBeds != null ? analysis.avgBeds : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Select value={community} onValueChange={setCommunity}>
          <SelectTrigger>
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {communities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={subArea} onValueChange={setSubArea}>
          <SelectTrigger>
            <SelectValue placeholder="Sub-area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sub-areas</SelectItem>
            {filteredSubAreas.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Townhouse">Townhouse</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
          </SelectContent>
        </Select>

        <Select value={beds} onValueChange={setBeds}>
          <SelectTrigger>
            <SelectValue placeholder="Beds" />
          </SelectTrigger>
          <SelectContent>
            {BED_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={transactionType} onValueChange={setTransactionType}>
          <SelectTrigger>
            <SelectValue placeholder="Deal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sale + Rent</SelectItem>
            <SelectItem value="sale">Sale</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest date</SelectItem>
            <SelectItem value="price_desc">Price: high → low</SelectItem>
            <SelectItem value="price_asc">Price: low → high</SelectItem>
            <SelectItem value="beds_desc">Beds: high → low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price (AED)</TableHead>
              <TableHead>Beds</TableHead>
              <TableHead>Built-up</TableHead>
              <TableHead>Plot</TableHead>
              <TableHead>History</TableHead>
              <TableHead className="w-[72px]">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No transactions yet. Run{" "}
                  <code className="text-xs">npm run import-transactions</code> in the worker.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const link = transactionLink(row.detail_url)
                return (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(row.transaction_date)}</TableCell>
                    <TableCell>
                      <BayutTitleLink
                        href={link?.url}
                        title={row.sub_area || row.community}
                        subtitle={row.master_community || row.community}
                      />
                    </TableCell>
                    <TableCell>{row.property_type || "—"}</TableCell>
                    <TableCell className="tabular-nums font-medium">{formatPrice(row.price_aed)}</TableCell>
                    <TableCell>{bedsLabel(row.bedrooms)}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatSqft(row.built_up_sqft ?? row.size_sqft)}
                    </TableCell>
                    <TableCell className="tabular-nums">{formatSqft(row.plot_sqft)}</TableCell>
                    <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                      {row.history || "—"}
                    </TableCell>
                    <TableCell>
                      <BayutLink link={link} />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            No transactions yet.
          </p>
        ) : (
          rows.map((row) => {
            const link = transactionLink(row.detail_url)
            return (
              <div key={row.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <BayutTitleLink
                    href={link?.url}
                    title={row.sub_area || row.community}
                    subtitle={formatDate(row.transaction_date)}
                    className="max-w-none"
                  />
                  <Badge variant="secondary" className="capitalize">
                    {row.transaction_type}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Price</p>
                    <p className="font-medium">{formatPrice(row.price_aed)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Beds</p>
                    <p className="font-medium">{bedsLabel(row.bedrooms)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Built-up</p>
                    <p className="font-medium">{formatSqft(row.built_up_sqft ?? row.size_sqft)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Plot</p>
                    <p className="font-medium">{formatSqft(row.plot_sqft)}</p>
                  </div>
                </div>
                {row.history ? <p className="mt-2 text-xs text-muted-foreground">{row.history}</p> : null}
                <div className="mt-3">
                  <BayutLink link={link} variant="inline">
                    Open on Bayut
                  </BayutLink>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
