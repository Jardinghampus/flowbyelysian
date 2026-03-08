"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Plus, Trash2, Pencil, MapPin, Bed, Bath, Maximize2,
  Building2, Tag, Eye, EyeOff, ExternalLink, X, ImagePlus, ChevronDown,
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
  DialogHeader, DialogTitle, DialogTrigger,
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
  propertyType: PropertyType
  transactionType: TransactionType
  status: ListingStatus
  price: number
  size: number
  bedrooms: number
  bathrooms: number
  description: string
  features: string[]
  images: string[]
  propertyFinderUrl?: string
  createdAt: string
  views: number
  inquiries: number
}

const AREAS = [
  "Palm Jumeirah", "Dubai Marina", "Downtown Dubai", "Emirates Hills",
  "Arabian Ranches", "Tilal Al Ghaf", "Business Bay", "JBR",
  "Jumeirah Golf Estates", "Al Furjan", "Damac Hills", "Dubai Hills",
]

const FEATURE_OPTIONS = [
  "Private Pool", "Garden", "Balcony", "Sea View", "Golf View",
  "Smart Home", "Maid's Room", "Gym", "Concierge", "Parking",
  "Furnished", "Upgraded", "Pet Friendly", "Beach Access",
]

const statusColors: Record<ListingStatus, { bg: string; text: string }> = {
  live: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-700 dark:text-green-400" },
  pocket: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400" },
  draft: { bg: "bg-neutral-100 dark:bg-neutral-500/20", text: "text-neutral-600 dark:text-neutral-400" },
}

const initialListings: MyListing[] = [
  {
    id: "ml-1",
    title: "Luxury 5BR Villa — Emirates Hills",
    area: "Emirates Hills",
    propertyType: "villa",
    transactionType: "sale",
    status: "live",
    price: 15000000,
    size: 8500,
    bedrooms: 5,
    bathrooms: 6,
    description: "Corner plot with private pool, fully upgraded kitchen, Italian marble throughout.",
    features: ["Private Pool", "Garden", "Smart Home", "Maid's Room"],
    images: [],
    propertyFinderUrl: "https://www.propertyfinder.ae/property/123456",
    createdAt: "2026-01-15",
    views: 342,
    inquiries: 8,
  },
  {
    id: "ml-2",
    title: "4BR Townhouse — Arabian Ranches III",
    area: "Arabian Ranches",
    propertyType: "townhouse",
    transactionType: "sale",
    status: "live",
    price: 5200000,
    size: 3800,
    bedrooms: 4,
    bathrooms: 4,
    description: "Well-maintained townhouse in a family-friendly gated community with community pool.",
    features: ["Garden", "Parking", "Pet Friendly"],
    images: [],
    createdAt: "2026-02-10",
    views: 187,
    inquiries: 4,
  },
  {
    id: "ml-3",
    title: "2BR Apartment — Marina View",
    area: "Dubai Marina",
    propertyType: "apartment",
    transactionType: "rent",
    status: "pocket",
    price: 130000,
    size: 1400,
    bedrooms: 2,
    bathrooms: 2,
    description: "High floor, full marina view, furnished. Available immediately.",
    features: ["Sea View", "Furnished", "Gym", "Balcony"],
    images: [],
    createdAt: "2026-02-20",
    views: 56,
    inquiries: 1,
  },
  {
    id: "ml-4",
    title: "Studio — Business Bay (Draft)",
    area: "Business Bay",
    propertyType: "apartment",
    transactionType: "rent",
    status: "draft",
    price: 55000,
    size: 450,
    bedrooms: 0,
    bathrooms: 1,
    description: "",
    features: [],
    images: [],
    createdAt: "2026-03-01",
    views: 0,
    inquiries: 0,
  },
]

interface FormData {
  title: string
  area: string
  propertyType: PropertyType
  transactionType: TransactionType
  status: ListingStatus
  price: string
  size: string
  bedrooms: string
  bathrooms: string
  description: string
  features: string[]
  propertyFinderUrl: string
}

const emptyForm: FormData = {
  title: "",
  area: "",
  propertyType: "apartment",
  transactionType: "sale",
  status: "draft",
  price: "",
  size: "",
  bedrooms: "",
  bathrooms: "",
  description: "",
  features: [],
  propertyFinderUrl: "",
}

export default function MyListingsPage() {
  const { isSeller, isInternal } = useRole()
  const [listings, setListings] = useState<MyListing[]>(initialListings)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (listing: MyListing) => {
    setEditingId(listing.id)
    setForm({
      title: listing.title,
      area: listing.area,
      propertyType: listing.propertyType,
      transactionType: listing.transactionType,
      status: listing.status,
      price: listing.price.toString(),
      size: listing.size.toString(),
      bedrooms: listing.bedrooms.toString(),
      bathrooms: listing.bathrooms.toString(),
      description: listing.description,
      features: listing.features,
      propertyFinderUrl: listing.propertyFinderUrl || "",
    })
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
                propertyType: form.propertyType,
                transactionType: form.transactionType,
                status: form.status,
                price: Number(form.price) || 0,
                size: Number(form.size) || 0,
                bedrooms: Number(form.bedrooms) || 0,
                bathrooms: Number(form.bathrooms) || 0,
                description: form.description,
                features: form.features,
                propertyFinderUrl: form.propertyFinderUrl || undefined,
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
        propertyType: form.propertyType,
        transactionType: form.transactionType,
        status: form.status,
        price: Number(form.price) || 0,
        size: Number(form.size) || 0,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        description: form.description,
        features: form.features,
        images: [],
        propertyFinderUrl: form.propertyFinderUrl || undefined,
        createdAt: new Date().toISOString().split("T")[0],
        views: 0,
        inquiries: 0,
      }
      setListings((prev) => [newListing, ...prev])
      toast.success("Listing created")
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
                <Card className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {listing.area}
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${sc.bg} ${sc.text} border-0`}>
                        {listing.status}
                      </Badge>
                    </div>

                    {/* Details */}
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
                    </div>

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
                        {listing.features.slice(0, 3).map((f) => (
                          <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{f}</span>
                        ))}
                        {listing.features.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            +{listing.features.length - 3}
                          </span>
                        )}
                      </div>
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
          <p className="text-sm">Click "Add Listing" to create your first property listing.</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Listing" : "New Listing"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update your listing details." : "Fill in the property details."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. 3BR Villa — Palm Jumeirah"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Area</Label>
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
                <Label>Property Type</Label>
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
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Transaction</Label>
                <Select value={form.transactionType} onValueChange={(v) => setForm({ ...form, transactionType: v as TransactionType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ListingStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="pocket">Pocket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Price (AED)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
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

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the property..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Features</Label>
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
            </div>

            <div className="grid gap-2">
              <Label>PropertyFinder URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                placeholder="https://www.propertyfinder.ae/..."
                value={form.propertyFinderUrl}
                onChange={(e) => setForm({ ...form, propertyFinderUrl: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? "Save Changes" : "Create Listing"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the listing. This action cannot be undone.
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
