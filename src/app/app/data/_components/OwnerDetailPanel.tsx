"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { Phone, MessageSquare, Mail, Users, Smartphone, ExternalLink, Loader2, Save } from "lucide-react"
import type { Owner, OutreachLog, OutreachType, OwnerStatus, OwnerPriority } from "../_lib/types"
import { STATUS_CONFIG, PRIORITY_CONFIG, OUTREACH_TYPE_CONFIG, DUBAI_AREAS } from "../_lib/types"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface OwnerDetailPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  owner: Owner | null
  logs: OutreachLog[]
  loading: boolean
  onRefresh: () => void
  onRefreshAll: () => void
}

const typeIcons: Record<OutreachType, React.ElementType> = {
  call: Phone,
  whatsapp: MessageSquare,
  email: Mail,
  meeting: Users,
  sms: Smartphone,
}

export function OwnerDetailPanel({
  open,
  onOpenChange,
  owner,
  logs,
  loading,
  onRefresh,
  onRefreshAll,
}: OwnerDetailPanelProps) {
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editArea, setEditArea] = useState("")
  const [editUnit, setEditUnit] = useState("")
  const [editBedrooms, setEditBedrooms] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [editPriority, setEditPriority] = useState("")
  const [editFollowUp, setEditFollowUp] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [initialized, setInitialized] = useState(false)

  if (owner && !initialized) {
    setEditName(owner.name)
    setEditPhone(owner.phone)
    setEditArea(owner.area)
    setEditUnit(owner.unit_number || "")
    setEditBedrooms(owner.bedrooms || "")
    setEditStatus(owner.status)
    setEditPriority(owner.priority)
    setEditFollowUp(owner.follow_up_at ? owner.follow_up_at.split("T")[0] : "")
    setEditNotes(owner.notes || "")
    setInitialized(true)
  }

  if (!owner && initialized) {
    setInitialized(false)
  }

  const handleSave = async () => {
    if (!owner) return
    setSaving(true)
    try {
      const res = await fetch(`/api/owners/${owner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          area: editArea,
          unit_number: editUnit || null,
          bedrooms: editBedrooms || null,
          status: editStatus,
          priority: editPriority,
          follow_up_at: editFollowUp ? new Date(editFollowUp).toISOString() : null,
          notes: editNotes || null,
        }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast.success("Owner updated")
      onRefresh()
      onRefreshAll()
    } catch {
      toast.error("Failed to update owner")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setInitialized(false) }}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto p-0">
        {loading || !owner ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 rounded-full border-2 border-[#C9A84C] border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <SheetHeader className="p-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className={cn("h-3 w-3 rounded-full", PRIORITY_CONFIG[owner.priority as OwnerPriority]?.color)} />
                <SheetTitle className="text-lg">{owner.name}</SheetTitle>
                <span className={cn(
                  "ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                  STATUS_CONFIG[owner.status as OwnerStatus]?.bg,
                  STATUS_CONFIG[owner.status as OwnerStatus]?.color,
                )}>{STATUS_CONFIG[owner.status as OwnerStatus]?.label}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-muted-foreground">{owner.phone}</span>
                <a
                  href={`https://wa.me/${owner.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  WhatsApp
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </SheetHeader>

            {/* Editable fields */}
            <div className="p-6 space-y-4 border-b">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1 h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="mt-1 h-8 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Area</Label>
                  <Select value={editArea} onValueChange={setEditArea}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DUBAI_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Unit</Label>
                  <Input value={editUnit} onChange={(e) => setEditUnit(e.target.value)} className="mt-1 h-8 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">BR</Label>
                  <Select value={editBedrooms || "none"} onValueChange={(v) => setEditBedrooms(v === "none" ? "" : v)}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5+">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="considering">Considering</SelectItem>
                      <SelectItem value="listed">Listed</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="unresponsive">Unresponsive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Select value={editPriority} onValueChange={setEditPriority}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Follow-up Date</Label>
                <Input
                  type="date"
                  value={editFollowUp}
                  onChange={(e) => setEditFollowUp(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="mt-1 text-sm resize-none"
                />
              </div>
              <Button onClick={handleSave} disabled={saving} size="sm" className="w-full bg-[#C9A84C] hover:bg-[#B8973B] text-black">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>

            {/* Outreach Timeline */}
            <div className="p-6">
              <h3 className="text-sm font-semibold mb-4">Outreach History ({logs.length})</h3>
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No outreach logged yet</p>
              ) : (
                <div className="space-y-0">
                  {logs.map((log, idx) => {
                    const Icon = typeIcons[log.type as OutreachType] || Phone
                    const config = OUTREACH_TYPE_CONFIG[log.type as OutreachType]
                    return (
                      <div key={log.id} className="relative flex gap-3 pb-4">
                        {idx < logs.length - 1 && (
                          <div className="absolute left-[13px] top-8 bottom-0 w-px bg-border" />
                        )}
                        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{config?.label || log.type}</span>
                            {log.status_changed_to && (
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full border",
                                STATUS_CONFIG[log.status_changed_to as OwnerStatus]?.bg,
                                STATUS_CONFIG[log.status_changed_to as OwnerStatus]?.color,
                              )}>
                                → {STATUS_CONFIG[log.status_changed_to as OwnerStatus]?.label}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              {formatDistanceToNow(new Date(log.logged_at), { addSuffix: true })}
                            </span>
                          </div>
                          {log.outcome && (
                            <p className="text-xs text-muted-foreground mt-0.5">{log.outcome}</p>
                          )}
                          {log.agent_name && (
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">by {log.agent_name}</p>
                          )}
                          {log.follow_up_set_to && (
                            <p className="text-[10px] text-amber-400 mt-0.5">
                              Follow-up set: {format(new Date(log.follow_up_set_to), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
