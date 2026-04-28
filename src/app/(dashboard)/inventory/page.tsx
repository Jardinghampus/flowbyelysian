"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Plus, Sparkles, Filter, X, Loader2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { InventoryTable } from "./components/inventory-table"
import { CreateListingDialog } from "./components/create-listing-dialog"
import { AIMatchingDialog } from "./components/ai-matching-dialog"
import { MatchingTable, getUserMatches } from "./components/matching-table"
import { MyMatchesView } from "./components/my-matches-view"
import { useRole } from "@/contexts/role-context"

export type ListingStatus = "live" | "pocket" | "unofficial"
export type ListingType = "villa" | "apartment" | "townhouse" | "penthouse" | "plot" | "office" | "retail"
export type InquiryType = "stock" | "request"
export type TransactionType = "sale" | "rent"

export interface Listing {
  id: string
  title: string
  area: string
  subArea?: string
  size: number
  price: number
  type: ListingType
  status: ListingStatus
  inquiryType: InquiryType
  transactionType: TransactionType
  notes: string
  propertyFinderUrl?: string
  images: string[]
  bedrooms?: number
  bathrooms?: number
  availability?: string
  ownerId: string
  ownerName: string
  createdAt: string
  updatedAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToListing(row: any): Listing {
  return {
    id: row.id,
    title: row.title,
    area: row.area_name || "",
    subArea: row.sub_area || undefined,
    size: row.size || 0,
    price: row.price,
    type: row.type,
    status: row.status,
    inquiryType: row.inquiry_type,
    transactionType: row.transaction_type,
    notes: row.notes || "",
    propertyFinderUrl: row.property_finder_url || undefined,
    images: row.images || [],
    bedrooms: row.bedrooms || undefined,
    bathrooms: row.bathrooms || undefined,
    availability: row.availability || undefined,
    ownerId: row.owner_id,
    ownerName: row.owner_name || "Unknown",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapListingToDb(listing: Omit<Listing, "id" | "createdAt" | "updatedAt" | "ownerId" | "ownerName">) {
  return {
    title: listing.title,
    area_name: listing.area,
    sub_area: listing.subArea || null,
    size: listing.size,
    price: listing.price,
    type: listing.type,
    status: listing.status,
    inquiry_type: listing.inquiryType,
    transaction_type: listing.transactionType,
    notes: listing.notes || null,
    property_finder_url: listing.propertyFinderUrl || null,
    images: listing.images,
    bedrooms: listing.bedrooms || null,
    bathrooms: listing.bathrooms || null,
    availability: listing.availability || null,
  }
}

interface Filters {
  search: string
  subArea: string
  propertyType: string
  transactionType: string
  status: string
  inquiryType: string
  minPrice: string
  maxPrice: string
  minSize: string
  maxSize: string
  bedrooms: string
  agent: string
}

const defaultFilters: Filters = {
  search: "",
  subArea: "all",
  propertyType: "all",
  transactionType: "all",
  status: "all",
  inquiryType: "all",
  minPrice: "",
  maxPrice: "",
  minSize: "",
  maxSize: "",
  bedrooms: "all",
  agent: "all",
}

export default function InventoryPage() {
  const { user } = useUser()
  const currentUserId = user?.id ?? ""
  const currentUserName = user?.fullName ?? user?.firstName ?? ""

  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isMatchingOpen, setIsMatchingOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [activeTab, setActiveTab] = useState("all")
  const { isAdmin } = useRole()

  const loadListings = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/listings?limit=500")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setListings((data.listings || []).map(mapDbToListing))
    } catch (err) {
      console.error("Failed to load listings:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  // Unique areas from all loaded listings, sorted alphabetically
  const areaTabs = useMemo(() => {
    const areaSet = new Set<string>()
    listings.forEach((l) => { if (l.area) areaSet.add(l.area) })
    return Array.from(areaSet).sort()
  }, [listings])

  // Unique sub-areas for filter dropdown
  const subAreas = useMemo(() => {
    const set = new Set<string>()
    const source = activeTab !== "all" && activeTab !== "mine" && activeTab !== "mymatches"
      ? listings.filter((l) => l.area === activeTab)
      : listings
    source.forEach((l) => { if (l.subArea) set.add(l.subArea) })
    return Array.from(set).sort()
  }, [listings, activeTab])

  const agents = useMemo(() => {
    const uniqueAgents = new Map<string, string>()
    listings.forEach((l) => uniqueAgents.set(l.ownerId, l.ownerName))
    return Array.from(uniqueAgents, ([id, name]) => ({ id, name }))
  }, [listings])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.subArea !== "all") count++
    if (filters.propertyType !== "all") count++
    if (filters.transactionType !== "all") count++
    if (filters.status !== "all") count++
    if (filters.inquiryType !== "all") count++
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    if (filters.minSize) count++
    if (filters.maxSize) count++
    if (filters.bedrooms !== "all") count++
    if (filters.agent !== "all") count++
    return count
  }, [filters])

  const resetFilters = () => setFilters(defaultFilters)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Reset sub-area filter when switching area tabs
    if (filters.subArea !== "all") setFilters((f) => ({ ...f, subArea: "all" }))
  }

