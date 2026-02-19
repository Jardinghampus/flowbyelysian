"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  BellRing,
  X,
  Plus,
  Trash2,
  Check,
  ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  type PropertyCategory,
  type PropertyType,
  type TransactionType,
  areas,
  categoryLabels,
} from "@/lib/data/marketplace-listings"

export interface SavedSearchCriteria {
  id: string
  name: string
  minPrice: number
  maxPrice: number
  minBeds: number
  areas: string[]
  categories: PropertyCategory[]
  types: PropertyType[]
  transactionType: TransactionType | "any"
  createdAt: number
  matchCount?: number
}

const STORAGE_KEY = "marketplace-saved-searches"

function loadSavedSearches(): SavedSearchCriteria[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveSavedSearches(searches: SavedSearchCriteria[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
}

interface SavedSearchPanelProps {
  isOpen: boolean
  onClose: () => void
  currentFilters?: {
    categories: PropertyCategory[]
    area: string | null
    searchQuery: string
  }
  matchCounts?: Record<string, number>
}

export function SavedSearchPanel({
  isOpen,
  onClose,
  currentFilters,
  matchCounts,
}: SavedSearchPanelProps) {
  const [searches, setSearches] = useState<SavedSearchCriteria[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [minBeds, setMinBeds] = useState("")
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<PropertyCategory[]>(["listing", "off-market", "request"])
  const [transactionType, setTransactionType] = useState<TransactionType | "any">("any")

  useEffect(() => {
    setSearches(loadSavedSearches())
  }, [])

  const handleSave = () => {
    if (!newName.trim()) {
      toast.error("Please enter a name for your search")
      return
    }

    const newSearch: SavedSearchCriteria = {
      id: Date.now().toString(),
      name: newName.trim(),
      minPrice: minPrice ? parseInt(minPrice) : 0,
      maxPrice: maxPrice ? parseInt(maxPrice) : 999999999,
      minBeds: minBeds ? parseInt(minBeds) : 0,
      areas: selectedAreas,
      categories: selectedCategories,
      types: [],
      transactionType,
      createdAt: Date.now(),
    }

    const updated = [...searches, newSearch]
    setSearches(updated)
    saveSavedSearches(updated)
    setIsCreating(false)
    resetForm()
    toast.success("Search saved! You'll be notified of matching listings.")
  }

  const handleDelete = (id: string) => {
    const updated = searches.filter((s) => s.id !== id)
    setSearches(updated)
    saveSavedSearches(updated)
    toast.success("Saved search removed")
  }

  const handleQuickSave = () => {
    if (!currentFilters) return

    const autoName = [
      currentFilters.area
        ? areas.find((a) => a.slug === currentFilters.area)?.name
        : "All Areas",
      currentFilters.categories.map((c) => categoryLabels[c]).join(", "),
      currentFilters.searchQuery || "",
    ]
      .filter(Boolean)
      .join(" - ")

    const newSearch: SavedSearchCriteria = {
      id: Date.now().toString(),
      name: autoName,
      minPrice: 0,
      maxPrice: 999999999,
      minBeds: 0,
      areas: currentFilters.area ? [currentFilters.area] : [],
      categories: currentFilters.categories,
      types: [],
      transactionType: "any",
      createdAt: Date.now(),
    }

    const updated = [...searches, newSearch]
    setSearches(updated)
    saveSavedSearches(updated)
    toast.success("Current search saved!")
  }

  const resetForm = () => {
    setNewName("")
    setMinPrice("")
    setMaxPrice("")
    setMinBeds("")
    setSelectedAreas([])
    setSelectedCategories(["listing", "off-market", "request"])
    setTransactionType("any")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 h-full z-50 flex flex-col",
              "w-full sm:w-[380px] md:w-[400px]",
              "bg-background border-l border-border shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BellRing className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Saved Searches</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Get notified when new listings match
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick save current */}
            {currentFilters && (
              <div className="px-4 py-3 border-b border-border bg-primary/5">
                <button
                  onClick={handleQuickSave}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-primary/20 bg-background hover:bg-primary/5 text-sm font-medium text-primary transition-colors"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Save Current Search
                </button>
              </div>
            )}

            {/* Searches list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {searches.length === 0 && !isCreating && (
                <div className="text-center py-12">
                  <Bell className="h-10 w-10 text-gray-200 dark:text-neutral-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-neutral-400 mb-1">
                    No saved searches yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-neutral-500 mb-4">
                    Save a search to get notified when new listings match your criteria
                  </p>
                </div>
              )}

              {searches.map((search) => (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border border-border bg-white dark:bg-neutral-900 group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {search.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 dark:text-neutral-500">
                        Created {new Date(search.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {matchCounts && matchCounts[search.id] !== undefined && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary">
                          {matchCounts[search.id]} matches
                        </Badge>
                      )}
                      <button
                        onClick={() => handleDelete(search.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {search.areas.length > 0 &&
                      search.areas.map((slug) => (
                        <span key={slug} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400">
                          {areas.find((a) => a.slug === slug)?.name || slug}
                        </span>
                      ))}
                    {search.minPrice > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400">
                        Min AED {(search.minPrice / 1000000).toFixed(1)}M
                      </span>
                    )}
                    {search.maxPrice < 999999999 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400">
                        Max AED {(search.maxPrice / 1000000).toFixed(1)}M
                      </span>
                    )}
                    {search.minBeds > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400">
                        {search.minBeds}+ beds
                      </span>
                    )}
                    {search.transactionType !== "any" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400">
                        {search.transactionType === "sale" ? "For Sale" : "For Rent"}
                      </span>
                    )}
                    {search.categories.map((cat) => (
                      <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400">
                        {categoryLabels[cat]}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Create new form */}
              <AnimatePresence>
                {isCreating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
                      <Input
                        placeholder="Search name (e.g. 'Palm Villas under 30M')"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8 text-sm"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min Price (AED)"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Input
                          type="number"
                          placeholder="Max Price (AED)"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <Input
                        type="number"
                        placeholder="Min Bedrooms"
                        value={minBeds}
                        onChange={(e) => setMinBeds(e.target.value)}
                        className="h-8 text-xs"
                      />

                      <div>
                        <p className="text-[11px] font-medium text-gray-600 dark:text-neutral-400 mb-1.5">Areas</p>
                        <div className="flex flex-wrap gap-1">
                          {areas.map((area) => (
                            <button
                              key={area.slug}
                              onClick={() =>
                                setSelectedAreas((prev) =>
                                  prev.includes(area.slug)
                                    ? prev.filter((s) => s !== area.slug)
                                    : [...prev, area.slug]
                                )
                              }
                              className={cn(
                                "text-[10px] px-2.5 py-1 rounded-full border transition-colors",
                                selectedAreas.includes(area.slug)
                                  ? "border-primary bg-primary/10 text-primary font-medium"
                                  : "border-border bg-background text-gray-500 dark:text-neutral-400 hover:bg-secondary"
                              )}
                            >
                              {selectedAreas.includes(area.slug) && <Check className="h-2.5 w-2.5 inline mr-0.5" />}
                              {area.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-medium text-gray-600 dark:text-neutral-400 mb-1.5">Transaction</p>
                        <div className="flex gap-1">
                          {(["any", "sale", "rent"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setTransactionType(t)}
                              className={cn(
                                "text-[10px] px-3 py-1 rounded-full border transition-colors",
                                transactionType === t
                                  ? "border-primary bg-primary/10 text-primary font-medium"
                                  : "border-border bg-background text-gray-500 dark:text-neutral-400 hover:bg-secondary"
                              )}
                            >
                              {t === "any" ? "Any" : t === "sale" ? "For Sale" : "For Rent"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleSave}>
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Save Search
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            setIsCreating(false)
                            resetForm()
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!isCreating && (
              <div className="p-4 border-t border-border">
                <Button
                  className="w-full h-9 text-xs gap-1.5"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Custom Search Alert
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Trigger button for the saved search panel
export function SavedSearchTrigger({
  onClick,
  savedCount,
}: {
  onClick: () => void
  savedCount: number
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 text-xs gap-1.5 relative"
      onClick={onClick}
    >
      <Bell className="h-3.5 w-3.5" />
      Alerts
      {savedCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-bold">
          {savedCount}
        </span>
      )}
    </Button>
  )
}
