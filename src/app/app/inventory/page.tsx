"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Sparkles, Filter, X, FileText, Loader2 } from "lucide-react"
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
import { useDemoUser } from "@/contexts/demo-user-context"
import { toast } from "sonner"

export type ListingStatus = "live" | "pocket" | "unofficial"
export type ListingType = "villa" | "apartment" | "townhouse" | "penthouse" | "plot" | "office" | "retail"
export type InquiryType = "stock" | "request"
export type TransactionType = "sale" | "rent"

export interface Listing {
  id: string
  title: string
  area: string
  size: number // sqft
  price: number
  type: ListingType
  status: ListingStatus
  inquiryType: InquiryType
  transactionType: TransactionType
  notes: string
  propertyFinderUrl?: string
  googleMapsUrl?: string
  images: string[] // URLs, max 5
  bedrooms?: number
  bathrooms?: number
  availability?: string
  ownerId: string // Agent who owns this listing
  ownerName: string // Display name of the agent
  ownerContactId?: string | null // FK to owners table
  ownerContactName?: string | null
  createdAt: string
  updatedAt: string
}

function mapApiListing(raw: Record<string, unknown>): Listing {
  return {
    id: raw.id as string,
    title: raw.title as string,
    area: (raw.area_name as string) || "",
    size: (raw.size as number) || 0,
    price: Number(raw.price) || 0,
    type: raw.type as ListingType,
    status: (raw.status as ListingStatus) || "live",
    inquiryType: (raw.inquiry_type as InquiryType) || "stock",
    transactionType: raw.transaction_type as TransactionType,
    notes: (raw.notes as string) || "",
    propertyFinderUrl: raw.property_finder_url as string | undefined,
    googleMapsUrl: raw.google_maps_url as string | undefined,
    images: (raw.images as string[]) || [],
    bedrooms: raw.bedrooms as number | undefined,
    bathrooms: raw.bathrooms as number | undefined,
    availability: raw.availability as string | undefined,
    ownerId: raw.owner_id as string,
    ownerName: (raw.owner_name as string) || "Unknown",
    ownerContactId: (raw.owner_contact_id as string | null) || null,
    ownerContactName: (raw.owner_contact_name as string | null) || null,
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
  }
}

function toApiListing(listing: Partial<Listing>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {}
  if (listing.title !== undefined) mapped.title = listing.title
  if (listing.area !== undefined) mapped.area_name = listing.area
  if (listing.size !== undefined) mapped.size = listing.size
  if (listing.price !== undefined) mapped.price = listing.price
  if (listing.type !== undefined) mapped.type = listing.type
  if (listing.status !== undefined) mapped.status = listing.status
  if (listing.inquiryType !== undefined) mapped.inquiry_type = listing.inquiryType
  if (listing.transactionType !== undefined) mapped.transaction_type = listing.transactionType
  if (listing.notes !== undefined) mapped.notes = listing.notes
  if (listing.propertyFinderUrl !== undefined) mapped.property_finder_url = listing.propertyFinderUrl
  if (listing.googleMapsUrl !== undefined) mapped.google_maps_url = listing.googleMapsUrl
  if (listing.images !== undefined) mapped.images = listing.images
  if (listing.bedrooms !== undefined) mapped.bedrooms = listing.bedrooms
  if (listing.bathrooms !== undefined) mapped.bathrooms = listing.bathrooms
  if (listing.availability !== undefined) mapped.availability = listing.availability
  return mapped
}

// Get unique areas from listings
const AREAS = [
  "Emirates Hills",
  "Downtown Dubai",
  "Al Murooj",
  "Tilal Al Ghaf",
  "Dubai Marina",
  "Arabian Ranches",
  "Palm Jumeirah",
  "Business Bay",
  "JBR",
  "DIFC",
]

interface Filters {
  search: string
  area: string
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
  area: "all",
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
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isMatchingOpen, setIsMatchingOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "mymatches" | ListingStatus | InquiryType | TransactionType>("all")
  const { isAdmin } = useRole()
  const { user } = useDemoUser()

