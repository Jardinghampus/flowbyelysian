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
  EyeOff,
  Lock,
  HandMetal,
  Plus,
  X,
  Database,
  Link2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRole } from "@/contexts/role-context"
import { toast } from "sonner"
import { LeadScoreInline, LeadScoreBadge } from "@/components/lead-score-badge"

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
  claimed_by: string | null
  claimed_by_name: string | null
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

// Current agent ID — in production from Clerk/auth
const CURRENT_AGENT_ID = "demo-agent-self"
const CURRENT_AGENT_NAME = "Ahmed Hassan"

function LinkedOwnerSection({ phone, name, area }: { phone: string; name: string; area: string | null }) {
  const [owner, setOwner] = useState<{ id: string; name: string; status: string; area: string; follow_up_at: string | null } | null>(null)
  const [searching, setSearching] = useState(true)

  useEffect(() => {
    if (!phone) { setSearching(false); return }
    fetch(`/api/owners?search=${encodeURIComponent(phone)}&limit=1`)
      .then((r) => r.json())
      .then((data) => {
        if (data.owners?.length > 0) setOwner(data.owners[0])
      })
      .catch(() => {})
      .finally(() => setSearching(false))
  }, [phone])

  if (searching) return null

  return (
    <div className="rounded-xl border p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-[#4B8EDB]" />
        <h3 className="text-sm font-bold">Owner Database Link</h3>
      </div>
      {owner ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Link2 className="h-3 w-3 text-emerald-500" />
              {owner.name}
            </p>
            <p className="text-xs text-muted-foreground">{owner.area} · {owner.status}</p>
          </div>
          <a
            href="/app/data"
            className="text-xs text-[#4B8EDB] hover:underline"
          >
            View in Data →
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">No matching owner found in database</p>
          <a
            href={`/app/data?prefillName=${encodeURIComponent(name)}&prefillPhone=${encodeURIComponent(phone)}&prefillArea=${encodeURIComponent(area || "")}`}
            className="text-xs text-[#4B8EDB] hover:underline"
          >
            + Add to Data
          </a>
        </div>
      )}
    </div>
  )
}

