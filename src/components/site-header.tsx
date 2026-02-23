"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { CommandSearch, SearchTrigger } from "@/components/command-search"
import { NotificationBell } from "@/components/notification-bell"
import { RoleSwitcher } from "@/components/role-switcher"
import { useTheme } from "@/hooks/use-theme"
import { motion } from "framer-motion"

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-neutral-200/50 dark:border-white/[0.06] bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="flex w-full items-center justify-between gap-1 px-4 py-2 lg:gap-2 lg:px-6">
          <div className="flex-1 max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-[#00d4ff]" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </motion.button>
            <RoleSwitcher />
            <NotificationBell />
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
