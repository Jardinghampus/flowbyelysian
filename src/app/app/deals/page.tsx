"use client"

import { useCallback, useEffect, useState } from "react"
import { Handshake, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type Deal = {
  id: string
  title: string
  status: string
  deal_type: string
  offer_amount: number | null
  agreed_amount: number | null
  gross_commission: number | null
  expected_close_date: string | null
  commission_paid: boolean
  agent_name: string | null
  trakheesi_permit: string | null
  listing_id: string | null
}

const STATUSES = [
  "offer",
  "negotiation",
  "mou",
  "form_f",
  "closed_won",
  "closed_lost",
  "cancelled",
] as const

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [offerAmount, setOfferAmount] = useState("")
  const [dealType, setDealType] = useState<"sale" | "rent">("sale")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/deals?limit=100")
      const data = await res.json()
      setDeals(data.deals || [])
    } catch {
      toast.error("Failed to load deals")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const createDeal = async () => {
    if (!title.trim()) {
      toast.error("Title required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          dealType,
          offerAmount: offerAmount ? Number(offerAmount) : null,
          status: "offer",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success("Deal created")
      setOpen(false)
      setTitle("")
      setOfferAmount("")
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create deal")
    } finally {
      setSaving(false)
    }
  }

  const advance = async (deal: Deal, status: string) => {
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Update failed")
      toast.success(`Moved to ${status}`)
      await load()
    } catch {
      toast.error("Could not update deal")
    }
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Handshake className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
          <p className="text-sm text-muted-foreground">
            Offer → negotiation → MOU → Form F → close, with commission tracking.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New deal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create deal / offer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  placeholder="Emirates Hills villa — cash offer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={dealType} onValueChange={(v: "sale" | "rent") => setDealType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Offer amount (AED)</Label>
                  <Input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => void createDeal()} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : deals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No deals yet. Create an offer when a lead is serious.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {deals.map((deal) => (
            <Card key={deal.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{deal.title}</CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {deal.status.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {deal.deal_type}
                  </Badge>
                </div>
                <CardDescription>
                  {deal.agent_name || "Agent"}
                  {deal.offer_amount != null
                    ? ` · Offer AED ${Number(deal.offer_amount).toLocaleString()}`
                    : ""}
                  {deal.expected_close_date ? ` · Close ${deal.expected_close_date}` : ""}
                  {deal.commission_paid ? " · Commission paid" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {STATUSES.filter((s) => s !== deal.status).slice(0, 4).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs capitalize"
                    onClick={() => void advance(deal, s)}
                  >
                    → {s.replace(/_/g, " ")}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
