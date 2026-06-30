"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Home,
  Bed,
  Maximize2,
  ChevronDown,
  ChevronRight,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  BadgePercent,
  Clock,
  FileText,
  CreditCard,
  CheckCircle2,
  Phone,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

// Off-plan project data
interface OffPlanProject {
  id: string
  name: string
  developer: string
  area: string
  type: string
  status: "launching" | "under-construction" | "near-handover" | "sold-out"
  handover: string
  priceFrom: number
  priceTo: number
  bedrooms: string
  sizeFrom: number
  sizeTo: number
  paymentPlan: string
  dldWaiver: boolean
  postHandover: boolean
  image: string
  features: string[]
  description: string
  roi: number
}

const projects: OffPlanProject[] = [
  {
    id: "op-1",
    name: "Harmony by Majid Al Futtaim",
    developer: "Majid Al Futtaim",
    area: "Tilal Al Ghaf",
    type: "Villa",
    status: "under-construction",
    handover: "Q4 2027",
    priceFrom: 5800000,
    priceTo: 18000000,
    bedrooms: "4-6",
    sizeFrom: 4500,
    sizeTo: 12000,
    paymentPlan: "60/40",
    dldWaiver: true,
    postHandover: true,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    features: ["Lagoon Access", "Smart Home", "Crystal Lagoon", "Community Club"],
    description: "Luxury lagoon-facing villas in the heart of Tilal Al Ghaf. Premium finishes, smart home technology, and direct access to the crystal lagoon.",
    roi: 7.2,
  },
  {
    id: "op-2",
    name: "DAMAC Lagoons 2.0",
    developer: "DAMAC Properties",
    area: "DAMAC Hills",
    type: "Townhouse",
    status: "launching",
    handover: "Q2 2028",
    priceFrom: 1600000,
    priceTo: 4500000,
    bedrooms: "3-5",
    sizeFrom: 2200,
    sizeTo: 5500,
    paymentPlan: "80/20",
    dldWaiver: false,
    postHandover: true,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    features: ["Water Canal", "Beach", "Floating Cinema", "Wellness Centre"],
    description: "Tropical-inspired townhouses with water canals and beach-themed amenities. Flexible payment plans with post-handover options.",
    roi: 8.5,
  },
  {
    id: "op-3",
    name: "The Acres by Meraas",
    developer: "Meraas",
    area: "Dubai Land",
    type: "Villa",
    status: "under-construction",
    handover: "Q1 2027",
    priceFrom: 4200000,
    priceTo: 9500000,
    bedrooms: "3-5",
    sizeFrom: 3800,
    sizeTo: 8500,
    paymentPlan: "70/30",
    dldWaiver: true,
    postHandover: false,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    features: ["Farm-to-Table", "Organic Gardens", "Nature Trails", "Co-working Spaces"],
    description: "Farm-inspired community with organic gardens and nature trails. A new concept in Dubai living focused on sustainability and wellness.",
    roi: 6.8,
  },
  {
    id: "op-4",
    name: "Palm Jebel Ali Villas",
    developer: "Nakheel",
    area: "Palm Jebel Ali",
    type: "Villa",
    status: "launching",
    handover: "Q3 2028",
    priceFrom: 15000000,
    priceTo: 45000000,
    bedrooms: "5-7",
    sizeFrom: 8000,
    sizeTo: 25000,
    paymentPlan: "50/50",
    dldWaiver: true,
    postHandover: true,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    features: ["Private Beach", "Marina Berth", "Infinity Pool", "Staff Quarters"],
    description: "Ultra-luxury beachfront villas on the new Palm Jebel Ali. Each villa comes with private beach, marina berth, and unobstructed sea views.",
    roi: 5.5,
  },
  {
    id: "op-5",
    name: "Emaar South Hills",
    developer: "Emaar Properties",
    area: "Dubai South",
    type: "Apartment",
    status: "near-handover",
    handover: "Q2 2026",
    priceFrom: 850000,
    priceTo: 2800000,
    bedrooms: "1-3",
    sizeFrom: 650,
    sizeTo: 2200,
    paymentPlan: "60/40",
    dldWaiver: false,
    postHandover: false,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    features: ["Golf Course View", "Expo City Proximity", "Metro Access", "Retail Boulevard"],
    description: "Modern apartments near Expo City and Al Maktoum Airport. Excellent investment opportunity with strong rental demand.",
    roi: 9.1,
  },
  {
    id: "op-6",
    name: "Al Furjan West Villas",
    developer: "Arada",
    area: "Al Furjan",
    type: "Villa",
    status: "under-construction",
    handover: "Q4 2027",
    priceFrom: 3200000,
    priceTo: 7800000,
    bedrooms: "4-6",
    sizeFrom: 3500,
    sizeTo: 7500,
    paymentPlan: "70/30",
    dldWaiver: true,
    postHandover: true,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    features: ["Central Park", "Mosque", "Schools", "Retail Strip"],
    description: "Family-oriented villas with excellent connectivity to Metro and Ibn Battuta Mall. Spacious layouts with modern Arabic-inspired design.",
    roi: 7.8,
  },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  launching: { label: "New Launch", color: "bg-violet-500 text-white" },
  "under-construction": { label: "Under Construction", color: "bg-blue-500 text-white" },
  "near-handover": { label: "Near Handover", color: "bg-emerald-500 text-white" },
  "sold-out": { label: "Sold Out", color: "bg-neutral-400 text-white" },
}

