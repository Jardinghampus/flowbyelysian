"use client"

import { ExternalLink, Pencil, MapPin, Ruler, DollarSign, Bed, Bath, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Listing } from "../page"

interface ViewListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: Listing
  onEdit: () => void
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(price)
}

export function ViewListingDialog({
  open,
  onOpenChange,
  listing,
  onEdit,
}: ViewListingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{listing.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={statusColors[listing.status]}>
                  {listing.status}
                </Badge>
                <Badge variant="outline" className={inquiryColors[listing.inquiryType]}>
                  {listing.inquiryType}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {listing.type}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        {/* Images */}
        {listing.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {listing.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${listing.title} - Image ${index + 1}`}
                className="h-32 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {/* Key Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Area</p>
              <p className="font-medium">{listing.area}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="font-medium">{listing.size.toLocaleString()} sqft</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-medium">{formatPrice(listing.price)}</p>
            </div>
          </div>

          {listing.availability && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Availability</p>
                <p className="font-medium">{listing.availability}</p>
              </div>
            </div>
          )}
        </div>

        {(listing.bedrooms || listing.bathrooms) && (
          <div className="flex gap-6">
            {listing.bedrooms && (
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>{listing.bedrooms} Bedrooms</span>
              </div>
            )}
            {listing.bathrooms && (
              <div className="flex items-center gap-2">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span>{listing.bathrooms} Bathrooms</span>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Notes */}
        {listing.notes && (
          <div>
            <h4 className="font-medium mb-2">Notes</h4>
            <p className="text-muted-foreground">{listing.notes}</p>
          </div>
        )}

        {/* PropertyFinder Link */}
        {listing.propertyFinderUrl && (
          <div>
            <h4 className="font-medium mb-2">External Links</h4>
            <a
              href={listing.propertyFinderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View on PropertyFinder
            </a>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex justify-between text-xs text-muted-foreground pt-4 border-t">
          <span>Created: {new Date(listing.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(listing.updatedAt).toLocaleDateString()}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
