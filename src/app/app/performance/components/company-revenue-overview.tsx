"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Overview = {
  period: { year: number; month: number }
  company: {
    thisMonth: {
      revenue: number
      commission: number
      deals: number
      saleDeals: number
      rentDeals: number
      saleCommission: number
      rentCommission: number
      saleRevenue: number
      rentRevenue: number
    }
    lastMonth: {
      revenue: number
      commission: number
      deals: number
      saleCommission: number
      rentCommission: number
      saleDeals: number
      rentDeals: number
    }
    delta: {
      revenue: number
      commission: number
      deals: number
      saleDeals: number
      rentDeals: number
    }
    forecast: {
      revenue: { projected: number; dayOfMonth: number; daysInMonth: number; pacePct: number }
      commission: { projected: number; dayOfMonth: number; daysInMonth: number; pacePct: number }
    }
    vsCompanyTarget: {
      revenuePct: number | null
      commissionPct: number | null
      dealsPct: number | null
    } | null
  }
  companyStandards: {
    target_revenue_aed: number
    target_commission_aed: number
    target_deals: number
  } | null
  agents: Array<{
    agentId: string
    agentName: string
    saleDeals: number
    rentDeals: number
    saleCommission: number
    rentCommission: number
    deals: number
    commission: number
    revenue: number
    targetPercent: number
    rank: number
  }>
}

function aed(n: number) {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `AED ${Math.round(n / 1000)}K`
  return `AED ${Math.round(n).toLocaleString("en-AE")}`
}

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="inline-flex items-center gap-1 text-muted-foreground"><Minus className="h-3.5 w-3.5" /> flat vs last month</span>
  if (value > 0) return <span className="inline-flex items-center gap-1 text-emerald-600"><TrendingUp className="h-3.5 w-3.5" /> +{aed(value)} vs last month</span>
  return <span className="inline-flex items-center gap-1 text-rose-600"><TrendingDown className="h-3.5 w-3.5" /> {aed(value)} vs last month</span>
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

export function CompanyRevenueOverview({
  onLoaded,
}: {
  onLoaded?: (data: Overview) => void
}) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/performance/overview?year=${year}&month=${month}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      setData(json)
      onLoaded?.(json)
    } catch (e) {
      console.error(e)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [year, month, onLoaded])

  useEffect(() => {
    void load()
  }, [load])

  const t = data?.company.thisMonth
  const f = data?.company.forecast
  const vs = data?.company.vsCompanyTarget

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Company revenue</h2>
          <p className="text-sm text-muted-foreground">
            Closed deals + admin actuals · sale vs rent · MoM · run-rate forecast
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((label, i) => (
                <SelectItem key={label} value={String(i + 1)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading || !t || !f ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total revenue (agreed)</CardDescription>
                <CardTitle className="text-2xl">{aed(t.revenue)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <Delta value={data.company.delta.revenue} />
                <div>Last month: {aed(data.company.lastMonth.revenue)}</div>
                {vs?.revenuePct != null && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>vs company target</span>
                      <span>{vs.revenuePct}%</span>
                    </div>
                    <Progress value={Math.min(vs.revenuePct, 100)} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Gross commission</CardDescription>
                <CardTitle className="text-2xl">{aed(t.commission)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <Delta value={data.company.delta.commission} />
                <div>Sale {aed(t.saleCommission)} · Rent {aed(t.rentCommission)}</div>
                <div>
                  Last month: {aed(data.company.lastMonth.commission)} (S{" "}
                  {aed(data.company.lastMonth.saleCommission)} · R{" "}
                  {aed(data.company.lastMonth.rentCommission)})
                </div>
                {vs?.commissionPct != null && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>vs company target</span>
                      <span>{vs.commissionPct}%</span>
                    </div>
                    <Progress value={Math.min(vs.commissionPct, 100)} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Deals closed</CardDescription>
                <CardTitle className="text-2xl">{t.deals}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex gap-2">
                  <Badge variant="secondary">Sale {t.saleDeals}</Badge>
                  <Badge variant="outline">Rent {t.rentDeals}</Badge>
                </div>
                <div>
                  {data.company.delta.deals >= 0 ? "+" : ""}
                  {data.company.delta.deals} vs last month ({data.company.lastMonth.deals})
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Month-end forecast</CardDescription>
                <CardTitle className="text-2xl">{aed(f.revenue.projected)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div>
                  Pace day {f.revenue.dayOfMonth}/{f.revenue.daysInMonth} ({f.revenue.pacePct}% of month)
                </div>
                <div>Projected commission: {aed(f.commission.projected)}</div>
                <p className="pt-1 leading-relaxed">
                  Linear run-rate from day 1 → today. If you keep this pace, this is where the month lands.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sale vs rental</CardTitle>
              <CardDescription>
                {MONTHS[month - 1]} {year} · revenue and commission split
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Sales</span>
                  <Badge>{t.saleDeals} deals</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Revenue {aed(t.saleRevenue)}</div>
                <div className="text-sm text-muted-foreground">Commission {aed(t.saleCommission)}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Rentals</span>
                  <Badge variant="outline">{t.rentDeals} deals</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Revenue {aed(t.rentRevenue)}</div>
                <div className="text-sm text-muted-foreground">Commission {aed(t.rentCommission)}</div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export type { Overview as PerformanceOverviewData }
