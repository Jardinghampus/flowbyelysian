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

export default function InventoryPage() {
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isMatchingOpen, setIsMatchingOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "mine" | ListingStatus | InquiryType | TransactionType>("all")
  const { isAdmin } = useRole()

  const currentUserId = CURRENT_USER_ID
  const currentUserName = CURRENT_USER_NAME

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
    switch (activeTab) {
      case "all":
        return listings
      case "mine":
        return listings.filter((l) => l.ownerId === currentUserId)
      case "stock":
      case "request":
        return listings.filter((l) => l.inquiryType === activeTab)
      case "sale":
      case "rent":
        return listings.filter((l) => l.transactionType === activeTab)
      case "live":
      case "pocket":
      case "unofficial":
        return listings.filter((l) => l.status === activeTab)
      default:
        return listings
    }
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
