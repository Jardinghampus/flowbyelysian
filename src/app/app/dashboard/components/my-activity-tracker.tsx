"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Phone,
  Users,
  Eye,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  BarChart3,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useDemoUser } from "@/contexts/demo-user-context"

interface DailyActivity {
  agent_id: string
  activity_date: string
  calls_wa: number
  leads: number
  viewings: number
  notes?: string
}

type Period = "7d" | "30d" | "90d"

const chartConfig = {
  calls_wa: {
    label: "Calls/WA",
    color: "hsl(217, 91%, 60%)",
  },
  leads: {
    label: "Leads",
    color: "hsl(160, 84%, 39%)",
  },
  viewings: {
    label: "Viewings",
    color: "hsl(25, 95%, 53%)",
  },
} satisfies ChartConfig

const metricConfig = [
  {
    key: "calls_wa" as const,
    label: "Calls / WA",
    icon: Phone,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    ring: "focus-within:ring-blue-500/20",
  },
  {
    key: "leads" as const,
    label: "Leads",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    ring: "focus-within:ring-emerald-500/20",
  },
  {
    key: "viewings" as const,
    label: "Viewings",
    icon: Eye,
    color: "text-orange-600",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    ring: "focus-within:ring-orange-500/20",
  },
]

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

function getWeekDays(refDate: Date): { date: string; label: string; dayLabel: string }[] {
  const days: { date: string; label: string; dayLabel: string }[] = []
  const start = new Date(refDate)
  // Go to Monday of that week
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push({
      date: formatDate(d),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      dayLabel: d.toLocaleDateString("en-GB", { weekday: "short" }),
    })
  }
  return days
}

function getPeriodRange(period: Period): { from: string; to: string } {
  const now = new Date()
  const to = formatDate(now)
  const start = new Date(now)
  if (period === "7d") start.setDate(start.getDate() - 6)
  else if (period === "30d") start.setDate(1) // This month
  else start.setMonth(start.getMonth() - 3) // 3 months back
  return { from: formatDate(start), to }
}

