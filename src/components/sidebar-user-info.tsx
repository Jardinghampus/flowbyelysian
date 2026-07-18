"use client"

import { useDemoUser, useDemoClerk } from "@/contexts/demo-user-context"
import { cn } from "@/lib/utils"
import { LogOut } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export function SidebarUserInfo({ open }: { open: boolean }) {
  const { user } = useDemoUser()

  return (
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
              {user?.fullName || "Zaylo User"}
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
  )
}

export function SidebarLogoutButton({ open }: { open: boolean }) {
  const { signOut } = useDemoClerk()

  const handleSignOut = () => {
    signOut({ redirectUrl: "/sign-in" })
  }

  return (
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
  )
}
