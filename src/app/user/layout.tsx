"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer"
import { RoleProvider, useRole, isCustomerAllowedRoute } from "@/contexts/role-context"
import { MobileBottomTabs } from "@/components/mobile-bottom-tabs"
import { usePathname, useRouter } from "next/navigation"
import { Lock } from "lucide-react"

/**
 * CustomerGuard enforces the boundary:
 * Customers can ONLY access /user/my-opportunities and /user/settings.
 * All other /user/* routes (marketplace, market-stats, chat, etc.) are agent-only.
 * Internal staff (admin/agent) can access everything under /user/ as well.
 */
function CustomerGuard({ children }: { children: React.ReactNode }) {
  const { isCustomer } = useRole()
  const pathname = usePathname()
  const router = useRouter()

  if (isCustomer && !isCustomerAllowedRoute(pathname)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-neutral-50 dark:bg-black">
        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
          <Lock className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md">
          This area is only available to Zaylo agents. You can manage your opportunities and profile from your portal.
        </p>
        <button
          onClick={() => router.push("/user/my-opportunities")}
          className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Go to My Opportunities
        </button>
      </div>
    )
  }

  return <>{children}</>
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)

  return (
    <RoleProvider>
      <CustomerGuard>
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
      </CustomerGuard>
    </RoleProvider>
  )
}
