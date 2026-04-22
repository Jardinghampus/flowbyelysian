"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Owner, OutreachType } from "../_lib/types"
import { OUTREACH_TYPE_CONFIG } from "../_lib/types"
import { toast } from "sonner"
import { Loader2, Phone, MessageSquare, Mail, Users, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogOutreachModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefillOwner?: Owner | null
  owners: Owner[]
  onSuccess: () => void
}

const typeIcons: Record<OutreachType, React.ElementType> = {
  call: Phone,
  whatsapp: MessageSquare,
  email: Mail,
  meeting: Users,
  sms: Smartphone,
}

export function LogOutreachModal({ open, onOpenChange, prefillOwner, owners, onSuccess }: LogOutreachModalProps) {
  const [loading, setLoading] = useState(false)
  const [ownerId, setOwnerId] = useState("")
  const [type, setType] = useState<OutreachType>("call")
  const [outcome, setOutcome] = useState("")
  const [statusChange, setStatusChange] = useState("")
  const [followUpDays, setFollowUpDays] = useState("")
  const [customDate, setCustomDate] = useState("")

  useEffect(() => {
    if (prefillOwner) {
      setOwnerId(prefillOwner.id)
    }
  }, [prefillOwner])

  const resetForm = () => {
    setOwnerId(""); setType("call"); setOutcome("")
    setStatusChange(""); setFollowUpDays(""); setCustomDate("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ownerId) {
      toast.error("Please select an owner")
      return
    }

    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        owner_id: ownerId,
        type,
        outcome: outcome || undefined,
      }
      if (statusChange) body.status_changed_to = statusChange
      if (followUpDays === "custom" && customDate) {
        body.follow_up_date = customDate
      } else if (followUpDays) {
        body.follow_up_days = parseInt(followUpDays)
      }

      const res = await fetch("/api/outreach-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("Failed to log outreach")

      toast.success("Outreach logged")
      resetForm()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Failed to log outreach")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Log Outreach</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Owner selector */}
          {!prefillOwner && (
            <div>
              <Label className="text-xs">Owner *</Label>
              <Select value={ownerId} onValueChange={setOwnerId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name} — {o.area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {prefillOwner && (
            <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
              <p className="text-sm font-medium">{prefillOwner.name}</p>
              <p className="text-xs text-muted-foreground">{prefillOwner.area} {prefillOwner.unit_number ? `· ${prefillOwner.unit_number}` : ""}</p>
            </div>
          )}

          {/* Outreach type */}
          <div>
            <Label className="text-xs mb-2 block">Type *</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.entries(OUTREACH_TYPE_CONFIG) as [OutreachType, { label: string }][]).map(([key, config]) => {
                const Icon = typeIcons[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-all",
                      type === key
                        ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                        : "border-border hover:border-border/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Outcome */}
          <div>
            <Label className="text-xs">Notes / Outcome</Label>
            <Textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="What happened? Key takeaways..."
              rows={2}
              className="mt-1 resize-none"
            />
          </div>

          {/* Status change */}
          <div>
            <Label className="text-xs">Update Status</Label>
            <Select value={statusChange || "none"} onValueChange={(v) => setStatusChange(v === "none" ? "" : v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="No change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="considering">Considering</SelectItem>
                <SelectItem value="listed">Listed</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="unresponsive">Unresponsive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Follow-up */}
          <div>
            <Label className="text-xs">Set Next Follow-up</Label>
            <Select value={followUpDays || "none"} onValueChange={(v) => setFollowUpDays(v === "none" ? "" : v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="No follow-up" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No follow-up</SelectItem>
                <SelectItem value="3">In 3 days</SelectItem>
                <SelectItem value="7">In 7 days</SelectItem>
                <SelectItem value="14">In 14 days</SelectItem>
                <SelectItem value="30">In 30 days</SelectItem>
                <SelectItem value="custom">Custom date</SelectItem>
              </SelectContent>
            </Select>
            {followUpDays === "custom" && (
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#C9A84C] hover:bg-[#B8973B] text-black">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Log Outreach
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
