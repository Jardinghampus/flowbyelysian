"use client"

import { TrendCardGrid } from "@/components/ui/trend-card"

export function PerformanceCards() {
  const trendData = [
    {
      title: "Conversion Rate",
      value: "24.8%",
      change: "+3.2%",
      changeType: "positive" as const,
      trendType: "up" as const,
    },
    {
      title: "Response Time",
      value: "2.4 hrs",
      change: "-15%",
      changeType: "positive" as const,
      trendType: "down" as const,
    },
    {
      title: "Deals Closed",
      value: "156",
      change: "-8%",
      changeType: "negative" as const,
      trendType: "down" as const,
    },
    {
      title: "Team Efficiency",
      value: "94.2%",
      change: "+5.1%",
      changeType: "positive" as const,
      trendType: "up" as const,
    },
  ]

  return <TrendCardGrid data={trendData} columns={4} />
}
