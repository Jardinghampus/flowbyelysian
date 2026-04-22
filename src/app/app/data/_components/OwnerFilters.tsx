"use client"

import { useState, useEffect } from "react"
import { Search, X, Download, Plus, SlidersHorizontal, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OwnerFiltersState } from "../_lib/types"

interface OwnerFiltersProps {
  filters: OwnerFiltersState
  onFiltersChange: (filters: OwnerFiltersState) => void
  onAddOwner: () => void
  onLogOutreach: () => void
  onExport: () => void
  areas: string[]
}

export function OwnerFilters({
  filters,
  onFiltersChange,
  onAddOwner,
  onLogOutreach,
  onExport,
  areas,
}: OwnerFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, filters, onFiltersChange])

  const hasActiveFilters =
    filters.area || filters.bedrooms || filters.status || filters.agent || filters.dateFrom || filters.dateTo

  const clearFilters = () => {
    setSearchInput("")
    onFiltersChange({
      search: "",
      area: "",
      bedrooms: "",
      status: "",
      agent: "",
      dateFrom: "",
      dateTo: "",
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, unit..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9 bg-background/50"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); onFiltersChange({ ...filters, search: "" }) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick filters */}
        <Select
          value={filters.area || "all"}
          onValueChange={(v) => onFiltersChange({ ...filters, area: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[160px] h-9 bg-background/50">
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(v) => onFiltersChange({ ...filters, status: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[140px] h-9 bg-background/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="considering">Considering</SelectItem>
            <SelectItem value="listed">Listed</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="unresponsive">Unresponsive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.bedrooms || "all"}
          onValueChange={(v) => onFiltersChange({ ...filters, bedrooms: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[120px] h-9 bg-background/50">
            <SelectValue placeholder="BR" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All BR</SelectItem>
            <SelectItem value="Studio">Studio</SelectItem>
            <SelectItem value="1">1 BR</SelectItem>
            <SelectItem value="2">2 BR</SelectItem>
            <SelectItem value="3">3 BR</SelectItem>
            <SelectItem value="4">4 BR</SelectItem>
            <SelectItem value="5+">5+ BR</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">More</span>
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={onLogOutreach}>
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log Outreach</span>
          </Button>
          <Button size="sm" className="h-9 gap-1.5 bg-[#C9A84C] hover:bg-[#B8973B] text-black" onClick={onAddOwner}>
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Owner</span>
          </Button>
        </div>
      </div>

      {/* Advanced filters row */}
      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Last contacted:</span>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
              className="w-[140px] h-8 text-xs bg-background/50"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
              className="w-[140px] h-8 text-xs bg-background/50"
            />
          </div>
        </div>
      )}
    </div>
  )
}
