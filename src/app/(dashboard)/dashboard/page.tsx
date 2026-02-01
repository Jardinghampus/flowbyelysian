"use client"

import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { SectionCards } from "./components/section-cards"
import { AgentPerformanceTable } from "./components/agent-performance-table"
import { WavyBackground } from "@/components/ui/wavy-background"
import { SimpleTypewriter } from "@/components/ui/typewriter-effect"

export default function Page() {
  return (
    <>
      {/* Hero Section with Wavy Background */}
      <WavyBackground
        containerClassName="min-h-[200px] sm:min-h-[280px] rounded-xl mx-4 lg:mx-6"
        className="max-w-4xl mx-auto pb-6 sm:pb-8 pt-6 sm:pt-8 flex flex-col items-center justify-center px-4"
        colors={["#00d4ff", "#03dac6", "#00a8cc", "#0088a8", "#006688"]}
        waveOpacity={0.6}
        blur={4}
        speed="slow"
        backgroundFill="rgba(0, 0, 0, 0.95)"
      >
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
      </WavyBackground>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        <SectionCards />
        <ChartAreaInteractive />
        <AgentPerformanceTable />
      </div>
    </>
  )
}
