"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Phone,
  Users,
  Eye,
  Plus,
  Minus,
  Save,
  Loader2,
  CalendarDays,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import agentData from "../../dashboard/data/agent-performance.json"

interface DailyActivity {
  agent_id: string
  agent_name: string
  activity_date: string
  calls_wa: number
  leads: number
  viewings: number
  notes?: string
}

const agents = agentData.agents.map((a) => ({
  id: String(a.id),
  name: a.name,
  initials: a.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase(),
  area: a.area,
  role: a.role,
}))

const metricConfig = [
  {
    key: "calls_wa" as const,
    label: "Calls / WA",
    icon: Phone,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    accent: "border-blue-500/30",
  },
  {
    key: "leads" as const,
    label: "Leads",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    accent: "border-emerald-500/30",
  },
  {
    key: "viewings" as const,
    label: "Viewings",
    icon: Eye,
    color: "text-orange-600",
    bg: "bg-orange-500/10",
    accent: "border-orange-500/30",
  },
]

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const today = formatDate(new Date())
  const yesterday = formatDate(new Date(Date.now() - 86400000))
  if (dateStr === today) return "Today"
  if (dateStr === yesterday) return "Yesterday"
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

function CounterButton({
  value,
  onChange,
  metric,
}: {
  value: number
  onChange: (v: number) => void
  metric: (typeof metricConfig)[0]
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border", metric.accent, metric.bg)}>
      <div className={cn("flex items-center gap-1.5", metric.color)}>
        <metric.icon className="h-4 w-4" />
        <span className="text-xs font-medium">{metric.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-2xl font-bold w-10 text-center tabular-nums">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={() => onChange(value + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function DailyTracker() {
  const [tab, setTab] = useState<"log" | "team">("log")
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [activities, setActivities] = useState<Record<string, DailyActivity>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [teamData, setTeamData] = useState<DailyActivity[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch team data for the selected date
  const fetchTeamData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/daily-activity?date=${selectedDate}`)
      if (res.ok) {
        const { data } = await res.json()
        if (data) {
          setTeamData(data)
          // Also populate activities map for editing
          const map: Record<string, DailyActivity> = {}
          for (const d of data) {
            map[d.agent_id] = d
          }
          setActivities(map)
        }
      }
    } catch {
      // Use local state if API unavailable
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchTeamData()
  }, [fetchTeamData])

  const getActivity = (agentId: string): DailyActivity => {
    return (
      activities[agentId] ?? {
        agent_id: agentId,
        agent_name: agents.find((a) => a.id === agentId)?.name ?? "",
        activity_date: selectedDate,
        calls_wa: 0,
        leads: 0,
        viewings: 0,
      }
    )
  }

  const updateMetric = (agentId: string, key: keyof Pick<DailyActivity, "calls_wa" | "leads" | "viewings">, value: number) => {
    const agent = agents.find((a) => a.id === agentId)
    setActivities((prev) => ({
      ...prev,
      [agentId]: {
        ...getActivity(agentId),
        agent_name: agent?.name ?? "",
        activity_date: selectedDate,
        [key]: value,
      },
    }))
  }

  const saveActivity = async (agentId: string) => {
    setSaving(agentId)
    const activity = getActivity(agentId)
    try {
      const res = await fetch("/api/daily-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          activity_date: selectedDate,
          calls_wa: activity.calls_wa,
          leads: activity.leads,
          viewings: activity.viewings,
          notes: activity.notes,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Activity saved for ${agents.find((a) => a.id === agentId)?.name}`)
    } catch {
      toast.error("Failed to save activity")
    } finally {
      setSaving(null)
    }
  }

  const navigateDate = (delta: number) => {
    const d = new Date(selectedDate + "T00:00:00")
    d.setDate(d.getDate() + delta)
    const today = new Date()
    if (d <= today) {
      setSelectedDate(formatDate(d))
    }
  }

  const isToday = selectedDate === formatDate(new Date())

  // Team totals for the selected date
  const teamTotals = agents.reduce(
    (acc, agent) => {
      const a = getActivity(agent.id)
      return {
        calls_wa: acc.calls_wa + a.calls_wa,
        leads: acc.leads + a.leads,
        viewings: acc.viewings + a.viewings,
      }
    },
    { calls_wa: 0, leads: 0, viewings: 0 }
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Daily Activity Tracker</CardTitle>
              <CardDescription>Log calls, leads & viewings for every agent</CardDescription>
            </div>
          </div>
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant={isToday ? "default" : "secondary"} className="text-xs px-3 py-1">
              {formatDisplayDate(selectedDate)}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateDate(1)}
              disabled={isToday}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Totals Bar */}
        <div className="grid grid-cols-3 gap-3">
          {metricConfig.map((m) => (
            <div key={m.key} className={cn("flex items-center gap-2 p-3 rounded-xl border", m.accent, m.bg)}>
              <m.icon className={cn("h-5 w-5", m.color)} />
              <div>
                <p className="text-2xl font-bold tabular-nums">{teamTotals[m.key]}</p>
                <p className="text-xs text-muted-foreground">{m.label} (Team)</p>
              </div>
            </div>
          ))}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "log" | "team")}>
          <TabsList className="w-full">
            <TabsTrigger value="log" className="flex-1 text-xs sm:text-sm">Log Activity</TabsTrigger>
            <TabsTrigger value="team" className="flex-1 text-xs sm:text-sm">Team Overview</TabsTrigger>
          </TabsList>

          {/* Log Activity Tab */}
          <TabsContent value="log" className="space-y-4 mt-4">
            {agents.map((agent) => {
              const activity = getActivity(agent.id)
              const total = activity.calls_wa + activity.leads + activity.viewings
              return (
                <div key={agent.id} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {agent.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {agent.area} &middot; {agent.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {total > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {total} total
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        onClick={() => saveActivity(agent.id)}
                        disabled={saving === agent.id}
                        className="h-8"
                      >
                        {saving === agent.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                        <span className="ml-1.5 text-xs hidden sm:inline">Save</span>
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {metricConfig.map((m) => (
                      <CounterButton
                        key={m.key}
                        value={activity[m.key]}
                        onChange={(v) => updateMetric(agent.id, m.key, v)}
                        metric={m}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </TabsContent>

          {/* Team Overview Tab */}
          <TabsContent value="team" className="mt-4">
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="p-3 font-medium">Agent</th>
                    <th className="p-3 font-medium text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Calls/WA</span>
                      </div>
                    </th>
                    <th className="p-3 font-medium text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Leads</span>
                      </div>
                    </th>
                    <th className="p-3 font-medium text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-orange-600" />
                        <span className="hidden sm:inline">Viewings</span>
                      </div>
                    </th>
                    <th className="p-3 font-medium text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {agents
                    .map((agent) => ({
                      agent,
                      activity: getActivity(agent.id),
                    }))
                    .sort(
                      (a, b) =>
                        b.activity.calls_wa + b.activity.leads + b.activity.viewings -
                        (a.activity.calls_wa + a.activity.leads + a.activity.viewings)
                    )
                    .map(({ agent, activity }) => {
                      const total = activity.calls_wa + activity.leads + activity.viewings
                      return (
                        <tr key={agent.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-[10px]">{agent.initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{agent.name}</p>
                                <p className="text-xs text-muted-foreground">{agent.area}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={cn("font-semibold tabular-nums", activity.calls_wa > 0 && "text-blue-600")}>
                              {activity.calls_wa}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={cn("font-semibold tabular-nums", activity.leads > 0 && "text-emerald-600")}>
                              {activity.leads}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={cn("font-semibold tabular-nums", activity.viewings > 0 && "text-orange-600")}>
                              {activity.viewings}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={total > 0 ? "default" : "secondary"} className="text-xs">
                              {total}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/50 font-semibold">
                    <td className="p-3">Team Total</td>
                    <td className="p-3 text-center text-blue-600">{teamTotals.calls_wa}</td>
                    <td className="p-3 text-center text-emerald-600">{teamTotals.leads}</td>
                    <td className="p-3 text-center text-orange-600">{teamTotals.viewings}</td>
                    <td className="p-3 text-center">
                      <Badge>{teamTotals.calls_wa + teamTotals.leads + teamTotals.viewings}</Badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
