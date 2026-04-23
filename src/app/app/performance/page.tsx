import { PerformanceCards } from "./components/performance-cards"
import { PerformanceChart } from "./components/performance-chart"
import { TopPerformers } from "./components/top-performers"
import { TargetCommissionChart } from "./components/target-commission-chart"
import { MarketData } from "./components/market-data"
import { AgentPerformanceTable } from "../dashboard/components/agent-performance-table"
import { PersonalTargets } from "./components/personal-targets"
import { AICoach } from "./components/ai-coach"
import { MonthlyReportDownload } from "./components/monthly-report"
import { Leaderboard } from "./components/leaderboard"
import { Achievements } from "./components/achievements"
import { DailyTracker } from "./components/daily-tracker"

export default function PerformancePage() {
  return (
    <>
      {/* Page Title and Description */}
      <div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground">Monitor your team and business performance</p>
        </div>
      </div>

      <div className="@container/main space-y-4">
        {/* Daily Activity Tracker */}
        <DailyTracker />

        {/* Personal Targets and AI Coach - Side by side */}
        <div className="grid gap-4 lg:grid-cols-2">
          <PersonalTargets />
          <AICoach />
        </div>

        {/* Gamification - Leaderboard and Achievements */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Leaderboard />
          <Achievements />
        </div>

        {/* Monthly Report Download */}
        <MonthlyReportDownload />

        {/* Agent Performance Table */}
        <AgentPerformanceTable />

        {/* Top Performers - #1 Sales and #1 Rentals */}
        <TopPerformers />

        {/* Target vs Commission Radial Charts */}
        <TargetCommissionChart />

        {/* Performance Cards */}
        <PerformanceCards />

        {/* Performance Chart */}
        <PerformanceChart />

        {/* Dubai Market Data */}
        <MarketData />
      </div>
    </>
  )
}
