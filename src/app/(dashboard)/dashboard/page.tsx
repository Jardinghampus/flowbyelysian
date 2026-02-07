"use client"

import { useEffect, useState } from "react"
import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { SectionCards } from "./components/section-cards"
import { AgentPerformanceTable } from "./components/agent-performance-table"
import ColourfulText from "@/components/ui/colourful-text"

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-center px-4 py-6">
        Welcome to <ColourfulText text="Eflow" />
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-normal text-center px-4">
        Your real estate dashboard powered by Elysian
      </p>

      {mounted && (
        <div className="@container/main px-4 sm:px-6 lg:px-6 space-y-6 w-full max-w-full mt-6">
          <SectionCards />
          <ChartAreaInteractive />
          <AgentPerformanceTable />
        </div>
      )}
    </div>
  )
}
