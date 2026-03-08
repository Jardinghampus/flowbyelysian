"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Plus, Trash2, Pencil, MapPin, Bed, Bath, Maximize2,
  Building2, Tag, Eye, ExternalLink, X, ImagePlus,
  Upload, ChevronLeft, ChevronRight, Camera, GripVertical,
  Calendar, Layers, Hash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRole } from "@/contexts/role-context"

type ListingStatus = "live" | "pocket" | "draft"
type PropertyType = "villa" | "apartment" | "townhouse" | "penthouse" | "office" | "retail"
type TransactionType = "sale" | "rent"

interface MyListing {
  id: string
  title: string
  area: string
  subArea: string
  propertyType: PropertyType
  transactionType: TransactionType
  status: ListingStatus
  price: number
  size: number
  bedrooms: number
  bathrooms: number
  floor: string
  availability: string
  description: string
  highlights: string
  features: string[]
  images: string[]
  propertyFinderUrl: string
  createdAt: string
  views: number
  inquiries: number
}

const AREAS = [
  "Palm Jumeirah", "Dubai Marina", "Downtown Dubai", "Emirates Hills",
  "Arabian Ranches", "Tilal Al Ghaf", "Business Bay", "JBR",
  "Jumeirah Golf Estates", "Al Furjan", "Damac Hills", "Dubai Hills",
  "DIFC", "City Walk", "Al Barari", "Mohammed Bin Rashid City",
]

const FEATURE_OPTIONS = [
  "Private Pool", "Garden", "Balcony", "Terrace", "Sea View", "Golf View",
  "Skyline View", "Lagoon View", "Smart Home", "Maid's Room", "Driver's Room",
  "Gym", "Concierge", "Parking x2", "Parking x3", "Furnished", "Semi-Furnished",
  "Upgraded", "Pet Friendly", "Beach Access", "Private Elevator", "Study Room",
  "Walk-in Closet", "Central A/C", "Built-in Wardrobes", "Storage",
]

const statusColors: Record<ListingStatus, { bg: string; text: string }> = {
  live: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-700 dark:text-green-400" },
  pocket: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400" },
  draft: { bg: "bg-neutral-100 dark:bg-neutral-500/20", text: "text-neutral-600 dark:text-neutral-400" },
}

// Demo images from Unsplash for sample listings
const DEMO_IMAGES = {
  villa1: [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  ],
  townhouse: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80",
  ],
  apartment: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  ],
}

const initialListings: MyListing[] = [
  {
    id: "ml-1",
    title: "Luxury 5BR Villa — Emirates Hills",
    area: "Emirates Hills",
    subArea: "Sector E",
    propertyType: "villa",
    transactionType: "sale",
    status: "live",
    price: 15000000,
    size: 8500,
    bedrooms: 5,
    bathrooms: 6,
    floor: "G+1",
    availability: "Immediate",
    description: "Stunning corner-plot villa in the prestigious Emirates Hills gated community. This fully upgraded masterpiece features Italian marble flooring, a gourmet kitchen with Gaggenau appliances, and floor-to-ceiling windows overlooking the golf course.\n\nThe ground floor offers an expansive open-plan living area, formal dining room, and a separate family room. The private garden includes a temperature-controlled infinity pool, outdoor kitchen, and landscaped gardens.",
    highlights: "Motivated seller. Below market value. Recently appraised at AED 17.5M. All service charges paid for 2026.",
    features: ["Private Pool", "Garden", "Smart Home", "Maid's Room", "Driver's Room", "Parking x3", "Golf View"],
    images: DEMO_IMAGES.villa1,
    propertyFinderUrl: "https://www.propertyfinder.ae/property/123456",
    createdAt: "2026-01-15",
    views: 342,
    inquiries: 8,
  },
  {
    id: "ml-2",
    title: "4BR Townhouse — Arabian Ranches III",
    area: "Arabian Ranches",
    subArea: "Sun by Emaar",
    propertyType: "townhouse",
    transactionType: "sale",
    status: "live",
    price: 5200000,
    size: 3800,
    bedrooms: 4,
    bathrooms: 4,
    floor: "G+1",
    availability: "Q2 2026",
    description: "Beautiful 4-bedroom townhouse in the sought-after Sun community. End-unit with extra privacy and a larger garden. Open-plan kitchen and living area with double-height ceilings.",
    highlights: "End unit. Larger plot. Close to community pool and park.",
    features: ["Garden", "Parking x2", "Pet Friendly", "Built-in Wardrobes", "Central A/C"],
    images: DEMO_IMAGES.townhouse,
    propertyFinderUrl: "",
    createdAt: "2026-02-10",
    views: 187,
    inquiries: 4,
  },
  {
    id: "ml-3",
    title: "2BR Apartment — Marina View Tower",
    area: "Dubai Marina",
    subArea: "Marina View Tower A",
    propertyType: "apartment",
    transactionType: "rent",
    status: "pocket",
    price: 130000,
    size: 1400,
    bedrooms: 2,
    bathrooms: 2,
    floor: "42",
    availability: "Immediate",
    description: "High-floor apartment with unobstructed full marina and sea views. Fully furnished to a high standard with designer furniture. Walking distance to Marina Mall, JBR Beach, and Metro station.",
    highlights: "42nd floor. Fully furnished. 4 cheques accepted.",
    features: ["Sea View", "Furnished", "Gym", "Balcony", "Concierge", "Walk-in Closet"],
    images: DEMO_IMAGES.apartment,
    propertyFinderUrl: "",
    createdAt: "2026-02-20",
    views: 56,
    inquiries: 1,
  },
  {
    id: "ml-4",
    title: "Studio — Business Bay",
    area: "Business Bay",
    subArea: "",
    propertyType: "apartment",
    transactionType: "rent",
    status: "draft",
    price: 55000,
    size: 450,
    bedrooms: 0,
    bathrooms: 1,
    floor: "12",
    availability: "",
    description: "",
    highlights: "",
    features: [],
    images: [],
    propertyFinderUrl: "",
    createdAt: "2026-03-01",
    views: 0,
    inquiries: 0,
  },
]

