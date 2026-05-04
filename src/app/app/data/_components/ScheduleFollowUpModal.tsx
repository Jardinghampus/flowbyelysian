"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, CalendarDays, Phone, MapPin, Loader2, Check } from "lucide-react"
import type { Owner } from "../_lib/types"
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../_lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { addDays, format } from "date-fns"

interface ScheduleFollowUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  owners: Owner[]
  prefillOwner?: Owner | null
  onSuccess: () => void
}

function sevenDaysFromNow() {
  return format(addDays(new Date(), 7), "yyyy-MM-dd")
}

export function ScheduleFollowUpModal({
  open,
  onOpenChange,
  owners,
  prefillOwner,
  onSuccess,
}: ScheduleFollowUpModalProps) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Owner | null>(prefillOwner ?? null)
  const [date, setDate] = useState(sevenDaysFromNow)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setSelected(prefillOwner ?? null)
      setQuery("")
      setDate(sevenDaysFromNow())
    }
  }, [open, prefillOwner])

  // Search by name OR phone number — phone number match is how owners sync
  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, "")
    if (!q || q.length < 2) return []
    return owners.filter((o) => {
      const nameMatch = o.name.toLowerCase().includes(q)
      const phoneMatch = o.phone.replace(/\s+/g, "").toLowerCase().includes(q) ||
        (o.whatsapp_number ?? "").replace(/\s+/g, "").toLowerCase().includes(q)
      return nameMatch || phoneMatch
    }).slice(0, 6)
  }, [query, owners])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) { toast.error("Select an owner first"); return }
    if (!date) { toast.error("Choose a date"); return }

    setLoading(true)
    try {
      const res = await fetch(`/api/owners/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follow_up_at: new Date(date).toISOString() }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Follow-up set for ${selected.name}`)
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Failed to set follow-up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#4B8EDB]" />
            Schedule Follow-up
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Owner search — or locked to prefill */}
          {prefillOwner ? (
            <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
              <p className="text-sm font-medium">{prefillOwner.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {prefillOwner.area}
                {prefillOwner.unit_number && <span>· {prefillOwner.unit_number}</span>}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs">Owner — search by name or phone number</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Type name or +971 50…"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
                  className="pl-9 h-9 text-sm"
                  autoFocus
                />
              </div>

              {/* Dropdown results */}
              {results.length > 0 && !selected && (
                <div className="rounded-lg border bg-popover shadow-md overflow-hidden">
                  {results.map((owner) => (
                    <button
                      key={owner.id}
                      type="button"
                      onClick={() => { setSelected(owner); setQuery(owner.name) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className={cn("h-2 w-2 rounded-full flex-shrink-0", PRIORITY_CONFIG[owner.priority]?.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{owner.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5" />{owner.phone}
                          </span>
                          <span>· {owner.area}</span>
                        </p>
                      </div>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0",
                        STATUS_CONFIG[owner.status]?.bg,
                        STATUS_CONFIG[owner.status]?.color,
                      )}>
                        {STATUS_CONFIG[owner.status]?.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected owner confirmation */}
              {selected && (
                <div className="flex items-center gap-2 rounded-lg border border-[#4B8EDB]/30 bg-[#4B8EDB]/5 px-3 py-2">
                  <Check className="h-3.5 w-3.5 text-[#4B8EDB] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.phone} · {selected.area}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelected(null); setQuery("") }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Date picker with quick presets */}
          <div className="space-y-2">
            <Label className="text-xs">Follow-up date</Label>
            <div className="flex items-center gap-2">
              {[
                { label: "3d", days: 3 },
                { label: "7d", days: 7 },
                { label: "14d", days: 14 },
                { label: "30d", days: 30 },
              ].map(({ label, days }) => {
                const val = format(addDays(new Date(), days), "yyyy-MM-dd")
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDate(val)}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all",
                      date === val
                        ? "border-[#4B8EDB] bg-[#4B8EDB]/10 text-[#4B8EDB]"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              className="h-9 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || (!selected && !prefillOwner)}
              className="bg-[#4B8EDB] hover:bg-[#3A7DCB] text-white"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Set Follow-up
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
