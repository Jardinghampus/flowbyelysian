"use client"

import { useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import {
  marketplaceListings,
  areas,
  type MarketplaceProperty,
  type PropertyCategory,
} from "@/lib/data/marketplace-listings"
import { FilterBar } from "@/components/marketplace/filter-bar"
import { PropertyCard } from "@/components/marketplace/property-card"
import { AIAdvisor, AIAdvisorTrigger } from "@/components/marketplace/ai-advisor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Maximize2,
  Minimize2,
  Search,
  Map,
  LayoutGrid,
  SlidersHorizontal,
  Building2,
  TrendingUp,
  DollarSign,
  ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Dynamic import for Mapbox (no SSR)
const MarketplaceMap = dynamic(
  () =>
    import("@/components/marketplace/marketplace-map").then(
      (mod) => mod.MarketplaceMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-muted animate-pulse rounded-xl flex items-center justify-center">
        <Map className="h-8 w-8 text-muted-foreground/40" />
      </div>
    ),
  }
)

export default function MarketplacePage() {
  const [selectedCategories, setSelectedCategories] = useState<PropertyCategory[]>([
    "listing",
    "off-market",
    "request",
  ])
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<MarketplaceProperty | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<"both" | "map" | "list">("both")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return marketplaceListings.filter((p) => {
      if (!selectedCategories.includes(p.category)) return false
      if (selectedArea && p.areaSlug !== selectedArea) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          p.title.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.developer.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [selectedCategories, selectedArea, searchQuery])

  // Map center based on selected area
  const mapCenter = useMemo(() => {
    if (selectedArea) {
      const area = areas.find((a) => a.slug === selectedArea)
      return area?.center
    }
    return undefined
  }, [selectedArea])

  const mapZoom = useMemo(() => {
    if (selectedArea) {
      const area = areas.find((a) => a.slug === selectedArea)
      return area?.zoom
    }
    return undefined
  }, [selectedArea])

  const handleToggleCategory = useCallback((category: PropertyCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        if (prev.length === 1) return prev // Don't allow empty
        return prev.filter((c) => c !== category)
      }
      return [...prev, category]
    })
  }, [])

  const handleSelectArea = useCallback((slug: string | null) => {
    setSelectedArea(slug)
    setSelectedProperty(null)
  }, [])

  const handleSelectProperty = useCallback((property: MarketplaceProperty) => {
    setSelectedProperty(property)
  }, [])

  // Stats
  const stats = useMemo(() => {
    const listings = filteredProperties.filter((p) => p.category === "listing")
    const offMarket = filteredProperties.filter((p) => p.category === "off-market")
    const requests = filteredProperties.filter((p) => p.category === "request")
    const avgPrice =
      listings.length > 0
        ? listings.reduce((sum, p) => sum + p.price, 0) / listings.length
        : 0

    return { listings: listings.length, offMarket: offMarket.length, requests: requests.length, avgPrice }
  }, [filteredProperties])

  return (
    <>
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Map className="h-6 w-6 text-primary" />
              Market Place
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Explore listings, off-market deals, and buyer requests across Dubai&apos;s premium communities
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-muted-foreground">Listings:</span>
              <span className="font-semibold">{stats.listings}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-muted-foreground">Off-Market:</span>
              <span className="font-semibold">{stats.offMarket}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <DollarSign className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-muted-foreground">Requests:</span>
              <span className="font-semibold">{stats.requests}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties, areas, developers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* View mode + actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("both")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "both"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                )}
              >
                Both
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
                  viewMode === "map"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                )}
              >
                <Map className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  showFilters && "rotate-180"
                )}
              />
            </Button>

            {viewMode !== "list" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setIsFullscreen((prev) => !prev)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
                {isFullscreen ? "Exit" : "Fullscreen"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 lg:px-6 overflow-hidden"
          >
            <FilterBar
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              selectedArea={selectedArea}
              onSelectArea={handleSelectArea}
              areas={areas}
              resultCount={filteredProperties.length}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="px-4 lg:px-6 flex-1">
        <AnimatePresence mode="wait">
          {/* Fullscreen map */}
          {isFullscreen && viewMode !== "list" ? (
            <motion.div
              key="fullscreen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-background"
            >
              <div className="h-full w-full">
                <MarketplaceMap
                  properties={filteredProperties}
                  selectedProperty={selectedProperty}
                  onSelectProperty={handleSelectProperty}
                  isFullscreen={true}
                  mapCenter={mapCenter}
                  mapZoom={mapZoom}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 left-4 z-40 h-8 text-xs gap-1.5 bg-background/90 backdrop-blur-sm"
                onClick={() => setIsFullscreen(false)}
              >
                <Minimize2 className="h-3.5 w-3.5" />
                Exit Fullscreen
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Map */}
              {viewMode !== "list" && (
                <div
                  className={cn(
                    "w-full rounded-xl overflow-hidden border border-border",
                    viewMode === "map" ? "h-[calc(100vh-280px)]" : "h-[400px] md:h-[450px]"
                  )}
                >
                  <MarketplaceMap
                    properties={filteredProperties}
                    selectedProperty={selectedProperty}
                    onSelectProperty={handleSelectProperty}
                    isFullscreen={false}
                    mapCenter={mapCenter}
                    mapZoom={mapZoom}
                  />
                </div>
              )}

              {/* Listings grid */}
              {viewMode !== "map" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-sm">
                      Properties
                      <span className="text-muted-foreground font-normal ml-1.5">
                        ({filteredProperties.length})
                      </span>
                    </h2>
                    {selectedArea && (
                      <Badge variant="secondary" className="text-xs">
                        {areas.find((a) => a.slug === selectedArea)?.name}
                      </Badge>
                    )}
                  </div>

                  {filteredProperties.length === 0 ? (
                    <div className="text-center py-16">
                      <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No properties match your filters
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          setSelectedCategories(["listing", "off-market", "request"])
                          setSelectedArea(null)
                          setSearchQuery("")
                        }}
                      >
                        Reset filters
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredProperties.map((property, index) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          isSelected={selectedProperty?.id === property.id}
                          onClick={() => handleSelectProperty(property)}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Advisor */}
      <AIAdvisorTrigger onClick={() => setIsAdvisorOpen(true)} />
      <AIAdvisor
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        listings={filteredProperties}
      />
    </>
  )
}