interface FormData {
  title: string
  area: string
  subArea: string
  propertyType: PropertyType
  transactionType: TransactionType
  status: ListingStatus
  price: string
  size: string
  bedrooms: string
  bathrooms: string
  floor: string
  availability: string
  description: string
  highlights: string
  features: string[]
  images: string[]
  propertyFinderUrl: string
}

const emptyForm: FormData = {
  title: "",
  area: "",
  subArea: "",
  propertyType: "apartment",
  transactionType: "sale",
  status: "draft",
  price: "",
  size: "",
  bedrooms: "",
  bathrooms: "",
  floor: "",
  availability: "",
  description: "",
  highlights: "",
  features: [],
  images: [],
  propertyFinderUrl: "",
}

const MAX_IMAGES = 8

// ─── Image carousel for listing cards ───
function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="relative h-44 bg-muted rounded-t-lg flex items-center justify-center">
        <Camera className="h-8 w-8 text-muted-foreground/40" />
        <span className="absolute bottom-2 left-2 text-[10px] text-muted-foreground">No photos</span>
      </div>
    )
  }

  return (
    <div className="relative h-44 rounded-t-lg overflow-hidden group">
      <img
        src={images[current]}
        alt={`${title} — photo ${current + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length) }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length) }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Photo count badge */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
        <Camera className="h-2.5 w-2.5" /> {images.length}
      </div>
    </div>
  )
}

// ─── Image upload zone for the form ───
function ImageUploadZone({
  images,
  onChange,
}: {
  images: string[]
  onChange: (images: string[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [urlInput, setUrlInput] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const addFiles = useCallback((files: FileList) => {
    const remaining = MAX_IMAGES - images.length
    const toAdd = Array.from(files).slice(0, remaining)
    const newUrls = toAdd.map((file) => URL.createObjectURL(file))
    onChange([...images, ...newUrls])
    if (toAdd.length < files.length) {
      toast.info(`Max ${MAX_IMAGES} images. ${files.length - toAdd.length} skipped.`)
    }
  }, [images, onChange])

  const addUrl = () => {
    if (!urlInput.trim()) return
    if (images.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images`)
      return
    }
    onChange([...images, urlInput.trim()])
    setUrlInput("")
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Photos <span className="text-muted-foreground text-xs">({images.length}/{MAX_IMAGES})</span></Label>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/50"
          }
          ${images.length >= MAX_IMAGES ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
        <p className="text-sm font-medium">Drop images here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max {MAX_IMAGES} photos</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* URL paste */}
      <div className="flex gap-2">
        <Input
          placeholder="Or paste image URL..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          disabled={images.length >= MAX_IMAGES}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addUrl}
          disabled={!urlInput.trim() || images.length >= MAX_IMAGES}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group aspect-[4/3] rounded-lg overflow-hidden border">
              <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-medium">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ───
