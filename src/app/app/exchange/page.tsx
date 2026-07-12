"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  requestTypeConfig,
  type ExchangeRequest,
  type RequestType,
} from "@/lib/data/exchange-data"
import { areas } from "@/lib/data/marketplace-listings"
import { RequestCard } from "@/components/exchange/request-card"
import { RequestPopup } from "@/components/exchange/request-popup"
import { RequestForm, type RequestFormData } from "@/components/exchange/request-form"
import { InventoryBrowser } from "@/components/exchange/inventory-browser"
import { AgencyInquiry } from "@/components/exchange/agency-inquiry"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRole } from "@/contexts/role-context"
import {
  Search,
  Plus,
  ArrowLeftRight,
  ShoppingCart,
  Tag,
  Key,
  Building,
  Building2,
  Briefcase,
  SlidersHorizontal,
  ChevronDown,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
} from "lucide-react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { toast } from "sonner"

// Animated counter
function useAnimatedCounter(end: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const startTime = performance.now()
    function step(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(end * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration, isInView])

  return { count, ref }
}

function AnimatedStat({
  value,
  label,
  icon: Icon,
  color,
}: {
  value: number
  label: string
  icon: React.ElementType
  color: string
}) {
  const { count, ref } = useAnimatedCounter(value)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-sm"
    >
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <span ref={ref} className="text-lg font-bold text-gray-900 dark:text-white">
          {count.toLocaleString()}
        </span>
        <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-tight">{label}</p>
      </div>
    </motion.div>
  )
}

const typeFilters: { type: RequestType | "all"; icon: React.ElementType; label: string }[] = [
  { type: "all", icon: ArrowLeftRight, label: "All" },
  { type: "buy", icon: ShoppingCart, label: "Buy" },
  { type: "sell", icon: Tag, label: "Sell" },
  { type: "rent", icon: Key, label: "Rent" },
  { type: "lease", icon: Building, label: "Lease" },
]

// localStorage key for user-added requests
const STORAGE_KEY = "exchange-user-requests"

