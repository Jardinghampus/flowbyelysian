"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { type RequestType, requestTypeConfig } from "@/lib/data/exchange-data"
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
  Building2,
  Send,
  Phone,
  Mail,
  MessageSquare,
  Shield,
  Star,
  CheckCircle2,
  Award,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface AgencyInquiryProps {
  isOpen: boolean
  onClose: () => void
}

const propertyTypes = ["villa", "apartment", "townhouse", "penthouse", "plot", "office", "retail"]

const benefits = [
  { icon: Shield, title: "RERA Licensed", desc: "Fully licensed and regulated by Dubai RERA" },
  { icon: Star, title: "Premium Marketing", desc: "Professional photography, 3D tours & staging" },
  { icon: Award, title: "Market Expertise", desc: "Deep knowledge of Dubai's premium communities" },
  { icon: CheckCircle2, title: "End-to-End Service", desc: "From valuation to handover, we handle everything" },
]

export function AgencyInquiry({ isOpen, onClose }: AgencyInquiryProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    propertyType: "villa",
    transactionType: "sell" as RequestType,
    area: "",
    bedrooms: 3,
    estimatedValue: 0,
    description: "",
    hasTitle: false,
    preferredContact: "phone" as "phone" | "email" | "whatsapp",
  })

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Please fill in all contact details")
      return
    }
    if (!form.area) {
      toast.error("Please select a property area")
      return
    }
    toast.success("Inquiry submitted! Our team will contact you within 24 hours.", {
      duration: 5000,
    })
    onClose()
    setStep(1)
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-auto sm:w-full sm:max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-neutral-800 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">List with Flow by Elysian</h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                    Professional agency listing — maximize your property&apos;s potential
                  </p>
                </div>
              </div>

              {/* Steps indicator */}
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                        s <= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-200 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400"
                      )}
                    >
                      {s}
                    </div>
                    <span className={cn(
                      "text-[11px] font-medium hidden sm:inline",
                      s <= step ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-neutral-500"
                    )}>
                      {s === 1 ? "Property" : s === 2 ? "Details" : "Contact"}
                    </span>
                    {s < 3 && <div className={cn("flex-1 h-0.5 rounded-full", s < step ? "bg-primary" : "bg-gray-200 dark:bg-neutral-800")} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    {/* Benefits */}
                    <div className="grid grid-cols-2 gap-3">
                      {benefits.map((b) => (
                        <div key={b.title} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                          <b.icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{b.title}</p>
                            <p className="text-[10px] text-gray-500 dark:text-neutral-400 mt-0.5">{b.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Transaction type */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">What would you like to do?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["sell", "lease"] as const).map((t) => {
                          const conf = requestTypeConfig[t]
                          const isActive = form.transactionType === t
                          return (
                            <button
                              key={t}
                              onClick={() => update("transactionType", t)}
                              className={cn(
                                "p-3 rounded-xl border text-sm font-medium transition-all",
                                isActive
                                  ? `${conf.bg} ${conf.text} border-current`
                                  : "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 hover:border-gray-300"
                              )}
                            >
                              {t === "sell" ? "Sell My Property" : "Lease My Property"}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Property type & area */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Property Type</Label>
                        <Select value={form.propertyType} onValueChange={(v) => update("propertyType", v)}>
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
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Area / Community *</Label>
                        <Select value={form.area} onValueChange={(v) => update("area", v)}>
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
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Bedrooms</Label>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => update("bedrooms", Math.max(0, form.bedrooms - 1))}>-</Button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">{form.bedrooms}</span>
                          <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => update("bedrooms", form.bedrooms + 1)}>+</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">
                          Estimated Value (AED)
                        </Label>
                        <Input
                          type="number"
                          placeholder="e.g. 5000000"
                          value={form.estimatedValue || ""}
                          onChange={(e) => update("estimatedValue", Number(e.target.value))}
                          className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">
                        Tell us about your property
                      </Label>
                      <textarea
                        placeholder="Describe your property: upgrades, views, unique features, reason for selling/leasing..."
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        rows={4}
                        className="w-full text-sm rounded-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        id="has-title"
                        checked={form.hasTitle}
                        onChange={(e) => update("hasTitle", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-neutral-600 accent-primary"
                      />
                      <label htmlFor="has-title" className="text-xs text-gray-700 dark:text-neutral-300">
                        I have the Title Deed / Oqood for this property
                      </label>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Full Name *</Label>
                      <Input
                        placeholder="Your full name"
                        value={form.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Email *</Label>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Phone *</Label>
                        <Input
                          type="tel"
                          placeholder="+971 5X XXX XXXX"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          className="h-9 text-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Preferred Contact Method</Label>
                      <div className="flex gap-2">
                        {([
                          { value: "phone", icon: Phone, label: "Phone" },
                          { value: "email", icon: Mail, label: "Email" },
                          { value: "whatsapp", icon: MessageSquare, label: "WhatsApp" },
                        ] as const).map(({ value, icon: Icon, label }) => (
                          <button
                            key={value}
                            onClick={() => update("preferredContact", value)}
                            className={cn(
                              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                              form.preferredContact === value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 hover:border-gray-300"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white">What happens next?</h4>
                      <ul className="space-y-1.5 text-[11px] text-gray-600 dark:text-neutral-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          Our team reviews your property within 24 hours
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          Free market valuation and pricing strategy
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          Professional photography and 3D tour scheduling
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          Listed across all major portals + our network
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              {step > 1 ? (
                <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <Button size="sm" className="gap-1.5" onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Button>
              ) : (
                <Button size="sm" className="gap-1.5" onClick={handleSubmit}>
                  <Send className="h-3.5 w-3.5" />
                  Submit Inquiry
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
