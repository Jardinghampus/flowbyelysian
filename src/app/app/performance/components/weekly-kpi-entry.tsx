"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { formatWeekLabel, weekStartMonday } from "@/lib/kpi/periods"

type WeekEntry = {
  total_listings: number
  new_listings: number
  offers: number
  viewings: number
  notes: string
  week_start: string
}

function shiftWeek(isoMonday: string, deltaWeeks: number) {
  const d = new Date(isoMonday + "T12:00:00")
  d.setDate(d.getDate() + deltaWeeks * 7)
  return weekStartMonday(d).toISOString().slice(0, 10)
}

export function WeeklyKpiEntry() {
  const [weekStart, setWeekStart] = useState(() =>
    weekStartMonday().toISOString().slice(0, 10)
  )
  const [entry, setEntry] = useState<WeekEntry>({
    total_listings: 0,
    new_listings: 0,
    offers: 0,
    viewings: 0,
    notes: "",
    week_start: weekStart,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/kpi?period=week&week_start=${weekStart}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      const w = json.myWeek
      setEntry({
        total_listings: Number(w.total_listings) || 0,
        new_listings: Number(w.new_listings) || 0,
        offers: Number(w.offers) || 0,
        viewings: Number(w.viewings) || 0,
        notes: w.notes || "",
        week_start: w.week_start || weekStart,
      })
    } catch (e) {
      console.error(e)
      toast.error("Could not load your weekly KPI")
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/kpi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_start: weekStart,
          total_listings: entry.total_listings,
          new_listings: entry.new_listings,
          offers: entry.offers,
          viewings: entry.viewings,
          notes: entry.notes,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Save failed")
      toast.success("Weekly KPI saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const weekOptions = [-2, -1, 0, 1].map((delta) => {
    const iso = shiftWeek(weekStartMonday().toISOString().slice(0, 10), delta)
    return { iso, label: formatWeekLabel(new Date(iso + "T12:00:00")) }
  })

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>My weekly stats</CardTitle>
          <CardDescription>
            Monday–Sunday · total listings, new listings, offers, viewings
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={weekStart} onValueChange={setWeekStart}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weekOptions.map((w) => (
                <SelectItem key={w.iso} value={w.iso}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => void save()} disabled={saving || loading}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-20 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["total_listings", "Total listings"],
                ["new_listings", "New listings"],
                ["offers", "Offers"],
                ["viewings", "Viewings"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  type="number"
                  min={0}
                  value={entry[key]}
                  onChange={(e) =>
                    setEntry((prev) => ({ ...prev, [key]: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
