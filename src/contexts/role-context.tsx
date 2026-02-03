"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

export type UserRole = "admin" | "agent" | "user"

// Admin email addresses with full rights
const ADMIN_EMAILS = [
  "jardinghampus@gmail.com",
  "admin@admin.com",
]

// Agent email patterns - agents can add/delete their own listings but limited edit rights
const AGENT_EMAILS = [
  "agent@agent.com",
]

interface RoleContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  isAdmin: boolean
  isAgent: boolean
  userEmail: string | null
  canEditListing: (listingOwnerId: string, currentUserId: string) => boolean
  canDeleteListing: (listingOwnerId: string, currentUserId: string) => boolean
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
          const emailLower = email.toLowerCase()
          if (ADMIN_EMAILS.includes(emailLower)) {
            setRole("admin")
          } else if (AGENT_EMAILS.includes(emailLower)) {
            setRole("agent")
          } else {
            setRole("user")
          }
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

  // Permission helpers
  const canEditListing = (listingOwnerId: string, currentUserId: string): boolean => {
    if (role === "admin") return true // Admins can edit any listing
    if (role === "agent") return listingOwnerId === currentUserId // Agents can only edit their own
    return false // Regular users cannot edit
  }

  const canDeleteListing = (listingOwnerId: string, currentUserId: string): boolean => {
    if (role === "admin") return true // Admins can delete any listing
    if (role === "agent") return listingOwnerId === currentUserId // Agents can only delete their own
    return false // Regular users cannot delete
  }

  return (
    <RoleContext.Provider value={{
      role,
      setRole,
      isAdmin: role === "admin",
      isAgent: role === "agent",
      userEmail,
      canEditListing,
      canDeleteListing,
    }}>
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
