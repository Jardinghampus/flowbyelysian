"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer"
import { RoleProvider } from "@/contexts/role-context"
import { BottomNavbar } from "@/components/mobile-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)

  return (
    <RoleProvider>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white dark:bg-black">
        {/* Aceternity Sidebar - Hidden on mobile */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <SiteHeader />
          <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="flex flex-col">
              <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 md:px-6">
                {children}
              </div>
            </div>
            <SiteFooter />
          </div>
        </main>

        {/* Bottom Navbar for Mobile */}
        <BottomNavbar />

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
