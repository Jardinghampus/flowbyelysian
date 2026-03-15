"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer"
import { RoleProvider } from "@/contexts/role-context"
import { MobileBottomTabs } from "@/components/mobile-bottom-tabs"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)

  return (
    <RoleProvider>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-neutral-50 dark:bg-black w-full max-w-full">
        {/* Aceternity Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
          <SiteHeader />
          <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth [-webkit-overflow-scrolling:touch]">
            <div className="@container/main flex flex-col w-full max-w-full">
              <div className="flex flex-col gap-4 px-4 py-4 md:gap-5 md:px-6 md:py-5 pb-24 md:pb-5 w-full max-w-[1400px] mx-auto animate-page-in">
                {children}
              </div>
            </div>
            <SiteFooter />
          </div>
        </main>

        {/* Mobile Bottom Tab Navigation */}
        <MobileBottomTabs />

        {/* Theme Customizer - Hidden on Mobile */}
        <div className="hidden md:block">
          <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
        </div>
        <ThemeCustomizer
          open={themeCustomizerOpen}
          onOpenChange={setThemeCustomizerOpen}
        />
      </div>
    </RoleProvider>
  )
}
