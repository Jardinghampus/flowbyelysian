"use client"

import { useCallback, useEffect, useState } from "react"
import { ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

type MarketListing = {
  id: string
  community: string
  master_community: string | null
  sub_area: string | null
  listing_number: string
  title: string
  price: number | null
  currency: string
  rent_period: string
  location: string
  beds: number | null
  size_sqft: number | null
  built_up_sqft: number | null
  plot_sqft: number | null
  property_type: string
  listing_url: string
  transaction_type: "rent" | "sale"
  status: string
  last_seen: string
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

function formatPrice(price: number | null, currency: string, rentPeriod: string) {
  if (price == null) return "—"
  const formatted = `${currency || "AED"} ${Math.round(price).toLocaleString("en-AE")}`
  return rentPeriod ? `${formatted} / ${rentPeriod}` : formatted
}

function formatSqft(value: number | null | undefined) {
  if (value == null) return "—"
  return `${Math.round(Number(value)).toLocaleString("en-AE")} sqft`
}

function bedsLabel(beds: number | null) {
  if (beds === null || beds === undefined) return "—"
  if (beds === 0) return "Studio"
  return String(beds)
}

function areaLabel(listing: MarketListing) {
  return listing.master_community || listing.community || "—"
}

function subAreaLabel(listing: MarketListing) {
  return listing.sub_area || listing.community || listing.location || "—"
}

export default function MarketListingsPage() {
  const [listings, setListings] = useState<MarketListing[]>([])
  const [communities, setCommunities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [community, setCommunity] = useState("all")
  const [beds, setBeds] = useState("all")
  const [transactionType, setTransactionType] = useState("all")
  const [q, setQ] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: "active" })
      if (community !== "all") params.set("community", community)
      if (beds !== "all") params.set("beds", beds)
      if (transactionType !== "all") params.set("transactionType", transactionType)
      if (q.trim()) params.set("q", q.trim())

      const res = await fetch(`/api/market-listings?${params.toString()}`)
      const data = await res.json()
      setListings(data.listings || [])
      setCommunities(data.communities || [])
    } catch (error) {
      console.error(error)
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [community, beds, transactionType, q])

  useEffect(() => {
    const t = setTimeout(() => {
      void load()
    }, 200)
    return () => clearTimeout(t)
  }, [load])

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Active Listings</h1>
          <p className="text-sm text-muted-foreground">
            Live Bayut scrape — gone from portal disappears here after the next import.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Rent + Sale</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="sale">Sale</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search title / listing # / location"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            No active listings yet.
          </p>
        ) : (
          listings.map((listing) => (
            <a
              key={listing.id}
              href={listing.listing_url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border bg-card p-4 shadow-sm active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold leading-snug line-clamp-2">{listing.title || "Untitled"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {areaLabel(listing)}
                    {subAreaLabel(listing) !== areaLabel(listing) ? ` · ${subAreaLabel(listing)}` : ""}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize shrink-0">
                  {listing.transaction_type}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Price</p>
                  <p className="font-medium">{formatPrice(listing.price, listing.currency, listing.rent_period)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Beds</p>
                  <p className="font-medium">{bedsLabel(listing.beds)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Built-up</p>
                  <p className="font-medium">{formatSqft(listing.built_up_sqft ?? listing.size_sqft)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Plot</p>
                  <p className="font-medium">{formatSqft(listing.plot_sqft)}</p>
                </div>
              </div>
              {listing.listing_url ? (
                <p className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                  Open listing <ExternalLink className="h-3.5 w-3.5" />
                </p>
              ) : null}
            </a>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Sub-area</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Built-up</TableHead>
              <TableHead>Plot</TableHead>
              <TableHead>Beds</TableHead>
              <TableHead>Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No active listings yet. Run the worker:{" "}
                  <code className="text-xs">pnpm zaylo:worker --job import-market</code>
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="max-w-[220px]">
                    <div className="font-medium line-clamp-2">{listing.title || "—"}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {listing.listing_number || "—"}
                    </div>
                  </TableCell>
                  <TableCell>{areaLabel(listing)}</TableCell>
                  <TableCell className="max-w-[160px]">
                    <span className="line-clamp-2">{subAreaLabel(listing)}</span>
                  </TableCell>
                  <TableCell>{formatPrice(listing.price, listing.currency, listing.rent_period)}</TableCell>
                  <TableCell>{formatSqft(listing.built_up_sqft ?? listing.size_sqft)}</TableCell>
                  <TableCell>{formatSqft(listing.plot_sqft)}</TableCell>
                  <TableCell>{bedsLabel(listing.beds)}</TableCell>
                  <TableCell>
                    {listing.listing_url ? (
                      <a
                        href={listing.listing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">{listings.length} listings shown</p>
    </div>
  )
}
