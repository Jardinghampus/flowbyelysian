"use client"

import { Phone, MessageSquare, Users, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentPerf {
  agent_id: string
  agent_name: string
  total_calls: number
  calls_7d: number
  total_whatsapp: number
  whatsapp_7d: number
  owners_managed: number
  considering_count: number
  listed_count: number
  conversion_rate: number
}

interface PerformancePanelProps {
  performance: AgentPerf[]
  loading: boolean
}

export function PerformancePanel({ performance, loading }: PerformancePanelProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  if (performance.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No performance data yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Start logging outreach to see stats</p>
      </div>
    )
  }

  const maxManaged = Math.max(...performance.map((p) => p.owners_managed), 1)

  return (
    <div className="space-y-3 p-1">
      {performance.map((agent) => (
        <div key={agent.agent_id} className="rounded-xl border bg-background/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">{agent.agent_name}</span>
            <span className="text-xs text-muted-foreground">{agent.owners_managed} owners</span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <Phone className="h-3 w-3 text-blue-400" />
              <span className="text-muted-foreground">Calls:</span>
              <span className="font-medium">{agent.total_calls}</span>
              <span className="text-muted-foreground/60">({agent.calls_7d} 7d)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MessageSquare className="h-3 w-3 text-emerald-400" />
              <span className="text-muted-foreground">WA:</span>
              <span className="font-medium">{agent.total_whatsapp}</span>
              <span className="text-muted-foreground/60">({agent.whatsapp_7d} 7d)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Users className="h-3 w-3 text-amber-400" />
              <span className="text-muted-foreground">Considering:</span>
              <span className="font-medium">{agent.considering_count}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="h-3 w-3 text-pink-400" />
              <span className="text-muted-foreground">Listed:</span>
              <span className="font-medium">{agent.listed_count}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Conversion</span>
              <span className="font-medium text-[#4B8EDB]">{agent.conversion_rate}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-[#4B8EDB] transition-all"
                style={{ width: `${Math.min(agent.conversion_rate, 100)}%` }}
              />
            </div>
          </div>

          {/* Relative bar */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pipeline</span>
              <span className="text-muted-foreground/60">{agent.owners_managed}/{maxManaged}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", "bg-blue-500/60")}
                style={{ width: `${(agent.owners_managed / maxManaged) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
