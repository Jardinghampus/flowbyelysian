"use client"

import * as React from "react"
import { CommandSearch, SearchTrigger } from "@/components/command-search"
import { NotificationBell } from "@/components/notification-bell"

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)

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
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 dark:border-white/5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60">
        <div className="flex w-full items-center justify-between gap-1 px-4 py-3 lg:gap-2 lg:px-6">
          <div className="flex-1 max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
