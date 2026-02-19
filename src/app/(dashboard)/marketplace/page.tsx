"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import {
  marketplaceListings,
  areas,
  type MarketplaceProperty,
  type PropertyCategory,
  categoryColors,
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
  ArrowUpRight,
  Waves,
} from "lucide-react"
import { motion, AnimatePresence, useInView } from "framer-motion"

// Dynamic import for Mapbox (no SSR)
const MarketplaceMap = dynamic(
  () =>
    import("@/components/marketplace/marketplace-map").then(
      (mod) => mod.MarketplaceMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-50 dark:bg-neutral-900 animate-pulse rounded-xl flex items-center justify-center">
        <Map className="h-8 w-8 text-gray-300 dark:text-neutral-700" />
      </div>
    ),
  }
)

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1200) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const startTime = performance.now()

    function step(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(end * eased))
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [end, duration, isInView])

  return { count, ref }
}

function AnimatedStat({
  value,
  label,
  icon: Icon,
  color,
}: {
  value: number
  label: string
  icon: React.ElementType
  color: string
}) {
  const { count, ref } = useAnimatedCounter(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-sm"
    >
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <span ref={ref} className="text-lg font-bold text-gray-900 dark:text-white">
          {count.toLocaleString()}
        </span>
        <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-tight">{label}</p>
      </div>
    </motion.div>
  )
}

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
        if (prev.length === 1) return prev
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

  const stats = useMemo(() => {
    const listings = filteredProperties.filter((p) => p.category === "listing")
    const offMarket = filteredProperties.filter((p) => p.category === "off-market")
    const requests = filteredProperties.filter((p) => p.category === "request")

    return {
      listings: listings.length,
      offMarket: offMarket.length,
      requests: requests.length,
    }
  }, [filteredProperties])

  const selectedAreaInfo = useMemo(() => {
    if (!selectedArea) return null
    return areas.find((a) => a.slug === selectedArea) || null
  }, [selectedArea])

  return (
    <>
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white"
            >
              <Map className="h-6 w-6 text-primary" />
              Market Place
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 dark:text-neutral-400 text-sm mt-1"
            >
              Explore listings, off-market deals, and buyer requests across Dubai&apos;s premium communities
            </motion.p>
          </div>

          {/* Animated stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <AnimatedStat
              value={stats.listings}
              label="Live Listings"
              icon={Building2}
              color={categoryColors.listing.marker}
            />
            <AnimatedStat
              value={stats.offMarket}
              label="Off-Market"
              icon={TrendingUp}
              color={categoryColors["off-market"].marker}
            />
            <AnimatedStat
              value={stats.requests}
              label="Requests"
              icon={DollarSign}
              color={categoryColors.request.marker}
            />
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-neutral-500" />
            <Input
              placeholder="Search properties, areas, developers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
              {(["both", "map", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors",
                    mode !== "both" && "border-l border-gray-200 dark:border-neutral-800",
                    viewMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  )}
                >
                  {mode === "both" ? "Both" : mode === "map" ? <Map className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                </button>
              ))}
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
                  "h-3 w-3 transition-transform duration-200",
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
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
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
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "w-full rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-sm",
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
                </motion.div>
              )}

              {/* Area info strip — appears when an area is selected */}
              <AnimatePresence>
                {selectedAreaInfo && viewMode !== "map" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border border-primary/10">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Waves className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {selectedAreaInfo.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">
                            {selectedAreaInfo.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs flex-shrink-0">
                        <div className="text-center">
                          <span className="block font-bold text-gray-900 dark:text-white">
                            AED {selectedAreaInfo.avgPricePerSqft.toLocaleString()}
                          </span>
                          <span className="text-gray-500 dark:text-neutral-400">Avg/sqft</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-neutral-700" />
                        <div className="text-center">
                          <span className="block font-bold text-gray-900 dark:text-white">
                            {filteredProperties.length}
                          </span>
                          <span className="text-gray-500 dark:text-neutral-400">Properties</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-neutral-700" />
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          <span className="font-semibold">8-12%</span>
                          <span className="text-gray-500 dark:text-neutral-400">YoY</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Listings grid */}
              {viewMode !== "map" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-sm text-gray-900 dark:text-white">
                      Properties
                      <span className="text-gray-400 dark:text-neutral-500 font-normal ml-1.5">
                        ({filteredProperties.length})
                      </span>
                    </h2>
                    {selectedArea && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                        {areas.find((a) => a.slug === selectedArea)?.name}
                      </Badge>
                    )}
                  </div>

                  {filteredProperties.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <Building2 className="h-12 w-12 text-gray-200 dark:text-neutral-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
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
                    </motion.div>
                  ) : (
                    <motion.div
                      layout
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                      {filteredProperties.map((property, index) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          isSelected={selectedProperty?.id === property.id}
                          onClick={() => handleSelectProperty(property)}
                          index={index}
                        />
                      ))}
                    </motion.div>
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
