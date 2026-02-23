"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Home,
  Search,
  ArrowLeftRight,
  Heart,
  SlidersHorizontal,
  Building2,
  BarChart3,
  Map,
  ClipboardList,
} from "lucide-react"
import { useRole } from "@/contexts/role-context"
import { cn } from "@/lib/utils"

interface TabItem {
  href: string
  label: string
  icon: React.ReactNode
}

export function MobileBottomTabs() {
  const pathname = usePathname()
  const { isInternal, role } = useRole()

  const tabs: TabItem[] = isInternal
    ? [
        { href: "/dashboard", label: "Home", icon: <Home className="h-5 w-5" /> },
        { href: "/exchange", label: "Exchange", icon: <ArrowLeftRight className="h-5 w-5" /> },
        { href: "/requests", label: "Requests", icon: <ClipboardList className="h-5 w-5" /> },
        { href: "/market-statistics", label: "Stats", icon: <BarChart3 className="h-5 w-5" /> },
      ]
    : role === "seller" || role === "landlord"
    ? [
        { href: "/dashboard", label: "Home", icon: <Home className="h-5 w-5" /> },
        { href: "/exchange", label: "Exchange", icon: <ArrowLeftRight className="h-5 w-5" /> },
        { href: "/inventory", label: "Listings", icon: <Building2 className="h-5 w-5" /> },
        { href: "/saved", label: "Saved", icon: <Heart className="h-5 w-5" /> },
      ]
    : [
        { href: "/dashboard", label: "Home", icon: <Home className="h-5 w-5" /> },
        { href: "/exchange", label: "Exchange", icon: <ArrowLeftRight className="h-5 w-5" /> },
        { href: "/my-search", label: "Search", icon: <SlidersHorizontal className="h-5 w-5" /> },
        { href: "/saved", label: "Saved", icon: <Heart className="h-5 w-5" /> },
      ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl backdrop-saturate-150 border-t border-neutral-200/50 dark:border-white/[0.06]">
      <div className="flex items-stretch justify-around" style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))" }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 px-3 min-w-0 flex-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomtab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {tab.icon}
              </motion.div>
              <span className="text-[10px] font-medium leading-tight truncate">
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
