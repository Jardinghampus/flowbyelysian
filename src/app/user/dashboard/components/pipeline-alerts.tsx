"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Clock,
  Phone,
  MessageCircle,
  Bell,
  ChevronRight,
  RefreshCw,
  Loader2,
  Zap,
  UserX,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  scanPipeline,
  getPipelineHealth,
  type PipelineOpportunity,
  type AutomationTrigger,
  type PipelineHealthSummary,
} from "@/lib/pipeline-automations"

// Demo opportunities for when API is unavailable
const demoOpportunities: PipelineOpportunity[] = [
  {
    id: "demo-1",
    status: "new",
    fullName: "Mohammed Al Rashid",
    phone: "+971 50 123 4567",
    whatsapp: "+971501234567",
    email: "mohammed@example.com",
    area: "Tilal Al Ghaf",
    propertyType: "Villa",
    assignedAgentId: null,
    assignedAgentName: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: null,
  },
  {
    id: "demo-2",
    status: "contacted",
    fullName: "Sarah Johnson",
    phone: "+971 55 987 6543",
    whatsapp: "+971559876543",
    email: "sarah@example.com",
    area: "DAMAC Hills",
    propertyType: "Villa",
    assignedAgentId: "agent-1",
    assignedAgentName: "Ahmed Hassan",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    notes: null,
  },
  {
    id: "demo-3",
    status: "in_progress",
    fullName: "David Chen",
    phone: "+971 52 456 7890",
    whatsapp: null,
    email: "david@example.com",
    area: "Dubai Marina",
    propertyType: "Apartment",
    assignedAgentId: "agent-1",
    assignedAgentName: "Ahmed Hassan",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    notes: null,
  },
  {
    id: "demo-4",
    status: "new",
    fullName: "Lisa Thompson",
    phone: "+971 56 111 2222",
    whatsapp: "+971561112222",
    email: "lisa@example.com",
    area: "Palm Jumeirah",
    propertyType: "Penthouse",
    assignedAgentId: null,
    assignedAgentName: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: null,
  },
]

const priorityConfig = {
  critical: { color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", icon: AlertTriangle },
  high: { color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400", icon: Zap },
  medium: { color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", icon: Clock },
  low: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", icon: Bell },
}

const actionIcons = {
  follow_up_reminder: Phone,
  stale_alert: Clock,
  escalation: AlertTriangle,
  re_engage: MessageCircle,
  congratulate: Zap,
}

export function PipelineAlerts() {
  const [health, setHealth] = useState<PipelineHealthSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/pipeline-automations")
      if (res.ok) {
        const data = await res.json()
        setHealth({
          totalActive: data.health.totalActive,
          byStatus: data.health.byStatus,
          criticalCount: data.health.criticalCount,
          highCount: data.health.highCount,
          avgDaysInPipeline: data.health.avgDaysInPipeline,
          oldestLead: data.health.oldestLead,
          triggers: data.triggers,
        })
      } else {
        throw new Error("API unavailable")
      }
    } catch {
      // Fallback to local calculation with demo data
      const result = getPipelineHealth(demoOpportunities)
      setHealth(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!health || health.triggers.length === 0) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-500/30">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Pipeline is healthy</p>
            <p className="text-xs text-muted-foreground">{health?.totalActive || 0} active deals, no actions needed</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const visibleTriggers = expanded ? health.triggers : health.triggers.slice(0, 3)

  return (
    <Card className={cn(
      "border-l-4",
      health.criticalCount > 0 ? "border-l-red-500" : health.highCount > 0 ? "border-l-orange-500" : "border-l-amber-500"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn(
              "h-4 w-4",
              health.criticalCount > 0 ? "text-red-500" : "text-orange-500"
            )} />
            <CardTitle className="text-sm">Pipeline Alerts</CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {health.triggers.length}
            </Badge>
          </div>
          <button onClick={loadAlerts} className="p-1 rounded-md hover:bg-muted transition-colors">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
        {/* Quick stats */}
        <div className="flex gap-3 text-[11px] text-muted-foreground mt-1">
          <span>{health.totalActive} active</span>
          <span>avg {health.avgDaysInPipeline}d in pipeline</span>
          {health.criticalCount > 0 && (
            <span className="text-red-600 font-medium">{health.criticalCount} critical</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleTriggers.map((trigger) => {
          const pConfig = priorityConfig[trigger.priority]
          const PriorityIcon = pConfig.icon
          const ActionIcon = actionIcons[trigger.action]

          return (
            <div
              key={trigger.opportunityId + trigger.action}
              className="flex items-start gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className={cn("h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0", pConfig.color)}>
                <PriorityIcon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium truncate">{trigger.title}</p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{trigger.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="secondary" className={cn("text-[9px] h-4", pConfig.color)}>
                    {trigger.priority}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <ActionIcon className="h-2.5 w-2.5" />
                    {trigger.suggestedChannel}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {trigger.daysInStage}d in stage
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {health.triggers.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? "Show less" : `Show ${health.triggers.length - 3} more alerts`}
            <ChevronRight className={cn("h-3 w-3 transition-transform", expanded && "rotate-90")} />
          </button>
        )}
      </CardContent>
    </Card>
  )
}