export default function LeadsPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [newLead, setNewLead] = useState({
    full_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    type: "buy" as OpportunityType,
    area: "",
    property_type: "",
    bedrooms: "",
    notes: "",
    price: "",
  })
  const { isInternal, isAdmin } = useRole()

  // Mask contact info — non-internal users only see phone
  const maskEmail = (email: string) => {
    const [user, domain] = email.split("@")
    return `${user.charAt(0)}***@${domain}`
  }
  const maskWhatsApp = (wa: string) => {
    return wa.replace(/(\d{3})\d{4,}(\d{3})/, "$1****$2")
  }
  const canSeeFullContact = isInternal

  // Claim a lead
  const claimLead = (id: string) => {
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === id
          ? {
              ...opp,
              claimed_by: CURRENT_AGENT_ID,
              claimed_by_name: CURRENT_AGENT_NAME,
              status: opp.status === "new" ? "contacted" : opp.status,
            }
          : opp
      )
    )
    if (selectedOpp?.id === id) {
      setSelectedOpp((prev) =>
        prev ? { ...prev, claimed_by: CURRENT_AGENT_ID, claimed_by_name: CURRENT_AGENT_NAME, status: prev.status === "new" ? "contacted" : prev.status } : null
      )
    }
    toast.success("Lead claimed!", { description: "You are now the assigned agent for this lead." })
  }

  const unclaimLead = (id: string) => {
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === id ? { ...opp, claimed_by: null, claimed_by_name: null } : opp
      )
    )
    if (selectedOpp?.id === id) {
      setSelectedOpp((prev) => prev ? { ...prev, claimed_by: null, claimed_by_name: null } : null)
    }
    toast.info("Lead released.")
  }

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

  const handleAddLead = () => {
    if (!newLead.full_name || !newLead.phone) {
      toast.error("Name and phone are required")
      return
    }
    const lead: Opportunity = {
      id: `manual-${Date.now()}`,
      type: newLead.type,
      status: "new",
      full_name: newLead.full_name,
      email: newLead.email,
      phone: newLead.phone,
      whatsapp: newLead.whatsapp || null,
      preferred_contact: "phone",
      area: newLead.area || null,
      sub_area: null,
      unit_number: null,
      property_type: newLead.property_type || null,
      bedrooms: newLead.bedrooms ? Number(newLead.bedrooms) : null,
      bathrooms: null,
      size: null,
      price: newLead.price ? Number(newLead.price) : null,
      price_type: null,
      min_price: null,
      max_price: null,
      features: [],
      notes: newLead.notes || null,
      ai_price_summary: null,
      market_comparison_pct: null,
      assigned_agent_id: CURRENT_AGENT_ID,
      assigned_agent_name: CURRENT_AGENT_NAME,
      agent_notes: null,
      claimed_by: CURRENT_AGENT_ID,
      claimed_by_name: CURRENT_AGENT_NAME,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setOpportunities((prev) => [lead, ...prev])
    setNewLead({ full_name: "", email: "", phone: "", whatsapp: "", type: "buy", area: "", property_type: "", bedrooms: "", notes: "", price: "" })
    setAddLeadOpen(false)
    toast.success("Lead added", { description: `${lead.full_name} added to your pipeline.` })
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
    <div className="flex-1 space-y-4 p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads Pipeline</h1>
          <p className="text-muted-foreground">
            Manage incoming opportunities from customers. Contact, match, and close deals.
          </p>
        </div>
        {isInternal && (
          <button
            onClick={() => setAddLeadOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </button>
        )}
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Agent</th>
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
                            <p className="text-xs text-muted-foreground">
                              {canSeeFullContact ? opp.email : maskEmail(opp.email)}
                            </p>
                            {!canSeeFullContact && (
                              <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5">
                                <EyeOff className="h-2.5 w-2.5" /> Contact locked
                              </p>
                            )}
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
                      <td className="px-4 py-3">
                        <LeadScoreInline opportunity={opp} />
                      </td>
                      {/* Agent / Claim */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {opp.claimed_by ? (
                          <div className="flex items-center gap-1.5">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-xs font-medium">{opp.claimed_by_name}</span>
                            {(opp.claimed_by === CURRENT_AGENT_ID || isAdmin) && (
                              <button
                                onClick={() => unclaimLead(opp.id)}
                                className="ml-1 text-[10px] text-muted-foreground hover:text-destructive underline"
                              >
                                release
                              </button>
                            )}
                          </div>
                        ) : isInternal ? (
                          <button
                            onClick={() => claimLead(opp.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            <HandMetal className="h-3 w-3" />
                            Claim
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unclaimed</span>
                        )}
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
                          {canSeeFullContact && opp.whatsapp && (
                            <a href={`https://wa.me/${opp.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center" title="WhatsApp">
                              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                            </a>
                          )}
                          {canSeeFullContact && (
                            <a href={`mailto:${opp.email}`} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center" title="Email">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            </a>
                          )}
                          {!canSeeFullContact && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Phone only
                            </span>
                          )}
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

              {/* Lead Score */}
              <div className="rounded-xl border p-4 space-y-2">
                <h3 className="text-sm font-bold">Lead Score</h3>
                <LeadScoreBadge opportunity={selectedOpp} showInsights />
              </div>

              {/* Claim section */}
              {isInternal && (
                <div className="rounded-xl border p-4 space-y-2">
                  <h3 className="text-sm font-bold">Assigned Agent</h3>
                  {selectedOpp.claimed_by ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{selectedOpp.claimed_by_name}</p>
                          <p className="text-xs text-muted-foreground">Claimed agent</p>
                        </div>
                      </div>
                      {(selectedOpp.claimed_by === CURRENT_AGENT_ID || isAdmin) && (
                        <button
                          onClick={() => unclaimLead(selectedOpp.id)}
                          className="text-xs text-muted-foreground hover:text-destructive underline"
                        >
                          Release
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => claimLead(selectedOpp.id)}
                      className="w-full h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <HandMetal className="h-4 w-4" />
                      Claim This Lead
                    </button>
                  )}
                </div>
              )}

              {/* Contact info */}
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Contact Information</h3>
                  {!canSeeFullContact && (
                    <span className="text-[10px] text-amber-600 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10">
                      <Lock className="h-2.5 w-2.5" /> Restricted
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedOpp.phone}`} className="hover:underline">{selectedOpp.phone}</a>
                  </div>
                  {selectedOpp.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      {canSeeFullContact ? (
                        <a href={`https://wa.me/${selectedOpp.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{selectedOpp.whatsapp}</a>
                      ) : (
                        <span className="text-muted-foreground">{maskWhatsApp(selectedOpp.whatsapp)}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {canSeeFullContact ? (
                      <a href={`mailto:${selectedOpp.email}`} className="hover:underline">{selectedOpp.email}</a>
                    ) : (
                      <span className="text-muted-foreground">{maskEmail(selectedOpp.email)}</span>
                    )}
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

              {/* Linked Owner from Data Tab */}
              {isInternal && (
                <LinkedOwnerSection phone={selectedOpp.phone} name={selectedOpp.full_name} area={selectedOpp.area} />
              )}

              {/* Quick actions */}
              <div className="flex gap-2">
                <a
                  href={`tel:${selectedOpp.phone}`}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
                {canSeeFullContact && selectedOpp.whatsapp && (
                  <a
                    href={`https://wa.me/${selectedOpp.whatsapp.replace(/\s+/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center gap-2 text-sm font-medium hover:bg-emerald-500 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                {canSeeFullContact && (
                  <a
                    href={`mailto:${selectedOpp.email}`}
                    className="flex-1 h-10 rounded-lg border flex items-center justify-center gap-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Mail className="h-4 w-4" /> Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Dialog */}
      {addLeadOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setAddLeadOpen(false)}>
          <div
            className="w-full max-w-lg bg-background rounded-xl shadow-xl overflow-y-auto max-h-[85vh] animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Add Manual Lead</h2>
                <button onClick={() => setAddLeadOpen(false)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">Full Name *</label>
                    <input
                      value={newLead.full_name}
                      onChange={(e) => setNewLead({ ...newLead, full_name: e.target.value })}
                      placeholder="John Smith"
                      className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">Phone *</label>
                    <input
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      placeholder="+971 50 123 4567"
                      className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      placeholder="john@example.com"
                      className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">WhatsApp</label>
                    <input
                      value={newLead.whatsapp}
                      onChange={(e) => setNewLead({ ...newLead, whatsapp: e.target.value })}
                      placeholder="+971 50 123 4567"
                      className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-sm font-medium">Lead Type</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {(Object.entries(typeConfig) as [OpportunityType, typeof typeConfig.buy][]).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <button
                          key={key}
                          onClick={() => setNewLead({ ...newLead, type: key })}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                            newLead.type === key
                              ? config.bg + " " + config.color + " border-current"
                              : "border-border hover:bg-muted"
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">Area</label>
                    <input
                      value={newLead.area}
                      onChange={(e) => setNewLead({ ...newLead, area: e.target.value })}
                      placeholder="Dubai Marina"
                      className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">Property Type</label>
                    <input
                      value={newLead.property_type}
                      onChange={(e) => setNewLead({ ...newLead, property_type: e.target.value })}
                      placeholder="Villa"
                      className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <input
                      type="number"
                      value={newLead.bedrooms}
                      onChange={(e) => setNewLead({ ...newLead, bedrooms: e.target.value })}
                      placeholder="3"
                      className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-sm font-medium">Budget (AED)</label>
                  <input
                    type="number"
                    value={newLead.price}
                    onChange={(e) => setNewLead({ ...newLead, price: e.target.value })}
                    placeholder="5000000"
                    className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    placeholder="Additional details about this lead..."
                    rows={3}
                    className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setAddLeadOpen(false)}
                  className="h-10 px-4 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLead}
                  className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Add Lead
                </button>
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
    claimed_by: null,
    claimed_by_name: null,
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
    claimed_by: "demo-agent-1",
    claimed_by_name: "Ahmed Hassan",
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
    claimed_by: null,
    claimed_by_name: null,
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
    claimed_by: "demo-agent-4",
    claimed_by_name: "Maria Santos",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-5",
    type: "buy",
    status: "new",
    full_name: "James Thornton",
    email: "james.t@finance.co.uk",
    phone: "+971 50 888 9012",
    whatsapp: "+971508889012",
    preferred_contact: "whatsapp",
    area: "Palm Jumeirah",
    sub_area: "Frond N",
    unit_number: null,
    property_type: "Villa",
    bedrooms: 6,
    bathrooms: 7,
    size: 12000,
    price: 35000000,
    price_type: "fixed",
    min_price: null,
    max_price: null,
    features: ["Private Beach", "Private Pool", "Sea View", "Smart Home", "Private Elevator"],
    notes: "UHNW client. Cash buyer. Must be signature villa with private beach. No timeline pressure but wants exclusivity.",
    ai_price_summary: "Your budget is well within the premium range for 6BR signature villas on Palm Jumeirah (avg AED 38,000,000). Strong buyer position — multiple options available. Priority matching engaged.",
    market_comparison_pct: -7.9,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-6",
    type: "rent",
    status: "new",
    full_name: "Priya Sharma",
    email: "priya.s@techstartup.io",
    phone: "+971 52 333 4455",
    whatsapp: "+971523334455",
    preferred_contact: "whatsapp",
    area: "Business Bay",
    sub_area: "Executive Towers",
    unit_number: null,
    property_type: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    size: 850,
    price: null,
    price_type: "range",
    min_price: 65000,
    max_price: 85000,
    features: ["Gym", "Balcony", "Furnished"],
    notes: "Tech professional, just moved from Bangalore. Needs furnished, close to metro. 4 cheques preferred.",
    ai_price_summary: "Your budget range is aligned with current market rates for 1BR furnished apartments in Business Bay (avg AED 75,000/yr). Multiple matches expected within 48 hours.",
    market_comparison_pct: 2.5,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-7",
    type: "sell",
    status: "new",
    full_name: "Khalid bin Fahad",
    email: "khalid.f@gmail.com",
    phone: "+971 55 222 3344",
    whatsapp: "+971552223344",
    preferred_contact: "phone",
    area: "Emirates Hills",
    sub_area: "Sector W",
    unit_number: "EH-W-47",
    property_type: "Villa",
    bedrooms: 7,
    bathrooms: 8,
    size: 15000,
    price: 42000000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Golf View", "Private Pool", "Garden", "Smart Home", "Maid's Room", "Driver's Room", "Upgraded"],
    notes: "Inherited property. Wants quick sale. Open to reasonable offers. Currently vacant.",
    ai_price_summary: "Your asking price is 5.3% below the average for a 7BR villa in Emirates Hills (avg AED 44,350,000). Competitive pricing should attract buyers quickly. Recommend professional photography.",
    market_comparison_pct: -5.3,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-8",
    type: "buy",
    status: "contacted",
    full_name: "David & Emma Clarke",
    email: "emma.clarke@outlook.com",
    phone: "+971 58 777 8899",
    whatsapp: "+971587778899",
    preferred_contact: "email",
    area: "Arabian Ranches",
    sub_area: "Savannah",
    unit_number: null,
    property_type: "Townhouse",
    bedrooms: 4,
    bathrooms: 4,
    size: 3200,
    price: null,
    price_type: "range",
    min_price: 3500000,
    max_price: 5000000,
    features: ["Garden", "Pet Friendly", "Parking x2", "Community Pool"],
    notes: "British expat family. 3 kids, golden retriever. Need community with schools and parks. Currently renting in JLT.",
    ai_price_summary: "Budget range covers 65% of available 4BR townhouses in Arabian Ranches. Savannah and Sun communities have the most options. School proximity: JESS Arabian Ranches (2 min drive).",
    market_comparison_pct: -3.1,
    assigned_agent_id: "demo-agent-self",
    assigned_agent_name: "Ahmed Hassan",
    agent_notes: null,
    claimed_by: "demo-agent-self",
    claimed_by_name: "Ahmed Hassan",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-9",
    type: "lease",
    status: "matched",
    full_name: "Tanaka Yuki",
    email: "tanaka@jpmorgan.com",
    phone: "+971 50 555 6677",
    whatsapp: null,
    preferred_contact: "email",
    area: "DIFC",
    sub_area: "Gate Village",
    unit_number: null,
    property_type: "Office",
    bedrooms: 0,
    bathrooms: 2,
    size: 3500,
    price: 650000,
    price_type: "fixed",
    min_price: null,
    max_price: null,
    features: ["Fitted", "Partitioned", "Reception"],
    notes: "Japanese bank expanding MENA ops. Need Grade A office in DIFC. 3-year lease minimum. Brand-new fit-out required.",
    ai_price_summary: "AED 650K/yr for 3,500 sqft in DIFC Gate Village is approximately AED 186/sqft — 4% below average for Grade A (AED 194/sqft). Competitive offer. 3 matching units currently available.",
    market_comparison_pct: -4.0,
    assigned_agent_id: "demo-agent-2",
    assigned_agent_name: "Sara Al Maktoum",
    agent_notes: null,
    claimed_by: "demo-agent-2",
    claimed_by_name: "Sara Al Maktoum",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-10",
    type: "buy",
    status: "in_progress",
    full_name: "Viktor Sorokin",
    email: "viktor.s@protonmail.com",
    phone: "+971 56 444 5566",
    whatsapp: "+971564445566",
    preferred_contact: "whatsapp",
    area: "Palm Jumeirah",
    sub_area: "Atlantis The Royal Residences",
    unit_number: null,
    property_type: "Penthouse",
    bedrooms: 5,
    bathrooms: 6,
    size: 10000,
    price: 75000000,
    price_type: "fixed",
    min_price: null,
    max_price: null,
    features: ["Sea View", "Private Pool", "Private Elevator", "Concierge", "Furnished"],
    notes: "VIP — NDA required before viewings. Only interested in super-prime units. No financial constraints. Wants to close within 60 days.",
    ai_price_summary: "Ultra-prime penthouse segment on Palm Jumeirah. Only 4 units currently available in this price range. Atlantis The Royal Residences has 2 matching units. Recommend immediate private viewing.",
    market_comparison_pct: 0,
    assigned_agent_id: "demo-agent-self",
    assigned_agent_name: "Ahmed Hassan",
    agent_notes: null,
    claimed_by: "demo-agent-self",
    claimed_by_name: "Ahmed Hassan",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-11",
    type: "rent",
    status: "contacted",
    full_name: "Amira El-Sayed",
    email: "amira.e@deloitte.com",
    phone: "+971 52 999 0011",
    whatsapp: "+971529990011",
    preferred_contact: "whatsapp",
    area: "Downtown Dubai",
    sub_area: "Boulevard Point",
    unit_number: null,
    property_type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    size: 1600,
    price: 180000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Burj Khalifa View", "Furnished", "Gym", "Concierge"],
    notes: "Senior consultant at Deloitte. Company pays rent. Wants Burj Khalifa view, no exceptions. Available from April 1.",
    ai_price_summary: "AED 180K/yr for a 2BR with Burj Khalifa view in Downtown is 8% above average (AED 167K). However, direct Burj view units command a 15-20% premium. Budget is realistic for full fountain view.",
    market_comparison_pct: 8.0,
    assigned_agent_id: "demo-agent-3",
    assigned_agent_name: "Omar Khalil",
    agent_notes: null,
    claimed_by: "demo-agent-3",
    claimed_by_name: "Omar Khalil",
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-12",
    type: "buy",
    status: "new",
    full_name: "Robert & Lisa Martinez",
    email: "martinez.r@gmail.com",
    phone: "+971 50 666 7788",
    whatsapp: "+971506667788",
    preferred_contact: "phone",
    area: "Dubai Hills Estate",
    sub_area: "Maple",
    unit_number: null,
    property_type: "Townhouse",
    bedrooms: 3,
    bathrooms: 3,
    size: 2400,
    price: null,
    price_type: "range",
    min_price: 3000000,
    max_price: 4200000,
    features: ["Garden", "Parking x2", "Community Pool", "Pet Friendly"],
    notes: "American couple, early retirees. Want community feel, walking trails, close to Dubai Hills Mall. Cash buyers.",
    ai_price_summary: "Budget is well-positioned for 3BR townhouses in Dubai Hills Maple (avg AED 3,600,000). 8 active listings match criteria. Cash buyer status gives strong negotiation leverage.",
    market_comparison_pct: 1.2,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-13",
    type: "sell",
    status: "in_progress",
    full_name: "Fatima Al Zaabi",
    email: "fatima.z@adnoc.ae",
    phone: "+971 55 111 2233",
    whatsapp: "+971551112233",
    preferred_contact: "phone",
    area: "Al Barari",
    sub_area: "The Nest",
    unit_number: "B2-14",
    property_type: "Villa",
    bedrooms: 6,
    bathrooms: 7,
    size: 9800,
    price: 18500000,
    price_type: "firm",
    min_price: null,
    max_price: null,
    features: ["Private Pool", "Garden", "Smart Home", "Upgraded", "Maid's Room", "Study Room"],
    notes: "Relocating to Abu Dhabi. Wants to sell by end of Q2. Villa is in pristine condition with custom Italian interiors. Currently has a tenant (lease ends May).",
    ai_price_summary: "AED 18.5M for a 6BR in Al Barari The Nest is 3.5% above recent transactions (avg AED 17.9M). Justified by premium upgrades. Recommend staging photos post-tenant departure for optimal marketing.",
    market_comparison_pct: 3.5,
    assigned_agent_id: "demo-agent-self",
    assigned_agent_name: "Ahmed Hassan",
    agent_notes: null,
    claimed_by: "demo-agent-self",
    claimed_by_name: "Ahmed Hassan",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-14",
    type: "rent",
    status: "new",
    full_name: "Sophie Laurent",
    email: "sophie.l@lvmh.com",
    phone: "+971 58 222 3344",
    whatsapp: "+971582223344",
    preferred_contact: "email",
    area: "City Walk",
    sub_area: null,
    unit_number: null,
    property_type: "Apartment",
    bedrooms: 3,
    bathrooms: 3,
    size: 2800,
    price: 320000,
    price_type: "fixed",
    min_price: null,
    max_price: null,
    features: ["Terrace", "Walk-in Closet", "Concierge", "Furnished"],
    notes: "French expat, LVMH executive. Needs luxury living, walkable neighborhood, high-end finishes. Has small dog. Arriving March 20.",
    ai_price_summary: null,
    market_comparison_pct: null,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-15",
    type: "buy",
    status: "matched",
    full_name: "Ahmad & Noor Kassem",
    email: "ahmad.k@hotmail.com",
    phone: "+971 50 444 5566",
    whatsapp: "+971504445566",
    preferred_contact: "whatsapp",
    area: "Jumeirah Golf Estates",
    sub_area: "Earth Course",
    unit_number: null,
    property_type: "Villa",
    bedrooms: 5,
    bathrooms: 5,
    size: 6500,
    price: 12000000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Golf View", "Private Pool", "Garden", "Maid's Room", "Driver's Room"],
    notes: "Lebanese family. Want golf course views. Have been looking for 3 months. Pre-approved mortgage with ENBD. Ready to move fast on the right property.",
    ai_price_summary: "AED 12M for 5BR on Earth Course is aligned with market (avg AED 11.8M). 2 matching villas identified — one with direct fairway view. Mortgage pre-approval strengthens position. Viewing recommended.",
    market_comparison_pct: 1.7,
    assigned_agent_id: "demo-agent-2",
    assigned_agent_name: "Sara Al Maktoum",
    agent_notes: null,
    claimed_by: "demo-agent-2",
    claimed_by_name: "Sara Al Maktoum",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-16",
    type: "relocation",
    status: "new",
    full_name: "Thomas & Ingrid Müller",
    email: "thomas.m@siemens.de",
    phone: "+971 56 888 9900",
    whatsapp: "+971568889900",
    preferred_contact: "email",
    area: "Arabian Ranches",
    sub_area: null,
    unit_number: null,
    property_type: "Villa",
    bedrooms: 4,
    bathrooms: 4,
    size: 3500,
    price: null,
    price_type: "range",
    min_price: 200000,
    max_price: 280000,
    features: ["Garden", "Community Pool", "Pet Friendly", "Parking x2"],
    notes: "German family relocating for Siemens. 2 teenagers, need GEMS or similar school nearby. Want safe gated community. Arriving April 15. Company provides housing allowance.",
    ai_price_summary: null,
    market_comparison_pct: null,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  // ── INCOMING — just arrived ──
  {
    id: "demo-17",
    type: "buy",
    status: "new",
    full_name: "Alexander Novikov",
    email: "alex.nov@yandex.ru",
    phone: "+971 50 321 0099",
    whatsapp: "+971503210099",
    preferred_contact: "whatsapp",
    area: "Dubai Marina",
    sub_area: "Marina Gate",
    unit_number: null,
    property_type: "Penthouse",
    bedrooms: 4,
    bathrooms: 5,
    size: 5500,
    price: 18000000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Sea View", "Private Pool", "Private Elevator", "Smart Home", "Terrace"],
    notes: "Russian tech entrepreneur. Cash buyer. Wants full marina + sea view penthouse. Currently staying at Address Marina. Available for viewings today.",
    ai_price_summary: "AED 18M for a 4BR penthouse in Marina Gate is competitive — recent transactions range AED 16-22M depending on floor and view. 3 units currently match criteria. Recommend same-day viewing.",
    market_comparison_pct: -2.1,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-18",
    type: "rent",
    status: "new",
    full_name: "Olivia & Mark Bennett",
    email: "olivia.bennett@hsbc.com",
    phone: "+971 55 100 2030",
    whatsapp: "+971551002030",
    preferred_contact: "phone",
    area: "Jumeirah",
    sub_area: "Jumeirah 1",
    unit_number: null,
    property_type: "Villa",
    bedrooms: 5,
    bathrooms: 5,
    size: 6000,
    price: 450000,
    price_type: "range",
    min_price: 380000,
    max_price: 480000,
    features: ["Private Pool", "Garden", "Pet Friendly", "Maid's Room", "Beach Access"],
    notes: "HSBC senior VP relocating from Hong Kong with family. 3 children + nanny. Need proximity to international school (preferably Dubai College). 2 dogs. Arriving in 2 weeks — urgent.",
    ai_price_summary: null,
    market_comparison_pct: null,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-19",
    type: "buy",
    status: "new",
    full_name: "Rashid Al Ketbi",
    email: "rashid.k@adgm.ae",
    phone: "+971 56 700 8800",
    whatsapp: "+971567008800",
    preferred_contact: "whatsapp",
    area: "Palm Jumeirah",
    sub_area: "Frond G",
    unit_number: null,
    property_type: "Villa",
    bedrooms: 5,
    bathrooms: 6,
    size: 8000,
    price: null,
    price_type: "range",
    min_price: 20000000,
    max_price: 30000000,
    features: ["Private Beach", "Private Pool", "Sea View", "Upgraded", "Smart Home"],
    notes: "Emirati national. Investment + personal use. Wants garden home or signature villa on trunk or frond. No mortgage needed. Has 2 other properties in Abu Dhabi.",
    ai_price_summary: "Budget range of AED 20-30M covers garden homes and select signature villas on Palm Jumeirah. 7 active listings match. Frond G has 2 available units. Market trending upward — recommend acting within 30 days.",
    market_comparison_pct: 0,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-20",
    type: "sell",
    status: "new",
    full_name: "Isabella Rossi",
    email: "isabella.r@gmail.com",
    phone: "+971 52 600 7700",
    whatsapp: "+971526007700",
    preferred_contact: "whatsapp",
    area: "Downtown Dubai",
    sub_area: "Opera Grand",
    unit_number: "2305",
    property_type: "Apartment",
    bedrooms: 3,
    bathrooms: 4,
    size: 2200,
    price: 5800000,
    price_type: "firm",
    min_price: null,
    max_price: null,
    features: ["Burj Khalifa View", "Balcony", "Walk-in Closet", "Concierge", "Gym"],
    notes: "Italian owner returning to Milan. Must sell within 45 days. Unit is vacant and in excellent condition. Has original floor plan from Emaar. No agents contacted yet — exclusive opportunity.",
    ai_price_summary: "AED 5.8M for a 3BR in Opera Grand is 6% above recent comps (avg AED 5.47M). Burj view premium justified. Strong demand in this building — average days on market: 23 days. Exclusive listing potential.",
    market_comparison_pct: 6.0,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-21",
    type: "rent",
    status: "new",
    full_name: "Yusuf & Layla Hassan",
    email: "yusuf.h@mckinsey.com",
    phone: "+971 58 300 4400",
    whatsapp: "+971583004400",
    preferred_contact: "email",
    area: "Dubai Hills Estate",
    sub_area: "Sidra",
    unit_number: null,
    property_type: "Villa",
    bedrooms: 4,
    bathrooms: 4,
    size: 3800,
    price: 320000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Garden", "Community Pool", "Parking x2", "Maid's Room", "Study Room"],
    notes: "McKinsey partner. Egyptian-American couple. 2 young kids. Need Sidra or Maple — close to park and school. Available April 1. Willing to pay premium for right villa. 1 cheque.",
    ai_price_summary: "AED 320K/yr for a 4BR Sidra villa is at market rate (avg AED 310K). 1-cheque payment gives strong leverage. 5 villas available matching criteria — recommend scheduling 3 viewings this week.",
    market_comparison_pct: 3.2,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-22",
    type: "buy",
    status: "new",
    full_name: "George & Catherine Whitfield",
    email: "g.whitfield@barclays.co.uk",
    phone: "+971 50 900 1122",
    whatsapp: "+971509001122",
    preferred_contact: "phone",
    area: "Tilal Al Ghaf",
    sub_area: "Elan",
    unit_number: null,
    property_type: "Villa",
    bedrooms: 5,
    bathrooms: 6,
    size: 5000,
    price: null,
    price_type: "range",
    min_price: 7000000,
    max_price: 9500000,
    features: ["Lagoon View", "Private Pool", "Garden", "Smart Home", "Pet Friendly"],
    notes: "British banker, been in Dubai 8 years. Currently renting in Jumeirah Park. Wants to buy in Tilal Al Ghaf — lagoon-facing Elan or Harmony. Pre-approved with Mashreq for AED 7M. Cash for remainder.",
    ai_price_summary: "Budget range covers most 5BR villas in Elan (avg AED 8.2M). Lagoon-facing units command 10-15% premium. 4 matching units available. Mortgage pre-approval + cash top-up is a strong position.",
    market_comparison_pct: 1.5,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-23",
    type: "buy",
    status: "new",
    full_name: "Aisha Al Mansoori",
    email: "aisha.m@emirates.com",
    phone: "+971 55 800 9900",
    whatsapp: "+971558009900",
    preferred_contact: "phone",
    area: "Dubai Creek Harbour",
    sub_area: "Creek Palace",
    unit_number: null,
    property_type: "Apartment",
    bedrooms: 3,
    bathrooms: 3,
    size: 2300,
    price: 4500000,
    price_type: "fixed",
    min_price: null,
    max_price: null,
    features: ["Creek View", "Balcony", "Gym", "Concierge", "Built-in Wardrobes"],
    notes: "Emirates cabin crew manager. First-time buyer. Wants Creek view in Creek Palace or Harbour Gate. Cash purchase. Needs handover-ready unit — no off-plan.",
    ai_price_summary: "AED 4.5M for 3BR in Creek Palace aligns with market (avg AED 4.3M). Creek-view units sell fast — average 18 days on market. 2 ready units match criteria. Recommend viewing within 48 hours.",
    market_comparison_pct: 4.7,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-24",
    type: "rent",
    status: "new",
    full_name: "Pierre Dupont",
    email: "pierre.d@totalenergies.com",
    phone: "+971 56 200 3300",
    whatsapp: "+971562003300",
    preferred_contact: "whatsapp",
    area: "JBR",
    sub_area: "Shams",
    unit_number: null,
    property_type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    size: 1500,
    price: 160000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Sea View", "Furnished", "Beach Access", "Gym", "Balcony"],
    notes: "French oil & gas executive. Single. Wants beachfront living in JBR — Shams or Rimal preferred. Fully furnished mandatory. Company pays rent. 1 cheque. Start date: immediately.",
    ai_price_summary: null,
    market_comparison_pct: null,
    assigned_agent_id: null,
    assigned_agent_name: null,
    agent_notes: null,
    claimed_by: null,
    claimed_by_name: null,
    created_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
  },
  // ── Demo user (Ahmed Hassan) leads ──
  {
    id: "demo-25",
    type: "buy",
    status: "contacted",
    full_name: "Hana Al Suwaidi",
    email: "hana.s@adnoc.ae",
    phone: "+971 50 111 4455",
    whatsapp: "+971501114455",
    preferred_contact: "whatsapp",
    area: "Mohammed Bin Rashid City",
    sub_area: "District One",
    unit_number: null,
    property_type: "Villa",
    bedrooms: 6,
    bathrooms: 7,
    size: 10000,
    price: 28000000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Crystal Lagoon", "Private Pool", "Garden", "Maid's Room", "Smart Home"],
    notes: "Emirati VIP client. Cash buyer. Wants District One mansion with lagoon access. Viewed 2 properties already — shortlisted. Follow up with new Crystal Lagoon listings.",
    ai_price_summary: "AED 28M for a 6BR mansion in District One is 5% below avg (AED 29.5M). Strong buyer position. 3 new lagoon mansions just listed this week. Recommend priority viewing.",
    market_comparison_pct: -5.1,
    assigned_agent_id: "demo-agent-self",
    assigned_agent_name: "Ahmed Hassan",
    agent_notes: "Client very responsive. Prefers evening viewings after 6pm.",
    claimed_by: "demo-agent-self",
    claimed_by_name: "Ahmed Hassan",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-26",
    type: "rent",
    status: "in_progress",
    full_name: "Marcus & Jade Wong",
    email: "marcus.wong@goldmansachs.com",
    phone: "+971 55 300 6677",
    whatsapp: "+971553006677",
    preferred_contact: "email",
    area: "DIFC",
    sub_area: "Limestone House",
    unit_number: null,
    property_type: "Apartment",
    bedrooms: 3,
    bathrooms: 3,
    size: 2400,
    price: 280000,
    price_type: "fixed",
    min_price: null,
    max_price: null,
    features: ["DIFC View", "Furnished", "Concierge", "Gym", "Walk-in Closet"],
    notes: "Goldman Sachs MD relocating from Singapore. Company pays rent. Need DIFC or Downtown — walkable to office. 2 kids starting at Repton. Arriving March 25 — URGENT.",
    ai_price_summary: "AED 280K/yr for 3BR in DIFC is at premium (avg AED 250K). Limestone House and Index Tower have matching units. Corporate tenant profile is strong — landlords prefer.",
    market_comparison_pct: 12.0,
    assigned_agent_id: "demo-agent-self",
    assigned_agent_name: "Ahmed Hassan",
    agent_notes: "Scheduled 3 viewings for Saturday. Wife joining via video call.",
    claimed_by: "demo-agent-self",
    claimed_by_name: "Ahmed Hassan",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-27",
    type: "sell",
    status: "contacted",
    full_name: "Nadia Khoury",
    email: "nadia.k@outlook.com",
    phone: "+971 52 400 5566",
    whatsapp: "+971524005566",
    preferred_contact: "phone",
    area: "Jumeirah Beach Residence",
    sub_area: "Sadaf",
    unit_number: "1804",
    property_type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    size: 1450,
    price: 3200000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Sea View", "Furnished", "Beach Access", "Gym", "Balcony"],
    notes: "Lebanese expat leaving Dubai. Wants quick sale. Unit is fully furnished, high floor with full sea view. Tenant vacating end of March. Open to offers above 3M.",
    ai_price_summary: "AED 3.2M for 2BR sea-view in Sadaf is 7% above avg (AED 2.99M). Sea-view premium justified. Recent Sadaf sales: AED 3.1M (floor 15) and AED 3.3M (floor 20). Fair pricing.",
    market_comparison_pct: 7.0,
    assigned_agent_id: "demo-agent-self",
    assigned_agent_name: "Ahmed Hassan",
    agent_notes: "Photography scheduled for April 1 after tenant moves out.",
    claimed_by: "demo-agent-self",
    claimed_by_name: "Ahmed Hassan",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-28",
    type: "buy",
    status: "matched",
    full_name: "Tariq & Salma Ibrahim",
    email: "tariq.ibrahim@emirates.com",
    phone: "+971 50 700 8899",
    whatsapp: "+971507008899",
    preferred_contact: "whatsapp",
    area: "Dubai Hills Estate",
    sub_area: "Fairway Villas",
    unit_number: null,
    property_type: "Villa",
    bedrooms: 5,
    bathrooms: 5,
    size: 4500,
    price: 9800000,
    price_type: "negotiable",
    min_price: null,
    max_price: null,
    features: ["Golf View", "Private Pool", "Garden", "Maid's Room", "Study Room"],
    notes: "Emirates pilot. Pre-approved with ADCB. Found the perfect villa — golf view Fairway V3. Offer submitted at AED 9.5M. Waiting for seller counter-offer. Close to signing.",
    ai_price_summary: "AED 9.8M for 5BR Fairway Villa is aligned with market (avg AED 9.6M). Golf view adds 8% premium. Offer at AED 9.5M is competitive — 97% of ask. Expect counter at AED 9.65M.",
    market_comparison_pct: 2.1,
    assigned_agent_id: "demo-agent-self",
    assigned_agent_name: "Ahmed Hassan",
    agent_notes: "Seller expected to counter by Thursday. Client approved up to 9.7M.",
    claimed_by: "demo-agent-self",
    claimed_by_name: "Ahmed Hassan",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-29",
    type: "relocation",
    status: "in_progress",
    full_name: "Erik & Maja Lindström",
    email: "erik.l@spotify.com",
    phone: "+971 56 500 6677",
    whatsapp: "+971565006677",
    preferred_contact: "email",
    area: "Jumeirah Village Circle",
    sub_area: null,
    unit_number: null,
    property_type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    size: 1100,
    price: null,
    price_type: "range",
    min_price: 80000,
    max_price: 110000,
    features: ["Gym", "Balcony", "Furnished", "Pet Friendly"],
    notes: "Swedish couple, Spotify engineers. Remote workers. Need good internet, quiet neighborhood, pet-friendly (cat). Budget-conscious but want modern finishes. Moving April 1.",
    ai_price_summary: "Budget is well within JVC market (avg 2BR: AED 85K/yr). 12 matching furnished units available. Recommend Five at JVC or Belgravia for modern finishes. Pet policy varies — confirm per building.",
    market_comparison_pct: 5.0,
    assigned_agent_id: "demo-agent-self",
    assigned_agent_name: "Ahmed Hassan",
    agent_notes: "Sent 5 listings. They liked Belgravia 2. Viewing booked for Sunday.",
    claimed_by: "demo-agent-self",
    claimed_by_name: "Ahmed Hassan",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
]
