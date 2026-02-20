"use client"

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
  MessageCircle,
  Share2,
  X,
  Clock,
  Users,
  ShoppingCart,
  Tag,
  Key,
  Building,
  AlertTriangle,
  Mail,
  Phone,
  Trash2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { toast } from "sonner"

const typeIcons: Record<string, React.ElementType> = {
  ShoppingCart,
  Tag,
  Key,
  Building,
}

interface RequestPopupProps {
  request: ExchangeRequest | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (id: string) => void
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
  if (diff < 7) return `${diff} days ago`
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`
  return `${Math.floor(diff / 30)} months ago`
}

export function RequestPopup({ request, isOpen, onClose, onDelete }: RequestPopupProps) {
  if (!request) return null

  const typeConf = requestTypeConfig[request.type]
  const urgConf = urgencyConfig[request.urgency]
  const TypeIcon = typeIcons[typeConf.icon] || ShoppingCart

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I'm responding to the ${request.type} request: "${request.title}" in ${request.area} (${formatBudget(request.minBudget, request.maxBudget)}). Let's discuss.`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const handleShare = () => {
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

  const handleDelete = () => {
    onDelete?.(request.id)
    onClose()
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
            <div className="relative h-48 sm:h-56 flex-shrink-0">
              <Image
                src={request.imageUrl}
                alt={request.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 576px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors z-10"
              >
                <X className="h-4 w-4 text-white" />
              </button>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border flex items-center gap-1", typeConf.bg, typeConf.text)}>
                  <TypeIcon className="h-3 w-3" />
                  {typeConf.label}
                </span>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-md border flex items-center gap-1", urgConf.bg, urgConf.text)}>
                  {request.urgency === "urgent" && <AlertTriangle className="h-2.5 w-2.5" />}
                  {urgConf.label}
                </span>
              </div>

              {/* Title & budget */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="min-w-0 mr-3">
                  <h2 className="text-white font-bold text-xl drop-shadow-lg leading-tight line-clamp-2">
                    {request.title}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-white/70" />
                    <span className="text-white/80 text-sm">{request.area}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-white font-bold text-xl drop-shadow-lg">
                    {formatBudget(request.minBudget, request.maxBudget)}
                  </span>
                  {(request.type === "rent" || request.type === "lease") && (
                    <span className="block text-white/60 text-xs">/year</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Meta row */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {timeAgo(request.createdAt)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {request.matchCount} potential matches
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 capitalize ml-auto">
                  {request.propertyType}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
                {request.description}
              </p>

              {/* Stats */}
              {request.bedrooms > 0 && (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                      <Bed className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{request.bedrooms}</span>
                      <span className="block text-[10px] text-gray-500 dark:text-neutral-400">Beds</span>
                    </div>
                  </div>
                  {request.bathrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                        <Bath className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{request.bathrooms}</span>
                        <span className="block text-[10px] text-gray-500 dark:text-neutral-400">Baths</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                      <Maximize2 className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {request.minSize.toLocaleString()}
                        {request.minSize !== request.maxSize && ` - ${request.maxSize.toLocaleString()}`}
                      </span>
                      <span className="block text-[10px] text-gray-500 dark:text-neutral-400">Sqft</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div>
                <span className="text-xs font-medium text-gray-700 dark:text-neutral-300 mb-2 block">Requirements</span>
                <div className="flex flex-wrap gap-1.5">
                  {request.features.map((feat) => (
                    <span
                      key={feat}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact info */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-2.5">
                <span className="text-xs font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider">Contact</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-neutral-300">
                    <Users className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                    {request.contactName}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-neutral-400">
                    <Phone className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                    {request.contactPhone}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-neutral-400">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                    {request.contactEmail}
                  </div>
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
                Contact
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-sm font-semibold transition-colors border border-gray-200 dark:border-neutral-700"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              {onDelete && request.id.startsWith("user-") && (
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold transition-colors border border-red-200 dark:border-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
