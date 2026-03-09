"use client"

import React, { useState, useMemo } from "react"
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
  Brain,
  Map,
  ArrowLeftRight,
  Search,
  ClipboardList,
  Heart,
  Home,
  Bell,
  MessageSquare,
  BarChart3,
  SlidersHorizontal,
  Kanban,
  CalendarDays,
  ImagePlus,
  CheckSquare,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/hooks/use-theme"
import { useRole, type UserRole } from "@/contexts/role-context"
import { Logo } from "@/components/logo"
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
const SEEKERS: UserRole[] = ["buyer", "tenant", "relocation_agent"]
const LISTERS: UserRole[] = ["seller", "landlord"]

const navSections: NavSection[] = [
  // ── INTERNAL: Core ──
  {
    title: "Core",
    roles: ["admin", "agent"],
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Pipeline", href: "/pipeline", icon: <Kanban className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Leads", href: "/leads", icon: <ClipboardList className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Inventory", href: "/inventory", icon: <Building2 className={iconClass} />, roles: ["admin", "agent"] },
      { label: "My Listings", href: "/my-listings", icon: <ImagePlus className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Exchange", href: "/exchange", icon: <ArrowLeftRight className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Organize ──
  {
    title: "Organize",
    roles: ["admin", "agent"],
    items: [
      { label: "Tasks", href: "/tasks", icon: <CheckSquare className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Calendar", href: "/calendar", icon: <CalendarDays className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Analytics ──
  {
    title: "Analytics",
    roles: ["admin", "agent"],
    items: [
      { label: "Areas", href: "/areas", icon: <MapPin className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Performance", href: "/performance", icon: <TrendingUp className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Market Stats", href: "/market-statistics", icon: <BarChart3 className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: CRM & Comms ──
  {
    title: "CRM & Comms",
    roles: ["admin", "agent"],
    items: [
      { label: "Contacts", href: "/users", icon: <Users className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Gmail", href: "/mail", icon: <Mail className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Intelligence ──
  {
    title: "Intelligence",
    roles: ["admin", "agent"],
    items: [
      { label: "Owner Lookup", href: "/owner-intelligence", icon: <Search className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: AI & Tools ──
  {
    title: "AI & Tools",
    roles: ["admin", "agent"],
    items: [
      { label: "Smart", href: "/smart", icon: <Brain className={iconClass} />, roles: ["admin", "agent"] },
      { label: "AI Bot", href: "/ai-assistant", icon: <Sparkles className={iconClass} />, roles: ["admin", "agent"] },
      { label: "SEO Generator", href: "/seo-generator", icon: <FileText className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Resources ──
  {
    title: "Resources",
    roles: ["admin", "agent"],
    items: [
      { label: "News", href: "/news", icon: <Newspaper className={iconClass} />, roles: ["admin", "agent"] },
      { label: "Training", href: "/training", icon: <GraduationCap className={iconClass} />, roles: ["admin", "agent"] },
    ],
  },
  // ── INTERNAL: Admin ──
  {
    title: "System",
    roles: ["admin"],
    items: [
      { label: "Admin", href: "/admin", icon: <UserCog className={iconClass} />, roles: ["admin"] },
    ],
  },

  // ── CUSTOMER: Home & Browse ──
  {
    title: "Home",
    roles: ALL_CUSTOMERS,
    items: [
      { label: "Home", href: "/dashboard", icon: <Home className={iconClass} />, roles: ALL_CUSTOMERS },
      { label: "Marketplace", href: "/marketplace", icon: <Map className={iconClass} />, roles: "all" },
      { label: "Off-Plan", href: "/off-plan", icon: <Building2 className={iconClass} />, roles: "all" },
    ],
  },
  // ── CUSTOMER: Search & Requests ──
  {
    title: "Search",
    roles: SEEKERS,
    items: [
      { label: "My Search", href: "/my-search", icon: <SlidersHorizontal className={iconClass} />, roles: SEEKERS },
      { label: "Search", href: "/properties", icon: <Search className={iconClass} />, roles: SEEKERS },
      { label: "Requests", href: "/requests", icon: <ClipboardList className={iconClass} />, roles: SEEKERS },
    ],
  },
  // ── CUSTOMER: My Properties ──
  {
    title: "My Properties",
    roles: LISTERS,
    items: [
      { label: "My Listings", href: "/my-listings", icon: <ImagePlus className={iconClass} />, roles: LISTERS },
    ],
  },
  // ── CUSTOMER: Insights ──
  {
    title: "Insights",
    roles: ALL_CUSTOMERS,
    items: [
      { label: "Market Stats", href: "/market-statistics", icon: <BarChart3 className={iconClass} />, roles: ALL_CUSTOMERS },
    ],
  },
  // ── CUSTOMER: Activity ──
  {
    title: "Activity",
    roles: ALL_CUSTOMERS,
    items: [
      { label: "Saved", href: "/saved", icon: <Heart className={iconClass} />, roles: ALL_CUSTOMERS },
      { label: "Messages", href: "/chat", icon: <MessageSquare className={iconClass} />, roles: ALL_CUSTOMERS },
      { label: "Notifications", href: "/notifications", icon: <Bell className={iconClass} />, roles: ALL_CUSTOMERS },
    ],
  },
]

const bottomLinks = [
  {
    label: "Settings",
    href: "/settings/user",
    icon: <Settings className={iconClass} />,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { role } = useRole()
  const [open, setOpen] = useState(false)

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
          {open ? <LogoFull /> : <LogoIcon />}

          {/* User Profile */}
          <SidebarUserInfo open={open} />

          {/* Main Navigation — grouped by section */}
          <div className="flex flex-col gap-0.5">
            {visibleSections.map((section, sIdx) => (
              <div key={section.title}>
                {sIdx > 0 && (
                  <div className="my-2 mx-3 border-t border-neutral-200/60 dark:border-white/[0.06]" />
                )}
                {open && (
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
            const isActive = pathname.startsWith(item.href)
            return (
              <SidebarLink
                key={idx}
                link={item}
                isActive={isActive}
              />
            )
          })}

          {/* Logout */}
          <SidebarLogoutButton open={open} />

          {/* Dark Mode Toggle - Only visible when sidebar is open */}
          <motion.div
            initial={false}
            animate={{
              opacity: open ? 1 : 0,
              height: open ? "auto" : 0,
              marginTop: open ? 8 : 0,
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

const LogoFull = () => {
  return (
    <Link
      href="/dashboard"
      className="font-bold flex items-center gap-3 text-black dark:text-white py-1 px-3 relative z-20"
    >
      <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
        <Logo size={22} className="text-primary-foreground" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-xl whitespace-pre tracking-tight"
      >
        ZFLOW
      </motion.span>
    </Link>
  )
}

const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-bold flex items-center justify-center py-1 relative z-20"
    >
      <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
        <Logo size={22} className="text-primary-foreground" />
      </div>
    </Link>
  )
}