"use client"

import { createContext, useContext, ReactNode, useMemo } from "react"
import { useUser } from "@clerk/nextjs"

export type UserRole = "admin" | "agent" | "user"

// These emails always get admin access regardless of publicMetadata
const ADMIN_EMAILS = [
  "jardinghampus@gmail.com",
  "admin@admin.com",
]

interface RoleContextType {
  role: UserRole
  isAdmin: boolean
  isAgent: boolean
  userEmail: string | null
  canEditListing: (listingOwnerId: string, currentUserId: string) => boolean
  canDeleteListing: (listingOwnerId: string, currentUserId: string) => boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()

  const role = useMemo<UserRole>(() => {
    const email = user?.primaryEmailAddress?.emailAddress
    if (email && ADMIN_EMAILS.includes(email)) return "admin"
    const metaRole = user?.publicMetadata?.role as string | undefined
    if (metaRole === "admin") return "admin"
    if (metaRole === "agent") return "agent"
    return "user"
  }, [user])

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null

  const canEditListing = (listingOwnerId: string, currentUserId: string): boolean => {
    if (role === "admin") return true
    if (role === "agent") return listingOwnerId === currentUserId
    return false
  }

  const canDeleteListing = (listingOwnerId: string, currentUserId: string): boolean => {
    if (role === "admin") return true
    if (role === "agent") return listingOwnerId === currentUserId
    return false
  }

  return (
    <RoleContext.Provider value={{
      role,
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
  if (!context) throw new Error("useRole must be used within a RoleProvider")
  return context
}