const allAreas = [...new Set(projects.map((p) => p.area))]
const allTypes = [...new Set(projects.map((p) => p.type))]

// AI Chat
interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const aiResponses: Record<string, string> = {
  default: "I'm your off-plan assistant! I can help you find the right project based on your budget, preferred area, handover date, or financing needs. What are you looking for?",
  budget: "Based on Dubai's off-plan market, here are my recommendations by budget:\n\n**Under AED 2M:** Emaar South Hills apartments — great ROI at 9.1%, near Expo City.\n\n**AED 2-5M:** DAMAC Lagoons 2.0 townhouses or Al Furjan West villas — both offer post-handover payment plans.\n\n**AED 5-15M:** Harmony at Tilal Al Ghaf — lagoon-facing villas with DLD waiver.\n\n**AED 15M+:** Palm Jebel Ali — ultra-luxury beachfront with private marina.\n\nWould you like details on any of these?",
  payment: "Most developers offer flexible payment plans:\n\n**50/50:** 50% during construction, 50% on handover (Palm Jebel Ali)\n**60/40:** 60% during construction, 40% on handover (Harmony, Emaar South)\n**70/30:** 70% during construction, 30% on handover (The Acres, Al Furjan West)\n**80/20:** Only 20% upfront, 80% over time (DAMAC Lagoons)\n\nSome projects also offer **post-handover** plans of 2-5 years. Would you like me to filter by payment plan?",
  handover: "Here's the handover timeline:\n\n**Q2 2026:** Emaar South Hills — almost ready, great for immediate ROI\n**Q1 2027:** The Acres by Meraas\n**Q4 2027:** Harmony (Tilal Al Ghaf), Al Furjan West\n**Q2 2028:** DAMAC Lagoons 2.0\n**Q3 2028:** Palm Jebel Ali\n\nNear-handover projects are ideal if you want quicker returns. New launches offer lower entry prices. What's your preference?",
  roi: "For investment returns, here's the current ROI outlook:\n\n**Highest ROI:** Emaar South Hills — 9.1% (near Expo, metro access)\n**Strong ROI:** DAMAC Lagoons — 8.5% (family demand, water features)\n**Good ROI:** Al Furjan West — 7.8% (metro connectivity)\n**Stable ROI:** Harmony — 7.2% (premium community)\n**Premium ROI:** The Acres — 6.8% (unique concept)\n**Ultra-luxury:** Palm Jebel Ali — 5.5% (capital appreciation play)\n\nWould you like to explore any of these in detail?",
  area: "Dubai's top off-plan areas right now:\n\n**Tilal Al Ghaf** — Lagoon living by MAF, premium family community\n**DAMAC Hills** — Established community with golf course, new phases launching\n**Dubai South** — Expo legacy area, strong infrastructure investment\n**Palm Jebel Ali** — The next Palm, ultra-luxury beachfront\n**Al Furjan** — Metro-connected family community, great value\n**Dubai Land** — The Acres concept, farm-to-table living\n\nWhich area interests you most?",
  villa: "For off-plan villas, I recommend:\n\n1. **Harmony (Tilal Al Ghaf)** — From AED 5.8M, lagoon access, 4-6BR\n2. **The Acres** — From AED 4.2M, farm-inspired, 3-5BR\n3. **Palm Jebel Ali** — From AED 15M, beachfront ultra-luxury, 5-7BR\n4. **Al Furjan West** — From AED 3.2M, family-oriented, 4-6BR\n\nAll offer payment plans and DLD waivers. Shall I go deeper into any project?",
}

function getAiResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes("budget") || lower.includes("price") || lower.includes("afford") || lower.includes("cost") || lower.includes("how much")) return aiResponses.budget
  if (lower.includes("payment") || lower.includes("plan") || lower.includes("installment") || lower.includes("finance") || lower.includes("down payment")) return aiResponses.payment
  if (lower.includes("handover") || lower.includes("ready") || lower.includes("when") || lower.includes("completion") || lower.includes("deliver")) return aiResponses.handover
  if (lower.includes("roi") || lower.includes("return") || lower.includes("invest") || lower.includes("yield") || lower.includes("rental")) return aiResponses.roi
  if (lower.includes("area") || lower.includes("location") || lower.includes("where") || lower.includes("community")) return aiResponses.area
  if (lower.includes("villa") || lower.includes("house") || lower.includes("home")) return aiResponses.villa
  return `Great question! Based on the current off-plan market in Dubai, I can help you explore projects that match your criteria.\n\nTry asking me about:\n- **Budget ranges** ("What can I get for AED 3M?")\n- **Payment plans** ("What financing options are available?")\n- **Handover dates** ("What's ready in 2027?")\n- **ROI & investment** ("Best projects for rental returns")\n- **Areas** ("Which areas are best for families?")\n- **Property types** ("Show me villa options")\n\nOr simply describe what you're looking for!`
}

function formatPrice(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toLocaleString()
}

