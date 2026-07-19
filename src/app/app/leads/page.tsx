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
  matched: { label: "Matched", color: "text-[#1e3a5f]", bg: "bg-[#1e3a5f]/10 dark:bg-[#1e3a5f]/20", icon: CheckCircle2 },
  closed: { label: "Closed", color: "text-neutral-700", bg: "bg-neutral-100 dark:bg-neutral-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100 dark:bg-red-500/20", icon: XCircle },
}

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
        <Database className="h-4 w-4 text-[#2d5082]" />
        <h3 className="text-sm font-bold">Owner Database Link</h3>
      </div>
      {owner ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Link2 className="h-3 w-3 text-emerald-500" />
              {owner.name}
            </p>
            <p className="text-xs text-muted-foreground">{owner.area} Â· {owner.status}</p>
          </div>
          <a
            href="/app/data"
            className="text-xs text-[#1e3a5f] hover:underline"
          >
            View in Data â†’
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">No matching owner found in database</p>
          <a
            href={`/app/data?prefillName=${encodeURIComponent(name)}&prefillPhone=${encodeURIComponent(phone)}&prefillArea=${encodeURIComponent(area || "")}`}
            className="text-xs text-[#1e3a5f] hover:underline"
          >
            + Add to Data
          </a>
        </div>
      )}
    </div>
  )
}

export default function LeadsPage() {
  const { isInternal, isAdmin, userId, userName } = useRole()
  const agentId = userId || "unknown"
  const agentName = userName || "Agent"
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

  // Mask contact info â€” non-internal users only see phone
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
              claimed_by: agentId,
              claimed_by_name: agentName,
              status: opp.status === "new" ? "contacted" : opp.status,
            }
          : opp
      )
    )
    if (selectedOpp?.id === id) {
      setSelectedOpp((prev) =>
        prev ? { ...prev, claimed_by: agentId, claimed_by_name: agentName, status: prev.status === "new" ? "contacted" : prev.status } : null
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
      setOpportunities([])
      toast.error("Could not load leads")
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
      assigned_agent_id: agentId,
      assigned_agent_name: agentName,
      agent_notes: null,
      claimed_by: agentId,
      claimed_by_name: agentName,
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
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
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
          { label: "Matched", value: stats.matched, color: "text-[#2d5082]" },
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
                              Â· <Home className="h-3 w-3" /> {opp.property_type}
                            </span>
                          )}
                          {opp.bedrooms && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              Â· <Bed className="h-3 w-3" /> {opp.bedrooms}
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
                          <span className="text-muted-foreground">â€”</span>
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
                            {(opp.claimed_by === agentId || isAdmin) && (
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
                      {(selectedOpp.claimed_by === agentId || isAdmin) && (
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
                    <span className="font-medium">{selectedOpp.area}{selectedOpp.sub_area ? ` â€” ${selectedOpp.sub_area}` : ""}</span>
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
                    <span className="font-medium">AED {selectedOpp.min_price.toLocaleString()} â€“ {selectedOpp.max_price.toLocaleString()}</span>
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
                      {selectedOpp.market_comparison_pct > 0 ? "â†‘" : "â†“"} {Math.abs(selectedOpp.market_comparison_pct)}% vs market
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