  const currentUserId = user?.id || ""
  const currentUserName = user?.fullName || ""

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch("/api/listings?limit=500")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setListings((data.listings || []).map(mapApiListing))
    } catch {
      toast.error("Could not load listings")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Get unique agents from listings
  const agents = useMemo(() => {
    const uniqueAgents = new Map<string, string>()
    listings.forEach((l) => uniqueAgents.set(l.ownerId, l.ownerName))
    return Array.from(uniqueAgents, ([id, name]) => ({ id, name }))
  }, [listings])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.area !== "all") count++
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

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  const handleCreateListing = async (listing: Omit<Listing, "id" | "createdAt" | "updatedAt" | "ownerId" | "ownerName">) => {
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApiListing(listing)),
      })
      if (!res.ok) throw new Error("Failed to create listing")
      const data = await res.json()
      setListings([mapApiListing(data.listing), ...listings])
      setIsCreateOpen(false)
      toast.success("Listing created")
    } catch {
      toast.error("Failed to create listing")
    }
  }

  const handleDeleteListing = async (id: string) => {
    const listing = listings.find((l) => l.id === id)
    if (!listing || !(listing.ownerId === currentUserId || isAdmin)) return
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setListings(listings.filter((l) => l.id !== id))
      toast.success("Listing deleted")
    } catch {
      toast.error("Failed to delete listing")
    }
  }

  const handleUpdateListing = async (updatedListing: Listing) => {
    const existingListing = listings.find((l) => l.id === updatedListing.id)
    if (!existingListing || !(existingListing.ownerId === currentUserId || isAdmin)) return
    try {
      const res = await fetch(`/api/listings/${updatedListing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApiListing(updatedListing)),
      })
      if (!res.ok) throw new Error("Failed to update")
      const data = await res.json()
      setListings(listings.map((l) => l.id === updatedListing.id ? mapApiListing(data.listing) : l))
      toast.success("Listing updated")
    } catch {
      toast.error("Failed to update listing")
    }
  }

  const handleGenerateReport = async () => {
    const filtered = getFilteredListings()
    if (filtered.length === 0) {
      toast.error("No listings to include in report")
      return
    }
    setIsGeneratingReport(true)
    try {
      const res = await fetch("/api/reports/client-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings: filtered }),
      })
      if (!res.ok) throw new Error("Failed to generate report")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || "inventory-report.pdf"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Report downloaded")
    } catch {
      toast.error("Failed to generate report")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const getFilteredListings = () => {
    let filtered = [...listings]

    // Apply tab filter first
    switch (activeTab) {
      case "mine":
        filtered = filtered.filter((l) => l.ownerId === currentUserId)
        break
      case "stock":
      case "request":
        filtered = filtered.filter((l) => l.inquiryType === activeTab)
        break
      case "sale":
      case "rent":
        filtered = filtered.filter((l) => l.transactionType === activeTab)
        break
      case "live":
      case "pocket":
      case "unofficial":
        filtered = filtered.filter((l) => l.status === activeTab)
        break
    }

    // Apply advanced filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(searchLower) ||
          l.area.toLowerCase().includes(searchLower) ||
          l.notes.toLowerCase().includes(searchLower)
      )
    }

    if (filters.area !== "all") {
      filtered = filtered.filter((l) => l.area === filters.area)
    }

    if (filters.propertyType !== "all") {
      filtered = filtered.filter((l) => l.type === filters.propertyType)
    }

    if (filters.transactionType !== "all") {
      filtered = filtered.filter((l) => l.transactionType === filters.transactionType)
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((l) => l.status === filters.status)
    }

    if (filters.inquiryType !== "all") {
      filtered = filtered.filter((l) => l.inquiryType === filters.inquiryType)
    }

    if (filters.minPrice) {
      filtered = filtered.filter((l) => l.price >= Number(filters.minPrice))
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((l) => l.price <= Number(filters.maxPrice))
    }

    if (filters.minSize) {
      filtered = filtered.filter((l) => l.size >= Number(filters.minSize))
    }

    if (filters.maxSize) {
      filtered = filtered.filter((l) => l.size <= Number(filters.maxSize))
    }

    if (filters.bedrooms !== "all") {
      filtered = filtered.filter((l) => l.bedrooms === Number(filters.bedrooms))
    }

    if (filters.agent !== "all") {
      filtered = filtered.filter((l) => l.ownerId === filters.agent)
    }

    return filtered
  }

  const myListingsCount = listings.filter((l) => l.ownerId === currentUserId).length
  const stockCount = listings.filter((l) => l.inquiryType === "stock").length
  const requestCount = listings.filter((l) => l.inquiryType === "request").length
  const saleCount = listings.filter((l) => l.transactionType === "sale").length
  const rentCount = listings.filter((l) => l.transactionType === "rent").length
  const myMatchesCount = useMemo(() => getUserMatches(listings, currentUserId).length, [listings, currentUserId])

  // Get my matches for the tab view
  const myMatches = useMemo(() => getUserMatches(listings, currentUserId), [listings, currentUserId])

  return (
    <>
      <div className="px-4 lg:px-6">
        {/* AI Matching Table at top */}
        <MatchingTable listings={listings} currentUserId={currentUserId} />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">
              Manage your property listings - Live, Pocket, and Unofficial
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
                      placeholder="Search by title, area, notes..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>

                  {/* Area & Property Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Area</Label>
                      <Select
                        value={filters.area}
                        onValueChange={(v) => setFilters({ ...filters, area: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Areas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Areas</SelectItem>
                          {AREAS.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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

                  {/* Agent */}
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
            <Button
              variant="outline"
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Client Report
            </Button>
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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
            <TabsTrigger value="mine">My Listings ({myListingsCount})</TabsTrigger>
            <TabsTrigger value="mymatches" className="bg-primary/10 text-primary hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              My Matches ({myMatchesCount})
            </TabsTrigger>
            <TabsTrigger value="sale">Sale ({saleCount})</TabsTrigger>
            <TabsTrigger value="rent">Rent ({rentCount})</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="pocket">Pocket</TabsTrigger>
            <TabsTrigger value="unofficial">Unofficial</TabsTrigger>
            <TabsTrigger value="stock">Stock ({stockCount})</TabsTrigger>
            <TabsTrigger value="request">Requests ({requestCount})</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activeTab === "mymatches" ? (
            <TabsContent value="mymatches" className="mt-4">
              <MyMatchesView matches={myMatches} />
            </TabsContent>
          ) : (
            <TabsContent value={activeTab} className="mt-4">
              <InventoryTable
                listings={getFilteredListings()}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onDelete={handleDeleteListing}
                onUpdate={handleUpdateListing}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <CreateListingDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateListing}
      />

      <AIMatchingDialog
        open={isMatchingOpen}
        onOpenChange={setIsMatchingOpen}
        listings={listings}
      />
    </>
  )
}
