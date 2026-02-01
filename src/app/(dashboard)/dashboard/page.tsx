"use client"

import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { DataTable } from "./components/data-table"
import { SectionCards } from "./components/section-cards"
import { WavyBackground } from "@/components/ui/wavy-background"
import { SimpleTypewriter } from "@/components/ui/typewriter-effect"

import data from "./data/data.json"
import pastPerformanceData from "./data/past-performance-data.json"
import keyPersonnelData from "./data/key-personnel-data.json"
import focusDocumentsData from "./data/focus-documents-data.json"

export default function Page() {
  return (
    <>
      {/* Hero Section with Wavy Background */}
      <WavyBackground
        containerClassName="min-h-[280px] rounded-xl mx-4 lg:mx-6"
        className="max-w-4xl mx-auto pb-8 pt-8 flex flex-col items-center justify-center"
        colors={["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"]}
        waveOpacity={0.6}
        blur={4}
        speed="slow"
        backgroundFill="rgba(0, 0, 0, 0.95)"
      >
        <h1 className="text-2xl md:text-4xl lg:text-5xl text-white font-bold text-center">
          <SimpleTypewriter
            text="Welcome to Flow"
            speed={100}
            delay={300}
          />
        </h1>
        <p className="text-base md:text-lg mt-4 text-white/80 font-normal text-center">
          Your real estate dashboard powered by Elysian
        </p>
      </WavyBackground>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        <SectionCards />
        <ChartAreaInteractive />
      </div>
      <div className="@container/main">
        <DataTable
          data={data}
          pastPerformanceData={pastPerformanceData}
          keyPersonnelData={keyPersonnelData}
          focusDocumentsData={focusDocumentsData}
        />
      </div>
    </>
  )
}
