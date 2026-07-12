"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, DollarSign, Building2, Eye, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

type TargetsState = {
  target_deals: number
  target_sale_deals: number
  target_rent_deals: number
  target_commission_aed: number
  target_listings: number
  target_viewings: number
}

const defaults: TargetsState = {
  target_deals: 5,
  target_sale_deals: 2,
  target_rent_deals: 3,
  target_commission_aed: 100000,
  target_listings: 10,
  target_viewings: 25,
}

export function PersonalTargets() {
  const [targets, setTargets] = useState<TargetsState>(defaults)
  const [company, setCompany] = useState<Record<string, number> | null>(null)
  const [actuals, setActuals] = useState({ deals: 0, commission: 0, listings: 0, viewings: 0 })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const [tRes, oRes] = await Promise.all([
        fetch(`/api/performance/targets?year=${year}&month=${month}`),
        fetch(`/api/performance/overview?year=${year}&month=${month}`),
      ])
      const tJson = await tRes.json()
      const oJson = await oRes.json()

      if (tJson.personal) {
        setTargets({
          target_deals: Number(tJson.personal.target_deals) || 0,
          target_sale_deals: Number(tJson.personal.target_sale_deals) || 0,
          target_rent_deals: Number(tJson.personal.target_rent_deals) || 0,
          target_commission_aed: Number(tJson.personal.target_commission_aed) || 0,
          target_listings: Number(tJson.personal.target_listings) || 0,
          target_viewings: Number(tJson.personal.target_viewings) || 0,
        })
      }
      if (tJson.company) {
        setCompany({
          target_deals: Number(tJson.company.target_deals) || 0,
          target_commission_aed: Number(tJson.company.target_commission_aed) || 0,
          target_listings: Number(tJson.company.target_listings) || 0,
          target_viewings: Number(tJson.company.target_viewings) || 0,
        })
      }
      const me = (oJson.agents || [])[0]
      if (me) {
        setActuals({
          deals: me.deals || 0,
          commission: me.commission || 0,
          listings: me.listings || 0,
          viewings: me.viewings || 0,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const saveTargets = async () => {
    setSaving(true)
    try {
      const now = new Date()
      const res = await fetch("/api/performance/targets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "personal",
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          ...targets,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Save failed")
      toast.success("Personal KPIs saved")
      setHasChanges(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  const rows: Array<{
    key: keyof TargetsState
    label: string
    icon: React.ReactNode
    current: number
    max: number
    unit: string
    companyKey?: string
  }> = [
    { key: "target_deals", label: "Monthly deals", icon: <TrendingUp className="h-4 w-4" />, current: actuals.deals, max: 20, unit: "deals", companyKey: "target_deals" },
    { key: "target_commission_aed", label: "Commission", icon: <DollarSign className="h-4 w-4" />, current: actuals.commission, max: 300000, unit: "AED", companyKey: "target_commission_aed" },
    { key: "target_listings", label: "Listings", icon: <Building2 className="h-4 w-4" />, current: actuals.listings, max: 40, unit: "", companyKey: "target_listings" },
    { key: "target_viewings", label: "Viewings", icon: <Eye className="h-4 w-4" />, current: actuals.viewings, max: 80, unit: "", companyKey: "target_viewings" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" /> Personal KPIs
            </CardTitle>
            <CardDescription>Your targets this month — company standards shown as reference</CardDescription>
          </div>
          {hasChanges && (
            <Button size="sm" onClick={() => void saveTargets()} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          rows.map((row) => {
            const target = targets[row.key]
            const pct = target > 0 ? Math.round((row.current / target) * 100) : 0
            const companyVal = row.companyKey && company ? company[row.companyKey] : null
            return (
              <div key={row.key} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {row.icon}
                    {row.label}
                  </div>
                  <div className="flex items-center gap-2">
                    {companyVal != null && companyVal > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        Co. {companyVal.toLocaleString()}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {row.current.toLocaleString()} / {Number(target).toLocaleString()} {row.unit}
                    </span>
                  </div>
                </div>
                <Progress value={Math.min(pct, 100)} />
                <Slider
                  value={[Number(target)]}
                  min={0}
                  max={row.max}
                  step={row.key === "target_commission_aed" ? 5000 : 1}
                  onValueChange={(v) => {
                    setTargets((prev) => ({ ...prev, [row.key]: v[0] }))
                    setHasChanges(true)
                  }}
                />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
