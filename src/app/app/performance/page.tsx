"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PersonalTargets } from "./components/personal-targets"
import {
  CompanyRevenueOverview,
  type PerformanceOverviewData,
} from "./components/company-revenue-overview"
import { LiveAgentPerformanceTable } from "./components/live-agent-table"
import { WeeklyKpiEntry } from "./components/weekly-kpi-entry"
import { KpiDashboard } from "./components/kpi-dashboard"

export default function PerformancePage() {
  const [overview, setOverview] = useState<PerformanceOverviewData | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground">
            Office KPIs, sale vs rental commission, and monthly admin actuals
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/performance/live" target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open live board
          </Link>
        </Button>
      </div>

      <div className="@container/main space-y-4">
        <KpiDashboard />
        <WeeklyKpiEntry />

        <CompanyRevenueOverview
          onLoaded={(data) => {
            setOverview(data)
            setLoadingOverview(false)
          }}
        />

        <LiveAgentPerformanceTable overview={overview} loading={loadingOverview && !overview} />

        <PersonalTargets />
      </div>
    </>
  )
}
