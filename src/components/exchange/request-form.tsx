"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { type RequestType, type UrgencyLevel, requestTypeConfig } from "@/lib/data/exchange-data"
import { areas } from "@/lib/data/marketplace-listings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  X,
  Plus,
  ShoppingCart,
  Tag,
  Key,
  Building,
  Send,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface RequestFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RequestFormData) => void
}

export interface RequestFormData {
  type: RequestType
  title: string
  description: string
  area: string
  subArea: string
  unitNumber: string
  floor: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  minSize: number
  maxSize: number
  minBudget: number
  maxBudget: number
  features: string[]
  urgency: UrgencyLevel
  contactName: string
  contactPhone: string
  contactEmail: string
}

const typeButtons: { type: RequestType; icon: React.ElementType; label: string }[] = [
  { type: "buy", icon: ShoppingCart, label: "Buy" },
  { type: "sell", icon: Tag, label: "Sell" },
  { type: "rent", icon: Key, label: "Rent" },
  { type: "lease", icon: Building, label: "Lease Out" },
]

const propertyTypes = ["villa", "apartment", "townhouse", "penthouse", "plot", "office", "retail"]

export function RequestForm({ isOpen, onClose, onSubmit }: RequestFormProps) {
  const [formData, setFormData] = useState<RequestFormData>({
    type: "buy",
    title: "",
    description: "",
    area: "",
    subArea: "",
    unitNumber: "",
    floor: "",
    propertyType: "villa",
    bedrooms: 3,
    bathrooms: 3,
    minSize: 1000,
    maxSize: 5000,
    minBudget: 1000000,
    maxBudget: 5000000,
    features: [],
    urgency: "medium",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  })
  const [featureInput, setFeatureInput] = useState("")

  const update = <K extends keyof RequestFormData>(key: K, value: RequestFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  const addFeature = () => {
    const feat = featureInput.trim()
    if (feat && !formData.features.includes(feat)) {
      update("features", [...formData.features, feat])
      setFeatureInput("")
    }
  }

  const removeFeature = (feat: string) => {
    update("features", formData.features.filter((f) => f !== feat))
  }

  const isListingType = formData.type === "sell" || formData.type === "lease"

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title")
      return
    }
    if (!formData.area) {
      toast.error("Please select an area")
      return
    }
    if (!formData.contactName.trim() || !formData.contactEmail.trim()) {
      toast.error("Please fill in contact details")
      return
    }
    if (isListingType && !formData.contactPhone.trim()) {
      toast.error("Phone number is required for listings")
      return
    }
    if (isListingType && !formData.unitNumber.trim()) {
      toast.error("Unit number is required for listings")
      return
    }
    onSubmit(formData)
    toast.success(isListingType ? "Listing submitted! Our agents will review it." : "Request submitted successfully!")
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
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white dark:bg-neutral-950 border-l border-gray-200 dark:border-neutral-800 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Request</h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                    Add a buy, sell, rent, or lease request
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                </button>
              </div>

              {/* Request type */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Request Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {typeButtons.map(({ type, icon: Icon, label }) => {
                    const conf = requestTypeConfig[type]
                    const isActive = formData.type === type
                    return (
                      <button
                        key={type}
                        onClick={() => update("type", type)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-xs font-medium",
                          isActive
                            ? `${conf.bg} ${conf.text} border-current shadow-sm`
                            : "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-neutral-700"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Title *</Label>
                <Input
                  placeholder="e.g. Looking for 3BR Villa in Palm Jumeirah"
                  value={formData.title}
                  onChange={(e) => update("title", e.target.value)}
                  className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Description</Label>
                <textarea
                  placeholder="Describe your requirements, preferences, timeline..."
                  value={formData.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  className="w-full text-sm rounded-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Area & Property Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Area *</Label>
                  <Select value={formData.area} onValueChange={(v) => update("area", v)}>
                    <SelectTrigger className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((a) => (
                        <SelectItem key={a.slug} value={a.slug}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Property Type</Label>
                  <Select value={formData.propertyType} onValueChange={(v) => update("propertyType", v)}>
                    <SelectTrigger className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Unit Details (for sell/lease) */}
              {isListingType && (
                <div className="space-y-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/10">
                  <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" />
                    Unit Details (Required)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Unit Number *</Label>
                      <Input
                        placeholder="e.g. V-M-12, APT-2305"
                        value={formData.unitNumber}
                        onChange={(e) => update("unitNumber", e.target.value)}
                        className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Sub-Area / Community</Label>
                      <Input
                        placeholder="e.g. Frond M, Harmony III"
                        value={formData.subArea}
                        onChange={(e) => update("subArea", e.target.value)}
                        className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Floor (if applicable)</Label>
                    <Input
                      placeholder="e.g. 23, Ground, Penthouse"
                      value={formData.floor}
                      onChange={(e) => update("floor", e.target.value)}
                      className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                    />
                  </div>
                </div>
              )}

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Bedrooms</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => update("bedrooms", Math.max(0, formData.bedrooms - 1))}
                    >-</Button>
                    <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">{formData.bedrooms}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => update("bedrooms", formData.bedrooms + 1)}
                    >+</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Bathrooms</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => update("bathrooms", Math.max(0, formData.bathrooms - 1))}
                    >-</Button>
                    <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">{formData.bathrooms}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => update("bathrooms", formData.bathrooms + 1)}
                    >+</Button>
                  </div>
                </div>
              </div>

              {/* Size range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Min Size (sqft)</Label>
                  <Input
                    type="number"
                    value={formData.minSize}
                    onChange={(e) => update("minSize", Number(e.target.value))}
                    className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Max Size (sqft)</Label>
                  <Input
                    type="number"
                    value={formData.maxSize}
                    onChange={(e) => update("maxSize", Number(e.target.value))}
                    className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                  />
                </div>
              </div>

              {/* Budget range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">
                    Min Budget (AED)
                  </Label>
                  <Input
                    type="number"
                    value={formData.minBudget}
                    onChange={(e) => update("minBudget", Number(e.target.value))}
                    className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">
                    Max Budget (AED)
                  </Label>
                  <Input
                    type="number"
                    value={formData.maxBudget}
                    onChange={(e) => update("maxBudget", Number(e.target.value))}
                    className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                  />
                </div>
              </div>

              {/* Urgency */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Urgency</Label>
                <div className="flex gap-2">
                  {(["low", "medium", "high", "urgent"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => update("urgency", level)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize",
                        formData.urgency === level
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 hover:border-gray-300"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Features / Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Private Pool"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                  />
                  <Button variant="outline" size="sm" className="h-9 px-3" onClick={addFeature}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formData.features.map((feat) => (
                      <span
                        key={feat}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {feat}
                        <button onClick={() => removeFeature(feat)} className="hover:text-red-500 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact info */}
              <div className="space-y-3 border-t border-gray-200 dark:border-neutral-800 pt-4">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider">Contact Information</h3>
                {isListingType && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Your contact details are only visible to Zaylo agents — never shared directly with other users.
                  </p>
                )}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Full Name *</Label>
                  <Input
                    placeholder="Your name"
                    value={formData.contactName}
                    onChange={(e) => update("contactName", e.target.value)}
                    className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Email *</Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.contactEmail}
                      onChange={(e) => update("contactEmail", e.target.value)}
                      className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">
                      Phone {isListingType ? "*" : ""}
                    </Label>
                    <Input
                      type="tel"
                      placeholder="+971 5X XXX XXXX"
                      value={formData.contactPhone}
                      onChange={(e) => update("contactPhone", e.target.value)}
                      className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                className="w-full h-10 gap-2 text-sm font-semibold"
              >
                <Send className="h-4 w-4" />
                Submit Request
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
