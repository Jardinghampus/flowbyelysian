"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  type MarketplaceProperty,
  categoryColors,
  categoryLabels,
} from "@/lib/data/marketplace-listings"
import { Badge } from "@/components/ui/badge"
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Sparkles,
  Eye,
  Share2,
  MessageCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { toast } from "sonner"

interface PropertyCardProps {
  property: MarketplaceProperty
  isSelected: boolean
  onClick: () => void
  onSeeMore?: () => void
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

export function PropertyCard({ property, isSelected, onClick, onSeeMore, index }: PropertyCardProps) {
  const colors = categoryColors[property.category]
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -8, y: x * 8 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setIsHovered(false)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/marketplace?property=${property.id}`
    const text = `${property.title} in ${property.area} - ${formatPrice(property.price, property.transactionType)}`

    if (navigator.share) {
      navigator.share({ title: property.title, text, url }).catch(() => {
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
      })
    } else {
      navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard!")
    }
  }

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const message = encodeURIComponent(
      `Hi! I'm interested in "${property.title}" in ${property.area} (${formatPrice(property.price, property.transactionType)}). Can I get more details?`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ perspective: 800 }}
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group cursor-pointer overflow-hidden rounded-xl border bg-white dark:bg-card",
          "transition-shadow duration-300 transition-[border-color] duration-300",
          isSelected
            ? "ring-2 ring-primary shadow-xl border-primary/40"
            : "shadow-sm hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/30"
        )}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : "rotateX(0deg) rotateY(0deg) scale(1)",
          transition: "transform 0.2s ease-out, box-shadow 0.3s ease",
        }}
      >
        {/* Image section */}
        <div className="relative h-44 overflow-hidden">
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className={cn(
              "object-cover transition-transform duration-700 ease-out",
              isHovered && "scale-110"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border",
                colors.bg,
                colors.text
              )}
            >
              {categoryLabels[property.category]}
            </span>
          </div>

          {/* Transaction type */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
              {property.transactionType === "sale" ? "For Sale" : "For Rent"}
            </span>
          </div>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <span className="text-white font-bold text-lg drop-shadow-lg">
              {formatPrice(property.price, property.transactionType)}
            </span>
            <span className="block text-white/60 text-[11px] mt-0.5">
              AED {property.pricePerSqft.toLocaleString()}/sqft
            </span>
          </div>

          {/* View on map pill */}
          <div
            className={cn(
              "absolute bottom-3 right-3 transition-all duration-300",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            )}
          >
            <span className="flex items-center gap-1 text-[11px] text-white/90 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              <Eye className="h-3 w-3" />
              View on map
            </span>
          </div>
        </div>

        {/* Content section */}
        <div className="p-4 space-y-2.5">
          {/* Title & area */}
          <div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-1 text-gray-900 dark:text-white">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-neutral-400">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{property.area}</span>
              <span className="text-gray-300 dark:text-neutral-600 mx-1">|</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                {property.type}
              </Badge>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-neutral-300">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-500" />
              <span className="font-medium">{property.bedrooms}</span> beds
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-500" />
              <span className="font-medium">{property.bathrooms}</span> bath
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-500" />
              <span className="font-medium">{property.size.toLocaleString()}</span> sqft
            </span>
          </div>

          {/* Vacancy bar */}
          <div className="text-[11px] px-2.5 py-1.5 rounded-md bg-gray-50 dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-800">
            {property.vacancy}
          </div>

          {/* AI Summary with shimmer */}
          <div className="relative overflow-hidden flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-neutral-300 line-clamp-2">
              {property.aiSummary}
            </p>
            {/* Shimmer overlay */}
            <div
              className={cn(
                "absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent",
                isHovered && "animate-[shimmer_1.5s_ease-in-out]"
              )}
            />
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {property.features.slice(0, 3).map((feat) => (
              <span
                key={feat}
                className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400"
              >
                {feat}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">
                +{property.features.length - 3}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onSeeMore?.() }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-colors border border-primary/20"
            >
              <Eye className="h-3.5 w-3.5" />
              See more
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25d366] hover:bg-[#20bd5a] text-white text-[11px] font-semibold transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-[11px] font-semibold transition-colors border border-gray-200 dark:border-neutral-700"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom glow on hover */}
        <div
          className={cn(
            "h-0.5 transition-opacity duration-500",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: `linear-gradient(90deg, transparent, ${categoryColors[property.category].marker}, transparent)`,
          }}
        />
      </div>
    </motion.div>
  )
}
