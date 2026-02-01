"use client"

import React, { useState } from "react"
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
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useClerk, useUser } from "@clerk/nextjs"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/aceternity-sidebar"

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
  const { signOut } = useClerk()
  const { user } = useUser()
  const [open, setOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ redirectUrl: "/sign-in" })
  }

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 border-r border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          {open ? <LogoFull /> : <LogoIcon />}

          {/* User Profile */}
          <div className={cn(
            "mt-6 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700",
            !open && "flex justify-center"
          )}>
            {open ? (
              <div className="flex items-center gap-3 px-2">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    className="h-10 w-10 flex-shrink-0 rounded-full"
                    width={40}
                    height={40}
                    alt="Avatar"
                  />
                ) : (
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {user?.firstName?.[0] || "U"}
                    </span>
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate">
                    {user?.fullName || "Flow User"}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    Real Estate Agent
                  </span>
                </div>
              </div>
            ) : (
              user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  className="h-8 w-8 flex-shrink-0 rounded-full"
                  width={32}
                  height={32}
                  alt="Avatar"
                />
              ) : (
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium text-xs">
                    {user?.firstName?.[0] || "U"}
                  </span>
                </div>
              )
            )}
          </div>

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
        <div className="flex flex-col gap-1 border-t border-neutral-200 dark:border-neutral-700 pt-4">
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
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md transition-colors",
              "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-sm whitespace-pre"
            >
              Logout
            </motion.span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md transition-colors",
              "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200"
            )}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Moon className="h-5 w-5 flex-shrink-0" />
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
          </button>
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
