"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  marketplaceListings,
  areas,
  type MarketplaceProperty,
  categoryColors,
  categoryLabels,
} from "@/lib/data/marketplace-listings"
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
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ExternalLink,
  Building2,
  Filter,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface InventoryBrowserProps {
  isOpen: boolean
  onClose: () => void
}

function formatPrice(price: number, transactionType: string): string {
  if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M${transactionType === "rent" ? "/yr" : ""}`
  if (price >= 1000) return `AED ${(price / 1000).toFixed(0)}K${transactionType === "rent" ? "/yr" : ""}`
  return `AED ${price.toLocaleString()}`
}

export function InventoryBrowser({ isOpen, onClose }: InventoryBrowserProps) {
  const [search, setSearch] = useState("")
  const [areaFilter, setAreaFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [transactionFilter, setTransactionFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("price-asc")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(true)

  const filtered = useMemo(() => {
    let result = marketplaceListings.filter((p) => {
      if (areaFilter !== "all" && p.areaSlug !== areaFilter) return false
      if (typeFilter !== "all" && p.type !== typeFilter) return false
      if (transactionFilter !== "all" && p.transactionType !== transactionFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.title.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.developer.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
        )
      }
      return true
    })

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "size-desc":
        result.sort((a, b) => b.size - a.size)
        break
      case "beds-desc":
        result.sort((a, b) => b.bedrooms - a.bedrooms)
        break
    }

    return result
  }, [search, areaFilter, typeFilter, transactionFilter, sortBy])

  const handleWhatsApp = (p: MarketplaceProperty) => {
    const message = encodeURIComponent(
      `Hi! I'm interested in "${p.title}" in ${p.area} (${formatPrice(p.price, p.transactionType)}). Can I get more details?`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
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
            className="fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-white dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800 rounded-t-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Inventory Browser</h2>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    {filtered.length} of {marketplaceListings.length} properties
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => setShowFilters((p) => !p)}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-b border-gray-200 dark:border-neutral-800"
                >
                  <div className="p-4 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search properties, areas, developers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Select value={areaFilter} onValueChange={setAreaFilter}>
                        <SelectTrigger className="h-8 text-xs bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
                          <SelectValue placeholder="Area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Areas</SelectItem>
                          {areas.map((a) => (
                            <SelectItem key={a.slug} value={a.slug}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="h-8 text-xs bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {["villa", "apartment", "townhouse", "penthouse", "plot"].map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                        <SelectTrigger className="h-8 text-xs bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
                          <SelectValue placeholder="Transaction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Sale & Rent</SelectItem>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="rent">For Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-8 text-xs bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
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

            {/* Listings */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Building2 className="h-12 w-12 text-gray-200 dark:text-neutral-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-neutral-400">No properties match your criteria</p>
                </div>
              ) : (
                filtered.map((p) => {
                  const colors = categoryColors[p.category]
                  const isExpanded = expandedId === p.id
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      className="border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 hover:border-primary/20 dark:hover:border-primary/30 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className="w-full flex items-center gap-3 p-3 text-left"
                      >
                        <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <Image src={p.imageUrl} alt={p.title} fill className="object-cover" sizes="56px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.title}</h3>
                            <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0", colors.bg, colors.text)}>
                              {categoryLabels[p.category]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                            <MapPin className="h-3 w-3" />
                            <span>{p.area}</span>
                            <span className="text-gray-300 dark:text-neutral-600">|</span>
                            <span className="capitalize">{p.type}</span>
                            <span className="text-gray-300 dark:text-neutral-600">|</span>
                            <span>{p.bedrooms}BR</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatPrice(p.price, p.transactionType)}
                          </span>
                          <span className="block text-[10px] text-gray-400 dark:text-neutral-500">
                            {p.transactionType === "sale" ? "For Sale" : "For Rent"}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-3 border-t border-gray-100 dark:border-neutral-800 pt-3">
                              <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed">
                                {p.description}
                              </p>
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
                              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                                <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-gray-600 dark:text-neutral-300 leading-relaxed">
                                  {p.aiSummary}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {p.features.map((f) => (
                                  <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">
                                    {f}
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleWhatsApp(p)}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25d366] hover:bg-[#20bd5a] text-white text-[11px] font-semibold transition-colors"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  Inquire
                                </button>
                                <a
                                  href={`/marketplace?property=${p.id}`}
                                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-[11px] font-semibold transition-colors border border-gray-200 dark:border-neutral-700"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  View
                                </a>
                              </div>
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
