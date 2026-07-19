"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RoleProvider } from "@/contexts/role-context"
import { FullscreenProvider } from "@/contexts/fullscreen-context"

export default function InloggadeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <FullscreenProvider>
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-neutral-50 dark:bg-black w-full max-w-full">
          <AppSidebar />
          <main className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
            <SiteHeader />
            <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
              <div className="flex flex-col gap-3 px-3 py-3 md:gap-4 md:px-5 md:py-4 pb-24 md:pb-4 w-full max-w-[1920px] mx-auto">
                {children}
              </div>
              <SiteFooter />
            </div>
          </main>
        </div>
      </FullscreenProvider>
    </RoleProvider>
  )
}
