"use client"

import React, { useState, useMemo } from "react"
import { useFullscreenContext } from "@/contexts/fullscreen-context"
import dynamic from "next/dynamic"
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  UserCog,
  Settings,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
  Mail,
  Newspaper,
  MapPin,
  FileText,
  PenLine,
  Brain,
  ArrowLeftRight,
  Search,
  ClipboardList,
  BarChart3,
  Kanban,
  CalendarDays,
  ImagePlus,
  CheckSquare,
  MessageCircle,
  Database,
  RadioTower,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/hooks/use-theme"
import { useRole, type UserRole } from "@/contexts/role-context"
import { Logo } from "@/components/logo"
import { useDocumentSettings } from "@/hooks/use-document-settings"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/aceternity-sidebar"

// Dynamic imports for Clerk-dependent components with ssr: false
const SidebarUserInfo = dynamic(
  () => import("@/components/sidebar-user-info").then(mod => mod.SidebarUserInfo),
  {
    ssr: false,
    loading: () => (
      <div className="mt-6 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-center">
        <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      </div>
    )
  }
)

const SidebarLogoutButton = dynamic(
  () => import("@/components/sidebar-user-info").then(mod => mod.SidebarLogoutButton),
  {
    ssr: false,
    loading: () => (
      <button
        className={cn(
          "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md transition-colors",
          "text-neutral-500"
        )}
        disabled
      >
        <LogOut className="h-[22px] w-[22px] flex-shrink-0" />
      </button>
    )
  }
)

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: UserRole[] | "all"  // which roles can see this item
}

const iconClass = "h-[22px] w-[22px] flex-shrink-0"

interface NavSection {
  title: string
  roles: UserRole[] | "all"
  items: NavItem[]
}

const ALL_CUSTOMERS: UserRole[] = ["buyer", "seller", "tenant", "landlord", "relocation_agent"]

