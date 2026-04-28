"use client"

import { useState } from "react"
import {
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Eye,
  User,
  Map,
  Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { EditListingDialog } from "./edit-listing-dialog"
import { ViewListingDialog } from "./view-listing-dialog"
import type { Listing } from "../page"

interface InventoryTableProps {
  listings: Listing[]
  currentUserId: string
  currentUserName: string
  isAdmin: boolean
  onDelete: (id: string) => void
  onUpdate: (listing: Listing) => void
  existingSubAreas?: string[]
}

const statusColors: Record<string, string> = {
  live: "bg-green-500/10 text-green-600 border-green-500/20",
  pocket: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  unofficial: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const inquiryColors: Record<string, string> = {
  stock: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  request: "bg-purple-500/10 text-purple-600 border-purple-500/20",
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

function formatSize(size: number): string {
  return `${size.toLocaleString()} sqft`
}

export function InventoryTable({
  listings,
  currentUserId,
  currentUserName,
  isAdmin,
  onDelete,
  onUpdate,
  existingSubAreas = [],
}: InventoryTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editListing, setEditListing] = useState<Listing | null>(null)
  const [viewListing, setViewListing] = useState<Listing | null>(null)

  const listingToDelete = listings.find((l) => l.id === deleteId)

  const canModify = (listing: Listing) => {
    return listing.ownerId === currentUserId || isAdmin
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>For</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Agent</TableHead>
              {isAdmin && <TableHead className="max-w-[200px]">Notes</TableHead>}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 10 : 9} className="text-center py-8 text-muted-foreground">
                  No listings found. Add your first listing to get started.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => {
                const isOwner = listing.ownerId === currentUserId
                return (
                  <TableRow
                    key={listing.id}
                    className={`cursor-pointer ${isOwner ? "bg-primary/5" : ""}`}
                    onClick={() => setViewListing(listing)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{listing.title}</p>
                          {listing.bedrooms && (
                            <p className="text-xs text-muted-foreground">
                              {listing.bedrooms} BR | {listing.bathrooms} BA
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{listing.area}</p>
                        {listing.subArea && (
                          <p className="text-xs text-muted-foreground">{listing.subArea}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{listing.type}</TableCell>
                    <TableCell className="text-right">{formatSize(listing.size)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(listing.price, listing.transactionType)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={transactionColors[listing.transactionType]}>
                        {listing.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant="outline" className={statusColors[listing.status]}>
                          {listing.status}
                        </Badge>
                        <Badge variant="outline" className={inquiryColors[listing.inquiryType]}>
                          {listing.inquiryType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-sm ${isOwner ? "font-medium text-primary" : "text-muted-foreground"}`}>
                          {isOwner ? (currentUserName || "You") : listing.ownerName}
                        </span>
                        {listing.ownerContactId && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-[#C9A84C]" title="Linked to owner in Data tab">
                            <Link2 className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="max-w-[200px]">
                        {listing.notes ? (
                          <p className="text-xs text-muted-foreground line-clamp-2">{listing.notes}</p>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewListing(listing)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {canModify(listing) && (
                            <DropdownMenuItem onClick={() => setEditListing(listing)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {listing.propertyFinderUrl && (
                            <DropdownMenuItem asChild>
                              <a
                                href={listing.propertyFinderUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                PropertyFinder
                              </a>
                            </DropdownMenuItem>
                          )}
                          {listing.googleMapsUrl && (
                            <DropdownMenuItem asChild>
                              <a
                                href={listing.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Map className="mr-2 h-4 w-4" />
                                Google Maps
                              </a>
                            </DropdownMenuItem>
                          )}
                          {canModify(listing) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(listing.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{listingToDelete?.title}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) onDelete(deleteId)
                setDeleteId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {editListing && (
        <EditListingDialog
          open={!!editListing}
          onOpenChange={() => setEditListing(null)}
          listing={editListing}
          existingSubAreas={existingSubAreas}
          onSubmit={(updated) => {
            onUpdate(updated)
            setEditListing(null)
          }}
        />
      )}

      {/* View Dialog */}
      {viewListing && (
        <ViewListingDialog
          open={!!viewListing}
          onOpenChange={() => setViewListing(null)}
          listing={viewListing}
          canEdit={canModify(viewListing)}
          onEdit={() => {
            setEditListing(viewListing)
            setViewListing(null)
          }}
        />
      )}
    </>
  )
}
