"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, Check, User, Building2, Target, Sparkles, Upload, FileText, X } from "lucide-react"

type OnboardingRole = "buyer" | "seller" | "tenant" | "landlord" | "agent" | ""

interface OnboardingData {
  fullName: string
  email: string
  phone: string
  role: OnboardingRole
  // Opportunity form fields
  propertyType: string
  transactionType: string
  area: string
  bedrooms: string
  budget: string
  timeline: string
  notes: string
  // Title Deed (owners only)
  titleDeedFile: File | null
  titleDeedUnitNumber: string
}

const OWNER_STEPS = [
  { label: "Account", icon: User, description: "Your details" },
  { label: "Role", icon: Building2, description: "How you'll use ZFLOW" },
  { label: "Title Deed", icon: FileText, description: "Verify ownership" },
  { label: "Opportunity", icon: Target, description: "First opportunity" },
  { label: "Ready", icon: Sparkles, description: "All set" },
]

const DEFAULT_STEPS = [
  { label: "Account", icon: User, description: "Your details" },
  { label: "Role", icon: Building2, description: "How you'll use ZFLOW" },
  { label: "Opportunity", icon: Target, description: "First opportunity" },
  { label: "Ready", icon: Sparkles, description: "All set" },
]

const AREAS = [
  "Tilal Al Ghaf", "Mudon", "Arabian Ranches", "Town Square",
  "DAMAC Hills", "Dubai Hills", "Palm Jumeirah", "Emirates Hills",
  "Dubai Marina", "Downtown Dubai", "Business Bay", "JBR",
  "Jumeirah Golf Estates", "Al Furjan",
]

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    propertyType: "",
    transactionType: "",
    area: "",
    bedrooms: "",
    budget: "",
    timeline: "",
    notes: "",
    titleDeedFile: null,
    titleDeedUnitNumber: "",
  })

  const update = (fields: Partial<OnboardingData>) => setData((prev) => ({ ...prev, ...fields }))

  const isOwner = data.role === "seller" || data.role === "landlord"
  const STEPS = isOwner ? OWNER_STEPS : DEFAULT_STEPS
  const lastStep = STEPS.length - 1

  // Map logical step to content step based on whether Title Deed step is shown
  const getContentStep = () => {
    if (!isOwner) return step
    // Owner flow: 0=Account, 1=Role, 2=TitleDeed, 3=Opportunity, 4=Ready
    return step
  }

  const canProceed = () => {
    const s = getContentStep()
    if (s === 0) return data.fullName.length > 1 && data.email.includes("@")
    if (s === 1) return data.role !== ""
    if (isOwner && s === 2) return data.titleDeedFile !== null // Title deed required for owners
    // Opportunity and Ready are always proceed-able
    return true
  }

  const next = async () => {
    // If we're on the title deed step and there's a file, submit it
    if (isOwner && step === 2 && data.titleDeedFile) {
      setUploading(true)
      try {
        // Convert file to base64 data URL for storage (in production, use Supabase Storage)
        const fileUrl = URL.createObjectURL(data.titleDeedFile)
        await fetch("/api/title-deeds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_user_id: data.email, // placeholder until Clerk gives us the real ID
            owner_name: data.fullName,
            owner_email: data.email,
            owner_phone: data.phone,
            area: data.area || null,
            property_type: data.propertyType || null,
            unit_number: data.titleDeedUnitNumber || null,
            file_url: fileUrl,
            file_name: data.titleDeedFile.name,
            file_size: data.titleDeedFile.size,
            file_type: data.titleDeedFile.type,
          }),
        })
      } catch (err) {
        console.error("Title deed upload failed:", err)
      } finally {
        setUploading(false)
      }
    }

    if (step < lastStep) setStep(step + 1)
    else router.push("/user/dashboard")
  }

  const back = () => {
    if (step > 0) setStep(step - 1)
  }

  const isBuyerSide = data.role === "buyer" || data.role === "tenant"
  const isSellerSide = isOwner

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Logo size={48} />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            {STEPS[step].description}
          </CardDescription>
        </CardHeader>

        {/* Step indicator */}
        <div className="px-6 pb-2">
          <div className="flex items-center justify-between mb-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i < step
                        ? "bg-primary text-primary-foreground"
                        : i === step
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">{s.label}</span>
                </div>
              )
            })}
          </div>
          <div className="h-1 bg-muted-foreground/20 rounded-full mt-2">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <CardContent className="pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0: Account details */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. Ahmed Al Maktoum"
                      value={data.fullName}
                      onChange={(e) => update({ fullName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={data.email}
                      onChange={(e) => update({ email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input
                      id="phone"
                      placeholder="+971 50 123 4567"
                      value={data.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Role selection */}
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    How will you primarily use ZFLOW?
                  </p>
                  {([
                    { value: "buyer", label: "Buyer", desc: "Looking to purchase property" },
                    { value: "tenant", label: "Tenant", desc: "Looking to rent property" },
                    { value: "seller", label: "Seller", desc: "I have property to sell" },
                    { value: "landlord", label: "Landlord", desc: "I have property to lease out" },
                    { value: "agent", label: "Agent", desc: "I'm a real estate professional" },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => update({ role: option.value })}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        data.role === option.value
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        data.role === option.value ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        {data.role === option.value ? <Check className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Title Deed step (owners only) */}
              {isOwner && step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your Title Deed to verify property ownership. This helps us match you with qualified buyers faster.
                  </p>

                  <div className="grid gap-2">
                    <Label className="text-xs">Unit / Villa Number <span className="text-muted-foreground">(optional)</span></Label>
                    <Input
                      className="h-9"
                      placeholder="e.g. Villa 42, Unit 1204"
                      value={data.titleDeedUnitNumber}
                      onChange={(e) => update({ titleDeedUnitNumber: e.target.value })}
                    />
                  </div>

                  {/* File upload area */}
                  {!data.titleDeedFile ? (
                    <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm">Click to upload Title Deed</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (max 10 MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && file.size <= 10 * 1024 * 1024) {
                            update({ titleDeedFile: file })
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{data.titleDeedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(data.titleDeedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => update({ titleDeedFile: null })}
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground">
                    Your Title Deed will be reviewed by our team for verification. This is required for all property owners.
                  </p>
                </div>
              )}

              {/* Opportunity form */}
              {step === (isOwner ? 3 : 2) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {isBuyerSide
                        ? "Tell us what you're looking for"
                        : isSellerSide
                        ? "Tell us about your property"
                        : "Create your first opportunity"
                      }
                    </p>
                    <Badge variant="outline" className="text-[10px]">Optional</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label className="text-xs">Transaction</Label>
                      <Select value={data.transactionType} onValueChange={(v) => update({ transactionType: v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select transaction type" /></SelectTrigger>
                        <SelectContent>
                          {isBuyerSide ? (
                            <>
                              <SelectItem value="buy">Buy</SelectItem>
                              <SelectItem value="rent">Rent</SelectItem>
                            </>
                          ) : isSellerSide ? (
                            <>
                              <SelectItem value="sell">Sell</SelectItem>
                              <SelectItem value="lease">Lease Out</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="buy">Buy</SelectItem>
                              <SelectItem value="sell">Sell</SelectItem>
                              <SelectItem value="rent">Rent</SelectItem>
                              <SelectItem value="lease">Lease Out</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs">Property Type</Label>
                      <Select value={data.propertyType} onValueChange={(v) => update({ propertyType: v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select property type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="penthouse">Penthouse</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label className="text-xs">Area</Label>
                      <Select value={data.area} onValueChange={(v) => update({ area: v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select area" /></SelectTrigger>
                        <SelectContent>
                          {AREAS.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs">Bedrooms</Label>
                      <Select value={data.bedrooms} onValueChange={(v) => update({ bedrooms: v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select bedrooms" /></SelectTrigger>
                        <SelectContent>
                          {["Studio", "1", "2", "3", "4", "5", "6", "7+"].map((n) => (
                            <SelectItem key={n} value={n}>{n === "Studio" ? n : `${n} BR`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label className="text-xs">Budget (AED)</Label>
                      <Input
                        className="h-9"
                        type="number"
                        placeholder="e.g. 5000000"
                        value={data.budget}
                        onChange={(e) => update({ budget: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs">Timeline</Label>
                      <Select value={data.timeline} onValueChange={(v) => update({ timeline: v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select timeline" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="1-3months">1-3 Months</SelectItem>
                          <SelectItem value="3-6months">3-6 Months</SelectItem>
                          <SelectItem value="6-12months">6-12 Months</SelectItem>
                          <SelectItem value="exploring">Just Exploring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs">Notes</Label>
                    <Textarea
                      className="min-h-[60px]"
                      placeholder="Any specific requirements, must-haves, or preferences..."
                      value={data.notes}
                      onChange={(e) => update({ notes: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Final step: Complete */}
              {step === lastStep && (
                <div className="text-center space-y-4 py-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Welcome, {data.fullName.split(" ")[0]}!</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Your account is ready. {data.area ? `We've noted your interest in ${data.area}.` : ""}
                    </p>
                  </div>
                  {data.role && (
                    <div className="flex justify-center gap-2">
                      <Badge variant="secondary" className="capitalize">{data.role}</Badge>
                      {data.transactionType && <Badge variant="outline" className="capitalize">{data.transactionType}</Badge>}
                      {data.area && <Badge variant="outline">{data.area}</Badge>}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    A Zaylo agent will reach out if you submitted an opportunity.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={back}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={next}
              disabled={!canProceed() || uploading}
              className="cursor-pointer"
            >
              {uploading ? "Uploading..." : step === lastStep ? "Enter Dashboard" : step === (isOwner ? 3 : 2) ? "Skip or Continue" : "Continue"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {step === 0 && (
            <p className="text-xs text-center text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link href="/sign-in" className="underline hover:text-primary">
                Sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
