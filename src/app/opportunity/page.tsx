"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ShoppingCart,
  Tag,
  Key,
  Building,
  Globe,
  Send,
  ArrowLeft,
  MapPin,
  Home,
  Phone,
  Mail,
  MessageCircle,
  User,
  Hash,
  Layers,
  Maximize2,
  DollarSign,
  Calendar,
  CheckCircle2,
  Bed,
  Bath,
  FileText,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

type OpportunityType = "buy" | "sell" | "rent" | "lease" | "relocation"

interface OpportunityFormData {
  type: OpportunityType
  // Contact
  fullName: string
  email: string
  phone: string
  whatsapp: string
  preferredContact: "phone" | "email" | "whatsapp"
  // Property details
  area: string
  subArea: string
  unitNumber: string
  floor: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  size: number
  // Pricing
  price: number
  priceType: "fixed" | "negotiable" | "range"
  minPrice: number
  maxPrice: number
  // Additional
  features: string[]
  availability: string
  notes: string
  furnished: string
  parking: number
  yearBuilt: string
}

const typeConfig: Record<OpportunityType, { label: string; icon: React.ElementType; color: string; bg: string; description: string }> = {
  buy: { label: "I Want to Buy", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30", description: "Looking to purchase a property" },
  sell: { label: "I Want to Sell", icon: Tag, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30", description: "List your property for sale" },
  rent: { label: "I Want to Rent", icon: Key, color: "text-violet-600", bg: "bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/30", description: "Looking for a rental property" },
  lease: { label: "I Want to Lease Out", icon: Building, color: "text-amber-600", bg: "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30", description: "List your property for lease" },
  relocation: { label: "Relocation Assistance", icon: Globe, color: "text-rose-600", bg: "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30", description: "Corporate or personal relocation" },
}

const areas = [
  "DAMAC Hills", "DAMAC Hills 2", "Tilal Al Ghaf", "Al Furjan", "Jumeirah Golf Estates",
  "Palm Jumeirah", "Dubai Marina", "Downtown Dubai", "Business Bay", "JBR", "JVC",
  "JLT", "Dubai Hills Estate", "Arabian Ranches", "Arabian Ranches 2", "Arabian Ranches 3",
  "Emirates Hills", "The Villa", "Mudon", "Town Square", "Reem", "Villanova",
  "Dubai Creek Harbour", "MBR City", "Dubai South", "Dubai Land", "Other",
]

const propertyTypes = ["Villa", "Apartment", "Townhouse", "Penthouse", "Duplex", "Plot", "Office", "Retail", "Warehouse"]

const featureOptions = [
  "Private Pool", "Garden", "Maid's Room", "Driver's Room", "Smart Home", "Upgraded",
  "Corner Unit", "Beach Access", "Golf View", "Sea View", "Skyline View", "Lake View",
  "Lagoon View", "Park View", "Gym", "Concierge", "Rooftop Terrace", "Basement",
  "Pet Friendly", "Balcony", "Walk-in Closet", "Jacuzzi", "Sauna", "Storage",
]

const initialFormData: OpportunityFormData = {
  type: "buy",
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  preferredContact: "whatsapp",
  area: "",
  subArea: "",
  unitNumber: "",
  floor: "",
  propertyType: "Villa",
  bedrooms: 3,
  bathrooms: 3,
  size: 0,
  price: 0,
  priceType: "negotiable",
  minPrice: 0,
  maxPrice: 0,
  features: [],
  availability: "",
  notes: "",
  furnished: "unfurnished",
  parking: 1,
  yearBuilt: "",
}

export default function OpportunityPage() {
  const [form, setForm] = useState<OpportunityFormData>(initialFormData)
  const [step, setStep] = useState(0) // 0 = type, 1 = details, 2 = contact, 3 = done
  const [submitted, setSubmitted] = useState(false)

  const update = <K extends keyof OpportunityFormData>(key: K, value: OpportunityFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleFeature = (feat: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feat)
        ? prev.features.filter((f) => f !== feat)
        : [...prev.features, feat],
    }))
  }

  const isOwner = form.type === "sell" || form.type === "lease"
  const isBuyer = form.type === "buy" || form.type === "rent" || form.type === "relocation"

  const handleSubmit = () => {
    setSubmitted(true)
    setStep(3)
  }

  const conf = typeConfig[form.type]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Submit Your Opportunity
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/70 max-w-xl mx-auto"
          >
            Whether you&apos;re buying, selling, renting, or relocating — fill in the details and a Zaylo agent will connect you with the right match.
          </motion.p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-3xl">

          {/* Progress */}
          <div className="flex items-center justify-between mb-10">
            {["Type", "Property Details", "Contact Info"].map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  step > i
                    ? "bg-emerald-500 text-white"
                    : step === i
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-200 text-neutral-500"
                )}>
                  {step > i ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                <span className={cn(
                  "text-sm font-medium hidden sm:block",
                  step >= i ? "text-neutral-900" : "text-neutral-400"
                )}>
                  {label}
                </span>
                {i < 2 && <div className={cn("flex-1 h-0.5 mx-2", step > i ? "bg-emerald-500" : "bg-neutral-200")} />}
              </div>
            ))}
          </div>

          {/* Step 0: Select type */}
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">What are you looking for?</h2>
              <p className="text-neutral-500 mb-6">Select the type of opportunity you want to submit.</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.entries(typeConfig) as [OpportunityType, typeof conf][]).map(([type, config]) => {
                  const Icon = config.icon
                  const isActive = form.type === type
                  return (
                    <button
                      key={type}
                      onClick={() => update("type", type)}
                      className={cn(
                        "flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all",
                        isActive
                          ? config.bg + " border-current shadow-sm"
                          : "border-neutral-200 hover:border-neutral-300 bg-white"
                      )}
                    >
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        isActive ? "bg-white/80" : "bg-neutral-100"
                      )}>
                        <Icon className={cn("h-6 w-6", isActive ? config.color : "text-neutral-400")} />
                      </div>
                      <div>
                        <span className={cn("text-base font-semibold block", isActive ? "text-neutral-900" : "text-neutral-700")}>{config.label}</span>
                        <span className="text-sm text-neutral-500">{config.description}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3 rounded-full bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Property Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", conf.bg)}>
                  <conf.icon className={cn("h-5 w-5", conf.color)} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">{isOwner ? "Your Property Details" : "What You're Looking For"}</h2>
                  <p className="text-sm text-neutral-500">{isOwner ? "Provide as much detail as possible for accurate matching" : "Tell us your requirements so we can find the best options"}</p>
                </div>
              </div>

              {/* Location */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-neutral-400" /> Area *
                  </label>
                  <select
                    value={form.area}
                    onChange={(e) => update("area", e.target.value)}
                    className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  >
                    <option value="">Select area</option>
                    {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-neutral-400" /> Sub-community
                  </label>
                  <input
                    placeholder="e.g. Frond M, Harmony III, Lime Tree Valley"
                    value={form.subArea}
                    onChange={(e) => update("subArea", e.target.value)}
                    className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  />
                </div>
              </div>

              {/* Unit details (for owners) */}
              {isOwner && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                      <Hash className="h-4 w-4 text-neutral-400" /> Unit Number *
                    </label>
                    <input
                      placeholder="e.g. V-M-12, APT-2305"
                      value={form.unitNumber}
                      onChange={(e) => update("unitNumber", e.target.value)}
                      className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-neutral-400" /> Floor
                    </label>
                    <input
                      placeholder="e.g. 23, Ground"
                      value={form.floor}
                      onChange={(e) => update("floor", e.target.value)}
                      className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-neutral-400" /> Year Built
                    </label>
                    <input
                      placeholder="e.g. 2022"
                      value={form.yearBuilt}
                      onChange={(e) => update("yearBuilt", e.target.value)}
                      className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                    />
                  </div>
                </div>
              )}

              {/* Property type & specs */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Home className="h-4 w-4 text-neutral-400" /> Property Type
                  </label>
                  <select
                    value={form.propertyType}
                    onChange={(e) => update("propertyType", e.target.value)}
                    className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  >
                    {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Maximize2 className="h-4 w-4 text-neutral-400" /> Size (sqft) {isOwner ? "*" : ""}
                  </label>
                  <input
                    type="number"
                    placeholder={isOwner ? "Exact size in sqft" : "Min preferred size"}
                    value={form.size || ""}
                    onChange={(e) => update("size", Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  />
                </div>
              </div>

              {/* Beds, baths, parking */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Bed className="h-4 w-4 text-neutral-400" /> Bedrooms
                  </label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => update("bedrooms", Math.max(0, form.bedrooms - 1))} className="h-11 w-11 rounded-xl border border-neutral-300 flex items-center justify-center text-lg hover:bg-neutral-50">-</button>
                    <span className="text-base font-semibold w-8 text-center">{form.bedrooms}</span>
                    <button onClick={() => update("bedrooms", form.bedrooms + 1)} className="h-11 w-11 rounded-xl border border-neutral-300 flex items-center justify-center text-lg hover:bg-neutral-50">+</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Bath className="h-4 w-4 text-neutral-400" /> Bathrooms
                  </label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => update("bathrooms", Math.max(0, form.bathrooms - 1))} className="h-11 w-11 rounded-xl border border-neutral-300 flex items-center justify-center text-lg hover:bg-neutral-50">-</button>
                    <span className="text-base font-semibold w-8 text-center">{form.bathrooms}</span>
                    <button onClick={() => update("bathrooms", form.bathrooms + 1)} className="h-11 w-11 rounded-xl border border-neutral-300 flex items-center justify-center text-lg hover:bg-neutral-50">+</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Parking</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => update("parking", Math.max(0, form.parking - 1))} className="h-11 w-11 rounded-xl border border-neutral-300 flex items-center justify-center text-lg hover:bg-neutral-50">-</button>
                    <span className="text-base font-semibold w-8 text-center">{form.parking}</span>
                    <button onClick={() => update("parking", form.parking + 1)} className="h-11 w-11 rounded-xl border border-neutral-300 flex items-center justify-center text-lg hover:bg-neutral-50">+</button>
                  </div>
                </div>
              </div>

              {/* Furnished */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Furnishing</label>
                <div className="flex gap-2">
                  {["unfurnished", "semi-furnished", "fully-furnished"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => update("furnished", opt)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize",
                        form.furnished === opt
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                      )}
                    >
                      {opt.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3 p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-neutral-400" />
                  {isOwner ? "Your Asking Price" : "Your Budget"}
                </h3>

                <div className="flex gap-2 mb-3">
                  {(["fixed", "negotiable", "range"] as const).map((pt) => (
                    <button
                      key={pt}
                      onClick={() => update("priceType", pt)}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm font-medium transition-all capitalize",
                        form.priceType === pt
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                      )}
                    >
                      {pt}
                    </button>
                  ))}
                </div>

                {form.priceType === "range" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-500">Min (AED)</label>
                      <input
                        type="number"
                        placeholder="1,000,000"
                        value={form.minPrice || ""}
                        onChange={(e) => update("minPrice", Number(e.target.value))}
                        className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-500">Max (AED)</label>
                      <input
                        type="number"
                        placeholder="5,000,000"
                        value={form.maxPrice || ""}
                        onChange={(e) => update("maxPrice", Number(e.target.value))}
                        className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-500">
                      {isOwner ? "Asking Price" : "Max Budget"} (AED) {form.type === "rent" || form.type === "lease" ? "/ year" : ""}
                    </label>
                    <input
                      type="number"
                      placeholder={isOwner ? "e.g. 5000000" : "e.g. 3000000"}
                      value={form.price || ""}
                      onChange={(e) => update("price", Number(e.target.value))}
                      className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                    />
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-neutral-400" /> {isOwner ? "Available From" : "Move-in Date"}
                </label>
                <input
                  type="date"
                  value={form.availability}
                  onChange={(e) => update("availability", e.target.value)}
                  className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>

              {/* Features */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-700">{isOwner ? "Property Features" : "Must-Have Features"}</label>
                <div className="flex flex-wrap gap-2">
                  {featureOptions.map((feat) => (
                    <button
                      key={feat}
                      onClick={() => toggleFeature(feat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm border transition-all",
                        form.features.includes(feat)
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                      )}
                    >
                      {feat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-neutral-400" /> Additional Notes
                </label>
                <textarea
                  placeholder={isOwner
                    ? "Describe your property — condition, recent upgrades, why you're selling/leasing, timeline, etc."
                    : "Describe your ideal property — specific requirements, timeline, any preferences, etc."
                  }
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(0)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-3 rounded-full bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-neutral-900 mb-1">Your Contact Information</h2>
              <p className="text-neutral-500 mb-4">
                Your details are shared exclusively with Zaylo agents — never directly with other parties.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-neutral-400" /> Full Name *
                  </label>
                  <input
                    placeholder="Your full name"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-neutral-400" /> Email *
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-neutral-400" /> Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="+971 5X XXX XXXX"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4 text-neutral-400" /> WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+971 5X XXX XXXX (if different)"
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Preferred Contact Method</label>
                  <div className="flex gap-2">
                    {(["whatsapp", "phone", "email"] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => update("preferredContact", method)}
                        className={cn(
                          "flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize",
                          form.preferredContact === method
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                        )}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Opportunity Summary</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-neutral-500">Type</span>
                  <span className="font-medium text-neutral-900">{conf.label}</span>
                  {form.area && <>
                    <span className="text-neutral-500">Area</span>
                    <span className="font-medium text-neutral-900">{form.area}{form.subArea ? ` — ${form.subArea}` : ""}</span>
                  </>}
                  <span className="text-neutral-500">Property</span>
                  <span className="font-medium text-neutral-900">{form.propertyType} · {form.bedrooms} BR · {form.bathrooms} Bath</span>
                  {form.size > 0 && <>
                    <span className="text-neutral-500">Size</span>
                    <span className="font-medium text-neutral-900">{form.size.toLocaleString()} sqft</span>
                  </>}
                  {(form.price > 0 || form.minPrice > 0) && <>
                    <span className="text-neutral-500">Price</span>
                    <span className="font-medium text-neutral-900">
                      {form.priceType === "range"
                        ? `AED ${form.minPrice.toLocaleString()} - ${form.maxPrice.toLocaleString()}`
                        : `AED ${form.price.toLocaleString()} (${form.priceType})`
                      }
                    </span>
                  </>}
                  {isOwner && form.unitNumber && <>
                    <span className="text-neutral-500">Unit</span>
                    <span className="font-medium text-neutral-900">{form.unitNumber}{form.floor ? ` · Floor ${form.floor}` : ""}</span>
                  </>}
                  {form.features.length > 0 && <>
                    <span className="text-neutral-500">Features</span>
                    <span className="font-medium text-neutral-900">{form.features.join(", ")}</span>
                  </>}
                </div>
              </div>

              <p className="text-xs text-neutral-400">
                By submitting, you agree to Zaylo&apos;s Terms of Service. Your information is secure and will only be shared with assigned Zaylo agents.
              </p>

              <div className="pt-2 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.fullName.trim() || !form.email.trim() || !form.phone.trim()}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" /> Submit Opportunity
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </motion.div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-3">Opportunity Submitted!</h2>
              <p className="text-neutral-500 max-w-md mx-auto mb-8">
                Thank you, {form.fullName.split(" ")[0]}. A Zaylo agent will review your opportunity and reach out via {form.preferredContact} within 24 hours.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/"
                  className="px-6 py-3 rounded-full border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                >
                  Back to Home
                </Link>
                <button
                  onClick={() => { setForm(initialFormData); setStep(0); setSubmitted(false) }}
                  className="px-6 py-3 rounded-full bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Submit Another
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
