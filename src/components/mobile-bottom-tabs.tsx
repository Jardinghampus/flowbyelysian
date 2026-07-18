"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Home,
  ClipboardList,
  Building2,
  MessageCircle,
  Settings,
  Rss,
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
  const { isInternal } = useRole()

  const tabIcon = "h-[22px] w-[22px]"
  const tabs: TabItem[] = isInternal
    ? [
        { href: "/app/dashboard", label: "Home", icon: <Home className={tabIcon} /> },
        { href: "/app/feed", label: "Feed", icon: <Rss className={tabIcon} /> },
        { href: "/app/leads", label: "Leads", icon: <ClipboardList className={tabIcon} /> },
        { href: "/app/inventory", label: "Listings", icon: <Building2 className={tabIcon} /> },
        { href: "/app/whatsapp", label: "WhatsApp", icon: <MessageCircle className={tabIcon} /> },
      ]
    : [
        { href: "/user/my-opportunities", label: "Opportunities", icon: <ClipboardList className={tabIcon} /> },
        { href: "/user/settings/user", label: "Profile", icon: <Settings className={tabIcon} /> },
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
                "relative flex flex-col items-center justify-center gap-1 pt-2 pb-1 px-3 min-w-0 flex-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomtab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div whileTap={{ scale: 0.85 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                {tab.icon}
              </motion.div>
              <span className="truncate text-[11px] font-medium leading-tight">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
