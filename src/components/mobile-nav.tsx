"use client"

import React from "react"
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  MessageCircle,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Dashboard",
    href: "/app/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Inventory",
    href: "/app/inventory",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    label: "Tasks",
    href: "/app/tasks",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    label: "Chat",
    href: "/user/chat",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    label: "Calendar",
    href: "/app/calendar",
    icon: <Calendar className="h-5 w-5" />,
  },
]

export function BottomNavbar() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border/50 flex justify-around items-center z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <div className="relative">
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 h-1 w-8 bg-primary rounded-full"
                />
              )}
              {React.cloneElement(item.icon, {
                className: cn(
                  "h-6 w-6 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                ),
              })}
            </div>
            <span
              className={cn(
                "text-xs mt-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
