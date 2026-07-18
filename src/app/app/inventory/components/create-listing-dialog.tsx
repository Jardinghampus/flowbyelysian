"use client"

import { useState } from "react"
import { Plus, X, Upload } from "lucide-react"
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

interface CreateListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (listing: Omit<Listing, "id" | "createdAt" | "updatedAt" | "ownerId" | "ownerName">) => void
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

export function CreateListingDialog({
  open,
  onOpenChange,
  onSubmit,
  existingSubAreas = [],
}: CreateListingDialogProps) {
  const [title, setTitle] = useState("")
  const [area, setArea] = useState("")
  const [customArea, setCustomArea] = useState("")
  const [subArea, setSubArea] = useState("")
  const [size, setSize] = useState("")
  const [price, setPrice] = useState("")
  const [type, setType] = useState<ListingType>("villa")
  const [status, setStatus] = useState<ListingStatus>("live")
  const [inquiryType, setInquiryType] = useState<InquiryType>("stock")
  const [transactionType, setTransactionType] = useState<TransactionType>("sale")
  const [notes, setNotes] = useState("")
  const [propertyFinderUrl, setPropertyFinderUrl] = useState("")
  const [googleMapsUrl, setGoogleMapsUrl] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [availability, setAvailability] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  const resetForm = () => {
    setTitle("")
    setArea("")
    setCustomArea("")
    setSubArea("")
    setSize("")
    setPrice("")
    setType("villa")
    setStatus("live")
    setInquiryType("stock")
    setTransactionType("sale")
    setNotes("")
    setPropertyFinderUrl("")
    setGoogleMapsUrl("")
    setImages([])
    setNewImageUrl("")
    setBedrooms("")
    setBathrooms("")
    setAvailability("")
    setContactName("")
    setContactPhone("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
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

    resetForm()
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
          <DialogTitle>Add New Listing</DialogTitle>
          <DialogDescription>
            Add a property to your inventory. Fill in the details below.
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
                placeholder="e.g., Luxury Villa with Pool"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Area *</Label>
                <Select value={area} onValueChange={setArea} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
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
                  list="subarea-suggestions"
                />
                {existingSubAreas.length > 0 && (
                  <datalist id="subarea-suggestions">
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
                  placeholder="e.g., Immediate"
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
                  placeholder="e.g., 5000"
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
                  placeholder="e.g., 10000000"
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
                  placeholder="e.g., 4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="e.g., 5"
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
                <Label htmlFor="contactName">Name</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Owner / landlord name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">WhatsApp phone</Label>
                <Input
                  id="contactPhone"
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
              placeholder="Additional details, selling points, buyer preferences..."
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
              placeholder="https://www.propertyfinder.ae/property/..."
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
            <p className="text-xs text-muted-foreground">
              {5 - images.length} image{5 - images.length !== 1 ? "s" : ""} remaining
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title || !area || !size || !price}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Listing
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
