"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer"

interface BaseLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function BaseLayout({ children, title, description }: BaseLayoutProps) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-neutral-900">
      {/* Aceternity Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <SiteHeader />
        <div className="flex-1 overflow-y-auto">
          <div className="@container/main flex flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {title && (
                <div className="px-4 lg:px-6">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && (
                      <p className="text-muted-foreground">{description}</p>
                    )}
                  </div>
                </div>
              )}
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
  )
}
