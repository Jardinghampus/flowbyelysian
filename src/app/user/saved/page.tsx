"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Bed, Bath, Maximize, MapPin, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { toast } from "sonner"

interface SavedListing {
  id: string
  title: string
  area: string
  type: string
  price: number
  transactionType: "sale" | "rent"
  bedrooms: number
  bathrooms: number
  size: number
  image: string
  savedAt: string
}

const DEMO_SAVED: SavedListing[] = [
  {
    id: "1",
    title: "Beachfront Villa - Signature",
    area: "Palm Jumeirah",
    type: "Villa",
    price: 25000000,
    transactionType: "sale",
    bedrooms: 6,
    bathrooms: 7,
    size: 8500,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
    savedAt: "2026-02-15",
  },
  {
    id: "2",
    title: "Marina Skyline Penthouse",
    area: "Dubai Marina",
    type: "Penthouse",
    price: 12000000,
    transactionType: "sale",
    bedrooms: 4,
    bathrooms: 5,
    size: 4200,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
    savedAt: "2026-02-10",
  },
  {
    id: "3",
    title: "Lagoon View Townhouse",
    area: "Tilal Al Ghaf",
    type: "Townhouse",
    price: 5800000,
    transactionType: "sale",
    bedrooms: 4,
    bathrooms: 5,
    size: 3200,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
    savedAt: "2026-02-08",
  },
  {
    id: "4",
    title: "Downtown Studio - High Floor",
    area: "Downtown Dubai",
    type: "Apartment",
    price: 120000,
    transactionType: "rent",
    bedrooms: 1,
    bathrooms: 1,
    size: 650,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2670&auto=format&fit=crop",
    savedAt: "2026-01-28",
  },
]

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedListing[]>(DEMO_SAVED)

  const handleRemove = (id: string) => {
    setSaved(saved.filter((s) => s.id !== id))
    toast.success("Removed from saved")
  }

  const formatPrice = (price: number, type: "sale" | "rent") => {
    if (type === "rent") return `AED ${price.toLocaleString()}/yr`
    if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M`
    return `AED ${price.toLocaleString()}`
  }

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Saved Properties</h1>
          <p className="text-muted-foreground">
            Your favorited listings ({saved.length} saved)
          </p>
        </div>
      </div>

      <div className="px-4 lg:px-6 mt-6">
        {saved.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {saved.map((listing) => (
              <Card key={listing.id} className="overflow-hidden group">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-white/90 text-neutral-900 hover:bg-white">
                      {listing.type}
                    </Badge>
                    <Badge variant={listing.transactionType === "sale" ? "default" : "secondary"}>
                      {listing.transactionType === "sale" ? "For Sale" : "For Rent"}
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleRemove(listing.id)}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                    <p className="font-bold text-lg whitespace-nowrap">
                      {formatPrice(listing.price, listing.transactionType)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    {listing.area}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" /> {listing.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" /> {listing.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize className="h-4 w-4" /> {listing.size.toLocaleString()} sqft
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Saved {listing.savedAt}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/properties/${listing.id}`}>
                        View Details
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No saved properties</p>
            <p className="text-muted-foreground mb-4">
              Browse the marketplace and save listings you are interested in.
            </p>
            <Button asChild>
              <Link href="/user/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
