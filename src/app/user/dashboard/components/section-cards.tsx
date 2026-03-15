"use client"

import { TrendCardGrid } from "@/components/ui/trend-card"
import { CollapsibleCard } from "@/components/ui/collapsible-card"
import { CardContent } from "@/components/ui/card"
import { Target } from "lucide-react"
import agentData from "../data/agent-performance.json"

export function SectionCards() {
  const { totals } = agentData

  const trendData = [
    {
      title: "Total Commission",
      value: `AED ${totals.commission.toLocaleString()}`,
      change: `+${totals.salesActualPercent}%`,
      changeType: "positive" as const,
      trendType: "up" as const,
    },
    {
      title: "Total Deals",
      value: totals.deals.toString(),
      change: `${totals.targetPercent}%`,
      changeType: totals.targetPercent >= 100 ? "positive" as const : "neutral" as const,
      trendType: totals.targetPercent >= 100 ? "up" as const : "neutral" as const,
    },
    {
      title: "Active Listings",
      value: totals.listings.toString(),
      change: "Active",
      changeType: "positive" as const,
      trendType: "up" as const,
    },
    {
      title: "Team Performance",
      value: `${agentData.agents.length} Agents`,
      change: totals.salesActualPercent >= 100 ? "On Target" : "Below",
      changeType: totals.salesActualPercent >= 100 ? "positive" as const : "negative" as const,
      trendType: totals.salesActualPercent >= 100 ? "up" as const : "down" as const,
    },
  ]

  return (
    <CollapsibleCard
      title="Targets & KPIs"
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
