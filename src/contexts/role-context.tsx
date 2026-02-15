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
  // Demo mode: Default to admin role for full demo access
  const [role, setRole] = useState<UserRole>("admin")
  const [userEmail, setUserEmail] = useState<string | null>("jardinghampus@gmail.com")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Demo mode: Set admin role immediately
    setRole("admin")
    setUserEmail("jardinghampus@gmail.com")
  }, [])

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
