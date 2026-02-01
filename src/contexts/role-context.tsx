"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

export type UserRole = "admin" | "user"

// Admin email addresses with full rights
const ADMIN_EMAILS = [
  "jardinghampus@gmail.com",
]

interface RoleContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  isAdmin: boolean
  userEmail: string | null
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("user")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Dynamically import Clerk to avoid SSR issues
    import("@clerk/nextjs").then(({ useUser }) => {
      // We can't use hooks here, so we'll use Clerk's client-side API instead
    }).catch(() => {})
  }, [])

  // Use a separate effect to fetch user data on the client
  useEffect(() => {
    if (!mounted) return

    // Use Clerk's window object if available
    const checkUser = async () => {
      try {
        // Access Clerk from window if available
        const clerk = (window as unknown as { Clerk?: { user?: { primaryEmailAddress?: { emailAddress?: string } } } }).Clerk
        if (clerk?.user) {
          const email = clerk.user.primaryEmailAddress?.emailAddress || ""
          setUserEmail(email)
          const isAdminUser = ADMIN_EMAILS.includes(email.toLowerCase())
          setRole(isAdminUser ? "admin" : "user")
        }
      } catch {
        // Silently fail during SSR
      }
    }

    // Poll for Clerk to be ready
    const interval = setInterval(() => {
      const clerk = (window as unknown as { Clerk?: { user?: { primaryEmailAddress?: { emailAddress?: string } } } }).Clerk
      if (clerk?.user) {
        checkUser()
        clearInterval(interval)
      }
    }, 100)

    // Also try immediately
    checkUser()

    return () => clearInterval(interval)
  }, [mounted])

  return (
    <RoleContext.Provider value={{ role, setRole, isAdmin: role === "admin", userEmail }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
