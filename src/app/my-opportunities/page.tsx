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
  ArrowRight,
  LogIn,
  Mail,
  Lock,
  User,
  X,
  Home,
  Sparkles,
  FileText,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

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
  buy: { label: "Buying", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  sell: { label: "Selling", icon: Tag, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  rent: { label: "Renting", icon: Key, color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  lease: { label: "Leasing", icon: Building, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  relocation: { label: "Relocation", icon: Globe, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
}

const statusConfig: Record<OpportunityStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  matched: { label: "Matched", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Sparkles },
  pending: { label: "Under Review", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  closed: { label: "Closed", color: "bg-neutral-100 text-neutral-500 border-neutral-200", icon: AlertCircle },
}

// Demo data for logged-in state
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

export default function MyOpportunitiesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [opportunities, setOpportunities] = useState<Opportunity[]>(demoOpportunities)
  const [filterType, setFilterType] = useState<OpportunityType | null>(null)
  const [filterStatus, setFilterStatus] = useState<OpportunityStatus | null>(null)
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleLogin = () => {
    setLoginLoading(true)
    // Simulate login
    setTimeout(() => {
      setIsLoggedIn(true)
      setLoginLoading(false)
    }, 800)
  }

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
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {!isLoggedIn ? (
        /* ==================== LOGIN SCREEN ==================== */
        <div className="pt-32 pb-24 px-4">
          <div className="mx-auto max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="mx-auto h-16 w-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-5">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome Back</h1>
              <p className="text-neutral-500">
                Log in to manage your opportunities, track matches, and stay updated.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-neutral-400" /> Email
                </label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full h-12 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-neutral-400" /> Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full h-12 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="w-full h-12 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loginLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Log In
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-neutral-400">or</span></div>
              </div>

              <p className="text-center text-sm text-neutral-500">
                Don&apos;t have an account?{" "}
                <Link href="/opportunity" className="font-semibold text-neutral-900 hover:underline">
                  Submit an opportunity
                </Link>{" "}
                first and we&apos;ll create one for you.
              </p>
            </motion.div>

            {/* AIDA micro-section below login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-10 space-y-4"
            >
              <h3 className="text-center text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                Why create an account?
              </h3>
              <div className="grid gap-3">
                {[
                  { icon: Eye, text: "Track your opportunity status in real-time" },
                  { icon: Edit3, text: "Update your requirements or pricing anytime" },
                  { icon: Sparkles, text: "Get notified when you're matched with a property" },
                  { icon: Plus, text: "Submit multiple opportunities from one dashboard" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="h-9 w-9 rounded-lg bg-neutral-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-neutral-500" />
                    </div>
                    <span className="text-sm text-neutral-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        /* ==================== DASHBOARD ==================== */
        <>
          {/* Header */}
          <section className="pt-28 pb-8 px-4 bg-white border-b border-neutral-200">
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">My Opportunities</h1>
                  <p className="text-neutral-500 text-sm mt-1">
                    {opportunities.length} total · {opportunities.filter((o) => o.status === "active" || o.status === "matched").length} active
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/opportunity"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> New Opportunity
                  </Link>
                  <Link
                    href="/off-plan"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors"
                  >
                    <Building className="h-4 w-4" /> Off-Plan
                  </Link>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 mt-6">
                <button
                  onClick={() => setFilterType(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    !filterType ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
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
                      filterType === key ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                    )}
                  >
                    {config.label}
                  </button>
                ))}
                <div className="w-px h-6 bg-neutral-200 mx-1 self-center" />
                {(Object.entries(statusConfig) as [OpportunityStatus, typeof statusConfig.active][]).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilterStatus(filterStatus === key ? null : key)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      filterStatus === key ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                    )}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Opportunity List */}
          <section className="py-8 px-4">
            <div className="mx-auto max-w-5xl">
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
                  <Search className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 mb-4">No opportunities match your filters.</p>
                  <button
                    onClick={() => { setFilterType(null); setFilterStatus(null) }}
                    className="text-sm font-medium text-neutral-900 underline"
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
                        className="bg-white rounded-2xl border border-neutral-200 hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <div className="p-5 sm:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 border", type.bg)}>
                                <TypeIcon className={cn("h-5 w-5", type.color)} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-base font-bold text-neutral-900">{type.label} — {opp.propertyType}</h3>
                                  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", status.color)}>
                                    <StatusIcon className="h-3 w-3" /> {status.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 text-sm text-neutral-500 flex-wrap">
                                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {opp.area}{opp.subArea ? ` · ${opp.subArea}` : ""}</span>
                                  <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {opp.bedrooms} BR</span>
                                  <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> AED {formatPrice(opp.price)}</span>
                                </div>
                                {opp.notes && (
                                  <p className="text-sm text-neutral-400 mt-2 line-clamp-1">{opp.notes}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {opp.matchCount > 0 && (
                                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                                  {opp.matchCount} match{opp.matchCount > 1 ? "es" : ""}
                                </span>
                              )}
                              <button
                                onClick={() => setSelectedOpp(opp)}
                                className="h-9 w-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <Link
                                href="/opportunity"
                                className="h-9 w-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => setDeleteConfirm(opp.id)}
                                className="h-9 w-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-400">
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
                              <div className="flex items-center justify-between px-5 py-3 bg-red-50 border-t border-red-200">
                                <span className="text-sm text-red-700">Delete this opportunity?</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:bg-white transition-colors"
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

              {/* Quick actions */}
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <Link
                  href="/opportunity"
                  className="flex items-center gap-4 p-5 rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-400 hover:bg-white transition-all group"
                >
                  <div className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                    <Plus className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div>
                    <span className="text-base font-semibold text-neutral-900 block">New Opportunity</span>
                    <span className="text-sm text-neutral-500">Buy, sell, rent, or lease</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-300 ml-auto" />
                </Link>
                <Link
                  href="/off-plan"
                  className="flex items-center gap-4 p-5 rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-400 hover:bg-white transition-all group"
                >
                  <div className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                    <Building className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div>
                    <span className="text-base font-semibold text-neutral-900 block">Browse Off-Plan</span>
                    <span className="text-sm text-neutral-500">AI-guided project search</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-300 ml-auto" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

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
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-white rounded-t-3xl overflow-y-auto md:inset-4 md:rounded-2xl md:max-h-none md:top-auto md:bottom-auto md:max-w-lg md:mx-auto"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900">Opportunity Details</h2>
                  <button onClick={() => setSelectedOpp(null)} className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-neutral-100 transition-colors">
                    <X className="h-5 w-5 text-neutral-500" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border", typeConfig[selectedOpp.type].bg)}>
                    {(() => { const Icon = typeConfig[selectedOpp.type].icon; return <Icon className={cn("h-5 w-5", typeConfig[selectedOpp.type].color)} /> })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">{typeConfig[selectedOpp.type].label} — {selectedOpp.propertyType}</h3>
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", statusConfig[selectedOpp.status].color)}>
                        {statusConfig[selectedOpp.status].label}
                      </span>
                      {selectedOpp.matchCount > 0 && (
                        <span className="text-xs text-blue-600 font-medium">{selectedOpp.matchCount} matches found</span>
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
                    <div key={item.label} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <item.icon className="h-4 w-4 text-neutral-400 mb-1" />
                      <span className="block text-xs text-neutral-500">{item.label}</span>
                      <span className="block text-sm font-semibold text-neutral-900">{item.value}</span>
                    </div>
                  ))}
                </div>

                {selectedOpp.notes && (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Notes</span>
                    <p className="text-sm text-neutral-700 mt-1">{selectedOpp.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-neutral-400 pt-2 border-t border-neutral-100">
                  <span>Created {new Date(selectedOpp.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                  {selectedOpp.updatedAt !== selectedOpp.createdAt && (
                    <span>· Updated {new Date(selectedOpp.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/opportunity"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" /> Edit Opportunity
                  </Link>
                  <button
                    onClick={() => { setDeleteConfirm(selectedOpp.id); setSelectedOpp(null) }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 text-neutral-500 hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
