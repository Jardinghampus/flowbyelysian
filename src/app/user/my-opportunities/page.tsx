"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Plus,
  Search,
  ShoppingCart,
  Tag,
  Key,
  Building,
  Globe,
  MapPin,
  Bed,
  DollarSign,
  Calendar,
  Edit3,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  X,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
type OpportunityType = "buy" | "sell" | "rent" | "lease" | "relocation"
type OpportunityStatus = "active" | "matched" | "closed" | "pending"

interface Opportunity {
  id: string
  type: OpportunityType
  status: OpportunityStatus
  area: string
  subArea: string
  propertyType: string
  bedrooms: number
  price: number
  priceType: string
  createdAt: string
  updatedAt: string
  matchCount: number
  notes: string
}

const typeConfig: Record<OpportunityType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  buy: { label: "Buying", icon: ShoppingCart, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20" },
  sell: { label: "Selling", icon: Tag, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" },
  rent: { label: "Renting", icon: Key, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20" },
  lease: { label: "Leasing", icon: Building, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" },
  relocation: { label: "Relocation", icon: Globe, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20" },
}

const statusConfig: Record<OpportunityStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Active", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20", icon: CheckCircle2 },
  matched: { label: "Matched", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20", icon: Sparkles },
  pending: { label: "Under Review", color: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20", icon: Clock },
  closed: { label: "Closed", color: "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700", icon: AlertCircle },
}

// Demo data
const demoOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    type: "buy",
    status: "matched",
    area: "Tilal Al Ghaf",
    subArea: "Harmony III",
    propertyType: "Villa",
    bedrooms: 5,
    price: 8500000,
    priceType: "negotiable",
    createdAt: "2026-02-15",
    updatedAt: "2026-03-05",
    matchCount: 3,
    notes: "Looking for lagoon-facing plot, ready to move Q3 2026",
  },
  {
    id: "opp-2",
    type: "rent",
    status: "active",
    area: "Dubai Marina",
    subArea: "",
    propertyType: "Apartment",
    bedrooms: 2,
    price: 180000,
    priceType: "range",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
    matchCount: 0,
    notes: "Sea view preferred, furnished, available April",
  },
  {
    id: "opp-3",
    type: "sell",
    status: "pending",
    area: "DAMAC Hills",
    subArea: "Lime Tree Valley",
    propertyType: "Villa",
    bedrooms: 4,
    price: 5200000,
    priceType: "fixed",
    createdAt: "2026-03-06",
    updatedAt: "2026-03-06",
    matchCount: 0,
    notes: "Recently upgraded, private pool, landscaped garden",
  },
]

function formatPrice(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toLocaleString()
}

export default function CustomerOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(demoOpportunities)
  const [filterType, setFilterType] = useState<OpportunityType | null>(null)
  const [filterStatus, setFilterStatus] = useState<OpportunityStatus | null>(null)
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setOpportunities((prev) => prev.filter((o) => o.id !== id))
    setDeleteConfirm(null)
    if (selectedOpp?.id === id) setSelectedOpp(null)
  }

  const filtered = opportunities.filter((o) => {
    if (filterType && o.type !== filterType) return false
    if (filterStatus && o.status !== filterStatus) return false
    return true
  })

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Opportunities</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {opportunities.length} total &middot; {opportunities.filter((o) => o.status === "active" || o.status === "matched").length} active
          </p>
        </div>
        <Link
          href="/opportunity"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> New Opportunity
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType(null)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            !filterType
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:border-foreground/20"
          )}
        >
          All Types
        </button>
        {(Object.entries(typeConfig) as [OpportunityType, typeof typeConfig.buy][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterType(filterType === key ? null : key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              filterType === key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-foreground/20"
            )}
          >
            {config.label}
          </button>
        ))}
        <div className="w-px h-6 bg-border mx-1 self-center" />
        {(Object.entries(statusConfig) as [OpportunityStatus, typeof statusConfig.active][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? null : key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              filterStatus === key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-foreground/20"
            )}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Opportunity List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border">
          <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No opportunities match your filters.</p>
          <button
            onClick={() => { setFilterType(null); setFilterStatus(null) }}
            className="text-sm font-medium underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((opp) => {
            const type = typeConfig[opp.type]
            const status = statusConfig[opp.status]
            const TypeIcon = type.icon
            const StatusIcon = status.icon
            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 border", type.bg)}>
                        <TypeIcon className={cn("h-5 w-5", type.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold">{type.label} &mdash; {opp.propertyType}</h3>
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", status.color)}>
                            <StatusIcon className="h-3 w-3" /> {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {opp.area}{opp.subArea ? ` · ${opp.subArea}` : ""}</span>
                          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {opp.bedrooms} BR</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> AED {formatPrice(opp.price)}</span>
                        </div>
                        {opp.notes && (
                          <p className="text-sm text-muted-foreground/70 mt-2 line-clamp-1">{opp.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {opp.matchCount > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-500/20">
                          {opp.matchCount} match{opp.matchCount > 1 ? "es" : ""}
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedOpp(opp)}
                        className="h-9 w-9 rounded-lg border flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link
                        href="/opportunity"
                        className="h-9 w-9 rounded-lg border flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(opp.id)}
                        className="h-9 w-9 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground/60">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Created {new Date(opp.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {opp.updatedAt !== opp.createdAt && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Updated {new Date(opp.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                </div>

                {/* Delete confirm */}
                <AnimatePresence>
                  {deleteConfirm === opp.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-5 py-3 bg-red-50 dark:bg-red-500/10 border-t border-red-200 dark:border-red-500/20">
                        <span className="text-sm text-red-700 dark:text-red-400">Delete this opportunity?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-card transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(opp.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Quick action */}
      <Link
        href="/opportunity"
        className="flex items-center gap-4 p-5 rounded-2xl border border-dashed hover:border-foreground/20 hover:bg-accent/50 transition-all group"
      >
        <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center group-hover:bg-accent/80 transition-colors">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <span className="text-base font-semibold block">Submit a New Opportunity</span>
          <span className="text-sm text-muted-foreground">Buy, sell, rent, or lease a property</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground/40 ml-auto" />
      </Link>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOpp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedOpp(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-card rounded-t-3xl overflow-y-auto md:inset-4 md:rounded-2xl md:max-h-none md:top-auto md:bottom-auto md:max-w-lg md:mx-auto border-t md:border"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Opportunity Details</h2>
                  <button onClick={() => setSelectedOpp(null)} className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border", typeConfig[selectedOpp.type].bg)}>
                    {(() => { const Icon = typeConfig[selectedOpp.type].icon; return <Icon className={cn("h-5 w-5", typeConfig[selectedOpp.type].color)} /> })()}
                  </div>
                  <div>
                    <h3 className="font-bold">{typeConfig[selectedOpp.type].label} &mdash; {selectedOpp.propertyType}</h3>
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", statusConfig[selectedOpp.status].color)}>
                        {statusConfig[selectedOpp.status].label}
                      </span>
                      {selectedOpp.matchCount > 0 && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{selectedOpp.matchCount} matches found</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Area", value: `${selectedOpp.area}${selectedOpp.subArea ? ` · ${selectedOpp.subArea}` : ""}`, icon: MapPin },
                    { label: "Bedrooms", value: `${selectedOpp.bedrooms} BR`, icon: Bed },
                    { label: "Price", value: `AED ${formatPrice(selectedOpp.price)} (${selectedOpp.priceType})`, icon: DollarSign },
                    { label: "Property", value: selectedOpp.propertyType, icon: Home },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-accent/50 border">
                      <item.icon className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="block text-xs text-muted-foreground">{item.label}</span>
                      <span className="block text-sm font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>

                {selectedOpp.notes && (
                  <div className="p-4 rounded-xl bg-accent/50 border">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</span>
                    <p className="text-sm mt-1">{selectedOpp.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground/60 pt-2 border-t">
                  <span>Created {new Date(selectedOpp.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                  {selectedOpp.updatedAt !== selectedOpp.createdAt && (
                    <span>&middot; Updated {new Date(selectedOpp.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/opportunity"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Edit3 className="h-4 w-4" /> Edit Opportunity
                  </Link>
                  <button
                    onClick={() => { setDeleteConfirm(selectedOpp.id); setSelectedOpp(null) }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
