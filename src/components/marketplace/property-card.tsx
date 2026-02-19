"use client"

import { cn } from "@/lib/utils"
import {
  type MarketplaceProperty,
  categoryColors,
  categoryLabels,
} from "@/lib/data/marketplace-listings"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Sparkles,
  TrendingUp,
  Eye,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface PropertyCardProps {
  property: MarketplaceProperty
  isSelected: boolean
  onClick: () => void
  index: number
}

function formatPrice(price: number, transactionType: string): string {
  if (price >= 1000000) {
    return `AED ${(price / 1000000).toFixed(1)}M${transactionType === "rent" ? "/yr" : ""}`
  }
  if (price >= 1000) {
    return `AED ${(price / 1000).toFixed(0)}K${transactionType === "rent" ? "/yr" : ""}`
  }
  return `AED ${price.toLocaleString()}`
}

export function PropertyCard({ property, isSelected, onClick, index }: PropertyCardProps) {
  const colors = categoryColors[property.category]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg border",
          isSelected
            ? "ring-2 ring-primary shadow-lg"
            : "hover:border-primary/30"
        )}
        onClick={onClick}
      >
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm border",
                colors.bg,
                colors.text
              )}
            >
              {categoryLabels[property.category]}
            </span>
          </div>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <span className="text-white font-bold text-lg drop-shadow-lg">
              {formatPrice(property.price, property.transactionType)}
            </span>
          </div>

          {/* View on map */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1 text-[11px] text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
              <Eye className="h-3 w-3" />
              View on map
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title & area */}
          <div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{property.area}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {property.bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms}
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              {property.size.toLocaleString()} sqft
            </span>
          </div>

          {/* Price per sqft */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              AED {property.pricePerSqft.toLocaleString()}/sqft
            </span>
            <Badge variant="secondary" className="text-[10px] h-5">
              {property.type}
            </Badge>
          </div>

          {/* Vacancy */}
          <div className="text-[11px] px-2.5 py-1.5 rounded-md bg-secondary/50 text-muted-foreground">
            {property.vacancy}
          </div>

          {/* AI Summary */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
              {property.aiSummary}
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {property.features.slice(0, 3).map((feat) => (
              <span
                key={feat}
                className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
              >
                {feat}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                +{property.features.length - 3}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