  const handleCreateListing = async (listing: Omit<Listing, "id" | "createdAt" | "updatedAt" | "ownerId" | "ownerName">) => {
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapListingToDb(listing)),
      })
      if (!res.ok) throw new Error("Failed to create")
      const data = await res.json()
      setListings((prev) => [mapDbToListing(data.listing), ...prev])
      setIsCreateOpen(false)
    } catch (err) {
      console.error("Failed to create listing:", err)
    }
  }

  const handleDeleteListing = async (id: string) => {
    const listing = listings.find((l) => l.id === id)
    if (!listing || (!isAdmin && listing.ownerId !== currentUserId)) return
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setListings((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      console.error("Failed to delete listing:", err)
    }
  }

  const handleUpdateListing = async (updatedListing: Listing) => {
    const existing = listings.find((l) => l.id === updatedListing.id)
    if (!existing || (!isAdmin && existing.ownerId !== currentUserId)) return
    try {
      const res = await fetch(`/api/listings/${updatedListing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedListing.title,
          area_name: updatedListing.area,
          sub_area: updatedListing.subArea || null,
          size: updatedListing.size,
          price: updatedListing.price,
          type: updatedListing.type,
          status: updatedListing.status,
          inquiry_type: updatedListing.inquiryType,
          transaction_type: updatedListing.transactionType,
          notes: updatedListing.notes || null,
          property_finder_url: updatedListing.propertyFinderUrl || null,
          images: updatedListing.images,
          bedrooms: updatedListing.bedrooms || null,
          bathrooms: updatedListing.bathrooms || null,
          availability: updatedListing.availability || null,
        }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const data = await res.json()
      setListings((prev) =>
        prev.map((l) => l.id === updatedListing.id ? mapDbToListing(data.listing) : l)
      )
    } catch (err) {
      console.error("Failed to update listing:", err)
    }
  }

  const getFilteredListings = () => {
    let filtered = [...listings]

    // Tab-level filter
    if (activeTab === "mine") {
      filtered = filtered.filter((l) => l.ownerId === currentUserId)
    } else if (activeTab !== "all" && activeTab !== "mymatches") {
      // area tab
      filtered = filtered.filter((l) => l.area === activeTab)
    }

    // Panel filters
    if (filters.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.area.toLowerCase().includes(q) ||
          (l.subArea || "").toLowerCase().includes(q) ||
          l.notes.toLowerCase().includes(q) ||
          l.ownerName.toLowerCase().includes(q)
      )
    }

    if (filters.subArea !== "all") filtered = filtered.filter((l) => l.subArea === filters.subArea)
    if (filters.propertyType !== "all") filtered = filtered.filter((l) => l.type === filters.propertyType)
    if (filters.transactionType !== "all") filtered = filtered.filter((l) => l.transactionType === filters.transactionType)
    if (filters.status !== "all") filtered = filtered.filter((l) => l.status === filters.status)
    if (filters.inquiryType !== "all") filtered = filtered.filter((l) => l.inquiryType === filters.inquiryType)
    if (filters.minPrice) filtered = filtered.filter((l) => l.price >= Number(filters.minPrice))
    if (filters.maxPrice) filtered = filtered.filter((l) => l.price <= Number(filters.maxPrice))
    if (filters.minSize) filtered = filtered.filter((l) => l.size >= Number(filters.minSize))
    if (filters.maxSize) filtered = filtered.filter((l) => l.size <= Number(filters.maxSize))
    if (filters.bedrooms !== "all") filtered = filtered.filter((l) => l.bedrooms === Number(filters.bedrooms))
    if (filters.agent !== "all") filtered = filtered.filter((l) => l.ownerId === filters.agent)

    return filtered
  }

  const myListingsCount = listings.filter((l) => l.ownerId === currentUserId).length
  const myMatchesCount = useMemo(() => getUserMatches(listings, currentUserId).length, [listings, currentUserId])
  const myMatches = useMemo(() => getUserMatches(listings, currentUserId), [listings, currentUserId])

  const areaCount = (area: string) => listings.filter((l) => l.area === area).length

  return (
    <>
      <div className="px-4 lg:px-6">
        <MatchingTable listings={listings} currentUserId={currentUserId} />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "All listings across every area and agent" : "Manage your property listings — Live, Pocket, and Unofficial"}
            </p>
          </div>
          <div className="flex gap-2">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Listings</SheetTitle>
                  <SheetDescription>
                    Apply filters to narrow down your search
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <Input
                      placeholder="Search by title, area, sub-area, agent, notes..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>

                  {/* Sub-Area */}
                  <div className="space-y-2">
                    <Label>Sub-Area</Label>
                    <Select
                      value={filters.subArea}
                      onValueChange={(v) => setFilters({ ...filters, subArea: v })}
                      disabled={subAreas.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Sub-Areas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sub-Areas</SelectItem>
                        {subAreas.map((sa) => (
                          <SelectItem key={sa} value={sa}>{sa}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select
                      value={filters.propertyType}
                      onValueChange={(v) => setFilters({ ...filters, propertyType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="plot">Plot</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transaction & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Transaction Type</Label>
                      <Select
                        value={filters.transactionType}
                        onValueChange={(v) => setFilters({ ...filters, transactionType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="rent">For Rent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Listing Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(v) => setFilters({ ...filters, status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="pocket">Pocket</SelectItem>
                          <SelectItem value="unofficial">Unofficial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Inquiry & Bedrooms */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Inquiry Type</Label>
                      <Select
                        value={filters.inquiryType}
                        onValueChange={(v) => setFilters({ ...filters, inquiryType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="stock">Stock</SelectItem>
                          <SelectItem value="request">Request</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Bedrooms</Label>
                      <Select
                        value={filters.bedrooms}
                        onValueChange={(v) => setFilters({ ...filters, bedrooms: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          <SelectItem value="1">1 Bedroom</SelectItem>
                          <SelectItem value="2">2 Bedrooms</SelectItem>
                          <SelectItem value="3">3 Bedrooms</SelectItem>
                          <SelectItem value="4">4 Bedrooms</SelectItem>
                          <SelectItem value="5">5+ Bedrooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label>Price Range (AED)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Size Range */}
                  <div className="space-y-2">
                    <Label>Size Range (sqft)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Min Size"
                        value={filters.minSize}
                        onChange={(e) => setFilters({ ...filters, minSize: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Max Size"
                        value={filters.maxSize}
                        onChange={(e) => setFilters({ ...filters, maxSize: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Agent (always visible — useful for admin and for agents looking at teammates) */}
                  <div className="space-y-2">
                    <Label>Agent</Label>
                    <Select
                      value={filters.agent}
                      onValueChange={(v) => setFilters({ ...filters, agent: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Agents" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Agents</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={resetFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)}>
                    Apply Filters
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <Button variant="outline" onClick={() => setIsMatchingOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Matching
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Listing
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading listings...</span>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="flex-wrap h-auto gap-1 mb-1">
              <TabsTrigger value="all">
                All ({listings.length})
              </TabsTrigger>
              {areaTabs.map((area) => (
                <TabsTrigger key={area} value={area}>
                  {area} ({areaCount(area)})
                </TabsTrigger>
              ))}
              <TabsTrigger value="mine">
                My Listings ({myListingsCount})
              </TabsTrigger>
              <TabsTrigger
                value="mymatches"
                className="bg-primary/10 text-primary hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                My Matches ({myMatchesCount})
              </TabsTrigger>
            </TabsList>

            {activeTab === "mymatches" ? (
              <TabsContent value="mymatches" className="mt-4">
                <MyMatchesView matches={myMatches} />
              </TabsContent>
            ) : (
              <TabsContent value={activeTab} className="mt-4">
                <InventoryTable
                  listings={getFilteredListings()}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteListing}
                  onUpdate={handleUpdateListing}
                  existingSubAreas={subAreas}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>

      <CreateListingDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateListing}
        existingSubAreas={subAreas}
      />

      <AIMatchingDialog
        open={isMatchingOpen}
        onOpenChange={setIsMatchingOpen}
        listings={listings}
      />
    </>
  )
}
