"use client"

import { useEffect, useState } from "react"
import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { SectionCards } from "./components/section-cards"
import { AgentPerformanceTable } from "./components/agent-performance-table"

import { LayoutTextFlip } from "@/components/ui/layout-text-flip"

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-white font-bold text-center px-4">
        <LayoutTextFlip
          texts={["Welcome to Flow", "May success be with you"]}
          duration={4000}
        />
      </h1>
      <p className="text-sm sm:text-base md:text-lg mt-3 sm:mt-4 text-white/80 font-normal text-center px-4">
        Your real estate dashboard powered by Elysian
      </p>

      {mounted && (
        <div className="@container/main px-4 sm:px-6 lg:px-6 space-y-6 w-full max-w-full">
          <SectionCards />
          <ChartAreaInteractive />
          <AgentPerformanceTable />
        </div>
      )}
    </div>
  )
}
