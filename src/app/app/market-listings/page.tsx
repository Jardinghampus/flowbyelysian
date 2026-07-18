"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
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
import { BayutLink, BayutTitleLink } from "@/components/zaylo/bayut-link"
import { listingLink, normalizeBayutUrl } from "@/lib/zaylo/bayut-links"

type MarketListing = {
  id: string
  community: string
  master_community: string | null
  sub_area: string | null
  listing_number: string
  permit_number?: string | null
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
  agency: string | null
  agent_name: string | null
  listing_url: string
  transaction_type: "rent" | "sale"
  status: string
  last_seen: string
}

type Stats = {
  count: number
  avgPrice: number | null
  rentCount: number
  saleCount: number
  avgRentPrice: number | null
  avgSalePrice: number | null
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

function formatPrice(price: number | null, currency = "AED", rentPeriod = "") {
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
  const [subAreas, setSubAreas] = useState<string[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [community, setCommunity] = useState("all")
  const [subArea, setSubArea] = useState("all")
  const [beds, setBeds] = useState("all")
  const [propertyType, setPropertyType] = useState("all")
  const [transactionType, setTransactionType] = useState("all")
  const [sort, setSort] = useState("newest")
  const [q, setQ] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: "active", limit: "500", sort })
      if (community !== "all") params.set("community", community)
      if (subArea !== "all") params.set("subArea", subArea)
      if (beds !== "all") params.set("beds", beds)
      if (propertyType !== "all") params.set("propertyType", propertyType)
      if (transactionType !== "all") params.set("transactionType", transactionType)
      if (q.trim()) params.set("q", q.trim())

      const res = await fetch(`/api/market-listings?${params.toString()}`)
      const data = await res.json()
      setListings(data.listings || [])
      setCommunities(data.communities || [])
      setSubAreas(data.subAreas || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error(error)
      setListings([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [community, subArea, beds, propertyType, transactionType, sort, q])

  useEffect(() => {
    const t = setTimeout(() => {
      void load()
    }, 200)
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
          <h1 className="text-2xl font-semibold tracking-tight">Active Listings</h1>
          <p className="text-sm text-muted-foreground">
            Bayut live scrape — Town Square, DAMAC Hills, Arabian Ranches 1–3, Mudon, DAMAC Lagoons, Villanova
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Listings</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stats?.count ?? "—"}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg price</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {formatPrice(stats?.avgPrice ?? null)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg rent</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {formatPrice(stats?.avgRentPrice ?? null)}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({stats?.rentCount ?? 0})
            </span>
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg sale</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {formatPrice(stats?.avgSalePrice ?? null)}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({stats?.saleCount ?? 0})
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
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
            <SelectValue placeholder="Property" />
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
            <SelectItem value="all">Rent + Sale</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="sale">Sale</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest seen</SelectItem>
            <SelectItem value="price_desc">Price: high → low</SelectItem>
            <SelectItem value="price_asc">Price: low → high</SelectItem>
            <SelectItem value="beds_desc">Beds: high → low</SelectItem>
            <SelectItem value="beds_asc">Beds: low → high</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search title / agency / permit"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

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
          listings.map((listing) => {
            const href = normalizeBayutUrl(listing.listing_url)
            const link = listingLink(listing.listing_url)
            return (
              <div key={listing.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <BayutTitleLink
                    href={href}
                    title={listing.title || "Untitled"}
                    subtitle={
                      areaLabel(listing) +
                      (subAreaLabel(listing) !== areaLabel(listing)
                        ? ` · ${subAreaLabel(listing)}`
                        : "")
                    }
                    className="min-w-0 max-w-none"
                  />
                  <Badge variant="secondary" className="capitalize shrink-0">
                    {listing.transaction_type}
                  </Badge>
                </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Type</p>
                  <p className="font-medium">{listing.property_type || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Price</p>
                  <p className="font-medium">{formatPrice(listing.price, listing.currency, listing.rent_period)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Beds</p>
                  <p className="font-medium">{bedsLabel(listing.beds)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Permit</p>
                  <p className="font-medium font-mono text-xs">{listing.permit_number || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Agency</p>
                  <p className="font-medium line-clamp-1">{listing.agency || "—"}</p>
                </div>
              </div>
              <div className="mt-3">
                <BayutLink link={link} variant="inline" />
              </div>
              </div>
            )
          })
        )}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Sub-area</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Beds</TableHead>
              <TableHead>Permit</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No active listings yet. Seed URLs then run{" "}
                  <code className="text-xs">pnpm zaylo:worker --job import-market</code>
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => {
                const href = normalizeBayutUrl(listing.listing_url)
                const link = listingLink(listing.listing_url)
                return (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <BayutTitleLink
                        href={href}
                        title={listing.title || "—"}
                        subtitle={listing.listing_number || null}
                      />
                    </TableCell>
                    <TableCell>{areaLabel(listing)}</TableCell>
                    <TableCell className="max-w-[140px]">
                      <span className="line-clamp-2">{subAreaLabel(listing)}</span>
                    </TableCell>
                    <TableCell>{listing.property_type || "—"}</TableCell>
                    <TableCell>{formatPrice(listing.price, listing.currency, listing.rent_period)}</TableCell>
                    <TableCell>{bedsLabel(listing.beds)}</TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {listing.permit_number || "—"}
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <span className="line-clamp-2 text-sm">{listing.agency || "—"}</span>
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

      <p className="text-xs text-muted-foreground">
        {stats?.count ?? listings.length} listings in filter · avg updates with beds/area/type
      </p>
    </div>
  )
}
