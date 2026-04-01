"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Users, Eye, CalendarDays, ArrowRight, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import agentData from "../data/agent-performance.json"

interface DailyActivity {
  agent_id: string
  calls_wa: number
  leads: number
  viewings: number
}

const agents = agentData.agents.map((a) => ({
  id: String(a.id),
  name: a.name,
  initials: a.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase(),
}))

export function DailyTrackerSummary() {
  const [todayData, setTodayData] = useState<DailyActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    fetch(`/api/daily-activity?date=${today}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) setTodayData(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Aggregate totals
  const totals = todayData.reduce(
    (acc, d) => ({
      calls_wa: acc.calls_wa + (d.calls_wa || 0),
      leads: acc.leads + (d.leads || 0),
      viewings: acc.viewings + (d.viewings || 0),
    }),
    { calls_wa: 0, leads: 0, viewings: 0 }
  )

  const totalActivity = totals.calls_wa + totals.leads + totals.viewings
  const agentsLogged = todayData.filter(
    (d) => (d.calls_wa || 0) + (d.leads || 0) + (d.viewings || 0) > 0
  ).length

  const metrics = [
    { label: "Calls/WA", value: totals.calls_wa, icon: Phone, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Leads", value: totals.leads, icon: Users, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Viewings", value: totals.viewings, icon: Eye, color: "text-orange-600", bg: "bg-orange-500/10" },
  ]

  // Top performer today
  const topAgent = todayData.length > 0
    ? todayData.reduce((best, curr) => {
        const bestTotal = (best.calls_wa || 0) + (best.leads || 0) + (best.viewings || 0)
        const currTotal = (curr.calls_wa || 0) + (curr.leads || 0) + (curr.viewings || 0)
        return currTotal > bestTotal ? curr : best
      })
    : null

  const topAgentInfo = topAgent
    ? agents.find((a) => a.id === topAgent.agent_id)
    : null

  return (
    <Card>
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-600" />
            <CardTitle className="text-base">Today&apos;s Activity</CardTitle>
          </div>
          <Link href="/app/performance">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary">
              Full Tracker
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {/* Metric Row */}
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className={cn("flex flex-col items-center p-2.5 rounded-lg", m.bg)}>
              <m.icon className={cn("h-4 w-4 mb-1", m.color)} />
              <span className="text-lg font-bold tabular-nums">{m.value}</span>
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Status Line */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            <span className="font-medium text-foreground">{agentsLogged}</span> of{" "}
            {agents.length} agents logged
          </span>
          <Badge variant={totalActivity > 0 ? "default" : "secondary"} className="text-[10px]">
            {totalActivity} total
          </Badge>
        </div>

        {/* Top performer chip */}
        {topAgentInfo && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[8px]">{topAgentInfo.initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs">
              <span className="font-medium">{topAgentInfo.name}</span>{" "}
              <span className="text-muted-foreground">is today&apos;s top performer</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
