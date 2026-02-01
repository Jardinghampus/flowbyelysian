"use client"

import { useState, useMemo } from "react"
import { Plus, Sparkles, Filter, X } from "lucide-react"
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
import { useRole } from "@/contexts/role-context"

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
  images: string[] // URLs, max 5
  bedrooms?: number
  bathrooms?: number
  availability?: string
  ownerId: string // Agent who owns this listing
  ownerName: string // Display name of the agent
  createdAt: string
  updatedAt: string
}

// Current user - in production this would come from Clerk/auth
const CURRENT_USER_ID = "user-1"
const CURRENT_USER_NAME = "Ahmed Hassan"

// Demo data with multiple agents
const initialListings: Listing[] = [
  {
    id: "1",
    title: "Luxury Villa with Pool",
    area: "Emirates Hills",
    size: 8500,
    price: 15000000,
    type: "villa",
    status: "live",
    inquiryType: "stock",
    transactionType: "sale",
    notes: "Corner plot, upgraded kitchen, private pool",
    propertyFinderUrl: "https://www.propertyfinder.ae/property/123456",
    images: [],
    bedrooms: 5,
    bathrooms: 6,
    availability: "Immediate",
    ownerId: "user-1",
    ownerName: "Ahmed Hassan",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: "2",
    title: "Modern Apartment Downtown",
    area: "Downtown Dubai",
    size: 1800,
    price: 180000,
    type: "apartment",
    status: "live",
    inquiryType: "stock",
    transactionType: "rent",
    notes: "Burj Khalifa view, high floor, yearly rent",
    propertyFinderUrl: "https://www.propertyfinder.ae/property/234567",
    images: [],
    bedrooms: 2,
    bathrooms: 3,
    availability: "Q2 2024",
    ownerId: "user-2",
    ownerName: "Sarah Miller",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
  },
  {
    id: "3",
    title: "Family Villa in Murooj",
    area: "Al Murooj",
    size: 5200,
    price: 8500000,
    type: "villa",
    status: "pocket",
    inquiryType: "stock",
    transactionType: "sale",
    notes: "Quiet community, near school, motivated seller",
    images: [],
    bedrooms: 4,
    bathrooms: 5,
    availability: "Negotiable",
    ownerId: "user-1",
    ownerName: "Ahmed Hassan",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-15",
  },
  {
    id: "4",
    title: "Client Looking for Villa",
    area: "Tilal Al Ghaf",
    size: 6000,
    price: 10000000,
    type: "villa",
    status: "unofficial",
    inquiryType: "request",
    transactionType: "sale",
    notes: "Buyer prequalified, 10M budget, prefers new builds",
    images: [],
    bedrooms: 5,
    bathrooms: 5,
    ownerId: "user-1",
    ownerName: "Ahmed Hassan",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
  },
  {
    id: "5",
    title: "Penthouse Marina",
    area: "Dubai Marina",
    size: 4200,
    price: 450000,
    type: "penthouse",
    status: "live",
    inquiryType: "stock",
    transactionType: "rent",
    notes: "Full sea view, private terrace, luxury finish",
    propertyFinderUrl: "https://www.propertyfinder.ae/property/345678",
    images: [],
    bedrooms: 3,
    bathrooms: 4,
    availability: "March 2024",
    ownerId: "user-3",
    ownerName: "Omar Khan",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-19",
  },
  {
    id: "6",
    title: "Townhouse Arabian Ranches",
    area: "Arabian Ranches",
    size: 3800,
    price: 5200000,
    type: "townhouse",
    status: "live",
    inquiryType: "stock",
    transactionType: "sale",
    notes: "Community pool access, landscaped garden",
    images: [],
    bedrooms: 4,
    bathrooms: 4,
    availability: "Immediate",
    ownerId: "user-2",
    ownerName: "Sarah Miller",
    createdAt: "2024-01-14",
    updatedAt: "2024-01-14",
  },
]

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
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isMatchingOpen, setIsMatchingOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [activeTab, setActiveTab] = useState<"all" | "mine" | ListingStatus | InquiryType | TransactionType>("all")
  const { isAdmin } = useRole()

  const currentUserId = CURRENT_USER_ID
  const currentUserName = CURRENT_USER_NAME

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

  const handleCreateListing = (listing: Omit<Listing, "id" | "createdAt" | "updatedAt" | "ownerId" | "ownerName">) => {
    const newListing: Listing = {
      ...listing,
      id: Date.now().toString(),
      ownerId: currentUserId,
      ownerName: currentUserName,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setListings([newListing, ...listings])
    setIsCreateOpen(false)
  }

  const handleDeleteListing = (id: string) => {
    const listing = listings.find((l) => l.id === id)
    // Only allow deletion if user owns the listing or is admin
    if (listing && (listing.ownerId === currentUserId || isAdmin)) {
      setListings(listings.filter((l) => l.id !== id))
    }
  }

  const handleUpdateListing = (updatedListing: Listing) => {
    // Only allow update if user owns the listing or is admin
    const existingListing = listings.find((l) => l.id === updatedListing.id)
    if (existingListing && (existingListing.ownerId === currentUserId || isAdmin)) {
      setListings(listings.map((l) =>
        l.id === updatedListing.id
          ? { ...updatedListing, updatedAt: new Date().toISOString().split("T")[0] }
          : l
      ))
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

  return (
    <>
      <div className="px-4 lg:px-6">
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
            <TabsTrigger value="sale">Sale ({saleCount})</TabsTrigger>
            <TabsTrigger value="rent">Rent ({rentCount})</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="pocket">Pocket</TabsTrigger>
            <TabsTrigger value="unofficial">Unofficial</TabsTrigger>
            <TabsTrigger value="stock">Stock ({stockCount})</TabsTrigger>
            <TabsTrigger value="request">Requests ({requestCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <InventoryTable
              listings={getFilteredListings()}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onDelete={handleDeleteListing}
              onUpdate={handleUpdateListing}
            />
          </TabsContent>
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
