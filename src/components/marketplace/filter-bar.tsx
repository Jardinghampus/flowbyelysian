"use client"

import { cn } from "@/lib/utils"
import {
  type PropertyCategory,
  type AreaInfo,
  categoryColors,
  categoryLabels,
} from "@/lib/data/marketplace-listings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, X } from "lucide-react"

interface FilterBarProps {
  selectedCategories: PropertyCategory[]
  onToggleCategory: (category: PropertyCategory) => void
  selectedArea: string | null
  onSelectArea: (areaSlug: string | null) => void
  areas: AreaInfo[]
  resultCount: number
}

export function FilterBar({
  selectedCategories,
  onToggleCategory,
  selectedArea,
  onSelectArea,
  areas,
  resultCount,
}: FilterBarProps) {
  const categories: PropertyCategory[] = ["listing", "off-market", "request"]

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Categories */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => {
          const isActive = selectedCategories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => onToggleCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200",
                isActive
                  ? `${categoryColors[cat].bg} ${categoryColors[cat].text} border-current`
                  : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
              )}
            >
              {categoryLabels[cat]}
            </button>
          )
        })}
        <span className="text-xs text-muted-foreground ml-1">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </span>
      </div>

      {/* Area filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        {areas.map((area) => {
          const isActive = selectedArea === area.slug
          return (
            <Badge
              key={area.slug}
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "cursor-pointer transition-all duration-200 text-[11px]",
                isActive && "shadow-sm"
              )}
              onClick={() => onSelectArea(isActive ? null : area.slug)}
            >
              {area.name}
              {isActive && <X className="h-3 w-3 ml-1" />}
            </Badge>
          )
        })}
        {selectedArea && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => onSelectArea(null)}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
