"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ExternalLink, Search, BarChart3, Home, Users } from "lucide-react"
import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { SectionCards } from "./components/section-cards"
import { AgentPerformanceTable } from "./components/agent-performance-table"
import { PipelineAlerts } from "./components/pipeline-alerts"
import { MyMatchesWidget } from "./components/my-matches-widget"
import { ActivityFeed } from "./components/activity-feed"
import { QuickActions } from "./components/quick-actions"
import { OnboardingProgress } from "./components/onboarding-progress"
import { TeamSidebar } from "./components/team-sidebar"
import { DailyTrackerSummary } from "./components/daily-tracker-summary"
import { MyActivityTracker } from "./components/my-activity-tracker"
import { RippleButton } from "@/components/ui/ripple-button"
import ColourfulText from "@/components/ui/colourful-text"

const quickLinks = [
  {
    name: "Propertyfinder",
    url: "https://propertyfinder.ae",
    icon: Search,
    color: "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20",
  },
  {
    name: "Propertymonitor",
    url: "https://propertymonitor.ae/v2",
    icon: BarChart3,
    color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20",
  },
  {
    name: "Holo",
    url: "https://www.useholo.com/en",
    icon: Home,
    color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20",
  },
  {
    name: "CRM",
    url: "https://zaylo.lightning.force.com/lightning/page/home",
    icon: Users,
    color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20",
  },
]

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-full max-w-full overflow-x-hidden -mt-1">
      {/* Compact Header Row */}
      <div className="flex items-center justify-between mb-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            Welcome to <ColourfulText text="ZFlow" />
          </h1>
          <p className="text-[11px] text-muted-foreground">
            Real estate dashboard — Zaylo
          </p>
        </motion.div>
        <div className="flex flex-wrap items-center gap-1">
          {quickLinks.map((link) => (
            <Link key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
              <RippleButton variant="outline" size="sm" className={`${link.color} border text-[11px] h-7 px-2`}>
                <link.icon className="h-3 w-3 mr-1" />
                {link.name}
                <ExternalLink className="h-2 w-2 ml-1 opacity-40" />
              </RippleButton>
            </Link>
          ))}
        </div>
      </div>

      {mounted && (
        <div className="w-full max-w-full">
          {/* Main Layout */}
          <div className="flex gap-3">
            {/* Main Content */}
            <div className="flex-1 space-y-3 min-w-0">
              {/* Trend Cards */}
              <SectionCards />

              {/* My Activity Tracker */}
              <MyActivityTracker />

              {/* Three Column Layout on wide screens */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Left: Pipeline + Matches */}
                <div className="space-y-3">
                  <PipelineAlerts />
                  <MyMatchesWidget />
                </div>

                {/* Center: Chart */}
                <div className="space-y-3">
                  <ChartAreaInteractive />
                  <ActivityFeed />
                </div>

                {/* Right: Actions + Onboarding */}
                <div className="space-y-3">
                  <DailyTrackerSummary />
                  <OnboardingProgress />
                  <QuickActions />
                </div>
              </div>

              {/* Performance Table — full width */}
              <AgentPerformanceTable />
            </div>

            {/* Team Sidebar - Desktop only on very wide */}
            <div className="hidden 2xl:block w-56 shrink-0">
              <div className="sticky top-3">
                <TeamSidebar />
              </div>
            </div>
          </div>

          {/* Team Sidebar - Below on smaller screens */}
          <div className="2xl:hidden mt-3">
            <TeamSidebar />
          </div>
        </div>
      )}
    </div>
  )
}
