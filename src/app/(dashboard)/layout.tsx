"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer"
import { RoleProvider } from "@/contexts/role-context"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)

  return (
    <RoleProvider>
      <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-neutral-900">
        {/* Aceternity Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <SiteHeader />
          <div className="flex-1 overflow-y-auto">
            <div className="@container/main flex flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
            <SiteFooter />
          </div>
        </main>

        {/* Theme Customizer */}
        <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
        <ThemeCustomizer
          open={themeCustomizerOpen}
          onOpenChange={setThemeCustomizerOpen}
        />
      </div>
    </RoleProvider>
  )
}
