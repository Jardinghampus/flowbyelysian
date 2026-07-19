"use client"

import { useState } from "react"
import { Building2, KeyRound, ClipboardList, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  QUICK_AREAS,
  type QuickInquiryType,
  type QuickListingPayload,
  type QuickListingStatus,
  type QuickListingType,
  type QuickTransactionType,
} from "@/lib/listings/quick-add"

export type QuickAddPreset = {
  id: string
  label: string
  description: string
  status: QuickListingStatus
  inquiryType: QuickInquiryType
}

export const QUICK_ADD_PRESETS: QuickAddPreset[] = [
  {
    id: "live",
    label: "Live listing",
    description: "Publish to team feed",
    status: "live",
    inquiryType: "stock",
  },
  {
    id: "pocket",
    label: "Pocket listing",
    description: "Off-market stock",
    status: "pocket",
    inquiryType: "stock",
  },
  {
    id: "request",
    label: "Buyer request",
    description: "Client looking to buy/rent",
    status: "live",
    inquiryType: "request",
  },
]

type QuickListingFormProps = {
  preset: QuickAddPreset
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function QuickListingForm({ preset, open, onOpenChange, onCreated }: QuickListingFormProps) {
  const [title, setTitle] = useState("")
  const [area, setArea] = useState(QUICK_AREAS[0]!)
  const [customArea, setCustomArea] = useState("")
  const [price, setPrice] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [type, setType] = useState<QuickListingType>("apartment")
  const [transactionType, setTransactionType] = useState<QuickTransactionType>("sale")
  const [contactPhone, setContactPhone] = useState("")
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setTitle("")
    setArea(QUICK_AREAS[0]!)
    setCustomArea("")
    setPrice("")
    setBedrooms("")
    setType("apartment")
    setTransactionType("sale")
    setContactPhone("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !price.trim()) {
      toast.error("Title and price are required")
      return
    }

    const payload: QuickListingPayload = {
      title: title.trim(),
      area_name: area === "__custom" ? customArea.trim() : area,
      price: parseInt(price.replace(/\D/g, ""), 10),
      size: 0,
      type,
      status: preset.status,
      inquiry_type: preset.inquiryType,
      transaction_type: transactionType,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      contact_phone: contactPhone.trim() || undefined,
      notes: `quick-add:${preset.id}`,
    }

    setSaving(true)
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success(`${preset.label} saved`)
      reset()
      onOpenChange(false)
      onCreated?.()
    } catch {
      toast.error("Could not save listing")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="text-base">{preset.label}</DialogTitle>
          <DialogDescription>{preset.description} — only the essentials</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
          <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <Label htmlFor="qa-title">Title</Label>
            <Input
              id="qa-title"
              placeholder="Marina Gate 2BR sea view"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Area</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUICK_AREAS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom">Other…</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qa-price">Price (AED)</Label>
              <Input
                id="qa-price"
                inputMode="numeric"
                placeholder="2500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          {area === "__custom" ? (
            <Input
              placeholder="Custom area"
              value={customArea}
              onChange={(e) => setCustomArea(e.target.value)}
            />
          ) : null}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as QuickListingType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tx</Label>
              <Select
                value={transactionType}
                onValueChange={(v) => setTransactionType(v as QuickTransactionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qa-beds">Beds</Label>
              <Input
                id="qa-beds"
                inputMode="numeric"
                placeholder="2"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              />
            </div>
          </div>
          {preset.status === "pocket" ? (
            <div className="space-y-1.5">
              <Label htmlFor="qa-phone">Owner phone (optional)</Label>
              <Input
                id="qa-phone"
                placeholder="+971 50 …"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          ) : null}
          </div>
          <DialogFooter className="px-5 py-3 border-t bg-muted/30 shrink-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save & close
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function presetIcon(id: string) {
  switch (id) {
    case "live":
      return Building2
    case "pocket":
      return KeyRound
    default:
      return ClipboardList
  }
}
