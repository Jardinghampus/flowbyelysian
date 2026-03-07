"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Filter,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Home,
  Bed,
  Bath,
  DollarSign,
  Clock,
  User,
  ChevronDown,
  ArrowUpDown,
  ShoppingCart,
  Tag,
  Key,
  Building,
  Globe,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type OpportunityType = "buy" | "sell" | "rent" | "lease" | "relocation"
type OpportunityStatus = "new" | "contacted" | "in_progress" | "matched" | "closed" | "cancelled"

interface Opportunity {
  id: string
  type: OpportunityType
  status: OpportunityStatus
  full_name: string
  email: string
  phone: string
  whatsapp: string | null
  preferred_contact: string
  area: string | null
  sub_area: string | null
  unit_number: string | null
  property_type: string | null
  bedrooms: number | null
  bathrooms: number | null
  size: number | null
  price: number | null
  price_type: string | null
  min_price: number | null
  max_price: number | null
  features: string[]
  notes: string | null
  ai_price_summary: string | null
  market_comparison_pct: number | null
  assigned_agent_id: string | null
  assigned_agent_name: string | null
  agent_notes: string | null
  created_at: string
  updated_at: string
}

const typeConfig: Record<OpportunityType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  buy: { label: "Buy", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
  sell: { label: "Sell", icon: Tag, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  rent: { label: "Rent", icon: Key, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
  lease: { label: "Lease", icon: Building, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
  relocation: { label: "Relocation", icon: Globe, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
}

const statusConfig: Record<OpportunityStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  new: { label: "New", color: "text-blue-700", bg: "bg-blue-100 dark:bg-blue-500/20", icon: AlertCircle },
  contacted: { label: "Contacted", color: "text-amber-700", bg: "bg-amber-100 dark:bg-amber-500/20", icon: Phone },
  in_progress: { label: "In Progress", color: "text-violet-700", bg: "bg-violet-100 dark:bg-violet-500/20", icon: Loader2 },
  matched: { label: "Matched", color: "text-emerald-700", bg: "bg-emerald-100 dark:bg-emerald-500/20", icon: CheckCircle2 },
  closed: { label: "Closed", color: "text-neutral-700", bg: "bg-neutral-100 dark:bg-neutral-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100 dark:bg-red-500/20", icon: XCircle },
}

export default function LeadsPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchOpportunities = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (filterType !== "all") params.set("type", filterType)
      const res = await fetch(`/api/opportunities?${params.toString()}`)
      const data = await res.json()
      setOpportunities(data.opportunities || [])
    } catch {
      // Use demo data if API fails
      setOpportunities(demoOpportunities)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterType])

  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  const updateStatus = async (id: string, newStatus: OpportunityStatus) => {
    setUpdatingStatus(true)
    try {
      await fetch("/api/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      })
      setOpportunities((prev) =>
        prev.map((opp) => (opp.id === id ? { ...opp, status: newStatus } : opp))
      )
      if (selectedOpp?.id === id) {
        setSelectedOpp((prev) => prev ? { ...prev, status: newStatus } : null)
      }
    } catch {
      // silent fail
    } finally {
      setUpdatingStatus(false)
    }
  }

  const filtered = opportunities.filter((opp) => {
    if (search) {
      const q = search.toLowerCase()
      if (
        !opp.full_name.toLowerCase().includes(q) &&
        !opp.email.toLowerCase().includes(q) &&
        !(opp.area || "").toLowerCase().includes(q) &&
        !opp.phone.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const stats = {
    total: opportunities.length,
    new: opportunities.filter((o) => o.status === "new").length,
    contacted: opportunities.filter((o) => o.status === "contacted").length,
    inProgress: opportunities.filter((o) => o.status === "in_progress").length,
    matched: opportunities.filter((o) => o.status === "matched").length,
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads Pipeline</h1>
        <p className="text-muted-foreground">
          Manage incoming opportunities from customers. Contact, match, and close deals.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Leads", value: stats.total, color: "text-foreground" },
          { label: "New", value: stats.new, color: "text-blue-600" },
          { label: "Contacted", value: stats.contacted, color: "text-amber-600" },
          { label: "In Progress", value: stats.inProgress, color: "text-violet-600" },
          { label: "Matched", value: stats.matched, color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by name, email, area, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 rounded-lg border bg-background pl-9 pr-8 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 rounded-lg border bg-background pl-9 pr-8 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Types</option>
              {Object.entries(typeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No leads found</p>
            <p className="text-sm text-muted-foreground">Adjust your filters or wait for new submissions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Property</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((opp) => {
                  const typeConf = typeConfig[opp.type]
                  const statusConf = statusConfig[opp.status]
                  const TypeIcon = typeConf.icon
                  return (
                    <tr
                      key={opp.id}
                      className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedOpp(opp)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{opp.full_name}</p>
                            <p className="text-xs text-muted-foreground">{opp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", typeConf.bg)}>
                          <TypeIcon className={cn("h-3 w-3", typeConf.color)} />
                          <span className={typeConf.color}>{typeConf.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          {opp.area && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {opp.area}
                            </span>
                          )}
                          {opp.property_type && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              · <Home className="h-3 w-3" /> {opp.property_type}
                            </span>
                          )}
                          {opp.bedrooms && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              · <Bed className="h-3 w-3" /> {opp.bedrooms}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {opp.price ? (
                          <span className="font-medium">AED {opp.price.toLocaleString()}</span>
                        ) : opp.min_price && opp.max_price ? (
                          <span className="text-xs">AED {opp.min_price.toLocaleString()} - {opp.max_price.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {opp.market_comparison_pct !== null && opp.market_comparison_pct !== undefined && (
                          <span className={cn(
                            "ml-1.5 text-xs font-medium",
                            opp.market_comparison_pct > 0 ? "text-emerald-600" : opp.market_comparison_pct < -10 ? "text-amber-600" : "text-blue-600"
                          )}>
                            {opp.market_comparison_pct > 0 ? "+" : ""}{opp.market_comparison_pct}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", statusConf.bg, statusConf.color)}>
                          {statusConf.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(opp.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {opp.phone && (
                            <a href={`tel:${opp.phone}`} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center" title="Call">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            </a>
                          )}
                          {opp.whatsapp && (
                            <a href={`https://wa.me/${opp.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center" title="WhatsApp">
                              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                            </a>
                          )}
                          <a href={`mailto:${opp.email}`} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center" title="Email">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setSelectedOpp(null)}>
          <div
            className="w-full max-w-lg bg-background border-l shadow-xl overflow-y-auto animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedOpp.full_name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedOpp.email}</p>
                </div>
                <button
                  onClick={() => setSelectedOpp(null)}
                  className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"
                >
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Status update */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.entries(statusConfig) as [OpportunityStatus, typeof statusConfig.new][]).map(([key, config]) => (
                    <button
                      key={key}
                      disabled={updatingStatus}
                      onClick={() => updateStatus(selectedOpp.id, key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        selectedOpp.status === key
                          ? config.bg + " " + config.color + " border-current"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact info */}
              <div className="rounded-xl border p-4 space-y-3">
                <h3 className="text-sm font-bold">Contact Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedOpp.phone}`} className="hover:underline">{selectedOpp.phone}</a>
                  </div>
                  {selectedOpp.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      <a href={`https://wa.me/${selectedOpp.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{selectedOpp.whatsapp}</a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedOpp.email}`} className="hover:underline">{selectedOpp.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Prefers: {selectedOpp.preferred_contact}</span>
                  </div>
                </div>
              </div>

              {/* Property details */}
              <div className="rounded-xl border p-4 space-y-3">
                <h3 className="text-sm font-bold">Property Requirements</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{selectedOpp.type}</span>
                  {selectedOpp.area && <>
                    <span className="text-muted-foreground">Area</span>
                    <span className="font-medium">{selectedOpp.area}{selectedOpp.sub_area ? ` — ${selectedOpp.sub_area}` : ""}</span>
                  </>}
                  {selectedOpp.property_type && <>
                    <span className="text-muted-foreground">Property Type</span>
                    <span className="font-medium">{selectedOpp.property_type}</span>
                  </>}
                  {selectedOpp.bedrooms && <>
                    <span className="text-muted-foreground">Bedrooms</span>
                    <span className="font-medium">{selectedOpp.bedrooms}</span>
                  </>}
                  {selectedOpp.bathrooms && <>
                    <span className="text-muted-foreground">Bathrooms</span>
                    <span className="font-medium">{selectedOpp.bathrooms}</span>
                  </>}
                  {selectedOpp.size && <>
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">{selectedOpp.size.toLocaleString()} sqft</span>
                  </>}
                  {selectedOpp.price && <>
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">AED {selectedOpp.price.toLocaleString()} ({selectedOpp.price_type})</span>
                  </>}
                  {selectedOpp.min_price && selectedOpp.max_price && <>
                    <span className="text-muted-foreground">Budget Range</span>
                    <span className="font-medium">AED {selectedOpp.min_price.toLocaleString()} – {selectedOpp.max_price.toLocaleString()}</span>
                  </>}
                </div>
                {selectedOpp.features && selectedOpp.features.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-medium text-muted-foreground">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedOpp.features.map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded-full bg-muted text-xs">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Price Summary */}
              {selectedOpp.ai_price_summary && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-400">AI Market Analysis</h3>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{selectedOpp.ai_price_summary}</p>
                  {selectedOpp.market_comparison_pct !== null && selectedOpp.market_comparison_pct !== undefined && (
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                      selectedOpp.market_comparison_pct > 0
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : selectedOpp.market_comparison_pct < -10
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                    )}>
                      {selectedOpp.market_comparison_pct > 0 ? "↑" : "↓"} {Math.abs(selectedOpp.market_comparison_pct)}% vs market
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedOpp.notes && (
                <div className="rounded-xl border p-4 space-y-2">
                  <h3 className="text-sm font-bold">Customer Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedOpp.notes}</p>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex gap-2">
                <a
                  href={`tel:${selectedOpp.phone}`}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
                {selectedOpp.whatsapp && (
                  <a
                    href={`https://wa.me/${selectedOpp.whatsapp.replace(/\s+/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center gap-2 text-sm font-medium hover:bg-emerald-500 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                <a
                  href={`mailto:${selectedOpp.email}`}
                  className="flex-1 h-10 rounded-lg border flex items-center justify-center gap-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Demo data for when API is not available
const demoOpportunities: Opportunity[] = [
  {
    id: "demo-1",
    type: "buy",
    status: "new",
    full_name: "Mohammed Al Rashid",
    email: "mohammed@example.com",
    phone: "+971 50 123 4567",
    whatsapp: "+971501234567",
    preferred_contact: "whatsapp",
    area: "Tilal Al Ghaf",
    sub_area: "Harmony",
    unit_number: null,
    property_type: "Villa",
    bedrooms: 4,
    bathrooms: 5,
    size: 4500,
    price: 6500000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Private Pool", "Garden", "Maid's Room"],
    notes: "Looking for lagoon-facing villa, preferably Harmony III or Elan",
    ai_price_summary: "Your budget is 8.2% below the average market price for a 4BR Villa in Tilal Al Ghaf (avg AED 7,080,000). Opportunities exist but may take longer to match. An agent will contact you soon.",
    market_comparison_pct: -8.2,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-2",
    type: "sell",
    status: "contacted",
    full_name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+971 55 987 6543",
    whatsapp: "+971559876543",
    preferred_contact: "phone",
    area: "DAMAC Hills",
    sub_area: "Golf Vita",
    unit_number: "V-12-A",
    property_type: "Villa",
    bedrooms: 5,
    bathrooms: 6,
    size: 5200,
    price: 7200000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Golf View", "Private Pool", "Smart Home", "Upgraded"],
    notes: "Fully upgraded villa with golf course views. Ready to sell within 3 months.",
    ai_price_summary: "Your asking price is 24.1% above the average market price for a 5BR Villa in DAMAC Hills (avg AED 5,800,000). Consider adjusting for faster matching. An agent will contact you soon.",
    market_comparison_pct: 24.1,
    assigned_agent_id: "demo-agent-1",
    assigned_agent_name: "Ahmed Hassan",
    agent_notes: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-3",
    type: "rent",
    status: "new",
    full_name: "Chen Wei",
    email: "chen.w@example.com",
    phone: "+971 52 456 7890",
    whatsapp: "+971524567890",
    preferred_contact: "whatsapp",
    area: "Dubai Marina",
    sub_area: null,
    unit_number: null,
    property_type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    size: 1200,
    price: 120000,
    price_type: "range",
    min_price: 100000,
    max_price: 140000,
    features: ["Sea View", "Gym", "Balcony"],
    notes: "Relocating for work, need furnished apartment near tram station",
    ai_price_summary: null,
    market_comparison_pct: null,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-4",
    type: "relocation",
    status: "in_progress",
    full_name: "Anna Petrova",
    email: "anna.p@corporate.com",
    phone: "+971 58 111 2233",
    whatsapp: null,
    preferred_contact: "email",
    area: "Downtown Dubai",
    sub_area: null,
    unit_number: null,
    property_type: "Apartment",
    bedrooms: 3,
    bathrooms: 3,
    size: 2000,
    price: 250000,
    price_type: "fixed",
    min_price: null,
    max_price: null,
    features: ["Burj Khalifa View", "Concierge", "Gym"],
    notes: "Corporate relocation from Moscow. Family with 2 children. Needs school proximity.",
    ai_price_summary: null,
    market_comparison_pct: null,
    assigned_agent_id: "demo-agent-4",
    assigned_agent_name: "Maria Santos",
    agent_notes: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]
