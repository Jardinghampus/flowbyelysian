import { PerformanceCards } from "./components/performance-cards"
import { PerformanceChart } from "./components/performance-chart"

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
        <PerformanceCards />
        <PerformanceChart />
      </div>
    </>
  )
}
