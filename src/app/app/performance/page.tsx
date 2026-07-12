"use client"

import { useState } from "react"
import { PerformanceCards } from "./components/performance-cards"
import { PerformanceChart } from "./components/performance-chart"
import { TopPerformers } from "./components/top-performers"
import { TargetCommissionChart } from "./components/target-commission-chart"
import { MarketData } from "./components/market-data"
import { PersonalTargets } from "./components/personal-targets"
import { AICoach } from "./components/ai-coach"
import { MonthlyReportDownload } from "./components/monthly-report"
import { Leaderboard } from "./components/leaderboard"
import { Achievements } from "./components/achievements"
import { DailyTracker } from "./components/daily-tracker"
import {
  CompanyRevenueOverview,
  type PerformanceOverviewData,
} from "./components/company-revenue-overview"
import { LiveAgentPerformanceTable } from "./components/live-agent-table"

export default function PerformancePage() {
  const [overview, setOverview] = useState<PerformanceOverviewData | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)

  return (
    <>
      <div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground">
            Company revenue, per-agent sale/rent, personal KPIs and company standards
          </p>
        </div>
      </div>

      <div className="@container/main space-y-4">
        <CompanyRevenueOverview
          onLoaded={(data) => {
            setOverview(data)
            setLoadingOverview(false)
          }}
        />

        <LiveAgentPerformanceTable overview={overview} loading={loadingOverview && !overview} />

        <DailyTracker />

        <div className="grid gap-4 lg:grid-cols-2">
          <PersonalTargets />
          <AICoach />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Leaderboard />
          <Achievements />
        </div>

        <MonthlyReportDownload />
        <TopPerformers />
        <TargetCommissionChart />
        <PerformanceCards />
        <PerformanceChart />
        <MarketData />
      </div>
    </>
  )
}
