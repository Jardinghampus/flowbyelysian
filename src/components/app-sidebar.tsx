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
        <LogOut className="h-5 w-5 flex-shrink-0" />
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

const allNavItems: NavItem[] = [
  // === INTERNAL STAFF (admin + agent) ===
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: <Building2 className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "Exchange",
    href: "/exchange",
    icon: <ArrowLeftRight className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "Areas",
    href: "/areas",
    icon: <MapPin className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "Performance",
    href: "/performance",
    icon: <TrendingUp className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "Contacts",
    href: "/users",
    icon: <Users className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "Gmail",
    href: "/mail",
    icon: <Mail className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "Smart",
    href: "/smart",
    icon: <Brain className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "AI Bot",
    href: "/ai-assistant",
    icon: <Sparkles className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "SEO Generator",
    href: "/seo-generator",
    icon: <FileText className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "News",
    href: "/news",
    icon: <Newspaper className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "Training",
    href: "/training",
    icon: <GraduationCap className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "Market Stats",
    href: "/market-statistics",
    icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin", "agent"],
  },
  {
    label: "Admin",
    href: "/admin",
    icon: <UserCog className="h-5 w-5 flex-shrink-0" />,
    roles: ["admin"],
  },

  // === CUSTOMER-FACING (all customers + shared) ===
  {
    label: "Home",
    href: "/dashboard",
    icon: <Home className="h-5 w-5 flex-shrink-0" />,
    roles: ["buyer", "seller", "tenant", "landlord", "relocation_agent"],
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: <Map className="h-5 w-5 flex-shrink-0" />,
    roles: "all",
  },
  {
    label: "My Search",
    href: "/my-search",
    icon: <SlidersHorizontal className="h-5 w-5 flex-shrink-0" />,
    roles: ["buyer", "tenant", "relocation_agent"],
  },
  {
    label: "Search",
    href: "/properties",
    icon: <Search className="h-5 w-5 flex-shrink-0" />,
    roles: ["buyer", "tenant", "relocation_agent"],
  },
  {
    label: "My Listings",
    href: "/inventory",
    icon: <Building2 className="h-5 w-5 flex-shrink-0" />,
    roles: ["seller", "landlord"],
  },
  {
    label: "Requests",
    href: "/requests",
    icon: <ClipboardList className="h-5 w-5 flex-shrink-0" />,
    roles: ["buyer", "tenant", "relocation_agent"],
  },
  {
    label: "Market Stats",
    href: "/market-statistics",
    icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />,
    roles: ["buyer", "seller", "tenant", "landlord", "relocation_agent"],
  },
  {
    label: "Saved",
    href: "/saved",
    icon: <Heart className="h-5 w-5 flex-shrink-0" />,
    roles: ["buyer", "seller", "tenant", "landlord", "relocation_agent"],
  },
  {
    label: "Messages",
    href: "/chat",
    icon: <MessageSquare className="h-5 w-5 flex-shrink-0" />,
    roles: ["buyer", "seller", "tenant", "landlord", "relocation_agent"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell className="h-5 w-5 flex-shrink-0" />,
    roles: ["buyer", "seller", "tenant", "landlord", "relocation_agent"],
  },
]

const bottomLinks = [
  {
    label: "Settings",
    href: "/settings/user",
    icon: <Settings className="h-5 w-5 flex-shrink-0" />,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { role } = useRole()
  const [open, setOpen] = useState(false)

  // Filter navigation items based on current role
  const visibleNavItems = useMemo(() => {
    return allNavItems.filter((item) => {
      if (item.roles === "all") return true
      return item.roles.includes(role)
    })
  }, [role])

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6 md:gap-8 border-r border-neutral-200/60 dark:border-white/[0.06]">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          {open ? <LogoFull /> : <LogoIcon />}

          {/* User Profile */}
          <SidebarUserInfo open={open} />

          {/* Main Navigation */}
          <div className="flex flex-col gap-1">
            {visibleNavItems.map((item, idx) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <SidebarLink
                  key={idx}
                  link={item}
                  isActive={isActive}
                />
              )
            })}
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
            <div className="flex items-center justify-between px-2 py-2">
              <Label htmlFor="dark-mode-toggle" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-[#00d4ff]" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="text-sm whitespace-pre">
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
      className="font-bold flex items-center gap-3 text-sm text-black dark:text-white py-1 px-2 relative z-20"
    >
      <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
        <Logo size={20} className="text-primary-foreground" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-lg whitespace-pre"
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
      className="font-bold flex items-center justify-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
        <Logo size={20} className="text-primary-foreground" />
      </div>
    </Link>
  )
}