const navSections: NavSection[] = [
  // ── INTERNAL: Apps ──
  {
    title: "Apps",
    roles: ["admin", "agent"],
    items: [
      { label: "WhatsApp", href: "/app/whatsapp", icon: <MessageCircle className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Core ── (/app/...)
  {
    title: "Core",
    roles: ["admin", "agent"],
    items: [
      { label: "Dashboard", href: "/app/dashboard", icon: <LayoutDashboard className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Pipeline", href: "/app/pipeline", icon: <Kanban className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Leads", href: "/app/leads", icon: <ClipboardList className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Inventory", href: "/app/inventory", icon: <Building2 className={iconClass} />, roles: ["admin", "agent"] },
      { label: "My Listings", href: "/app/my-listings", icon: <ImagePlus className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Landlord Report", href: "/app/landlord-report", icon: <FileText className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Exchange", href: "/app/exchange", icon: <ArrowLeftRight className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Intelligence ──
  {
    title: "Intelligence",
    roles: ["admin", "agent"],
    items: [
      { label: "Data", href: "/app/data", icon: <Database className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Owner Lookup", href: "/app/owner-intelligence", icon: <Search className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Zaylo", href: "/zaylo", icon: <RadioTower className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Organize ──
  {
    title: "Organize",
    roles: ["admin", "agent"],
    items: [
      { label: "Tasks", href: "/app/tasks", icon: <CheckSquare className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Calendar", href: "/app/calendar", icon: <CalendarDays className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Sign", href: "/app/documents", icon: <PenLine className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Contacts", href: "/app/users", icon: <Users className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Gmail", href: "/app/mail", icon: <Mail className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Analytics ──
  {
    title: "Analytics",
    roles: ["admin", "agent"],
    items: [
      { label: "Areas", href: "/app/areas", icon: <MapPin className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Performance", href: "/app/performance", icon: <TrendingUp className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Market Stats", href: "/app/market-statistics", icon: <BarChart3 className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: AI & Tools ──
  {
    title: "AI & Tools",
    roles: ["admin", "agent"],
    items: [
      { label: "Smart", href: "/app/smart", icon: <Brain className={iconClass} />, roles: ["admin", "agent"] },
      { label: "AI Bot", href: "/app/ai-assistant", icon: <Sparkles className={iconClass} />, roles: ["admin", "agent"] },
      { label: "SEO Generator", href: "/app/seo-generator", icon: <FileText className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Resources ──
  {
    title: "Resources",
    roles: ["admin", "agent"],
    items: [
      { label: "News", href: "/app/news", icon: <Newspaper className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Training", href: "/app/training", icon: <GraduationCap className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Admin ──
  {
    title: "System",
    roles: ["admin"],
    items: [
      { label: "Admin", href: "/app/admin", icon: <UserCog className={iconClass} />, roles: ["admin"] },
      { label: "System Health", href: "/app/admin/system-health", icon: <Activity className={iconClass} />, roles: ["admin"] },
    ],
  },

  // ── CUSTOMER: Portal ── (/user/...)
  // Customers can ONLY see their opportunities and profile.
  // They do NOT have access to the CRM app, marketplace browsing, or any other features.
  {
    title: "My Portal",
    roles: ALL_CUSTOMERS,
    items: [
      { label: "My Opportunities", href: "/user/my-opportunities", icon: <ClipboardList className={iconClass} />, roles: ALL_CUSTOMERS },
    ],
  },
]

const bottomLinks = [
  {
    label: "Settings",
    href: "/user/settings/user",
    icon: <Settings className={iconClass} />,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { role, isInternal } = useRole()
  const { isFullscreen } = useFullscreenContext()
  const { settings: docSettings } = useDocumentSettings()
  const [open, setOpen] = useState(false)

  const effectiveOpen = open

  // Filter sections and items based on current role
  const visibleSections = useMemo(() => {
    return navSections
      .filter((section) => {
        if (section.roles === "all") return true
        return section.roles.includes(role)
      })
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (item.roles === "all") return true
          return item.roles.includes(role)
        }),
      }))
      .filter((section) => section.items.length > 0)
  }, [role])

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6 md:gap-8 border-r border-neutral-200/60 dark:border-white/[0.06]">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          {effectiveOpen ? <LogoFull homeHref={isInternal ? "/app/dashboard" : "/user/my-opportunities"} logoUrl={docSettings.header_logo_url} displayName={docSettings.header_display_name} /> : <LogoIcon homeHref={isInternal ? "/app/dashboard" : "/user/my-opportunities"} logoUrl={docSettings.header_logo_url} />}

          {/* User Profile */}
          <SidebarUserInfo open={effectiveOpen} />

          {/* Main Navigation — grouped by section */}
          <div className="flex flex-col gap-0.5">
            {visibleSections.map((section, sIdx) => (
              <div key={section.title}>
                {sIdx > 0 && (
                  <div className="my-2 mx-3 border-t border-neutral-200/60 dark:border-white/[0.06]" />
                )}
                {effectiveOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 select-none"
                  >
                    {section.title}
                  </motion.span>
                )}
                {section.items.map((item, idx) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <SidebarLink
                      key={`${sIdx}-${idx}`}
                      link={item}
                      isActive={isActive}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-1 border-t border-neutral-200/60 dark:border-white/[0.06] pt-4">
          {/* Settings */}
          {bottomLinks.map((item, idx) => {
            const settingsHref = isInternal ? "/app/settings/user" : "/user/settings/user"
            const link = item.label === "Settings" ? { ...item, href: settingsHref } : item
            const isActive = pathname.startsWith(link.href)
            return (
              <SidebarLink
                key={idx}
                link={link}
                isActive={isActive}
              />
            )
          })}

          {/* Logout */}
          <SidebarLogoutButton open={effectiveOpen} />

          {/* Dark Mode Toggle - Only visible when sidebar is open */}
          <motion.div
            initial={false}
            animate={{
              opacity: effectiveOpen ? 1 : 0,
              height: effectiveOpen ? "auto" : 0,
              marginTop: effectiveOpen ? 8 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50">
              <Label htmlFor="dark-mode-toggle" className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400 cursor-pointer">
                {theme === "dark" ? (
                  <Sun className="h-[22px] w-[22px] text-[#00d4ff]" />
                ) : (
                  <Moon className="h-[22px] w-[22px]" />
                )}
                <span className="text-[15px] whitespace-pre">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              </Label>
              <Switch
                id="dark-mode-toggle"
                checked={theme === "dark"}
                onCheckedChange={(newChecked) => setTheme(newChecked ? "dark" : "light")}
              />
            </div>
          </motion.div>
        </div>
      </SidebarBody>
    </Sidebar>
  )
}

const LogoFull = ({ homeHref = "/user/dashboard", logoUrl, displayName }: { homeHref?: string; logoUrl?: string | null; displayName?: string }) => {
  return (
    <Link
      href={homeHref}
      className="font-bold flex items-center gap-3 text-black dark:text-white py-1 px-3 relative z-20"
    >
      <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
        {logoUrl ? (
          <Image src={logoUrl} alt="Logo" width={36} height={36} className="object-contain w-full h-full" unoptimized />
        ) : (
          <Logo size={22} className="text-primary-foreground" />
        )}
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-xl whitespace-pre tracking-tight"
      >
        {displayName || "ZFLOW"}
      </motion.span>
    </Link>
  )
}

const LogoIcon = ({ homeHref = "/user/dashboard", logoUrl }: { homeHref?: string; logoUrl?: string | null }) => {
  return (
    <Link
      href={homeHref}
      className="font-bold flex items-center justify-center py-1 relative z-20"
    >
      <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
        {logoUrl ? (
          <Image src={logoUrl} alt="Logo" width={36} height={36} className="object-contain w-full h-full" unoptimized />
        ) : (
          <Logo size={22} className="text-primary-foreground" />
        )}
      </div>
    </Link>
  )
}
