"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  type ExchangeRequest,
  requestTypeConfig,
  urgencyConfig,
} from "@/lib/data/exchange-data"
import { Badge } from "@/components/ui/badge"
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Clock,
  Users,
  Trash2,
  MessageCircle,
  Share2,
  ShoppingCart,
  Tag,
  Key,
  Building,
  AlertTriangle,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { toast } from "sonner"

const typeIcons: Record<string, React.ElementType> = {
  ShoppingCart,
  Tag,
  Key,
  Building,
}

interface RequestCardProps {
  request: ExchangeRequest
  onDelete?: (id: string) => void
  index: number
}

function formatBudget(min: number, max: number): string {
  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
    return n.toLocaleString()
  }
  if (min === max) return `AED ${fmt(min)}`
  return `AED ${fmt(min)} - ${fmt(max)}`
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 7) return `${diff}d ago`
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`
  return `${Math.floor(diff / 30)}mo ago`
}

export function RequestCard({ request, onDelete, index }: RequestCardProps) {
  const typeConf = requestTypeConfig[request.type]
  const urgConf = urgencyConfig[request.urgency]
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const TypeIcon = typeIcons[typeConf.icon] || ShoppingCart

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -6, y: x * 6 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setIsHovered(false)
  }

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const message = encodeURIComponent(
      `Hi! I'm interested in the ${request.type} request: "${request.title}" in ${request.area} (${formatBudget(request.minBudget, request.maxBudget)}). Can we discuss?`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/exchange?request=${request.id}`
    const text = `${request.title} - ${formatBudget(request.minBudget, request.maxBudget)}`
    if (navigator.share) {
      navigator.share({ title: request.title, text, url }).catch(() => {
        navigator.clipboard.writeText(url)
        toast.success("Link copied!")
      })
    } else {
      navigator.clipboard.writeText(url)
      toast.success("Link copied!")
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(request.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ perspective: 800 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group cursor-pointer overflow-hidden rounded-xl border bg-white dark:bg-card",
          "transition-shadow duration-300",
          "shadow-sm hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/30"
        )}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : "rotateX(0deg) rotateY(0deg) scale(1)",
          transition: "transform 0.2s ease-out, box-shadow 0.3s ease",
        }}
      >
        {/* Image section */}
        <div className="relative h-40 overflow-hidden">
          <Image
            src={request.imageUrl}
            alt={request.title}
            fill
            className={cn(
              "object-cover transition-transform duration-700 ease-out",
              isHovered && "scale-110"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border", typeConf.bg, typeConf.text)}>
              <TypeIcon className="h-3 w-3 inline mr-1 -mt-0.5" />
              {typeConf.label}
            </span>
          </div>

          {/* Urgency badge */}
          <div className="absolute top-3 right-3">
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-md border", urgConf.bg, urgConf.text)}>
              {request.urgency === "urgent" && <AlertTriangle className="h-2.5 w-2.5 inline mr-0.5 -mt-0.5" />}
              {urgConf.label}
            </span>
          </div>

          {/* Budget */}
          <div className="absolute bottom-3 left-3">
            <span className="text-white font-bold text-base drop-shadow-lg">
              {formatBudget(request.minBudget, request.maxBudget)}
            </span>
            <span className="block text-white/60 text-[11px] mt-0.5">
              {request.type === "rent" || request.type === "lease" ? "/year" : ""}
            </span>
          </div>

          {/* Match count */}
          <div className="absolute bottom-3 right-3">
            <span className="flex items-center gap-1 text-[11px] text-white/90 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              <Users className="h-3 w-3" />
              {request.matchCount} matches
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          <div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-1 text-gray-900 dark:text-white">
              {request.title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-neutral-400">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{request.area}</span>
              <span className="text-gray-300 dark:text-neutral-600 mx-1">|</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                {request.propertyType}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-[11px] leading-relaxed text-gray-500 dark:text-neutral-400 line-clamp-2">
            {request.description}
          </p>

          {/* Stats */}
          {request.bedrooms > 0 && (
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-neutral-300">
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-500" />
                <span className="font-medium">{request.bedrooms}</span> beds
              </span>
              {request.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-500" />
                  <span className="font-medium">{request.bathrooms}</span> bath
                </span>
              )}
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-500" />
                <span className="font-medium">{request.minSize.toLocaleString()}</span>
                {request.minSize !== request.maxSize && (
                  <> - {request.maxSize.toLocaleString()}</>
                )} sqft
              </span>
            </div>
          )}

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {request.features.slice(0, 3).map((feat) => (
              <span
                key={feat}
                className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400"
              >
                {feat}
              </span>
            ))}
            {request.features.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">
                +{request.features.length - 3}
              </span>
            )}
          </div>

          {/* Time & contact */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-neutral-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(request.createdAt)}
            </div>
            <span>{request.contactName}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25d366] hover:bg-[#20bd5a] text-white text-[11px] font-semibold transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Contact
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-[11px] font-semibold transition-colors border border-gray-200 dark:border-neutral-700"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-semibold transition-colors border border-red-200 dark:border-red-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom glow */}
        <div
          className={cn("h-0.5 transition-opacity duration-500", isHovered ? "opacity-100" : "opacity-0")}
          style={{ background: `linear-gradient(90deg, transparent, ${typeConf.color}, transparent)` }}
        />
      </div>
    </motion.div>
  )
}
