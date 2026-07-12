"use client"

import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Building2,
  Filter,
  Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface InventoryBrowserProps {
  isOpen: boolean
  onClose: () => void
}

type BrowseListing = {
  id: string
  title: string
  area: string
  type: string
  price: number
  size: number
  bedrooms: number
  bathrooms: number
  status: string
  transactionType: string
  notes: string
  ownerName: string
}

function formatPrice(price: number, transactionType: string): string {
  if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M${transactionType === "rent" ? "/yr" : ""}`
  if (price >= 1000) return `AED ${(price / 1000).toFixed(0)}K${transactionType === "rent" ? "/yr" : ""}`
  return `AED ${price.toLocaleString()}`
}

export function InventoryBrowser({ isOpen, onClose }: InventoryBrowserProps) {
  const [listings, setListings] = useState<BrowseListing[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [areaFilter, setAreaFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [transactionFilter, setTransactionFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("price-asc")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/listings?limit=500&inquiryType=stock")
        const data = await res.json()
        if (cancelled) return
        setListings(
          (data.listings || []).map((row: Record<string, unknown>) => ({
            id: String(row.id),
            title: String(row.title || "Untitled"),
            area: String(row.area_name || ""),
            type: String(row.type || "apartment"),
            price: Number(row.price) || 0,
            size: Number(row.size) || 0,
            bedrooms: Number(row.bedrooms) || 0,
            bathrooms: Number(row.bathrooms) || 0,
            status: String(row.status || "live"),
            transactionType: String(row.transaction_type || "sale"),
            notes: String(row.notes || ""),
            ownerName: String(row.owner_name || "Agent"),
          }))
        )
      } catch {
        if (!cancelled) setListings([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [isOpen])

  const areas = useMemo(
    () => Array.from(new Set(listings.map((l) => l.area).filter(Boolean))).sort(),
    [listings]
  )

  const filtered = useMemo(() => {
    let result = listings.filter((p) => {
      if (areaFilter !== "all" && p.area !== areaFilter) return false
      if (typeFilter !== "all" && p.type !== typeFilter) return false
      if (statusFilter !== "all" && p.status !== statusFilter) return false
      if (transactionFilter !== "all" && p.transactionType !== transactionFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.title.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
        )
      }
      return true
    })

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case "size-desc":
        result = [...result].sort((a, b) => b.size - a.size)
        break
      case "beds-desc":
        result = [...result].sort((a, b) => b.bedrooms - a.bedrooms)
        break
    }

    return result
  }, [listings, search, areaFilter, typeFilter, statusFilter, transactionFilter, sortBy])

  const handleWhatsApp = async (p: BrowseListing) => {
    try {
      const res = await fetch(`/api/listings/${p.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInDays: 30 }),
      })
      const share = await res.json()
      if (!res.ok) throw new Error(share.error || "Share failed")
      const message = `Listing from our inventory: "${p.title}" in ${p.area} (${formatPrice(p.price, p.transactionType)}).\nAgent: ${p.ownerName}\nPreview: ${share.url}\nPDF: ${share.pdfUrl}`
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
    } catch {
      const message = `Listing: "${p.title}" in ${p.area} (${formatPrice(p.price, p.transactionType)}). Agent: ${p.ownerName}`
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col overflow-hidden rounded-t-2xl border-t border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Team Inventory</h2>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    {loading ? "Loading…" : `${filtered.length} of ${listings.length} live + pocket`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setShowFilters((p) => !p)}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-gray-200 dark:border-neutral-800"
                >
                  <div className="space-y-3 p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search title, area, agent…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 border-gray-200 bg-white pl-9 text-sm dark:border-neutral-800 dark:bg-neutral-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <Select value={areaFilter} onValueChange={setAreaFilter}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Areas</SelectItem>
                          {areas.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {["villa", "apartment", "townhouse", "penthouse", "plot"].map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Live + Pocket</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="pocket">Pocket</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Transaction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Sale & Rent</SelectItem>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="rent">For Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price-asc">Price: Low to High</SelectItem>
                          <SelectItem value="price-desc">Price: High to Low</SelectItem>
                          <SelectItem value="size-desc">Largest First</SelectItem>
                          <SelectItem value="beds-desc">Most Bedrooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <Building2 className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-neutral-700" />
                  <p className="text-sm text-gray-500 dark:text-neutral-400">
                    No team listings match your filters
                  </p>
                </div>
              ) : (
                filtered.map((p) => {
                  const isExpanded = expandedId === p.id
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-primary/20 dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className="flex w-full items-center gap-3 p-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {p.title}
                            </h3>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {p.status}
                            </Badge>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
                            <MapPin className="h-3 w-3" />
                            <span>{p.area || "—"}</span>
                            <span>|</span>
                            <span className="capitalize">{p.type}</span>
                            <span>|</span>
                            <span>{p.ownerName}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatPrice(p.price, p.transactionType)}
                          </span>
                          <span className="block text-[10px] text-gray-400">
                            {p.transactionType === "sale" ? "For Sale" : "For Rent"}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 border-t border-gray-100 px-3 pb-3 pt-3 dark:border-neutral-800">
                              {p.notes ? (
                                <p className="text-xs leading-relaxed text-gray-600 dark:text-neutral-300">
                                  {p.notes}
                                </p>
                              ) : null}
                              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-neutral-300">
                                <span className="flex items-center gap-1">
                                  <Bed className="h-3.5 w-3.5 text-gray-400" />
                                  {p.bedrooms} beds
                                </span>
                                <span className="flex items-center gap-1">
                                  <Bath className="h-3.5 w-3.5 text-gray-400" />
                                  {p.bathrooms} bath
                                </span>
                                <span className="flex items-center gap-1">
                                  <Maximize2 className="h-3.5 w-3.5 text-gray-400" />
                                  {p.size.toLocaleString()} sqft
                                </span>
                              </div>
                              <Button
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                                onClick={() => handleWhatsApp(p)}
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Share listing
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
