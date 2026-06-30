"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Loader2, ImageIcon, User, MapPin, Ruler, DollarSign, Bed, Bath, Pencil, Trash2, ExternalLink, Map, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDemoUser } from "@/contexts/demo-user-context"
import { useRole } from "@/contexts/role-context"
import { toast } from "sonner"
import type { Listing, ListingStatus, ListingType, InquiryType, TransactionType } from "../inventory/page"
import { CreateListingDialog } from "../inventory/components/create-listing-dialog"
import { EditListingDialog } from "../inventory/components/edit-listing-dialog"
import { ViewListingDialog } from "../inventory/components/view-listing-dialog"

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

const statusColors: Record<string, string> = {
  live: "bg-green-500/10 text-green-600 border-green-500/20",
  pocket: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  unofficial: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const transactionColors: Record<string, string> = {
  sale: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rent: "bg-orange-500/10 text-orange-600 border-orange-500/20",
}

function formatPrice(price: number, transactionType: string): string {
  const formatted = new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(price)
  return transactionType === "rent" ? `${formatted}/yr` : formatted
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editListing, setEditListing] = useState<Listing | null>(null)
  const [viewListing, setViewListing] = useState<Listing | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { user } = useDemoUser()
  const { isAdmin } = useRole()

  const currentUserId = user?.id || ""

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch(`/api/listings?ownerId=${currentUserId}&limit=200`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setListings((data.listings || []).map(mapApiListing))
    } catch {
      toast.error("Could not load your listings")
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    if (currentUserId) fetchListings()
  }, [fetchListings, currentUserId])

  const handleCreate = async (listing: Omit<Listing, "id" | "createdAt" | "updatedAt" | "ownerId" | "ownerName">) => {
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApiListing(listing)),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setListings([mapApiListing(data.listing), ...listings])
      setIsCreateOpen(false)
      toast.success("Listing created")
    } catch {
      toast.error("Failed to create listing")
    }
  }

  const handleUpdate = async (updatedListing: Listing) => {
    try {
      const res = await fetch(`/api/listings/${updatedListing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApiListing(updatedListing)),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setListings(listings.map((l) => l.id === updatedListing.id ? mapApiListing(data.listing) : l))
      setEditListing(null)
      toast.success("Listing updated")
    } catch {
      toast.error("Failed to update listing")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setListings(listings.filter((l) => l.id !== id))
      setDeleteId(null)
      toast.success("Listing deleted")
    } catch {
      toast.error("Failed to delete listing")
    }
  }

  const listingToDelete = listings.find((l) => l.id === deleteId)

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground">Properties you have listed</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Listing
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No listings yet</h3>
          <p className="text-muted-foreground max-w-sm">
            You haven&apos;t added any listings. Click &quot;Add Listing&quot; to get started.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first listing
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card
              key={listing.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setViewListing(listing)}
            >
              {listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="h-40 w-full rounded-t-xl object-cover"
                />
              ) : (
                <div className="h-40 w-full rounded-t-xl bg-muted flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
                  <Badge variant="outline" className={`${statusColors[listing.status]} shrink-0 text-xs`}>
                    {listing.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{listing.area}</span>
                  <span className="ml-auto">
                    <Badge variant="outline" className={`${transactionColors[listing.transactionType]} text-xs`}>
                      {listing.transactionType === "sale" ? "For Sale" : "For Rent"}
                    </Badge>
                  </span>
                </div>

                <div className="text-lg font-bold">
                  {formatPrice(listing.price, listing.transactionType)}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {listing.size > 0 && (
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      {listing.size.toLocaleString()} sqft
                    </span>
                  )}
                  {listing.bedrooms && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      {listing.bedrooms} BR
                    </span>
                  )}
                  {listing.bathrooms && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      {listing.bathrooms} BA
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewListing(listing)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditListing(listing)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(listing.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {(listing.propertyFinderUrl || listing.googleMapsUrl) && (
                  <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    {listing.propertyFinderUrl && (
                      <a
                        href={listing.propertyFinderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        PropertyFinder
                      </a>
                    )}
                    {listing.googleMapsUrl && (
                      <a
                        href={listing.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Map className="h-3 w-3" />
                        Google Maps
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{listingToDelete?.title}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateListingDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      {editListing && (
        <EditListingDialog
          open={!!editListing}
          onOpenChange={() => setEditListing(null)}
          listing={editListing}
          onSubmit={handleUpdate}
        />
      )}

      {viewListing && (
        <ViewListingDialog
          open={!!viewListing}
          onOpenChange={() => setViewListing(null)}
          listing={viewListing}
          canEdit={viewListing.ownerId === currentUserId || isAdmin}
          onEdit={() => {
            setEditListing(viewListing)
            setViewListing(null)
          }}
        />
      )}
    </>
  )
}
