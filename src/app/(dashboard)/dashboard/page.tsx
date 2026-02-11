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
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-center px-4 py-6">
          Welcome to <ColourfulText text="Eflow" />
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-normal text-center px-4">
          Your real estate dashboard powered by Elysian
        </p>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap items-center justify-center gap-3 px-4 mt-6"
      >
        {quickLinks.map((link, index) => (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Link href={link.url} target="_blank" rel="noopener noreferrer">
              <RippleButton
                variant="outline"
                className={`${link.color} border`}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.name}
                <ExternalLink className="h-3 w-3 ml-2 opacity-50" />
              </RippleButton>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {mounted && (
        <div className="@container/main px-4 sm:px-6 lg:px-6 w-full max-w-full mt-6">
          {/* Main Layout with Team Sidebar */}
          <div className="flex gap-6">
            {/* Main Content Area */}
            <div className="flex-1 space-y-6 min-w-0">
              {/* Trend Cards */}
              <SectionCards />

              {/* Content Grid - 50/30/20 proportions */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Left Column - 50% */}
                <div className="lg:col-span-5 space-y-6">
                  <MyMatchesWidget />
                  <ActivityFeed />
                </div>

                {/* Middle Column - 30% */}
                <div className="lg:col-span-3">
                  <ChartAreaInteractive />
                </div>

                {/* Right Column - 20% */}
                <div className="lg:col-span-2 space-y-6">
                  <OnboardingProgress />
                  <QuickActions />
                </div>
              </div>

              {/* Agent Performance Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <AgentPerformanceTable />
              </motion.div>
            </div>

            {/* Team Sidebar - Fixed width on large screens */}
            <div className="hidden xl:block w-80 shrink-0">
              <div className="sticky top-6">
                <TeamSidebar />
              </div>
            </div>
          </div>

          {/* Team Sidebar for smaller screens - shows below content */}
          <div className="xl:hidden mt-6">
            <TeamSidebar />
          </div>
        </div>
      )}
    </div>
  )
}