export default function MyListingsPage() {
  const { isSeller, isInternal } = useRole()
  const [listings, setListings] = useState<MyListing[]>(initialListings)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formStep, setFormStep] = useState<0 | 1 | 2>(0)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormStep(0)
    setFormOpen(true)
  }

  const openEdit = (listing: MyListing) => {
    setEditingId(listing.id)
    setForm({
      title: listing.title,
      area: listing.area,
      subArea: listing.subArea,
      propertyType: listing.propertyType,
      transactionType: listing.transactionType,
      status: listing.status,
      price: listing.price.toString(),
      size: listing.size.toString(),
      bedrooms: listing.bedrooms.toString(),
      bathrooms: listing.bathrooms.toString(),
      floor: listing.floor,
      availability: listing.availability,
      description: listing.description,
      highlights: listing.highlights,
      features: listing.features,
      images: listing.images,
      propertyFinderUrl: listing.propertyFinderUrl,
    })
    setFormStep(0)
    setFormOpen(true)
  }

  const save = () => {
    if (!form.title || !form.area) {
      toast.error("Title and area are required")
      return
    }

    if (editingId) {
      setListings((prev) =>
        prev.map((l) =>
          l.id === editingId
            ? {
                ...l,
                title: form.title,
                area: form.area,
                subArea: form.subArea,
                propertyType: form.propertyType,
                transactionType: form.transactionType,
                status: form.status,
                price: Number(form.price) || 0,
                size: Number(form.size) || 0,
                bedrooms: Number(form.bedrooms) || 0,
                bathrooms: Number(form.bathrooms) || 0,
                floor: form.floor,
                availability: form.availability,
                description: form.description,
                highlights: form.highlights,
                features: form.features,
                images: form.images,
                propertyFinderUrl: form.propertyFinderUrl,
              }
            : l
        )
      )
      toast.success("Listing updated")
    } else {
      const newListing: MyListing = {
        id: `ml-${Date.now()}`,
        title: form.title,
        area: form.area,
        subArea: form.subArea,
        propertyType: form.propertyType,
        transactionType: form.transactionType,
        status: form.status,
        price: Number(form.price) || 0,
        size: Number(form.size) || 0,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        floor: form.floor,
        availability: form.availability,
        description: form.description,
        highlights: form.highlights,
        features: form.features,
        images: form.images,
        propertyFinderUrl: form.propertyFinderUrl,
        createdAt: new Date().toISOString().split("T")[0],
        views: 0,
        inquiries: 0,
      }
      setListings((prev) => [newListing, ...prev])
      toast.success("Listing created", { description: form.images.length > 0 ? `${form.images.length} photo(s) added.` : undefined })
    }
    setFormOpen(false)
  }

  const confirmDelete = () => {
    if (!deleteId) return
    setListings((prev) => prev.filter((l) => l.id !== deleteId))
    toast.success("Listing removed")
    setDeleteId(null)
  }

  const toggleFeature = (f: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter((x) => x !== f)
        : [...prev.features, f],
    }))
  }

  const filtered = statusFilter === "all"
    ? listings
    : listings.filter((l) => l.status === statusFilter)

  const counts = {
    all: listings.length,
    live: listings.filter((l) => l.status === "live").length,
    pocket: listings.filter((l) => l.status === "pocket").length,
    draft: listings.filter((l) => l.status === "draft").length,
  }

  const FORM_STEPS = ["Details", "Photos & Text", "Features & Publish"]

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage your property listings
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Listing
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "live", "pocket", "draft"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              statusFilter === key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1)}{" "}
            ({counts[key]})
          </button>
        ))}
      </div>

      {/* Listing cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((listing) => {
            const sc = statusColors[listing.status]
            return (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="group hover:shadow-md transition-shadow overflow-hidden">
                  {/* Image carousel */}
                  <ImageCarousel images={listing.images} title={listing.title} />

                  <CardContent className="p-4 space-y-3">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {listing.area}
                          {listing.subArea && (
                            <span className="text-primary">&middot; {listing.subArea}</span>
                          )}
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${sc.bg} ${sc.text} border-0`}>
                        {listing.status}
                      </Badge>
                    </div>

                    {/* Details row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span className="capitalize">{listing.propertyType}</span>
                      </span>
                      {listing.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3" /> {listing.bedrooms}
                        </span>
                      )}
                      {listing.bathrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bath className="h-3 w-3" /> {listing.bathrooms}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Maximize2 className="h-3 w-3" /> {listing.size.toLocaleString()} sqft
                      </span>
                      {listing.floor && (
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" /> {listing.floor}
                        </span>
                      )}
                    </div>

                    {/* Description preview */}
                    {listing.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">
                        AED {listing.price >= 1000000
                          ? `${(listing.price / 1000000).toFixed(1)}M`
                          : listing.price.toLocaleString()}
                        {listing.transactionType === "rent" ? "/yr" : ""}
                      </span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        For {listing.transactionType}
                      </Badge>
                    </div>

                    {/* Features */}
                    {listing.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {listing.features.slice(0, 4).map((f) => (
                          <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{f}</span>
                        ))}
                        {listing.features.length > 4 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            +{listing.features.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Highlights */}
                    {listing.highlights && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-md px-2 py-1 line-clamp-1">
                        {listing.highlights}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {listing.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" /> {listing.inquiries} inquiries
                      </span>
                      <span className="ml-auto">{listing.createdAt}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => openEdit(listing)}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(listing.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      {listing.propertyFinderUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => window.open(listing.propertyFinderUrl, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No listings yet</p>
          <p className="text-sm">Click &quot;Add Listing&quot; to create your first property listing.</p>
        </div>
      )}

      {/* ─── Create/Edit Dialog (multi-step) ─── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Listing" : "New Listing"}</DialogTitle>
            <DialogDescription>
              Step {formStep + 1} of 3 — {FORM_STEPS[formStep]}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex gap-1 mb-2">
            {FORM_STEPS.map((label, i) => (
              <button
                key={i}
                onClick={() => setFormStep(i as 0 | 1 | 2)}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i <= formStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={formStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* ─ Step 0: Property details ─ */}
              {formStep === 0 && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Title *</Label>
                    <Input
                      placeholder="e.g. 5BR Villa — Palm Jumeirah, Frond N"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Area *</Label>
                      <Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}>
                        <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                        <SelectContent>
                          {AREAS.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Sub-area / Building</Label>
                      <Input
                        placeholder="e.g. Frond N, Tower A, Sector E"
                        value={form.subArea}
                        onChange={(e) => setForm({ ...form, subArea: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Property Type *</Label>
                      <Select value={form.propertyType} onValueChange={(v) => setForm({ ...form, propertyType: v as PropertyType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="penthouse">Penthouse</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Transaction *</Label>
                      <Select value={form.transactionType} onValueChange={(v) => setForm({ ...form, transactionType: v as TransactionType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="rent">For Rent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="grid gap-2">
                      <Label>Price (AED) *</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Size (sqft)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={form.size}
                        onChange={(e) => setForm({ ...form, size: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Bedrooms</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={form.bedrooms}
                        onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Bathrooms</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={form.bathrooms}
                        onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Floor / Level</Label>
                      <Input
                        placeholder="e.g. 42, G+1, Penthouse"
                        value={form.floor}
                        onChange={(e) => setForm({ ...form, floor: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Availability</Label>
                      <Input
                        placeholder="e.g. Immediate, Q2 2026"
                        value={form.availability}
                        onChange={(e) => setForm({ ...form, availability: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Step 1: Photos & Text ─ */}
              {formStep === 1 && (
                <div className="space-y-5">
                  <ImageUploadZone
                    images={form.images}
                    onChange={(imgs) => setForm({ ...form, images: imgs })}
                  />

                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Full property description. Talk about the layout, finishes, views, community amenities, nearby landmarks..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="min-h-[120px]"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Tip: Include layout details, finishes, views, and community highlights.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label>Agent Highlights <span className="text-muted-foreground text-xs">(internal note — not shown to public)</span></Label>
                    <Textarea
                      placeholder="e.g. Motivated seller. Below market value. Owner relocated."
                      value={form.highlights}
                      onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>PropertyFinder URL</Label>
                    <Input
                      placeholder="https://www.propertyfinder.ae/..."
                      value={form.propertyFinderUrl}
                      onChange={(e) => setForm({ ...form, propertyFinderUrl: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* ─ Step 2: Features & Publish ─ */}
              {formStep === 2 && (
                <div className="space-y-5">
                  <div className="grid gap-2">
                    <Label>Features & Amenities</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {FEATURE_OPTIONS.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => toggleFeature(f)}
                          className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                            form.features.includes(f)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    {form.features.length > 0 && (
                      <p className="text-[10px] text-muted-foreground">{form.features.length} selected</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label>Listing Status</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: "draft", label: "Draft", desc: "Not visible yet" },
                        { value: "live", label: "Live", desc: "Published & searchable" },
                        { value: "pocket", label: "Pocket", desc: "Off-market, agent-only" },
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, status: opt.value })}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            form.status === opt.value
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="font-medium text-sm">{opt.label}</div>
                          <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary preview */}
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                    <h4 className="text-sm font-bold">Preview Summary</h4>
                    <div className="grid grid-cols-2 gap-y-1 text-xs">
                      <span className="text-muted-foreground">Title</span>
                      <span className="font-medium truncate">{form.title || "—"}</span>
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">{form.area}{form.subArea ? ` — ${form.subArea}` : ""}</span>
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{form.propertyType} • For {form.transactionType}</span>
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">AED {Number(form.price || 0).toLocaleString()}</span>
                      <span className="text-muted-foreground">Photos</span>
                      <span className="font-medium">{form.images.length} uploaded</span>
                      <span className="text-muted-foreground">Features</span>
                      <span className="font-medium">{form.features.length} selected</span>
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium capitalize">{form.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              {formStep > 0 && (
                <Button variant="outline" onClick={() => setFormStep((s) => (s - 1) as 0 | 1 | 2)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              {formStep < 2 ? (
                <Button onClick={() => setFormStep((s) => (s + 1) as 0 | 1 | 2)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={save}>
                  {editingId ? "Save Changes" : "Create Listing"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the listing and all its photos. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
