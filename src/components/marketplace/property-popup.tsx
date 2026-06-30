"use client"

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
  MessageCircle,
  Share2,
  X,
  Calendar,
  Building2,
  DollarSign,
  User,
  Hash,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { toast } from "sonner"

interface PropertyPopupProps {
  property: MarketplaceProperty | null
  isOpen: boolean
  onClose: () => void
}

function formatPrice(price: number, transactionType: string): string {
  if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M${transactionType === "rent" ? "/yr" : ""}`
  if (price >= 1000) return `AED ${(price / 1000).toFixed(0)}K${transactionType === "rent" ? "/yr" : ""}`
  return `AED ${price.toLocaleString()}`
}

export function PropertyPopup({ property, isOpen, onClose }: PropertyPopupProps) {
  if (!property) return null

  const colors = categoryColors[property.category]

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in "${property.title}" in ${property.area} (${formatPrice(property.price, property.transactionType)}). Can I get more details?`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const handleShare = () => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-auto sm:w-full sm:max-w-xl max-h-[90vh] bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Image header */}
            <div className="relative h-56 sm:h-64 flex-shrink-0">
              <Image
                src={property.imageUrl}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 576px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors z-10"
              >
                <X className="h-4 w-4 text-white" />
              </button>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border", colors.bg, colors.text)}>
                  {categoryLabels[property.category]}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
                  {property.transactionType === "sale" ? "For Sale" : "For Rent"}
                </span>
              </div>

              {/* Price overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <h2 className="text-white font-bold text-xl drop-shadow-lg leading-tight">
                    {property.title}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-white/70" />
                    <span className="text-white/80 text-sm">{property.area}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-white font-bold text-2xl drop-shadow-lg">
                    {formatPrice(property.price, property.transactionType)}
                  </span>
                  <span className="block text-white/60 text-xs">
                    AED {property.pricePerSqft.toLocaleString()}/sqft
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Stats row */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Bed className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{property.bedrooms}</span>
                    <span className="block text-[10px] text-gray-500 dark:text-neutral-400">Beds</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Bath className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{property.bathrooms}</span>
                    <span className="block text-[10px] text-gray-500 dark:text-neutral-400">Baths</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Maximize2 className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{property.size.toLocaleString()}</span>
                    <span className="block text-[10px] text-gray-500 dark:text-neutral-400">Sqft</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 capitalize ml-auto">
                  {property.type}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
                {property.description}
              </p>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                  <Building2 className="h-4 w-4 text-gray-400 dark:text-neutral-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[10px] text-gray-500 dark:text-neutral-400">Developer</span>
                    <span className="block text-xs font-medium text-gray-900 dark:text-white truncate">{property.developer}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                  <Calendar className="h-4 w-4 text-gray-400 dark:text-neutral-500 flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500 dark:text-neutral-400">Year</span>
                    <span className="block text-xs font-medium text-gray-900 dark:text-white">{property.completionYear || "N/A"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                  <Hash className="h-4 w-4 text-gray-400 dark:text-neutral-500 flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500 dark:text-neutral-400">Plot</span>
                    <span className="block text-xs font-medium text-gray-900 dark:text-white">{property.plotNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                  <DollarSign className="h-4 w-4 text-gray-400 dark:text-neutral-500 flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500 dark:text-neutral-400">Vacancy</span>
                    <span className="block text-xs font-medium text-gray-900 dark:text-white truncate">{property.vacancy}</span>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/10">
                <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-semibold text-primary mb-1">AI Market Insight</span>
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-neutral-300">
                    {property.aiSummary}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div>
                <span className="text-xs font-medium text-gray-700 dark:text-neutral-300 mb-2 block">Features</span>
                <div className="flex flex-wrap gap-1.5">
                  {property.features.map((feat) => (
                    <span
                      key={feat}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-gray-200 dark:border-neutral-800 flex gap-2 flex-shrink-0">
              <button
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-white text-sm font-semibold transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                I&apos;m Interested
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-sm font-semibold transition-colors border border-gray-200 dark:border-neutral-700"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
