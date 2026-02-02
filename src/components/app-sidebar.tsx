"use client"

import React, { useState } from "react"
import dynamic from "next/dynamic"
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  MessageCircle,
  Calendar,
  Users,
  GraduationCap,
  Sparkles,
  UserCog,
  Settings,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
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

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: <Building2 className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Performance",
    href: "/performance",
    icon: <TrendingUp className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: <CheckSquare className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Chat",
    href: "/chat",
    icon: <MessageCircle className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: <Calendar className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Users",
    href: "/users",
    icon: <Users className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Training",
    href: "/training",
    icon: <GraduationCap className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "RERA Assistant",
    href: "/ai-assistant",
    icon: <Sparkles className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: <UserCog className="h-5 w-5 flex-shrink-0" />,
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
  const [open, setOpen] = useState(false)

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6 md:gap-10 border-r border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          {open ? <LogoFull /> : <LogoIcon />}

          {/* User Profile */}
          <SidebarUserInfo open={open} />

          {/* Main Navigation */}
          <div className="flex flex-col gap-1">
            {navItems.map((item, idx) => {
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
        <div className="flex flex-col gap-1 border-t border-neutral-200 dark:border-neutral-800 pt-4">
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

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-2 py-2">
            <Label htmlFor="dark-mode-toggle" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-[#00d4ff]" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-sm whitespace-pre"
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </motion.span>
            </Label>
            <Switch
              id="dark-mode-toggle"
              checked={theme === "dark"}
              onCheckedChange={(newChecked) => setTheme(newChecked ? "dark" : "light")}
            />
          </div>
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
        FLOW
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