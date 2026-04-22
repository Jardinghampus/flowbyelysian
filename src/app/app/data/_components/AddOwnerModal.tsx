"use client"

import { useState } from "react"
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
import { addOwnerSchema } from "../_lib/schemas"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AddOwnerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  areas: string[]
}

export function AddOwnerModal({ open, onOpenChange, onSuccess, areas }: AddOwnerModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [area, setArea] = useState("")
  const [unitNumber, setUnitNumber] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [status, setStatus] = useState("owner")
  const [priority, setPriority] = useState("medium")
  const [followUpDays, setFollowUpDays] = useState("")
  const [notes, setNotes] = useState("")

  const resetForm = () => {
    setName(""); setPhone(""); setArea(""); setUnitNumber("")
    setBedrooms(""); setStatus("owner"); setPriority("medium")
    setFollowUpDays(""); setNotes("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const input = {
      name,
      phone,
      area,
      unit_number: unitNumber || undefined,
      bedrooms: bedrooms || undefined,
      status: status as "owner" | "considering" | "listed" | "sold" | "unresponsive",
      priority: priority as "high" | "medium" | "low",
      follow_up_days: followUpDays ? parseInt(followUpDays) : undefined,
      notes: notes || undefined,
    }

    const parsed = addOwnerSchema.safeParse(input)
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
      toast.error(firstError || "Please fix form errors")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      if (!res.ok) throw new Error("Failed to create owner")

      toast.success("Owner added successfully")
      resetForm()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Failed to add owner")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Owner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Owner name" className="mt-1" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs">Phone *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 123 4567" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Area *</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select area" /></SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Unit Number</Label>
              <Input value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} placeholder="e.g. A-1204" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Bedrooms</Label>
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="BR" /></SelectTrigger>
                <SelectContent>
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
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Follow-up in</Label>
            <Select value={followUpDays} onValueChange={setFollowUpDays}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Set follow-up" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="mt-1 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#C9A84C] hover:bg-[#B8973B] text-black">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Owner
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