export function MyActivityTracker() {
  const { user } = useDemoUser()
  const agentId = user?.id ?? "demo-user-001"

  const [weekOffset, setWeekOffset] = useState(0)
  const [weekData, setWeekData] = useState<Record<string, DailyActivity>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>("30d")
  const [periodData, setPeriodData] = useState<DailyActivity[]>([])
  const [periodLoading, setPeriodLoading] = useState(true)

  // Get current week days based on offset
  const weekRef = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + weekOffset * 7)
    return d
  }, [weekOffset])

  const weekDays = useMemo(() => getWeekDays(weekRef), [weekRef])
  const today = formatDate(new Date())
  const isCurrentWeek = weekOffset === 0

  // Week label
  const weekLabel = useMemo(() => {
    if (isCurrentWeek) return "This Week"
    if (weekOffset === -1) return "Last Week"
    return `${weekDays[0].label} – ${weekDays[6].label}`
  }, [isCurrentWeek, weekOffset, weekDays])

  // Fetch week data
  const fetchWeekData = useCallback(async () => {
    setLoading(true)
    try {
      const from = weekDays[0].date
      const to = weekDays[6].date
      const res = await fetch(`/api/daily-activity?agent_id=${agentId}&from=${from}&to=${to}`)
      if (res.ok) {
        const { data } = await res.json()
        const map: Record<string, DailyActivity> = {}
        if (data) {
          for (const d of data) {
            map[d.activity_date] = d
          }
        }
        setWeekData(map)
      }
    } catch {
      // Keep local state
    } finally {
      setLoading(false)
    }
  }, [agentId, weekDays])

  // Fetch period data for chart
  const fetchPeriodData = useCallback(async () => {
    setPeriodLoading(true)
    try {
      const { from, to } = getPeriodRange(period)
      const res = await fetch(`/api/daily-activity?agent_id=${agentId}&from=${from}&to=${to}`)
      if (res.ok) {
        const { data } = await res.json()
        setPeriodData(data ?? [])
      }
    } catch {
      // Keep empty
    } finally {
      setPeriodLoading(false)
    }
  }, [agentId, period])

  useEffect(() => {
    fetchWeekData()
  }, [fetchWeekData])

  useEffect(() => {
    fetchPeriodData()
  }, [fetchPeriodData])

  // Get or create activity for a date
  const getActivity = (date: string): DailyActivity =>
    weekData[date] ?? {
      agent_id: agentId,
      activity_date: date,
      calls_wa: 0,
      leads: 0,
      viewings: 0,
    }

  // Update a metric for a specific date
  const updateMetric = (
    date: string,
    key: "calls_wa" | "leads" | "viewings",
    value: number
  ) => {
    const val = Math.max(0, Math.min(999, value))
    setWeekData((prev) => ({
      ...prev,
      [date]: {
        ...getActivity(date),
        [key]: isNaN(val) ? 0 : val,
      },
    }))
  }

  // Save all changed days in the week
  const saveWeek = async () => {
    setSaving(true)
    try {
      const entries = Object.values(weekData).filter(
        (d) => d.calls_wa > 0 || d.leads > 0 || d.viewings > 0
      )

      // Also save zeroed-out days that might have had previous values
      const allDates = weekDays.map((d) => d.date)
      for (const date of allDates) {
        const activity = getActivity(date)
        if (!entries.find((e) => e.activity_date === date)) {
          // Check if we should save zeros (i.e., date is not in the future)
          if (date <= today) {
            entries.push(activity)
          }
        }
      }

      const pastEntries = entries.filter((e) => e.activity_date <= today)

      await Promise.all(
        pastEntries.map((activity) =>
          fetch("/api/daily-activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agent_id: agentId,
              activity_date: activity.activity_date,
              calls_wa: activity.calls_wa,
              leads: activity.leads,
              viewings: activity.viewings,
            }),
          })
        )
      )

      toast.success("Activity saved!")
      fetchPeriodData()
    } catch {
      toast.error("Failed to save activity")
    } finally {
      setSaving(false)
    }
  }

  // Period aggregations
  const periodTotals = useMemo(() => {
    return periodData.reduce(
      (acc, d) => ({
        calls_wa: acc.calls_wa + (d.calls_wa || 0),
        leads: acc.leads + (d.leads || 0),
        viewings: acc.viewings + (d.viewings || 0),
      }),
      { calls_wa: 0, leads: 0, viewings: 0 }
    )
  }, [periodData])

  // Weekly totals from input data
  const weekTotals = useMemo(() => {
    return weekDays.reduce(
      (acc, day) => {
        const a = getActivity(day.date)
        return {
          calls_wa: acc.calls_wa + a.calls_wa,
          leads: acc.leads + a.leads,
          viewings: acc.viewings + a.viewings,
        }
      },
      { calls_wa: 0, leads: 0, viewings: 0 }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDays, weekData])

  // Chart data - aggregate by date for the chart
  const chartData = useMemo(() => {
    const sorted = [...periodData].sort(
      (a, b) => a.activity_date.localeCompare(b.activity_date)
    )

    if (period === "90d") {
      // Group by week for 3-month view
      const weeks: Record<string, { calls_wa: number; leads: number; viewings: number; date: string }> = {}
      for (const d of sorted) {
        const dt = new Date(d.activity_date + "T00:00:00")
        const weekStart = new Date(dt)
        const day = weekStart.getDay()
        const diff = day === 0 ? -6 : 1 - day
        weekStart.setDate(weekStart.getDate() + diff)
        const key = formatDate(weekStart)
        if (!weeks[key]) weeks[key] = { calls_wa: 0, leads: 0, viewings: 0, date: key }
        weeks[key].calls_wa += d.calls_wa || 0
        weeks[key].leads += d.leads || 0
        weeks[key].viewings += d.viewings || 0
      }
      return Object.values(weeks).sort((a, b) => a.date.localeCompare(b.date))
    }

    return sorted.map((d) => ({
      date: d.activity_date,
      calls_wa: d.calls_wa || 0,
      leads: d.leads || 0,
      viewings: d.viewings || 0,
    }))
  }, [periodData, period])

  // Daily average
  const daysLogged = periodData.filter(
    (d) => (d.calls_wa || 0) + (d.leads || 0) + (d.viewings || 0) > 0
  ).length
  const totalPeriod = periodTotals.calls_wa + periodTotals.leads + periodTotals.viewings
  const dailyAvg = daysLogged > 0 ? Math.round(totalPeriod / daysLogged) : 0

  // Trend (compare first half vs second half of period)
  const trend = useMemo(() => {
    if (periodData.length < 4) return 0
    const mid = Math.floor(periodData.length / 2)
    const sorted = [...periodData].sort((a, b) => a.activity_date.localeCompare(b.activity_date))
    const firstHalf = sorted.slice(0, mid).reduce(
      (s, d) => s + (d.calls_wa || 0) + (d.leads || 0) + (d.viewings || 0), 0
    )
    const secondHalf = sorted.slice(mid).reduce(
      (s, d) => s + (d.calls_wa || 0) + (d.leads || 0) + (d.viewings || 0), 0
    )
    if (firstHalf === 0) return secondHalf > 0 ? 100 : 0
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
  }, [periodData])

  return (
    <Card className="@container/tracker">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-base">My Activity</CardTitle>
            <p className="text-xs text-muted-foreground">Track your daily performance</p>
          </div>
        </div>
        <CardAction>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[140px] h-8 text-xs" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg text-xs">Last 7 days</SelectItem>
              <SelectItem value="30d" className="rounded-lg text-xs">This month</SelectItem>
              <SelectItem value="90d" className="rounded-lg text-xs">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        {/* Period Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          {metricConfig.map((m) => (
            <div
              key={m.key}
              className={cn(
                "relative flex flex-col items-center p-3 rounded-xl border transition-colors",
                m.bg,
                m.border
              )}
            >
              <m.icon className={cn("h-4 w-4 mb-1", m.color)} />
              <span className="text-xl font-bold tabular-nums">
                {periodLoading ? (
                  <span className="inline-block h-6 w-8 rounded bg-muted animate-pulse" />
                ) : (
                  periodTotals[m.key]
                )}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{daysLogged}</span> days logged
            </span>
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{dailyAvg}</span>/day avg
            </span>
          </div>
          {trend !== 0 && (
            <Badge
              variant={trend > 0 ? "default" : "secondary"}
              className={cn(
                "text-[10px] gap-0.5",
                trend > 0 && "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20",
                trend < 0 && "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-500/20"
              )}
            >
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend > 0 ? "+" : ""}{trend}%
            </Badge>
          )}
        </div>

        {/* Chart */}
        {!periodLoading && chartData.length > 0 && (
          <div className="rounded-xl border bg-muted/30 p-2">
            <ChartContainer config={chartConfig} className="aspect-auto h-[140px] w-full">
              {period === "90d" ? (
                <BarChart data={chartData} barGap={1}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    minTickGap={40}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      const d = new Date(value + "T00:00:00")
                      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                    }}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          const d = new Date(value as string)
                          return `Week of ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Bar dataKey="calls_wa" fill="var(--color-calls_wa)" radius={[3, 3, 0, 0]} stackId="a" />
                  <Bar dataKey="leads" fill="var(--color-leads)" radius={[0, 0, 0, 0]} stackId="a" />
                  <Bar dataKey="viewings" fill="var(--color-viewings)" radius={[0, 0, 3, 3]} stackId="a" />
                </BarChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-calls_wa)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-calls_wa)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-leads)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillViewings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-viewings)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-viewings)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    minTickGap={32}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      const d = new Date(value + "T00:00:00")
                      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                    }}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          const d = new Date(value as string)
                          return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="calls_wa"
                    type="monotone"
                    fill="url(#fillCalls)"
                    stroke="var(--color-calls_wa)"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="leads"
                    type="monotone"
                    fill="url(#fillLeads)"
                    stroke="var(--color-leads)"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="viewings"
                    type="monotone"
                    fill="url(#fillViewings)"
                    stroke="var(--color-viewings)"
                    strokeWidth={2}
                  />
                </AreaChart>
              )}
            </ChartContainer>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-4 mt-2">
              {metricConfig.map((m) => (
                <div key={m.key} className="flex items-center gap-1.5">
                  <div className={cn("h-2 w-2 rounded-full", m.key === "calls_wa" ? "bg-blue-500" : m.key === "leads" ? "bg-emerald-500" : "bg-orange-500")} />
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" />
              Quick Log
            </span>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setWeekOffset((o) => o - 1)}
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Prev
          </Button>
          <Badge variant={isCurrentWeek ? "default" : "secondary"} className="text-xs px-3">
            {weekLabel}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setWeekOffset((o) => o + 1)}
            disabled={isCurrentWeek}
          >
            Next
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Weekly Input Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Header */}
            <div className="grid items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
              style={{ gridTemplateColumns: "4.5rem repeat(3, 1fr) auto" }}
            >
              <div />
              {metricConfig.map((m) => (
                <div key={m.key} className="flex items-center justify-center gap-1">
                  <m.icon className={cn("h-3 w-3", m.color)} />
                  <span className="hidden @[480px]/tracker:inline">{m.label}</span>
                </div>
              ))}
              <div className="w-9" />
            </div>

            {/* Day Rows */}
            {weekDays.map((day) => {
              const activity = getActivity(day.date)
              const isFuture = day.date > today
              const isToday = day.date === today
              const total = activity.calls_wa + activity.leads + activity.viewings

              return (
                <div
                  key={day.date}
                  className={cn(
                    "grid items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors",
                    isToday && "bg-primary/5 ring-1 ring-primary/20",
                    isFuture && "opacity-40 pointer-events-none",
                    !isToday && !isFuture && "hover:bg-muted/50"
                  )}
                  style={{ gridTemplateColumns: "4.5rem repeat(3, 1fr) auto" }}
                >
                  <div className="flex flex-col">
                    <span className={cn("text-xs font-medium", isToday && "text-primary")}>
                      {day.dayLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{day.label}</span>
                  </div>

                  {metricConfig.map((m) => (
                    <div key={m.key} className="flex justify-center">
                      <Input
                        type="number"
                        min={0}
                        max={999}
                        value={activity[m.key] || ""}
                        placeholder="0"
                        onChange={(e) =>
                          updateMetric(day.date, m.key, parseInt(e.target.value) || 0)
                        }
                        className={cn(
                          "h-8 w-full max-w-[4rem] text-center text-sm font-medium tabular-nums rounded-lg border",
                          m.border,
                          m.ring,
                          activity[m.key] > 0 && m.color
                        )}
                        disabled={isFuture}
                      />
                    </div>
                  ))}

                  <div className="flex justify-end w-9">
                    {total > 0 && (
                      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                        {total}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Week Totals */}
            <div
              className="grid items-center gap-1.5 rounded-lg bg-muted/50 px-2 py-2 mt-1"
              style={{ gridTemplateColumns: "4.5rem repeat(3, 1fr) auto" }}
            >
              <span className="text-xs font-semibold">Total</span>
              {metricConfig.map((m) => (
                <div key={m.key} className="flex justify-center">
                  <span className={cn("text-sm font-bold tabular-nums", m.color)}>
                    {weekTotals[m.key]}
                  </span>
                </div>
              ))}
              <div className="flex justify-end w-9">
                <Badge variant="secondary" className="text-[10px]">
                  {weekTotals.calls_wa + weekTotals.leads + weekTotals.viewings}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={saveWeek}
          disabled={saving}
          className="w-full h-9 text-sm"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Week
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