export default function OffPlanPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [areaFilter, setAreaFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProject, setSelectedProject] = useState<OffPlanProject | null>(null)

  // AI Chat
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: aiResponses.default },
  ])
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const sendMessage = () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setChatInput("")
    // Simulate AI response
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: "assistant", content: getAiResponse(userMsg) }])
    }, 600)
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (areaFilter && p.area !== areaFilter) return false
      if (typeFilter && p.type !== typeFilter) return false
      if (statusFilter && p.status !== statusFilter) return false
      if (maxPriceFilter && p.priceFrom > maxPriceFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return p.name.toLowerCase().includes(q) ||
          p.developer.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      }
      return true
    })
  }, [areaFilter, typeFilter, statusFilter, maxPriceFilter, searchQuery])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm mb-6"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                AI-Powered Off-Plan Guide
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
              >
                Off-Plan Opportunities
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white/70 max-w-xl"
              >
                Discover Dubai&apos;s most promising off-plan projects. Use our AI assistant to find the perfect match for your investment goals.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3"
            >
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-neutral-900 font-semibold hover:bg-neutral-100 transition-colors"
              >
                <Bot className="h-5 w-5" />
                Ask AI Assistant
              </button>
              <Link
                href="/opportunity"
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                <FileText className="h-5 w-5" />
                Submit Interest
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
          >
            {[
              { label: "Active Projects", value: projects.length.toString() },
              { label: "Starting From", value: `AED ${formatPrice(Math.min(...projects.map((p) => p.priceFrom)))}` },
              { label: "Avg ROI", value: `${(projects.reduce((s, p) => s + p.roi, 0) / projects.length).toFixed(1)}%` },
              { label: "Developers", value: [...new Set(projects.map((p) => p.developer))].length.toString() },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="block text-sm text-white/60 mt-1">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search + Filters */}
      <section className="sticky top-0 z-20 bg-white border-b border-neutral-200 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                placeholder="Search projects, developers, areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium transition-all",
                showFilters ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showFilters && "rotate-180")} />
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-2 h-11 px-4 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI Guide</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-4">
                  {/* Area */}
                  {allAreas.map((area) => (
                    <button
                      key={area}
                      onClick={() => setAreaFilter(areaFilter === area ? null : area)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        areaFilter === area ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                      )}
                    >
                      <MapPin className="h-3 w-3 inline mr-1" />{area}
                    </button>
                  ))}
                  <div className="w-px h-6 bg-neutral-200 mx-1 self-center" />
                  {/* Type */}
                  {allTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        typeFilter === type ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                  <div className="w-px h-6 bg-neutral-200 mx-1 self-center" />
                  {/* Status */}
                  {Object.entries(statusConfig).filter(([k]) => k !== "sold-out").map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(statusFilter === key ? null : key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        statusFilter === key ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                      )}
                    >
                      {val.label}
                    </button>
                  ))}
                  <div className="w-px h-6 bg-neutral-200 mx-1 self-center" />
                  {/* Max price */}
                  {[3000000, 5000000, 10000000, 20000000].map((price) => (
                    <button
                      key={price}
                      onClick={() => setMaxPriceFilter(maxPriceFilter === price ? null : price)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        maxPriceFilter === price ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                      )}
                    >
                      &le; AED {formatPrice(price)}
                    </button>
                  ))}
                  {(areaFilter || typeFilter || statusFilter || maxPriceFilter) && (
                    <button
                      onClick={() => { setAreaFilter(null); setTypeFilter(null); setStatusFilter(null); setMaxPriceFilter(null) }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-10 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">
              {filteredProjects.length} Project{filteredProjects.length !== 1 ? "s" : ""}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredProjects.map((project) => {
              const status = statusConfig[project.status]
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer bg-white"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <Image src={project.image} alt={project.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold", status.color)}>{status.label}</span>
                      {project.dldWaiver && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white">DLD Waiver</span>}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg leading-tight">{project.name}</h3>
                      <p className="text-white/70 text-sm">{project.developer} · {project.area}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-neutral-900">AED {formatPrice(project.priceFrom)}</span>
                        <span className="text-neutral-400 text-sm"> - {formatPrice(project.priceTo)}</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">{project.roi}% ROI</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {project.bedrooms} BR</span>
                      <span className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" /> {project.sizeFrom.toLocaleString()}-{project.sizeTo.toLocaleString()} sqft</span>
                      <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5" /> {project.type}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5 text-neutral-600">
                        <Calendar className="h-3.5 w-3.5 text-neutral-400" /> {project.handover}
                      </span>
                      <span className="flex items-center gap-1.5 text-neutral-600">
                        <CreditCard className="h-3.5 w-3.5 text-neutral-400" /> {project.paymentPlan}
                      </span>
                      {project.postHandover && (
                        <span className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                          <BadgePercent className="h-3.5 w-3.5" /> Post-Handover
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {project.features.slice(0, 4).map((feat) => (
                        <span key={feat} className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">{feat}</span>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedProject(project) }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
                      >
                        View Details <ChevronRight className="h-4 w-4" />
                      </button>
                      <Link
                        href="/opportunity"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <Building className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No projects match your filters.</p>
              <button
                onClick={() => { setAreaFilter(null); setTypeFilter(null); setStatusFilter(null); setMaxPriceFilter(null); setSearchQuery("") }}
                className="mt-3 text-sm font-medium text-neutral-900 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-white rounded-t-3xl overflow-y-auto md:inset-4 md:rounded-2xl md:max-h-none md:top-auto md:bottom-auto md:max-w-2xl md:mx-auto"
            >
              <div className="relative">
                <div className="relative h-64">
                  <Image src={selectedProject.image} alt={selectedProject.name} fill className="object-cover" sizes="100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-5 right-5">
                    <div className="flex gap-2 mb-2">
                      <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold", statusConfig[selectedProject.status].color)}>{statusConfig[selectedProject.status].label}</span>
                      {selectedProject.dldWaiver && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white">DLD Waiver</span>}
                      {selectedProject.postHandover && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500 text-white">Post-Handover</span>}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
                    <p className="text-white/70">{selectedProject.developer} · {selectedProject.area}</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <p className="text-neutral-600 leading-relaxed">{selectedProject.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Price", value: `AED ${formatPrice(selectedProject.priceFrom)} - ${formatPrice(selectedProject.priceTo)}`, icon: DollarSign },
                      { label: "Bedrooms", value: `${selectedProject.bedrooms} BR`, icon: Bed },
                      { label: "Size", value: `${selectedProject.sizeFrom.toLocaleString()} - ${selectedProject.sizeTo.toLocaleString()} sqft`, icon: Maximize2 },
                      { label: "Handover", value: selectedProject.handover, icon: Calendar },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                        <item.icon className="h-4 w-4 text-neutral-400 mb-1" />
                        <span className="block text-xs text-neutral-500">{item.label}</span>
                        <span className="block text-sm font-semibold text-neutral-900">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                      <span className="text-lg font-bold text-emerald-700">{selectedProject.roi}%</span>
                      <span className="block text-xs text-emerald-600">Est. ROI</span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                      <span className="text-lg font-bold text-blue-700">{selectedProject.paymentPlan}</span>
                      <span className="block text-xs text-blue-600">Payment Plan</span>
                    </div>
                    <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-center">
                      <span className="text-lg font-bold text-violet-700">{selectedProject.type}</span>
                      <span className="block text-xs text-violet-600">Type</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 mb-2">Features & Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.features.map((feat) => (
                        <span key={feat} className="px-3 py-1.5 rounded-full text-sm bg-neutral-100 text-neutral-700 border border-neutral-200">{feat}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href="/opportunity"
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
                    >
                      <FileText className="h-4 w-4" /> Register Interest
                    </Link>
                    <button
                      onClick={() => { setSelectedProject(null); setChatOpen(true) }}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-50 transition-colors"
                    >
                      <Bot className="h-4 w-4" /> Ask AI
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Chat */}
      <AnimatePresence>
        {chatOpen && (
          <>
            {/* Mobile: full sheet / Desktop: side panel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%", x: 0 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: "100%", x: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-white rounded-t-3xl flex flex-col md:inset-auto md:right-4 md:bottom-4 md:top-auto md:left-auto md:w-[420px] md:h-[600px] md:rounded-2xl md:shadow-2xl md:border md:border-neutral-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-neutral-900 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">Off-Plan AI Guide</h3>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                    </p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 transition-colors">
                  <X className="h-4 w-4 text-neutral-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
                      msg.role === "user"
                        ? "bg-neutral-900 text-white rounded-br-md"
                        : "bg-neutral-100 text-neutral-800 rounded-bl-md"
                    )}>
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick actions */}
              <div className="px-5 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
                {["Budget options", "Payment plans", "Best ROI", "Handover dates", "Villa options"].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setChatInput(q); setTimeout(() => sendMessage(), 50) }}
                    className="px-3 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-600 whitespace-nowrap hover:bg-neutral-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-5 pt-2 pb-5 border-t border-neutral-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Ask about projects, budget, areas..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatInput.trim()}
                    className="h-11 w-11 rounded-xl bg-neutral-900 flex items-center justify-center text-white hover:bg-neutral-800 transition-colors disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
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