export default function ExchangePage() {
  const { isInternal } = useRole()
  const [requests, setRequests] = useState<ExchangeRequest[]>([])
  const [typeFilter, setTypeFilter] = useState<RequestType | "all">("all")
  const [areaFilter, setAreaFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [popupRequest, setPopupRequest] = useState<ExchangeRequest | null>(null)

  // Load user requests from localStorage (no demo seed)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const userRequests: ExchangeRequest[] = JSON.parse(stored)
        setRequests(userRequests)
      }
    } catch {}
  }, [])

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false
      if (areaFilter && r.areaSlug !== areaFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.area.toLowerCase().includes(q) ||
          r.propertyType.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [requests, typeFilter, areaFilter, searchQuery])

  const stats = useMemo(() => ({
    buy: requests.filter((r) => r.type === "buy").length,
    sell: requests.filter((r) => r.type === "sell").length,
    rent: requests.filter((r) => r.type === "rent").length,
    lease: requests.filter((r) => r.type === "lease").length,
  }), [requests])

  const handleRequestAgent = useCallback((request: ExchangeRequest) => {
    toast.success("Agent contact requested!", {
      description: `A Zaylo agent will reach out to you shortly regarding "${request.title}".`,
      duration: 5000,
    })
  }, [])

  const handleAddRequest = useCallback((data: RequestFormData) => {
    const areaInfo = areas.find((a) => a.slug === data.area)
    const isListing = data.type === "sell" || data.type === "lease"
    const newRequest: ExchangeRequest = {
      id: `user-${Date.now()}`,
      type: data.type,
      title: data.title,
      description: data.description,
      area: areaInfo?.name || data.area,
      areaSlug: data.area,
      subArea: data.subArea || undefined,
      unitNumber: data.unitNumber || undefined,
      floor: data.floor || undefined,
      propertyType: data.propertyType as ExchangeRequest["propertyType"],
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      minSize: data.minSize,
      maxSize: data.maxSize,
      minBudget: data.minBudget,
      maxBudget: data.maxBudget,
      features: data.features,
      status: "active",
      urgency: data.urgency,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      createdAt: new Date().toISOString().split("T")[0],
      matchCount: 0,
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      isOffMarket: isListing,
    }

    setRequests((prev) => {
      const updated = [newRequest, ...prev]
      // Save user requests to localStorage
      const userRequests = updated.filter((r) => r.id.startsWith("user-"))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userRequests))
      return updated
    })
  }, [])

  const handleDeleteRequest = useCallback((id: string) => {
    setRequests((prev) => {
      const updated = prev.filter((r) => r.id !== id)
      const userRequests = updated.filter((r) => r.id.startsWith("user-"))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userRequests))
      return updated
    })
  }, [])

  return (
    <>
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white"
            >
              <ArrowLeftRight className="h-6 w-6 text-primary" />
              Exchange
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 dark:text-neutral-400 text-sm mt-1"
            >
              Post and browse buy, sell, rent &amp; lease requests — connect with the right people
            </motion.p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <AnimatedStat value={stats.buy} label="Buy Requests" icon={ShoppingCart} color={requestTypeConfig.buy.color} />
            <AnimatedStat value={stats.sell} label="Sell Listings" icon={Tag} color={requestTypeConfig.sell.color} />
            <AnimatedStat value={stats.rent + stats.lease} label="Rent / Lease" icon={Key} color={requestTypeConfig.rent.color} />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-neutral-500" />
            <Input
              placeholder="Search requests, areas, property types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New Request
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setIsInventoryOpen(true)}
            >
              <Building2 className="h-3.5 w-3.5" />
              Browse Inventory
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => setIsInquiryOpen(true)}
            >
              <Briefcase className="h-3.5 w-3.5" />
              List with Us
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", showFilters && "rotate-180")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 lg:px-6 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
              {/* Type filters */}
              <div className="flex items-center gap-1.5">
                {typeFilters.map(({ type, icon: Icon, label }) => {
                  const isActive = typeFilter === type
                  const conf = type !== "all" ? requestTypeConfig[type] : null
                  return (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                        isActive
                          ? conf
                            ? `${conf.bg} ${conf.text} border-current`
                            : "bg-primary text-primary-foreground border-primary"
                          : "border-transparent text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                      {type !== "all" && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1 py-0 bg-white/50 dark:bg-black/20">
                          {stats[type]}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="w-px h-6 bg-gray-200 dark:bg-neutral-700 hidden sm:block" />

              {/* Area filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setAreaFilter(null)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                    !areaFilter
                      ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                      : "text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                  )}
                >
                  All Areas
                </button>
                {areas.map((area) => (
                  <button
                    key={area.slug}
                    onClick={() => setAreaFilter(area.slug === areaFilter ? null : area.slug)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                      areaFilter === area.slug
                        ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                        : "text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    )}
                  >
                    {area.name}
                  </button>
                ))}
              </div>

              <div className="ml-auto text-xs text-gray-400 dark:text-neutral-500 flex-shrink-0">
                {filteredRequests.length} results
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick info banner */}
      <div className="px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border border-primary/10"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                How the Exchange works
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                {isInternal
                  ? "View all buy/sell/rent/lease requests. Contact details and unit numbers are visible to you. Connect matching parties."
                  : "Browse off-market listings and post your requirements. A Zaylo agent will connect you with matching parties."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600 dark:text-neutral-300 font-medium">{requests.length} active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-gray-600 dark:text-neutral-300 font-medium">12 matched this week</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600 dark:text-neutral-300 font-medium">Avg 3 days to match</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Request cards grid */}
      <div className="px-4 lg:px-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-white">
            Active Requests
            <span className="text-gray-400 dark:text-neutral-500 font-normal ml-1.5">
              ({filteredRequests.length})
            </span>
          </h2>
          {(typeFilter !== "all" || areaFilter) && (
            <button
              onClick={() => { setTypeFilter("all"); setAreaFilter(null); setSearchQuery("") }}
              className="text-[11px] text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <ArrowLeftRight className="h-12 w-12 text-gray-200 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-neutral-400">No requests match your filters</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => { setTypeFilter("all"); setAreaFilter(null); setSearchQuery("") }}
            >
              Reset filters
            </Button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredRequests.map((request, index) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onDelete={request.id.startsWith("user-") ? handleDeleteRequest : undefined}
                  onSeeMore={() => setPopupRequest(request)}
                  onRequestAgent={handleRequestAgent}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Panels & Modals */}
      <RequestForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddRequest}
      />
      <InventoryBrowser
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />
      <AgencyInquiry
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
      />
      <RequestPopup
        request={popupRequest}
        isOpen={!!popupRequest}
        onClose={() => setPopupRequest(null)}
        onDelete={handleDeleteRequest}
        onRequestAgent={handleRequestAgent}
      />
    </>
  )
}
