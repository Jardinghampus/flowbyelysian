import { PerformanceCards } from "./components/performance-cards"
import { PerformanceChart } from "./components/performance-chart"
import { TopPerformers } from "./components/top-performers"
import { TargetCommissionChart } from "./components/target-commission-chart"
import { MarketData } from "./components/market-data"
import { AgentPerformanceTable } from "../dashboard/components/agent-performance-table"

export default function PerformancePage() {
  return (
    <>
      {/* Page Title and Description */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground">Monitor your team and business performance</p>
        </div>
      </div>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* Agent Performance Table - At the top as requested */}
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
