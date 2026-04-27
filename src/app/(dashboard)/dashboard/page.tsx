"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ExternalLink, Search, BarChart3, Home, Users } from "lucide-react"
import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { SectionCards } from "./components/section-cards"
import { AgentPerformanceTable } from "./components/agent-performance-table"
import { MyMatchesWidget } from "./components/my-matches-widget"
import { ActivityFeed } from "./components/activity-feed"
import { QuickActions } from "./components/quick-actions"
import { OnboardingProgress } from "./components/onboarding-progress"
import { TeamSidebar } from "./components/team-sidebar"
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
    url: "https://elysian.lightning.force.com/lightning/page/home",
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
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Hero Section - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center py-2"
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Welcome to <ColourfulText text="Eflow" />
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your real estate dashboard · DSP
        </p>
      </motion.div>

      {/* Quick Links */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
        {quickLinks.map((link) => (
          <Link key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
            <RippleButton variant="outline" size="sm" className={`${link.color} border text-xs h-8`}>
              <link.icon className="h-3 w-3 mr-1.5" />
              {link.name}
              <ExternalLink className="h-2.5 w-2.5 ml-1.5 opacity-40" />
            </RippleButton>
          </Link>
        ))}
      </div>

      {mounted && (
        <div className="w-full max-w-full">
          {/* Main Layout */}
          <div className="flex gap-4">
            {/* Main Content */}
            <div className="flex-1 space-y-4 min-w-0">
              {/* Trend Cards */}
              <SectionCards />

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Matches + Activity stacked */}
                <div className="space-y-4">
                  <MyMatchesWidget />
                  <ActivityFeed />
                </div>

                {/* Right: Chart + Actions */}
                <div className="space-y-4">
                  <ChartAreaInteractive />
                  <div className="grid grid-cols-2 gap-4">
                    <OnboardingProgress />
                    <QuickActions />
                  </div>
                </div>
              </div>

              {/* Performance Table */}
              <AgentPerformanceTable />
            </div>

            {/* Team Sidebar - Desktop */}
            <div className="hidden xl:block w-60 shrink-0">
              <div className="sticky top-4">
                <TeamSidebar />
              </div>
            </div>
          </div>

          {/* Team Sidebar - Mobile */}
          <div className="xl:hidden mt-4">
            <TeamSidebar />
          </div>
        </div>
      )}
    </div>
  )
}
