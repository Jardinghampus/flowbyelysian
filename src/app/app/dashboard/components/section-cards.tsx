"use client"

import { TrendCardGrid } from "@/components/ui/trend-card"
import { CollapsibleCard } from "@/components/ui/collapsible-card"
import { CardContent } from "@/components/ui/card"
import { Target } from "lucide-react"
import { useUnifiedStats } from "@/hooks/use-unified-stats"
import agentData from "../data/agent-performance.json"

export function SectionCards() {
  const { stats, loading } = useUnifiedStats()
  const { totals } = agentData

  const activeListings = stats.listings.total > 0 ? stats.listings.live : totals.listings
  const totalLeads = stats.leads.total > 0 ? stats.leads.total : totals.deals
  const totalOwners = stats.owners.total

  const trendData = [
    {
      title: "Active Listings",
      value: loading ? "—" : activeListings.toString(),
      change: stats.listings.pocket > 0 ? `${stats.listings.pocket} pocket` : "Live",
      changeType: "positive" as const,
      trendType: "up" as const,
    },
    {
      title: "Leads / Opportunities",
      value: loading ? "—" : totalLeads.toString(),
      change: stats.leads.new > 0 ? `${stats.leads.new} new` : "None new",
      changeType: stats.leads.new > 0 ? "positive" as const : "neutral" as const,
      trendType: stats.leads.new > 0 ? "up" as const : "neutral" as const,
    },
    {
      title: "Owner Database",
      value: loading ? "—" : totalOwners.toString(),
      change: stats.owners.overdueFollowUps > 0
        ? `${stats.owners.overdueFollowUps} overdue`
        : stats.owners.considering > 0
          ? `${stats.owners.considering} considering`
          : "All clear",
      changeType: stats.owners.overdueFollowUps > 0 ? "negative" as const : "positive" as const,
      trendType: stats.owners.overdueFollowUps > 0 ? "down" as const : "up" as const,
    },
    {
      title: "Today's Activity",
      value: loading
        ? "—"
        : (stats.activity.callsToday + stats.activity.leadsToday + stats.activity.viewingsToday).toString(),
      change: stats.agents.activeToday > 0
        ? `${stats.agents.activeToday} agents active`
        : "No activity yet",
      changeType: stats.agents.activeToday > 0 ? "positive" as const : "neutral" as const,
      trendType: stats.agents.activeToday > 0 ? "up" as const : "neutral" as const,
    },
  ]

  return (
    <CollapsibleCard
      title="Live Overview"
      icon={<Target className="h-4 w-4 text-muted-foreground" />}
      defaultOpen={true}
      storageKey="targets-kpis"
    >
      <CardContent className="pb-4">
        <TrendCardGrid data={trendData} columns={4} />
      </CardContent>
    </CollapsibleCard>
  )
}
