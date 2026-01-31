"use client"

import { useState } from "react"
import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryTable } from "./components/inventory-table"
import { CreateListingDialog } from "./components/create-listing-dialog"
import { AIMatchingDialog } from "./components/ai-matching-dialog"
import { useRole } from "@/contexts/role-context"

export type ListingStatus = "live" | "pocket" | "unofficial"
export type ListingType = "villa" | "apartment" | "townhouse" | "penthouse" | "plot" | "office" | "retail"
export type InquiryType = "stock" | "request"

export interface Listing {
  id: string
  title: string
  area: string
  size: number // sqft
  price: number
  type: ListingType
  status: ListingStatus
  inquiryType: InquiryType
  notes: string
  propertyFinderUrl?: string
  images: string[] // URLs, max 5
  bedrooms?: number
  bathrooms?: number
  availability?: string
  ownerId: string // Agent who owns this listing
  createdAt: string
  updatedAt: string
}

// Demo data
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
    notes: "Corner plot, upgraded kitchen, private pool",
    propertyFinderUrl: "https://www.propertyfinder.ae/property/123456",
    images: [],
    bedrooms: 5,
    bathrooms: 6,
    availability: "Immediate",
    ownerId: "user-1",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: "2",
    title: "Modern Apartment Downtown",
    area: "Downtown Dubai",
    size: 1800,
    price: 3500000,
    type: "apartment",
    status: "live",
    inquiryType: "stock",
    notes: "Burj Khalifa view, high floor",
    propertyFinderUrl: "https://www.propertyfinder.ae/property/234567",
    images: [],
    bedrooms: 2,
    bathrooms: 3,
    availability: "Q2 2024",
    ownerId: "user-1",
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
    notes: "Quiet community, near school, motivated seller",
    images: [],
    bedrooms: 4,
    bathrooms: 5,
    availability: "Negotiable",
    ownerId: "user-1",
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
    notes: "Buyer prequalified, 10M budget, prefers new builds",
    images: [],
    bedrooms: 5,
    bathrooms: 5,
    ownerId: "user-1",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
  },
]

export default function InventoryPage() {
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isMatchingOpen, setIsMatchingOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | ListingStatus | InquiryType>("all")
  const { isAdmin } = useRole()

  const handleCreateListing = (listing: Omit<Listing, "id" | "createdAt" | "updatedAt" | "ownerId">) => {
    const newListing: Listing = {
      ...listing,
      id: Date.now().toString(),
      ownerId: "user-1", // Would come from auth
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setListings([newListing, ...listings])
    setIsCreateOpen(false)
  }

  const handleDeleteListing = (id: string) => {
    setListings(listings.filter((l) => l.id !== id))
  }

  const handleUpdateListing = (updatedListing: Listing) => {
    setListings(listings.map((l) =>
      l.id === updatedListing.id
        ? { ...updatedListing, updatedAt: new Date().toISOString().split("T")[0] }
        : l
    ))
  }

  const getFilteredListings = () => {
    if (activeTab === "all") return listings
    if (activeTab === "stock" || activeTab === "request") {
      return listings.filter((l) => l.inquiryType === activeTab)
    }
    return listings.filter((l) => l.status === activeTab)
  }

  const stockCount = listings.filter((l) => l.inquiryType === "stock").length
  const requestCount = listings.filter((l) => l.inquiryType === "request").length

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
          <TabsList>
            <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="pocket">Pocket</TabsTrigger>
            <TabsTrigger value="unofficial">Unofficial</TabsTrigger>
            <TabsTrigger value="stock">Stock ({stockCount})</TabsTrigger>
            <TabsTrigger value="request">Requests ({requestCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <InventoryTable
              listings={getFilteredListings()}
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
