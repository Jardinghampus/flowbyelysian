"use client"

import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { SectionCards } from "./components/section-cards"
import { AgentPerformanceTable } from "./components/agent-performance-table"

import { SimpleTypewriter } from "@/components/ui/typewriter-effect"

export default function Page() {
  return (
    <>
      {/* Hero Section */}
        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-white font-bold text-center">
          <SimpleTypewriter
            text="Welcome to Flow"
            speed={100}
            delay={300}
          />
        </h1>
        <p className="text-sm sm:text-base md:text-lg mt-3 sm:mt-4 text-white/80 font-normal text-center">
          Your real estate dashboard powered by Elysian
        </p>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        <SectionCards />
        <ChartAreaInteractive />
        <AgentPerformanceTable />
      </div>
    </>
  )
}
