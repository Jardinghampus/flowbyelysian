"use client"

import { useState, useEffect } from "react"
import { X, Upload, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Listing, ListingStatus, ListingType, InquiryType, TransactionType } from "../page"

interface EditListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: Listing
  onSubmit: (listing: Listing) => void
  existingSubAreas?: string[]
}

const areas = [
  "Emirates Hills",
  "Palm Jumeirah",
  "Downtown Dubai",
  "Dubai Marina",
  "Arabian Ranches",
  "Jumeirah Golf Estates",
  "Al Murooj",
  "Tilal Al Ghaf",
  "Dubai Hills Estate",
  "Jumeirah Beach Residence",
  "Business Bay",
  "DIFC",
  "City Walk",
  "Al Barari",
  "Mohammed Bin Rashid City",
]

export function EditListingDialog({
  open,
  onOpenChange,
  listing,
  onSubmit,
  existingSubAreas = [],
}: EditListingDialogProps) {
  const [title, setTitle] = useState(listing.title)
  const [area, setArea] = useState(areas.includes(listing.area) ? listing.area : "custom")
  const [customArea, setCustomArea] = useState(areas.includes(listing.area) ? "" : listing.area)
  const [subArea, setSubArea] = useState(listing.subArea || "")
  const [size, setSize] = useState(listing.size.toString())
  const [price, setPrice] = useState(listing.price.toString())
  const [type, setType] = useState<ListingType>(listing.type)
  const [status, setStatus] = useState<ListingStatus>(listing.status)
  const [inquiryType, setInquiryType] = useState<InquiryType>(listing.inquiryType)
  const [transactionType, setTransactionType] = useState<TransactionType>(listing.transactionType)
  const [notes, setNotes] = useState(listing.notes)
  const [propertyFinderUrl, setPropertyFinderUrl] = useState(listing.propertyFinderUrl || "")
  const [googleMapsUrl, setGoogleMapsUrl] = useState(listing.googleMapsUrl || "")
  const [images, setImages] = useState<string[]>(listing.images)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [bedrooms, setBedrooms] = useState(listing.bedrooms?.toString() || "")
  const [bathrooms, setBathrooms] = useState(listing.bathrooms?.toString() || "")
  const [availability, setAvailability] = useState(listing.availability || "")
  const [contactName, setContactName] = useState(listing.contactName || "")
  const [contactPhone, setContactPhone] = useState(listing.contactPhone || "")

  useEffect(() => {
    setTitle(listing.title)
    setArea(areas.includes(listing.area) ? listing.area : "custom")
    setCustomArea(areas.includes(listing.area) ? "" : listing.area)
    setSubArea(listing.subArea || "")
    setSize(listing.size.toString())
    setPrice(listing.price.toString())
    setType(listing.type)
    setStatus(listing.status)
    setInquiryType(listing.inquiryType)
    setTransactionType(listing.transactionType)
    setNotes(listing.notes)
    setPropertyFinderUrl(listing.propertyFinderUrl || "")
    setGoogleMapsUrl(listing.googleMapsUrl || "")
    setImages(listing.images)
    setBedrooms(listing.bedrooms?.toString() || "")
    setBathrooms(listing.bathrooms?.toString() || "")
    setAvailability(listing.availability || "")
    setContactName(listing.contactName || "")
    setContactPhone(listing.contactPhone || "")
  }, [listing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      ...listing,
      title,
      area: area === "custom" ? customArea : area,
      subArea: subArea.trim() || undefined,
      size: parseInt(size),
      price: parseInt(price),
      type,
      status,
      inquiryType,
      transactionType,
      notes,
      propertyFinderUrl: propertyFinderUrl || undefined,
      googleMapsUrl: googleMapsUrl || undefined,
      images,
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      availability: availability || undefined,
      contactName: contactName.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
    })
  }

  const handleAddImage = () => {
    if (newImageUrl && images.length < 5) {
      setImages([...images, newImageUrl])
      setNewImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription>
            Update the property details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Area *</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                    <SelectItem value="custom">Other (Custom)</SelectItem>
                  </SelectContent>
                </Select>
                {area === "custom" && (
                  <Input
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    placeholder="Enter area name"
                    className="mt-2"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subArea">Sub-Area / Community</Label>
                <Input
                  id="subArea"
                  value={subArea}
                  onChange={(e) => setSubArea(e.target.value)}
                  placeholder="e.g., Elan, Harmony, Alaya..."
                  list="edit-subarea-suggestions"
                />
                {existingSubAreas.length > 0 && (
                  <datalist id="edit-subarea-suggestions">
                    {existingSubAreas.map((sa) => (
                      <option key={sa} value={sa} />
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Property Type *</Label>
                <Select value={type} onValueChange={(v) => setType(v as ListingType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="size">Size (sqft) *</Label>
                <Input
                  id="size"
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (AED) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Transaction Type *</Label>
              <Select value={transactionType} onValueChange={(v) => setTransactionType(v as TransactionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Listing Status *</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ListingStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live (Published)</SelectItem>
                  <SelectItem value="pocket">Pocket (Off-market)</SelectItem>
                  <SelectItem value="unofficial">Unofficial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Inquiry Type *</Label>
              <Select value={inquiryType} onValueChange={(v) => setInquiryType(v as InquiryType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock (My Listing)</SelectItem>
                  <SelectItem value="request">Request (Buyer/Tenant)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Owner / contact — synced to Data → Contacts */}
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
            <div>
              <Label className="text-sm font-medium">Owner contact</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saves to your Contacts and unlocks the WhatsApp Contact button on this listing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="editContactName">Name</Label>
                <Input
                  id="editContactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Owner / landlord name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContactPhone">WhatsApp phone</Label>
                <Input
                  id="editContactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* PropertyFinder URL */}
          <div className="space-y-2">
            <Label htmlFor="propertyFinderUrl">PropertyFinder URL</Label>
            <Input
              id="propertyFinderUrl"
              type="url"
              value={propertyFinderUrl}
              onChange={(e) => setPropertyFinderUrl(e.target.value)}
            />
          </div>

          {/* Google Maps URL */}
          <div className="space-y-2">
            <Label htmlFor="googleMapsUrl">Google Maps Link</Label>
            <Input
              id="googleMapsUrl"
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
            />
            <p className="text-xs text-muted-foreground">
              Share this link with clients for viewings
            </p>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <Label>Images (Max 5)</Label>
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste image URL"
                className="flex-1"
                disabled={images.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddImage}
                disabled={!newImageUrl || images.length >= 5}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      className="h-20 w-full rounded object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
